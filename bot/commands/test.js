var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

class CommandTemplate extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get usesDatabase(){ return true; }
	get accessors(){ return ["test"]; }
	get mimics(){ return [/*{name:"buy",cmd:"bp buy"}*/]; }
	get help(){ return null;/*["A simple command!"];*/ }
	get helpExamples(){ return null;/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return null; }
	get helpName(){ return null; }
	modifyArgs( args ){ return args; }
	async execute( lToken ){ return null; }
}

module.exports = new CommandTemplate();