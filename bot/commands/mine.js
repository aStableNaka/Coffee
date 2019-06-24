const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/mine", "./views/mine");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

let {
	getCurrentBPBal,
	addBP,
	calcIncome,
	pickaxeLevelUD
} = require("../utils/bp");
let bp = require("../utils/bp");
let ufmt = require("../utils/fmt");
let itemUtils = require("../utils/item");

function createOutcome(amount = new BigInt(0), desc = "") {
	return {
		amount: amount,
		desc: desc
	};
}

let perks = itemUtils.pickPerks;
class CommandMine extends Command {
	constructor() {
		super();
	}

	get accessors() {
		return ['mine', 'dig'];
	}
	get usesDatabase() {
		return true;
	}
	get help() {
		return {
			name: "Mining",
			value: "- **Mine for some extra BP.**\n- You can only mine once every 5 minutes (initially)!\n- Mining will produce a good amount of BP.\n- Increase your mining income by buying generators at the ~shop"
		}
	}
	get helpExamples() {
		return [
			["mine", '', "Mine for some extra BP. You might also find something cool while mining!"]
		]
	}
	get helpName() {
		return "Mining";
	}
	get helpGroup() {
		return "BP";
	}
	async execute(lToken) {
		let timeSinceLastMine = new Date().getTime() - lToken.userData.lastmine;
		if (timeSinceLastMine / 1000 / 60 >= lToken.userData.pickaxe_time) {
			lToken.userData.lastmine = new Date().getTime();
			// Mine success
			var bal = getCurrentBPBal(lToken);
			let income = calcIncome(lToken);
			let outcome = bp.calcPickaxeIncome(lToken.userData);
			let blessing;
			let boost = false;
			let perkMessages = [];
			let bonusPerks = [];
			let pickaxeLevel = bp.pickaxeLevelUD(lToken.userData);
			let z = false;

			// Miner's blessing
			if (Math.random() < 1 / 20) {
				bonusPerks.push("miners_blessing_luck");
				lToken.shared.modules.db.temp.blessings++;
			}

			// TODO may 29 change this back to 1/10
			// Found treasure
			if (Math.random() < 1 / 10) {
				bonusPerks.push("treasure_luck");
				//lToken.shared.modules.db.temp.blessings++;
			}
			
			lToken.userData.pickaxe_exp++;
			// Apply pickaxe perk effects and add message fields
			// welcome to javascript
			function perkEventDecorator( eventName, perkAccessor ){
				return (perks[perkAccessor][eventName]||(()=>{}));
			}
			[...bonusPerks, ...lToken.userData.pickaxe_perks].map((perkAccessor) => {
				let mineField = perkEventDecorator('onMine', perkAccessor)(lToken, outcome);
				
				if((pickaxeLevel!=bp.pickaxeLevelUD(lToken.userData)&&!z)){
					bonusPerks.push('level_up');
					z = true;
				}
				if (mineField) {
					perkMessages.push(mineField);
				}
			});
			if(z){
				[...bonusPerks, ...lToken.userData.pickaxe_perks].map((perkAccessor) => {
					let levelUpField = perkEventDecorator('onLevelUp', perkAccessor)(lToken, outcome);
					if(levelUpField){
						perkMessages.push( levelUpField );
					}
				});
			}

			// Food boosts
			if (lToken.userData.mineboostcharge > 0) {
				boost = outcome.divide(100).multiply(lToken.userData.mineboost);
				lToken.userData.mineboostcharge--;
			}

			addBP(lToken, outcome.add(boost ? boost : 0));
			

			lToken.send(views.mine(lToken, outcome, perkMessages, boost));
		} else {
			// Mine deny
			lToken.send(views.mine_deny(lToken, timeSinceLastMine)).then((msg) => {
				let id = msg.id;
				lToken.userData.msg_m = id;
				let lastMsg = msg;
				let initialCmdcount = lToken.userData.cmdcount;

				function resend(first) {
					if (!first && lastMsg.id != lToken.userData.msg_m) {
						msg.delete().catch((e) => {
							console.log(`[DiscordMessage] [DeleteError] [mine@93] ${e}`);
						});
						return;
					}
					if (timeSinceLastMine / 1000 / 60 < lToken.userData.pickaxe_time) {
						timeSinceLastMine = new Date().getTime() - lToken.userData.lastmine;
						msg.edit(views.mine_deny(lToken, timeSinceLastMine)).then((newMsg) => {
							lastMsg = newMsg;
							setTimeout(() => {
								resend();
							}, Math.min(30, 30 - (timeSinceLastMine / 1000 / 60)) * 1000);
						}).catch((e) => {
							throw e;
						});
					} else {
						msg.edit(views.mine_available(lToken, timeSinceLastMine));
						if (lToken.userData.tools.mine_alert) {
							lToken.send(`[ ***Mine Alert*** ]: <@${lToken.author.id}>, You're ready to mine!`);
						}
					}
				}
				resend(true);
			});
		}

	}
}

module.exports = new CommandMine();