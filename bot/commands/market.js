const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

class CommandMarket extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get usesDatabase(){ return true; }
	get accessors(){ return ["market", "mark"]; }
	get mimics(){ return [
        {name:"catalogue",cmd:"mark catalogue"},
        {name:"cat",cmd:"mark catalogue"},
        {name:"sell", cmd:"mark sell"},
        {name:"bid", cmd:"mark bid"}
    ];}
	get help(){ return null;/*["A simple command!"];*/ }
	get helpExamples(){ return null;/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return null; }
	get helpName(){ return null; }
	modifyArgs( args, lToken ){
        let validOptions = ['catalogue', 'sell', 'bid'];
    }
	async execute( lToken ){ return null; }
}

module.exports = new CommandMarket();