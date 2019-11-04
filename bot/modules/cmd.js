const loader = require("../loader.js");
const env = require("../env.js");
const globalStates = require("../utils/globalstates");

var modules = {};
module.exports.linkModule = function (m) {
	modules = m;
	loadCommands();
}

var ready = false;

var sources = {}
const commands = {};
var mimics = {};
var helps = {};
var shared = {};
var prompts = {};

const views = loader("./bot/views/admin", "./views/admin");
const classes = loader("./bot/class", './class');

// Message IDs will be used as identifiers
let rawHooks = {
	MESSAGE_REACTION_ADD: {}
}

// Store commands by aliashash
function loadCommands() {
	sources = loader("./bot/commands", "./commands");
	//console.log(sources);
	Object.values(sources).map((cmd) => {
		cmd.accessors.map((alias) => {
			commands[modules.ezhash(alias)] = cmd;
			helps[alias] = cmd;
		})
		cmd.mimics.map((mimic) => {
			mimics[mimic.name] = mimic;
			helps[mimic.name] = cmd;
		})
	})
	shared.helps = helps;
	shared.commands = commands;
	shared.mimics = mimics;
	shared.modules = modules;
	shared.sources = sources;
	shared.views = loader("./bot/views", "./views");
	console.log(`[Command Manager] ${Object.keys(sources).length} command groups loaded!`);
	console.log(`[Command Manager] ${Object.keys(commands).length} ailiases loaded!`);
	console.log("[Command Manager] Ready to accept commands.");
	ready = true;
}

// Returns content without the prefix
function ridThePrefix(msg) {
	let {
		content,
		guild
	} = msg;
	// TODO rid the mention if it's at the beginning
	let preferences = modules.db.getGuildPreferences(guild);
	return content.replace(preferences.prefix, '');
}

// Dumb tokenization
function tokenize(msg) {
	return ridThePrefix(msg).split(' ');
}

/**
 * Splits a message into "Tokens"
 * 
 * Provided fields
 * - Chicken.accessor ( command accessor )
 * - Chicken.flags ( see @ChickenExpandOFlags )
 * - Chicken.args
 * - Chicken.msg ( [ DiscordjsMessage object ] )
 * - Chicken.mobile ( True if user requests mobile views )
 * - Chicken.isChicken ( A not-so-unique identifier for Chickens )
 * @param {DiscordjsMessage} msg 
 */
function Chickenize(msg, prompt) {
	let preferences = modules.db.getGuildPreferences(msg.guild);
	let tokens = tokenize(msg);
	/*
	if(msg.match(/\smax\s/gi).length>0){
		var max = true;
		msg = msg.replace(/\smax\s/gi, ' ');
	}
	*/
	let mobile = false;
	if (tokens[0][0] == preferences.prefix) {
		mobile = true;
		tokens[0] = tokens[0].replace(preferences.prefix, '');
	}
	if (mimics[tokens[0]]) {
		tokens = [...mimics[tokens[0]].cmd.split(' '), ...tokens.slice(1)].filter((x) => {
			return x != '' && !!x;
		});
	}

	let first = tokens[0].split(':')[0];
	
	return {
		accessor: modules.ezhash(first.toLowerCase()),
		flags: (tokens[0].split(':')[1] || "").split(';'),
		args: prompt ? tokens : tokens.slice(1),
		msg: msg,
		mobile: mobile,
		//max:max,
		isChicken: true
	};
}

/**
 * 
 * Provided fields
 * - Chicken.cmd
 * - Chicken.eArgsLen
 * @param {Chicken} Chicken 
 */
function ChickenExpandPlaceholders(Chicken) {
	let cmd = commands[Chicken.accessor];
	Chicken.cmd = cmd;
	Chicken.eArgsLen = 0;
	Chicken.oFlags = {};
}

/**
 * Expand operational flags
 * Syntax: ~command:flag1;flag2;flag3=10
 * 
 * Provided fields

 * @param {Chicken} Chicken
 */
function ChickenExpandOFlags(Chicken) {
	Chicken.flags.map((flag) => {
		var [key, value] = [...flag.split("="), true]
		Chicken.oFlags[key] = value;
	});
}

/**
 * Places message tokens into groups
 * 
 * Provided fields
 * - Chicken.mentions (All mentions + @[id] mentions)
 * - loken.numbers (All numbers, excluding words)
 * - Chicken.words (All words, excluding numericals and symbols)
 * - Chicken.quotes (All quotated tokens)
 * - Chicken.max (True if arguments includes phrase "max")
 * - Chicken.keyPairs, uses key:"value" syntax
 * @param {Chicken} Chicken 
 * @param {DiscordjsMessage} msg 
 */
async function ChickenGroupArguments(Chicken, msg) { // jshint ignore:line
	Chicken.mentions = [...msg.mentions.users.values()];

	// Searches for pattern: @[id], @1234592819341
	(msg.content.match(/@\d{0,}/gi) || []).slice(0, 4).map(async (idMention) => {
		let snowflake = idMention.replace("@", '');
		let user = await Chicken.client.fetchUser(snowflake); // jshint ignore:line

		// If snowflake search fails (which it will because nodejs is suck ass at realizing fetchUser is an async function)
		if (!user) {
			user = { search: true, id: snowflake };
		}

		if (!user) {
			return;
		}

		Chicken.mentions.push(user);
	});
	Chicken.numbers = Chicken.args.filter((x) => {
		return !Number.isNaN(parseFloat(x.replace(/,/gi, '')))
	}).map((x) => {
		return parseFloat(x.replace(/,/gi, ''));
	});

	const shorthands = {
		f:"filter",
		i:"item",
		p:"price",
		a:"amount",
		s:"sort"
	}


	let text = [Chicken.accessor, ...Chicken.args].join(' ');
	let keyPairs = text.match(/\w+:".+"/gi) || [];
	Chicken.keyPairs = {};
	keyPairs.map((kp) => {
		Chicken.args.splice(Chicken.args.indexOf(kp), 1);
		text = text.replace(kp, '');
		let m = kp.split(':');
		let g = m[1].split('"')[1];
		if(shorthands[m[0]]){
			Chicken.keyPairs[shorthands[m[0]]] = g;
		}else{
			Chicken.keyPairs[m[0]] = g;
		}
	});
	text = text.split(' ').filter((x) => {
		return x != '';
	}).join(' ');

	Chicken.words = text.match(/([A-z])\w+/gi);
	Chicken.argwords = Chicken.args.join(' ').match(/([A-z])\w+/gi);
	Chicken.quotes = text.match(/"[^"]*"/gi);
	Chicken.max = Chicken.args.includes('max');
	Chicken.wordsPlus = text.match(/(#?[A-z]?[0-9]?)\w+/gi);

	if (text.indexOf("<@350823530377773057>") == 0) {
		Chicken.mentions = Chicken.mentions.slice(1);
	}
}

/**
 * Rescopes DiscordjsMessage fields for
 * ease of access
 * 
 * Provided fields
 * - Chicken.channel ( DiscordjsChannel )
 * - Chicken.author ( DiscordjsUser )
 * @param {Chicken} Chicken 
 * @param {DiscordjsMessage} msg 
 */
function ChickenFlattenMsgData(Chicken, msg) {
	Chicken.channel = msg.channel;
	Chicken.author = msg.author;
	Chicken.guild = msg.guild;
	Chicken.cantUseEmojis = Chicken.guild ? !!Chicken.guild.me.missingPermissions(["USE_EXTERNAL_EMOJIS"])[0] : false;
}

/**
 * Handles emulation, if emulation is used
 * 
 * Provided fields
 * - Chicken.originalAuthor ( Original author of the message )
 * - Chicken.emulated ( True if the command uses emulation )
 * @param {Chicken} Chicken 
 */
function ChickenHandleEmulation(Chicken) {
	if (Chicken.oFlags['emulate']) {
		Chicken.originalAuthor = Chicken.author;
		Chicken.emulated = true;
		Chicken.author = Chicken.mentions[0];
	}
}

/**
 * Pass globals into the Chicken to be used as needed
 * 
 * Provided fields
 * - Chicken.bot
 * - Chicken.shared
 * - Chicken.cAccessors
 * - Chicken.database
 * - Chicken.commands
 * - Chicken.globalStates
 * - Chicken.rawHooks
 * @param {Chicken} Chicken 
 */
function ChickenIncludeGloals(Chicken) {
	Chicken.bot = shared;
	Chicken.shared = shared;
	Chicken.cAccessors = commands;
	Chicken.database = modules.db;
	Chicken.commands = sources;
	Chicken.globalStates = globalStates;
	Chicken.rawHooks = rawHooks;
}

/**
 * Create placeholder userdata for small uses of userData
 * ( i.e. formatting )
 * 
 * Provided fields
 * - Chicken.userData
 * @param {Chicken} Chicken 
 * @param {DiscordjsMessage} msg 
 */
function ChickenIncludeUserData(Chicken, msg) {
	Chicken.userData = {
		name: msg.author.username,
		discriminator: msg.author.discriminator,
		id: String(msg.author.id)
	};
}

/**
 * Passes arguments into the appropriate command's agument
 * parser
 * 
 * Provided fields
 * - Chicken.mArgs
 * - Chicken.usesDatabase ( true if a command needs to access database )
 * @param {Chicken} Chicken 
 */
function ChickenParseArguments(Chicken) {
	let cmd = commands[Chicken.accessor];
	if (Chicken.cmd) {
		Chicken.mArgs = cmd.modifyArgs(Chicken.args, Chicken);
		Chicken.usesDatabase = cmd.usesDatabase;
	}
}


/**
 * Provide wrappers for different response options
 * 
 * Provided fields
 * - Chicken.send()
 * - Chicken.prompt()
 * - Chicken.messageAdmin();
 * @param {*} Chicken 
 */
function ChickenProvideResponseHelpers(Chicken) {
	// Sending a message
	Chicken.send = (data, callback) => {
		/**
		 * This will prevent custom emojis from being used in servers that prevent custom emojis
		 */
		if(Chicken.cantUseEmojis){
			function deepSearch(object, depth=7){
				if(!depth||!object){return;}
				let keys = Object.keys(object);
				keys.map((key)=>{
					if(typeof(object[key])=='string'){
						object[key] = object[key].replace(/\[?\s?\<.+:\w+\>\s?\]?/gi, '');
					}else if(typeof(object[key]=='object')){
						deepSearch(object[key], depth-1);
					}
				})
			}
			if(typeof(data)=='string'){
				data = data.replace(/\[?\<.+:\w+\>\]?/gi, '');
			}else{
				deepSearch(data);
			}
		}
		
		let msgSendPromise = Chicken.channel.send(data);
		msgSendPromise.catch((e) => {

		});
		msgSendPromise.then(() => {
			//Chicken.channel.stopTyping( true );
		});
		/*if(Chicken.oFlags.stacktrace){
			var stack = new Error("Labunga").stack;
			Chicken.send("```javascript\n"+stack+"```");
		}*/
		return msgSendPromise;
	}

	// Prompting the user
	// For asking questions and having the user respond.
	Chicken.prompt = (data, onNextMessage) => {
		prompts[Chicken.author.id] = onNextMessage;
		return Chicken.channel.send(data);
	}

	Chicken.messageAdmin = (data) => {
		modules.client.users.find("id", "133169572923703296").send(data);
	}
}

function ChickenProvideAdminHelpers(Chicken) {
	// If not bot admin, do not go past this point
	if (!env.bot.admins[Chicken.author.id]) {
		return;
	}
	if (Chicken.oFlags['nodb']) {
		Chicken.usesDatabase = false;
	}
}

/**
 * Search for a user, given a term:userQuery
 * 
 * @param {Chicken} Chicken 
 * @param {String} userQuery 
 * @param {Lambda} onFoundOne (snowflake)=>{}
 * @param {Lambda} onFoundMany (lData[])=>{}
 * @param {Lambda} onFoundNone ()=>{}
 */
function ChickenQueryUser(
	Chicken, userQuery,
	onFoundOne = console.log,
	onFoundMany = console.log,
	onFoundNone = console.log
) {

	// Search for userQuery matches in the leaderboards user cache
	let results = Object.values(Chicken.shared.modules.db.global.leaderboards).filter((ldata) => {
		return ldata.name.toLowerCase().includes(userQuery.toLowerCase()) || ldata.id == userQuery.replace('@', '');
	});

	// If there is only one query result...
	if (results.length == 1) {
		let snowflake = results[0].id;
		onFoundOne(snowflake);
		return true;
	} else if (results.length) {
		// If there are multiple query results
		onFoundMany(results);
		return true;
	} else if (Chicken.mentions[0]) {
		onFoundOne(Chicken.mentions[0].id);
		return true;
	} else {
		// No results found
		onFoundNone();
		return false;
	}
}

/**
 * Provide helper functions that perform search operations
 * 
 * Provided fields
 * - Chicken.queryUser()
 * @param {Chicken} Chicken 
 */
function ChickenProvideQueryingHelpers(Chicken) {
	Chicken.queryUser = (userQuery, onFoundOne, onFoundMany, onFoundNone) => {
		return ChickenQueryUser(Chicken, userQuery, onFoundOne, onFoundMany, onFoundNone);
	}
}


function createHookData_MESSAGE_REACTION_ADD(Chicken, msg, emojiName, callback, lifetime) {
	//console.log(msg);
	return {
		msgID: msg.id.toString(),
		userID: Chicken.author.id.toString(),
		Chicken: Chicken,
		emojiName: emojiName,
		callback: callback,
		lifetime: lifetime
	}
}

function createHookIdentifier_MESSAGE_REACTION_ADD(msgID, userID, emojiName) {
	return `${msgID}_${userID}_e${emojiName}`;
}

module.exports.handleRaw = async function (data) {
	if (data.t == 'MESSAGE_REACTION_ADD') {
		//console.log(data);
		let hookIdentifier = createHookIdentifier_MESSAGE_REACTION_ADD(data.d.message_id, data.d.user_id, data.d.emoji.name);
		//console.log(`[Hook Catch ] ${hookIdentifier}`);
		//console.log(rawHooks.MESSAGE_REACTION_ADD);
		// If there's a hook with this specific identifier
		if (rawHooks.MESSAGE_REACTION_ADD[hookIdentifier]) {
			let hook = rawHooks.MESSAGE_REACTION_ADD[hookIdentifier];

			// Handle dead hooks
			if (hook.lifetime < new Date().getTime()) {
				// Pray that GC will take care of this
				delete rawHooks.MESSAGE_REACTION_ADD[hookIdentifier];
				return;
			}

			hook.callback(hook.Chicken);
		}
	}
}

function createMsgReactionHook(Chicken, msg, emojiName, callback, lifetime = 120000) {
	let hookData = createHookData_MESSAGE_REACTION_ADD(Chicken, msg, emojiName, callback, new Date().getTime() + lifetime);
	let hookIdentifier = createHookIdentifier_MESSAGE_REACTION_ADD(msg.id.toString(), Chicken.author.id.toString(), emojiName);
	rawHooks.MESSAGE_REACTION_ADD[hookIdentifier] = hookData;
	//console.log(`[Hook Create] ${hookIdentifier}`);
	setTimeout(() => {
		delete rawHooks.MESSAGE_REACTION_ADD[hookIdentifier];
	}, lifetime);
	return hookData;
}

/**
 * Provide helper functions for message hooks
 * 
 * Provided fields
 * - Chicken.addReactionHook
 * @param {Chicken} Chicken 
 */
function ChickenProvideMessageReactionHooks(Chicken) {
	Chicken.addReactionHook = (msg, emojiName, callback, lifetime = 120000) => {
		return createMsgReactionHook(Chicken, msg, emojiName, callback, lifetime);
	}
}

/**
 * Provide additional permissions information
 * 
 * Provided fields
 * - Chicken.userIsBotAdmin
 * @param {*} Chicken 
 */
function ChickenVerifyUserPermissions(Chicken) {
	Chicken.userIsBotAdmin = !!env.bot.admins[Chicken.author.id];
}

// Expand the Chicken only if it's a valid command
async function ChickenExpand(Chicken) {
	let msg = Chicken.msg;
	ChickenExpandPlaceholders(Chicken);
	ChickenExpandOFlags(Chicken);
	await ChickenGroupArguments(Chicken, msg);
	ChickenFlattenMsgData(Chicken, msg);
	ChickenHandleEmulation(Chicken);
	ChickenIncludeGloals(Chicken);
	ChickenIncludeUserData(Chicken, msg);
	ChickenParseArguments(Chicken);
	ChickenProvideResponseHelpers(Chicken);
	ChickenProvideAdminHelpers(Chicken);
	ChickenProvideQueryingHelpers(Chicken);
	ChickenVerifyUserPermissions(Chicken);
	ChickenProvideMessageReactionHooks(Chicken);
}

/*
	Chicken Interface
	
*/

function cmdExists(Chicken) {
	return commands[Chicken.accessor];
}

function isMimic(Chicken) {
	return !!mimics[Chicken.accessor];
}

function containsPrefix(msg) {
	let {
		content,
		guild
	} = msg;
	let preferences = modules.db.getGuildPreferences(guild);
	return content.indexOf(preferences.prefix) == 0 || content.indexOf("<@350823530377773057>") == 0;
}

const layoutInvalidPerms = require("../views/invalid_perms");
module.exports.handle = async function (msg, client) { // jshint ignore:line
	// Test for beta access
	if (env.beta) {
		if (env.whitelist.indexOf(msg.author.id.toString()) == -1) {
			return;
		}
	}
	if (msg.author.bot && !(env.bot.whitelist.includes(msg.author.id))) {
		return;
	}
	if (msg.content == `<@${client.user.id.toString()}>`) {
		msg.content = "~help";
	}

	var Chicken;
	// Handle prompts
	if (prompts[msg.author.id]) {
		Chicken = Chickenize(msg, true);
		await ChickenExpand(Chicken);
		prompts[msg.author.id](Chicken);
		delete prompts[msg.author.id];
		return;
	}
	// If it cointains the prefix, or if it's in dms
	if ((containsPrefix(msg) || !msg.channel.guild) && ready) {

		//console.log("[ready]", msg);
		modules.db.temp.commandsUsed++;
		modules.db.temp.commandsTotal++;
		Chicken = Chickenize(msg);
		Chicken.client = client;
		if (cmdExists(Chicken)) {
			await ChickenExpand(Chicken);
			//console.log(globalStates.isBotLocked());
			// Global lock implemtation
			if (globalStates.isBotLocked() && !Chicken.userIsBotAdmin) {
				Chicken.send("The bot is currently under lockdown. Please come back later!");
				return;
			}

			// Check for appropriate permissions
			if (Chicken.cmd.botAdminOnly && !env.bot.admins[Chicken.author.id]) {
				return; // Im sick of people doing stuff
			}

			if (msg.guild) {
				console.log(`[Cmd] < ${msg.author.username} > ( ${msg.guild.name} ): ${msg.content}`);
			} else {
				console.log(`[Cmd] < ${msg.author.username} > :${msg.content}`);
			}

			// Differenciate between commands that use the database and those that don't
			//msg.channel.startTyping()
			executeChicken(Chicken);

		}
	}
}

module.exports.handleMulti = async function (Chicken, content, client) { // jshint ignore:line

}

function createMonitorEvent(Chicken) {
	let lastMonitor = Chicken.userData.monitor[Chicken.userData.monitor.length - 1];
	let data = {
		t: new Date().getTime(),
		m: Chicken.msg.content,
		c: Chicken.channel.id
	};
	// Delta time
	if (lastMonitor) {
		data.dt = data.t - lastMonitor.t;
	}
	return data;
}

function notifyError(Chicken, e) {
	const ufmt = require("../utils/fmt");
	let errorMessage = `\`\`\`diff\n- Error -\n${e.message}\`\`\`\n\`\`\`javascript\n${e.stack.slice(0, 1000)}\`\`\` `;
	Chicken.send("Oh no... Something went wrong! I'll notify the bot admin.");
	Chicken.messageAdmin(
		ufmt.join([
			ufmt.denote('Type', 'Command Execution Error'),
			ufmt.denote('User', ufmt.name(Chicken.userData)),
			ufmt.denote('ID', Chicken.msg.author.id),
			ufmt.denote('Guild', Chicken.msg.guild.id),
			ufmt.denote('Channel', Chicken.msg.channel.id),
			ufmt.denote('Command', `\`${Chicken.msg.content}\``),
			errorMessage
		])
	)
}

function executeChicken(Chicken) {

	if (Chicken.usesDatabase) {
		modules.db.get(Chicken.author.id, (userData) => {
			// Temporary
			/*if(!env.bot.admins[ Chicken.author.id ]){
				Chicken.send( "This is currently disabled :)\nThank you for your patience." );
				return;
			}*/
			// Temporary

			Chicken.guildData = {};
			Chicken.userData = userData;
			Object.setPrototypeOf(Chicken.userData, classes.userdata.prototype);
			if (userData.blacklisted) {
				Chicken.send(views.blacklist(Chicken));
				return;
			}

			Chicken.cmd.execute(Chicken).then(() => { }).catch((e) => {
				return notifyError(Chicken, e);
			});
			Chicken.userData.cmdcount++;
			Chicken.userData.lastuse = new Date().getTime();
			if (userData.monitored) {
				userData.monitor.push(createMonitorEvent(Chicken));
			}
			if (!Chicken.msg.guild) {
				return;
			}
			let guildID = String(Chicken.msg.guild.id);
			if (!userData.guilds.includes(guildID)) {
				userData.guilds.push(guildID);
			}
		});
	} else {
		Chicken.cmd.execute(Chicken).then(() => { }).catch((e) => {
			return notifyError(Chicken, e);
		});
	}
}

module.exports.sources = sources;
module.exports.loadCommands = loadCommands;

///////////////
// REFERENCE //
///////////////

/*
 * Chicken Interface (v1.1.2)
 *
 * - Chicken.cmd
 * - Chicken.eArgsLen
 * - Chicken.keyPairs Ex: filter:"abcd"
 * - Chicken.accessor ( command accessor )
 * - Chicken.flags ( see @ChickenExpandOFlags )
 * - Chicken.args
 * - Chicken.msg ( [ DiscordjsMessage object ] )
 * - Chicken.mobile ( True if user requests mobile views )
 * - Chicken.isChicken ( A not-so-unique identifier for Chickens )
 * - Chicken.oFlags ( An object that uses flag-names as identifiers )
 * - Chicken.mentions (All mentions + @[id] mentions)
 * - loken.numbers (All numbers, excluding words)
 * - Chicken.words (All words, excluding numericals and symbols)
 * - Chicken.quotes (All quotated tokens)
 * - Chicken.max (True if arguments includes phrase "max")
 * - Chicken.channel ( DiscordjsChannel )
 * - Chicken.author ( DiscordjsUser )
 * - Chicken.bot
 * - Chicken.shared
 * - Chicken.cAccessors
 * - Chicken.database
 * - Chicken.commands
 * - Chicken.globalStates
 * - Chicken.mArgs
 * - Chicken.usesDatabase ( true if a command needs to access database )
 * - Chicken.send()
 * - Chicken.prompt()
 * - Chicken.queryUser()
 * - Chicken.addReactionHook
 * - Chicken.userIsBotAdmin
 * - Chicken.rawHooks
 * - Chicken.messageAdmin()
 * - Chicken.guildData
 */