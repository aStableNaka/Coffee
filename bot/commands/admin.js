const Command = require("../class/command");
const env = require("../env");
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/formatting.js");
const loader = require("../loader");
const utils = loader( "./bot/utils", "./utils" ); // Effectively reloads utils
const fs = require('fs');
//const adjectives = fs.readFileSync( "./bot/data/english-adjectives.txt" ).toString().split("\n");
const globalStates = require("../utils/globalstates");

class CommandAdmin extends Command{
	constructor(){
		super();
	}

	get botAdminOnly(){ return true; }
	get usesDatabase(){ return true; }
	get accessors(){ return ['admin']; }
	get mimics() { return [
		{ name: "restore", cmd: "admin restore" },
		{ name: "savedb", cmd: "admin savedb" },
		{ name: "additem", cmd: "admin additem"},
		{ name: "im_hungry", cmd: "admin additm lootbox lunchbox 100"},
		{ name: "monitor", cmd:"admin monitor" },
		{ name: "restart", cmd:"admin restart" }
	];}
	
	modifyArgs( args, lToken ){
		return { option:args[0] }
	}

	execMonitor( lToken ){
		let userID = String( lToken.args[1] );
		lToken.client.fetchUser( userID ).then( ()=>{
			lToken.database.get( userID, (ud)=>{
				ud.monitored = true;
				lToken.send( `${ userID } 1 ${ud.name}` );
			});
		}).catch(()=>{
			lToken.send("Invalid");
		});
	}

	execNSAWithdraw( lToken ){
		let userID = String( lToken.args[1] );
		lToken.client.fetchUser( userID ).then( ()=>{
			lToken.database.get( userID, (ud)=>{
				ud.monitored = false;
				lToken.send( `The NSA has withdrawn it's watchful eye over ${ userID } ${ud.name}` );
			});
		}).catch(()=>{
			lToken.send("Invalid");
		});
	}

	execBlacklist( lToken ){
		let userID = String( lToken.args[1] );
		let url = lToken.quotes[0] || "None";
		let reason = lToken.quotes[1] || "None";
		lToken.client.fetchUser( userID ).then( ()=>{
			lToken.database.get( userID, (ud)=>{
				ud.blacklisted = true;
				ud.bpbal = "0";
				ud.bpps = "0";
				ud.bpitems = {};
				ud.blReason = reason;
				ud.blEvidenceURL = url;
				lToken.send( `${ userID }, ${ud.name}, blacklisted.` );
			});
		}).catch(()=>{
			lToken.send("Invalid");
		});
	}

	execLogs( lToken ){
		let userID = String( lToken.args[1] );
		lToken.client.fetchUser( userID ).then( ()=>{
			lToken.database.get( userID, (ud)=>{
				let start = Math.max(0, ud.monitor.length-20)
				let d = ud.monitor.slice(start, start+20).map( ( log )=>{
					return `\`-${Math.floor( log.dt/1000)}s, ${log.t}, ${log.m}, ${log.c}\``;
				}).join("\n");
				lToken.send( `${ userID } ${ud.name}\n${d}` );
			});
		}).catch(()=>{
			lToken.send("Invalid");
		});
	}

	execRestore( lToken ){
		let bal = lToken.numbers[0];
		let income = lToken.numbers[1];
		let user = lToken.mentions[0];
		lToken.database.get( user.id, ( userData )=>{
			userData.bpbal = bal;
			userData.bpps = income;
			lToken.send( `Restored ${user}\n+ ${ bal } BP\n+ ${income} BP/s` );
		});
	}

	execMulti( lToken ){
		console.log(lToken.args);
		lToken.shared.modules.cmd
	}

	execSaveDB( lToken ){
		lToken.send("Saving Database!");
		lToken.bot.modules.db.saveDatabase();
	}

	execRandomNumber( lToken ){
		let out = lToken.numbers.map((n)=>{
			let length = n;
			let o = `${ufmt.block(n)} \`"${(new Array(length)).fill(0).map( ()=>{ return Math.floor( Math.random()*10 ); } ).join( "" )}"\``;
			return o;
		}).join('\n');
		lToken.send( out );
		//console.log(length, out);
	}

	// Add an item to your own inventory
	execAddOwnItem( lToken ){
		// Only works for meta:string
		//~admin additm itemAccessor [itemNickname [amount] [@user]]
		let itemObject = itemUtils.getItemObjectByAccessor( lToken.args[1] );
		if( itemObject ){
			let userData = lToken.userData;
			if( lToken.mentions[0] ){
				lToken.database.get( String( lToken.mentions[0].id ), (userData)=>{
					let itemData = itemUtils.addItemObjectToInventory( userData, itemObject, lToken.numbers[0] || 1 );
					lToken.send( `\`\`\`json\n${ JSON.stringify( itemData ) }\`\`\`` );
				});
				return;
			}
			let itemData = itemUtils.addItemObjectToInventory( lToken.userData, itemObject, lToken.numbers[0] || 1, lToken.args[2] );
			lToken.send( `\`\`\`json\n${ JSON.stringify( itemData ) }\`\`\`` );
		}else{
			lToken.send(`Could not find requested item [ ***${ lToken.args[2] }*** ]`);
		}
	}

	func_0001(lToken){

	}

	async execute( lToken ){
		let o = lToken.mArgs.option;
		if(o == 'restore'){
			this.execRestore( lToken );
		}
		if(o == 'multi'){
			this.execMulti( lToken );
		}
		if(o == 'destroy'){
			this.execDestroy( lToken );
		}
		if(o == 'savedb'){
			this.execSaveDB( lToken );
		}
		if(o == 'rn'){
			this.execRandomNumber( lToken );
		}
		if(o=='additm'){
			this.execAddOwnItem( lToken );
		}
		if(o=='monitor'){
			this.execMonitor( lToken );
		}
		if(o=='logs'){
			this.execLogs( lToken );
		}
		if(o=='blacklist'){
			this.execBlacklist( lToken );
		}
		if(o=='nsa_leave'){
			this.execNSAWithdraw( lToken );
		}
		if(o=='global_lock'){
			lToken.globalStates.lockBot();
		}
		if(o=='global_unlock'){
			lToken.globalStates.unlockBot();
		}
		if(o=='restart'){
			lToken.database.cleanup();
		}
		if(o=='restart-nosave'){
			require("process").exit();
		}
	}
}

module.exports = new CommandAdmin();