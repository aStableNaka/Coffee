var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/botinfo", "./views/botinfo");
//const localeReload = loader("./bot/data", "./data");
const locale = require("../data/EN_US");

class CommandCraft extends Command{
	constructor(){
        super();
        this.wip = true;
	}
	get botAdminOnly(){ return false; }
	get usesDatabase(){ return false; }
	get accessors(){ return ['craft']; }
	get mimics(){ return [];}
	get help(){ return {
		name:"Crafting",
		value:"View my info!"
	};}
	get helpExamples(){ return [
        ['craft', '', 'View a list of available crafting options!'],
        ['craft', '< item name >', 'craft an item!']
	];}
	get helpGroup(){ return "Crafting"; }
	get helpName(){ return "Crafting"; }
	get helpPage(){ return 2; }
	modifyArgs( args ){ return args; }
	async execute( lToken ){
        
	}
}

module.exports = new CommandCraft();