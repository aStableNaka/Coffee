const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/botinfo", "./views/botinfo");
//const localeReload = loader("./bot/data", "./data");
const url = "https://repl.it/@DrankArizonaIce/coffee";
const serverURL = "https://discord.gg/5caakFA";
const locale = require("../data/EN_US");

class CommandBotinfo extends Command{
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
		{name:"changelog", cmd:"botinfo changelogs"},
		{name:"contributors", cmd:"botinfo contributors"},
		{name:"patreon", cmd:"botinfo patreon"}
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
		['changelogs', '', 'View updates and changes'],
		['patreon', '', '[Click here to become a Patron!](https://www.patreon.com/coffeedev)']
	];}
	get helpGroup(){ return "Bot-Info"; }
	get helpName(){ return "Botinfo"; }
	get helpPage(){ return 2; }
	modifyArgs( args ){ return args; }
	async execute( Chicken ){
		if(Chicken.args[0]=='status'){
			Chicken.send( views.status( Chicken ) );
		}else if(Chicken.args[0]=='src'){
			Chicken.send( `<${url}>\nhttps://github.com/aStableNaka/Coffee` );
		}
		else if(Chicken.args[0]=='contributors'){
			Chicken.send( views.contributors( Chicken ) );
		}
		else if(Chicken.args[0]=='support'){
			Chicken.author.send( `Here's the link to my support server! ${serverURL}` );
			Chicken.send("I've sent you an invite to my support server. Check your DMs.");
		}else if(Chicken.args[0]=='patreon'){
			Chicken.send('[Click here to become a Patron!](https://www.patreon.com/coffeedev)');
		}
		else if(Chicken.args[0]=='changelogs'){
			Chicken.send( views.changelogs( locale.changelogs ) );
		}else{
			Chicken.send( views.info( Chicken ) );
		}
		
	}
}

module.exports = new CommandBotinfo();