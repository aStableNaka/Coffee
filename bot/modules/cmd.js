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
var commands = {};
var mimics = {};
var helps = {};
var shared = {};
var prompts = {};

const views = loader("./bot/views/admin", "./views/admin");

// Message IDs will be used as identifiers
let rawHooks = {
	MESSAGE_REACTION_ADD:{}
}

// Store commands by aliashash
function loadCommands() {
	sources = loader("./bot/commands", "./commands");
	console.log(sources);
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
	console.log(`[Command Manager] ${ Object.keys( sources ).length } command groups loaded!`);
	console.log(`[Command Manager] ${ Object.keys( commands ).length } ailiases loaded!`);
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
 * - lToken.accessor ( command accessor )
 * - lToken.flags ( see @lTokenExpandOFlags )
 * - lToken.args
 * - lToken.msg ( [ DiscordjsMessage object ] )
 * - lToken.mobile ( True if user requests mobile views )
 * - lToken.isLToken ( A not-so-unique identifier for lTokens )
 * @param {DiscordjsMessage} msg 
 */
function lTokenize(msg) {
	let preferences = modules.db.getGuildPreferences(msg.guild);
	let tokens = tokenize(msg);
	let mobile = false;
	if (tokens[0][0] == preferences.prefix) {
		mobile = true;
		tokens[0] = tokens[0].replace(preferences.prefix, '');
	}
	if (mimics[tokens[0]]) {
		tokens = [...mimics[tokens[0]].cmd.split(' '), ...tokens.slice(1)].filter((x) => {
			return x != '';
		});
	}

	let first = tokens[0].split(':')[0];
	return {
		accessor: modules.ezhash(first.toLowerCase()),
		flags: (tokens[0].split(':')[1] || "").split(';'),
		args: tokens.slice(1),
		msg: msg,
		mobile: mobile,
		isLToken: true
	};
}

/**
 * 
 * Provided fields
 * - lToken.cmd
 * - lToken.eArgsLen
 * @param {lToken} lToken 
 */
function lTokenExpandPlaceholders(lToken){
	let cmd = commands[lToken.accessor];
	lToken.cmd = cmd;
	lToken.eArgsLen = 0;
	lToken.oFlags = {};
}

/**
 * Expand operational flags
 * Syntax: ~command:flag1;flag2;flag3=10
 * 
 * Provided fields

 * @param {lToken} lToken
 */
function lTokenExpandOFlags(lToken){
	lToken.flags.map((flag) => {
		var [key, value] = [...flag.split("="), true]
		lToken.oFlags[key] = value;
	});
}

/**
 * Places message tokens into groups
 * 
 * Provided fields
 * - lToken.mentions (All mentions + @[id] mentions)
 * - loken.numbers (All numbers, excluding words)
 * - lToken.words (All words, excluding numericals and symbols)
 * - lToken.quotes (All quotated tokens)
 * - lToken.max (True if arguments includes phrase "max")
 * @param {lToken} lToken 
 * @param {DiscordjsMessage} msg 
 */
async function lTokenGroupArguments(lToken, msg){ // jshint ignore:line
	lToken.mentions = [...msg.mentions.users.values()];

	// Searches for pattern: @[id], @1234592819341
	(msg.content.match(/@\d{0,}/gi) || []).slice(0,4).map(async (idMention)=>{
		let snowflake = idMention.replace("@",'');
		let user = await lToken.client.fetchUser( snowflake ); // jshint ignore:line

		// If snowflake search fails (which it will because nodejs is suck ass at realizing fetchUser is an async function)
		if(!user){
			user = modules.db.global.leaderboards[snowflake];
		}

		if(!user){
			return;
		}

		lToken.mentions.push( user );
	});
	lToken.numbers = lToken.args.filter((x) => {
		return !Number.isNaN(parseFloat(x.replace(/,/gi, '')))
	}).map((x) => {
		return parseFloat(x.replace(/,/gi, ''));
	});
	lToken.words = msg.content.match(/([A-z])\w+/gi);
	lToken.quotes = msg.content.match(/"[^"]*"/gi);
	lToken.max = lToken.args.includes('max');

	if(msg.content.indexOf("<@350823530377773057>") == 0){
		lToken.mentions = lToken.mentions.slice(1);
	}
}

/**
 * Rescopes DiscordjsMessage fields for
 * ease of access
 * 
 * Provided fields
 * - lToken.channel ( DiscordjsChannel )
 * - lToken.author ( DiscordjsUser )
 * @param {lToken} lToken 
 * @param {DiscordjsMessage} msg 
 */
function lTokenFlattenMsgData(lToken, msg){
	lToken.channel = msg.channel;
	lToken.author = msg.author;
}

/**
 * Handles emulation, if emulation is used
 * 
 * Provided fields
 * - lToken.originalAuthor ( Original author of the message )
 * - lToken.emulated ( True if the command uses emulation )
 * @param {lToken} lToken 
 */
function lTokenHandleEmulation(lToken){
	if (lToken.oFlags['emulate']) {
		lToken.originalAuthor = lToken.author;
		lToken.emulated = true;
		lToken.author = lToken.mentions[0];
	}
}

/**
 * Pass globals into the lToken to be used as needed
 * 
 * Provided fields
 * - lToken.bot
 * - lToken.shared
 * - lToken.cAccessors
 * - lToken.database
 * - lToken.commands
 * - lToken.globalStates
 * - lToken.rawHooks
 * @param {lToken} lToken 
 */
function lTokenIncludeGloals(lToken){
	lToken.bot = shared;
	lToken.shared = shared;
	lToken.cAccessors = commands;
	lToken.database = modules.db;
	lToken.commands = sources;
	lToken.globalStates = globalStates;
	lToken.rawHooks = rawHooks;
}

/**
 * Create placeholder userdata for small uses of userData
 * ( i.e. formatting )
 * 
 * Provided fields
 * - lToken.userData
 * @param {lToken} lToken 
 * @param {DiscordjsMessage} msg 
 */
function lTokenIncludeUserData(lToken, msg){
	lToken.userData = {
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
 * - lToken.mArgs
 * - lToken.usesDatabase ( true if a command needs to access database )
 * @param {lToken} lToken 
 */
function lTokenParseArguments(lToken){
	let cmd = commands[lToken.accessor];
	if (lToken.cmd) {
		lToken.mArgs = cmd.modifyArgs(lToken.args, lToken);
		lToken.usesDatabase = cmd.usesDatabase;
	}
}


/**
 * Provide wrappers for different response options
 * 
 * Provided fields
 * - lToken.send()
 * - lToken.prompt()
 * @param {*} lToken 
 */
function lTokenProvideResponseHelpers(lToken){
	// Sending a message
	lToken.send = (data, callback) => {
		let msgSendPromise = lToken.channel.send(data);
		msgSendPromise.catch((e) => {

		});
		msgSendPromise.then(() => {});
		/*if(lToken.oFlags.stacktrace){
			var stack = new Error("Labunga").stack;
			lToken.send("```javascript\n"+stack+"```");
		}*/
		return msgSendPromise;
	}

	// Prompting the user
	// For asking questions and having the user respond.
	lToken.prompt = (data, onNextMessage) => {
		prompts[lToken.author.id] = onNextMessage;
		return lToken.channel.send(data);
	}
}

function lTokenProvideAdminHelpers(lToken){
	// If not bot admin, do not go past this point
	if (!env.bot.admins[lToken.author.id]) {
		return;
	}
	if (lToken.oFlags['nodb']) {
		lToken.usesDatabase = false;
	}
}

/**
 * Search for a user, given a term:userQuery
 * 
 * @param {lToken} lToken 
 * @param {String} userQuery 
 * @param {Lambda} onFoundOne (snowflake)=>{}
 * @param {Lambda} onFoundMany (lData[])=>{}
 * @param {Lambda} onFoundNone ()=>{}
 */
function lTokenQueryUser(
	lToken, userQuery,
	onFoundOne=console.log,
	onFoundMany=console.log,
	onFoundNone=console.log
){

	// Search for userQuery matches in the leaderboards user cache
	let results = Object.values( lToken.database.global.leaderboards ).filter((ldata)=>{
		return ldata.name.toLowerCase().includes( userQuery.toLowerCase() );
	});

	// If there is only one query result...
	if(results.length==1){
		let snowflake = results[0].id;
		onFoundOne( snowflake );
		return true;
	}else if(results.length){
		// If there are multiple query results
		onFoundMany( results );
		return true;
	}else{
		// No results found
		onFoundNone();
		return false;
	}
}

/**
 * Provide helper functions that perform search operations
 * 
 * Provided fields
 * - lToken.queryUser()
 * @param {lToken} lToken 
 */
function lTokenProvideQueryingHelpers(lToken){
	lToken.queryUser = (userQuery, onFoundOne, onFoundMany, onFoundNone)=>{
		return lTokenQueryUser( lToken, userQuery, onFoundOne, onFoundMany, onFoundNone );
	}
}


function createHookData_MESSAGE_REACTION_ADD( lToken, msg, emojiName, callback, lifetime ){
	//console.log(msg);
	return {
		msgID: msg.id.toString(),
		userID: lToken.author.id.toString(),
		lToken: lToken,
		emojiName: emojiName,
		callback: callback,
		lifetime: lifetime
	}
}

function createHookIdentifier_MESSAGE_REACTION_ADD( msgID, userID, emojiName ){
	return `${ msgID }_${userID}_e${emojiName}`;
}

module.exports.handleRaw = async function( data ){
	if(data.t=='MESSAGE_REACTION_ADD'){
		//console.log(data);
		let hookIdentifier = createHookIdentifier_MESSAGE_REACTION_ADD( data.d.message_id, data.d.user_id, data.d.emoji.name );
		//console.log(`[Hook Catch ] ${hookIdentifier}`);
		//console.log(rawHooks.MESSAGE_REACTION_ADD);
		// If there's a hook with this specific identifier
		if(rawHooks.MESSAGE_REACTION_ADD[ hookIdentifier ]){
			let hook = rawHooks.MESSAGE_REACTION_ADD[ hookIdentifier ];
			
			// Handle dead hooks
			if(hook.lifetime<new Date().getTime()){
				// Pray that GC will take care of this
				delete rawHooks.MESSAGE_REACTION_ADD[ hookIdentifier ];
				return;
			}
			
			hook.callback( hook.lToken );
		}
	}
}

function createMsgReactionHook( lToken, msg, emojiName, callback, lifetime=120000 ){
	let hookData = createHookData_MESSAGE_REACTION_ADD( lToken, msg, emojiName, callback, new Date().getTime() + lifetime );
	let hookIdentifier = createHookIdentifier_MESSAGE_REACTION_ADD( msg.id.toString(), lToken.author.id.toString(), emojiName );
	rawHooks.MESSAGE_REACTION_ADD[ hookIdentifier ] = hookData;
	//console.log(`[Hook Create] ${hookIdentifier}`);
	setTimeout( ()=>{
		delete rawHooks.MESSAGE_REACTION_ADD[ hookIdentifier ];
	}, lifetime);
	return hookData;
}

/**
 * Provide helper functions for message hooks
 * 
 * Provided fields
 * - lToken.addReactionHook
 * @param {lToken} lToken 
 */
function lTokenProvideMessageReactionHooks( lToken ){
	lToken.addReactionHook = ( msg, emojiName, callback, lifetime=120000 )=>{
		return createMsgReactionHook( lToken, msg, emojiName, callback, lifetime );
	}
}

/**
 * Provide additional permissions information
 * 
 * Provided fields
 * - lToken.userIsBotAdmin
 * @param {*} lToken 
 */
function lTokenVerifyUserPermissions( lToken ){
	lToken.userIsBotAdmin = !!env.bot.admins[lToken.author.id];
}

// Expand the lToken only if it's a valid command
async function lTokenExpand(lToken) {
	let msg = lToken.msg;
	lTokenExpandPlaceholders(lToken);
	lTokenExpandOFlags(lToken);
	await lTokenGroupArguments(lToken, msg);
	lTokenFlattenMsgData(lToken, msg);
	lTokenHandleEmulation(lToken);
	lTokenIncludeGloals(lToken);
	lTokenIncludeUserData(lToken, msg);
	lTokenParseArguments(lToken);
	lTokenProvideResponseHelpers(lToken);
	lTokenProvideAdminHelpers(lToken);
	lTokenProvideQueryingHelpers(lToken);
	lTokenVerifyUserPermissions(lToken);
	lTokenProvideMessageReactionHooks( lToken );
}

/*
	lToken Interface
	
*/

function cmdExists(lToken) {
	return commands[lToken.accessor];
}

function isMimic(lToken) {
	return !!mimics[lToken.accessor];
}

function containsPrefix(msg) {
	let {
		content,
		guild
	} = msg;
	let preferences = modules.db.getGuildPreferences(guild);
	return content.indexOf(preferences.prefix) == 0 || content.indexOf("<@350823530377773057>")==0;
}

const layoutInvalidPerms = require("../views/invalid_perms");
module.exports.handle = async function (msg, client) { // jshint ignore:line
	if (msg.author.bot && !(env.bot.whitelist.includes(msg.author.id))) {
		return;
	}
	if (msg.content == "<@350823530377773057>") {
		msg.content = "~help";
	}

	var lToken;
	// Handle prompts
	if (prompts[msg.author.id]) {
		lToken = lTokenize(msg);
		await lTokenExpand(lToken);
		prompts[msg.author.id](lToken);
		delete prompts[msg.author.id];
		return;
	}
	// If it cointains the prefix, or if it's in dms
	if ((containsPrefix(msg) || !msg.channel.guild) && ready) {

		//console.log("[ready]", msg);
		modules.db.temp.commandsUsed++;
		modules.db.temp.commandsTotal++;
		lToken = lTokenize(msg);
		lToken.client = client;
		if (cmdExists(lToken)) {
			await lTokenExpand(lToken);
			//console.log(globalStates.isBotLocked());
			// Global lock implemtation
			if( globalStates.isBotLocked() && !lToken.userIsBotAdmin ){
				lToken.send("The bot is currently under lockdown. Please come back later!");
				return;
			}

			// Check for appropriate permissions
			if (lToken.cmd.botAdminOnly && !env.bot.admins[lToken.author.id]) {
				return; // Im sick of people doing stuff
			}

			if (msg.guild) {
				console.log(`[Cmd] < ${msg.author.username} > ( ${msg.guild.name} ): ${msg.content}`);
			} else {
				console.log(`[Cmd] < ${msg.author.username} > :${msg.content}`);
			}

			// Differenciate between commands that use the database and those that don't
			executelToken(lToken);
		}
	}
}

module.exports.handleMulti = async function (lToken, content, client) { // jshint ignore:line

}

function createMonitorEvent(lToken) {
	let lastMonitor = lToken.userData.monitor[lToken.userData.monitor.length - 1];
	let data = {
		t: new Date().getTime(),
		m: lToken.msg.content,
		c: lToken.channel.id
	};
	// Delta time
	if (lastMonitor) {
		data.dt = data.t - lastMonitor.t;
	}
	return data;
}

function executelToken(lToken) {
	if (lToken.usesDatabase) {
		modules.db.get(lToken.author.id, (userData) => {
			// Temporary
			/*if(!env.bot.admins[ lToken.author.id ]){
				lToken.send( "This is currently disabled :)\nThank you for your patience." );
				return;
			}*/
			// Temporary

			lToken.userData = userData;
			if (userData.blacklisted) {
				lToken.send(views.blacklist(lToken));
				return;
			}
			lToken.cmd.execute(lToken).then(() => {}).catch((e) => {
				lToken.send(`<@133169572923703296>\n\`\`\`diff\n- Error -\n${e.message}\`\`\`\n\`\`\`javascript\n${ e.stack.slice(0,500) }\`\`\` `);
			});
			lToken.userData.cmdcount++;
			lToken.userData.lastuse = new Date().getTime();
			if (userData.monitored) {
				userData.monitor.push(createMonitorEvent(lToken));
			}
			if (!lToken.msg.guild) {
				return;
			}
			let guildID = String(lToken.msg.guild.id);
			if (!userData.guilds.includes(guildID)) {
				userData.guilds.push(guildID);
			}
		});
	} else {
		lToken.cmd.execute(lToken).then(() => {}).catch((e) => {
			lToken.send(`\`\`\`diff\n- Error -\n${e.message}\`\`\`\n\`\`\`javascript\n${ e.stack.slice(0,500) }\`\`\` `);
		});
	}
}

module.exports.sources = sources;
module.exports.loadCommands = loadCommands;

///////////////
// REFERENCE //
///////////////

/*
 * lToken Interface (v1.1.2)
 * 
 * - lToken.cmd
 * - lToken.eArgsLen
 * - lToken.accessor ( command accessor )
 * - lToken.flags ( see @lTokenExpandOFlags )
 * - lToken.args
 * - lToken.msg ( [ DiscordjsMessage object ] )
 * - lToken.mobile ( True if user requests mobile views )
 * - lToken.isLToken ( A not-so-unique identifier for lTokens )
 * - lToken.oFlags ( An object that uses flag-names as identifiers )
 * - lToken.mentions (All mentions + @[id] mentions)
 * - loken.numbers (All numbers, excluding words)
 * - lToken.words (All words, excluding numericals and symbols)
 * - lToken.quotes (All quotated tokens)
 * - lToken.max (True if arguments includes phrase "max")
 * - lToken.channel ( DiscordjsChannel )
 * - lToken.author ( DiscordjsUser )
 * - lToken.bot
 * - lToken.shared
 * - lToken.cAccessors
 * - lToken.database
 * - lToken.commands
 * - lToken.globalStates
 * - lToken.mArgs
 * - lToken.usesDatabase ( true if a command needs to access database )
 * - lToken.send()
 * - lToken.prompt()
 * - lToken.queryUser()
 * - lToken.addReactionHook
 * - lToken.userIsBotAdmin
 * - lToken.rawHooks
 * 
*/