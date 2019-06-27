const url = "https://repl.it/@DrankArizonaIce/coffee";
const Command = require("../class/command");
const env = require("../env");

class CommandSrc extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get usesDatabase(){ return false; }
	get accessors(){ return []; }
	get mimics(){ return [/*{name:"buy",cmd:"bp buy"}*/]; }
	get help(){ return null;}
	get helpExamples(){ return [];}
	get helpGroup(){ return "Src"; }
	get helpName(){ return "Src"; }
	modifyArgs( args ){ return args; }
	async execute( Chicken ){ 
		Chicken.send( `<${url}>` );
	}
}
module.exports = new CommandSrc();