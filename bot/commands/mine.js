var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader( "./bot/views/mn", "./views/mn" );
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

let {getCurrentBPBal, addBP, calcIncome, pickaxeLevelUD} = require("../utils/bp");
let bp =require("../utils/bp");
let ufmt = require("../utils/formatting");
let itemUtils = require("../utils/item");

function createOutcome( amount=new BigInt(0), desc="" ){
	return {amount: amount, desc: desc};
}

let perks = itemUtils.pickPerks;
class CommandMine extends Command{
	constructor(){
		super();
	}

	get accessors(){ return ['mine', 'dig']; }
	get usesDatabase(){ return true; }
	get help(){
		return {
			name: "Mining",
			value: "- **Mine for some extra BP.**\n- You can only mine once every 5 minutes (initially)!\n- Mining will produce a good amount of BP.\n- Increase your mining income by buying generators at the ~shop"
		}
	}
	get helpExamples(){
		return [["mine", '', "Mine for some extra BP. You might also find something cool while mining!"]]
	}
	get helpName(){ return "Mining"; }
	get helpGroup(){ return "BP"; }
	async execute( lToken ){
		let timeSinceLastMine = new Date().getTime() - lToken.userData.lastmine;
		if( timeSinceLastMine / 1000 / 60 >= lToken.userData.pickaxe_time ){
			lToken.userData.lastmine = new Date().getTime();
			// Mine success
			var bal = getCurrentBPBal( lToken );
			let income = calcIncome( lToken );
			var outcome = BigInt.max( 1, income ).multiply(60).multiply( 20 + 10 * pickaxeLevelUD( lToken.userData ));  // BINTCONV
			let blessing;
			let boost = false;
			let perkMessages = [];
			let bonusPerks = [];
			
			// Miner's blessing
			if(Math.random() < 1/20){
				bonusPerks.push("miners_blessing_luck");
				lToken.database.temp.blessings++;
			}

			// TODO may 29 change this back to 1/10
			// Found treasure
			if(Math.random() < 1/3){
				bonusPerks.push("treasure_luck");
				//lToken.database.temp.blessings++;
			}

			if(bp.pickaxeExpProgress(lToken.userData.pickaxe_exp)==0){
				bonusPerks.push('level_up');
			}

			// Pickaxe perks
			[...bonusPerks, ...lToken.userData.pickaxe_perks].map( ( perkAccessor )=>{
				let messageField = perks[perkAccessor].onMine( lToken, outcome );
				if(messageField){
					perkMessages.push( messageField );
				}
			});

			// Food boosts
			if( lToken.userData.mineboostcharge > 0 ){
				boost = outcome.divide(100).multiply( lToken.userData.mineboost );
				lToken.userData.mineboostcharge--;
		   }

			addBP( lToken, outcome.add( boost ? boost : 0 ) );
			lToken.userData.pickaxe_exp++;
			
			lToken.send( views.mine( lToken, outcome, perkMessages, boost ) );
		}else{
			// Mine deny
			lToken.send( views.mine_deny( lToken, timeSinceLastMine ) ).then( (msg)=>{
				let id = msg.id;
				lToken.userData.msg_m = id;
				let lastMsg = msg;
				let initialCmdcount = lToken.userData.cmdcount;
				function resend( first ){
					if(!first&&lastMsg.id != lToken.userData.msg_m){
						msg.delete();
						return;
					}
					if(timeSinceLastMine/1000/60 < lToken.userData.pickaxe_time){
						timeSinceLastMine = new Date().getTime() - lToken.userData.lastmine;
						msg.edit( views.mine_deny( lToken, timeSinceLastMine ) ).then( ( newMsg )=>{
							lastMsg = newMsg;
							setTimeout( ()=>{
								resend();
							}, 10000);
						}).catch((e)=>{
							throw e;
						});
					}else{
						msg.edit( views.mine_available( lToken, timeSinceLastMine ) );
						if(lToken.userData.tools.mine_alert){
							lToken.send( `[ ***Mine Alert*** ]: <@${lToken.author.id}>, You're ready to mine!` );
						}
					}
				}
				resend(true);
			} );
		}
		
	}
}

module.exports = new CommandMine();