const fs = require("fs");

const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader( "./bot/views/ev", "./views/ev" );

const ufmt = require("../utils/formatting.js");
const bpUtils = require("../utils/bp");
const globalStates = require("../utils/globalstates");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;

const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const locale = require("../data/EN_US.json");

const itemUtils = require("../utils/item.js");

// For temporary stuff
let temp = {};

class CommandEval extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return true; }
	get accessors(){ return ['ev', 'eval', 'e']; }
	modifyArgs( args ){
		return args.join(" ");
	}
	get usesDatabase() { return true; }
	async execute( lToken ){
		try{
			let modules = lToken.bot.modules;
			let db = modules.db;
			let commands = lToken.bot.commands;
			let author = lToken.author;
			let userData = lToken.userData;
			let send = (...args)=>{ lToken.send(...args)};

			lToken.mArgs = lToken.mArgs.replace("```javascript\n",'\n').replace('```','');
			// Env protection
			lToken.mArgs = lToken.mArgs.replace(/env/gi, '({})');
			console.log(lToken.mArgs);
			let ev = eval(lToken.mArgs);

			let jRes = function( msg ){
				views.eval_success( lToken, ufmt.code( JSON.stringify(msg, null, "\t") ) );
			}

			if(lToken.oFlags["noresponse"]){return;}
			if(lToken.flags.includes('json')){ ev = JSON.stringify(ev, null, "\t"); }
			if(lToken.flags.includes('simple')){
				lToken.send( ev );
			}else{
				lToken.send( views.eval_success( lToken, ufmt.code(ev) ) );
			}
			if(lToken.oFlags["save"]){
				let filename = `./debug/eval_${new Date().getTime()}.txt`;
				fs.writeFileSync( filename, ev );
				lToken.send(`[ Eval ] data written to ${filename}`);
			}
		}catch(error){
			lToken.send( views.eval_fail( lToken, error ) );
		}
	}
}

module.exports = new CommandEval();