const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

class CommandOverview extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get usesDatabase(){ return true; }
	get accessors(){ return []; }
	get mimics(){ return [];}
	get help(){ return null;/*["A simple command!"];*/ }
	get helpExamples(){ return null;/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return null; }
	get helpName(){ return null; }
	modifyArgs( args, lToken ){
        let validOptions = ['bp', 'inv', 'inventory', 'profile'];
    }
	async execute( lToken ){ return null; }
}

module.exports = new CommandOverview();