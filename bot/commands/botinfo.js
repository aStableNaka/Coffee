var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/botinfo", "./views/botinfo");
//const localeReload = loader("./bot/data", "./data");
const url = "https://repl.it/@DrankArizonaIce/coffee";
const serverURL = "https://discord.gg/5caakFA";
const locale = require("../data/EN_US");

class CommandTemplate extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return false; }
	get usesDatabase(){ return false; }
	get accessors(){ return ['botinfo', 'invite']; }
	get mimics(){ return [
		{name:"src",cmd:"botinfo src"},
		{name:"status", cmd:"botinfo status"},
		{name:"support", cmd:"botinfo support"},
		{name:"changelogs", cmd:"botinfo changelogs"},
		{name:"changelog", cmd:"botinfo changelogs"}
	];}
	get help(){ return {
		name:"Bot Info",
		value:"View my info!"
	};}
	get helpExamples(){ return [
		['invite', '', 'Invite me to your own server!'],
		['botinfo', '', 'View my info!'],
		['src', '', 'Get the link to view my source code!'],
		['support', '', 'Get the link to join the support server if you have further questions!'],
		['contributors', '', 'People who\'ve worked on this bot!'],
		['changelogs', '', 'View updates and changes']
	];}
	get helpGroup(){ return "Bot-Info"; }
	get helpName(){ return "Botinfo"; }
	get helpPage(){ return null; }
	modifyArgs( args ){ return args; }
	async execute( lToken ){
		if(lToken.args[0]=='status'){
			lToken.send( views.status( lToken ) );
		}else if(lToken.args[0]=='src'){
			lToken.send( `<${url}>\nhttps://github.com/aStableNaka/Coffee` );
		}
		else if(lToken.args[0]=='contributors'){
			lToken.send( views.contributors( lToken ) );
		}
		else if(lToken.args[0]=='support'){
			lToken.author.send( `Here's the link to my support server! ${serverURL}` );
			lToken.send("I've sent you an invite to my support server. Check your DMs.");
		}else if(lToken.args[0]=='changelogs'){
			lToken.send( views.changelogs( locale.changelogs ) );
		}else{
			lToken.send( views.info( lToken ) );
		}
		
	}
}

module.exports = new CommandTemplate();