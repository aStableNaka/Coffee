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
	modifyArgs( args, Chicken ){
		let mArgs = {};
		let validOptions = ['confirm'];
		if(args[0]=='confirm'){
			mArgs.confirm = true;
		}
		return mArgs;
	}
	async execute( Chicken ){ 
		if(Chicken.mArgs.confirm){
			
		}else{
			Chicken.queryUser( Chicken.args.join(" "), ( snowflake )=>{
				Chicken.database.get( snowflake, ( userData )=>{
					Chicken.send( views.overview( Chicken, userData ) );
				});
			}, ( )=>{
				Chicken.send( views.overview( Chicken ) );
			}, ( )=>{
				Chicken.send( views.overview( Chicken ) );
			} );
			
		}
	}
}

module.exports = new CommandPrestige();