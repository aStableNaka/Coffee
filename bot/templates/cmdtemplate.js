const Command = require("../class/command");
const env = require("../env");

class CommandTemplate extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return false; }
	get usesDatabase(){ return false; }
	get accessors(){ return []; }
	get mimics(){ return [/*{name:"buy",cmd:"bp buy"}*/]; }
	get help(){ return null;/*["A simple command!"];*/ }
	get helpExamples(){ return null;/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return null; }
	get helpName(){ return null; }
	modifyArgs( args ){ return args; }
	async execute( lToken ){ return null; }
}

module.exports = new CommandTemplate();