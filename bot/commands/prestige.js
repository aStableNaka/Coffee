const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

const views = loader("./bot/views/prestige", "./views/prestige");

class CommandPrestige extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get usesDatabase(){ return true; }
	get accessors(){ return ["prestige"]; }
	get mimics(){ return [];}
	get help(){ return null;/*["A simple command!"];*/ }
	get helpExamples(){ return null;/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return null; }
	get helpName(){ return null; }
	modifyArgs( args, lToken ){
		let mArgs = {};
		let validOptions = ['confirm'];
		if(args[0]=='confirm'){
			mArgs.confirm = true;
		}
		return mArgs;
	}
	async execute( lToken ){ 
		if(lToken.mArgs.confirm){
			
		}else{
			lToken.queryUser( lToken.args.join(" "), ( snowflake )=>{
				lToken.database.get( snowflake, ( userData )=>{
					lToken.send( views.overview( lToken, userData ) );
				});
			}, ( )=>{
				lToken.send( views.overview( lToken ) );
			}, ( )=>{
				lToken.send( views.overview( lToken ) );
			} );
			
		}
	}
}

module.exports = new CommandPrestige();