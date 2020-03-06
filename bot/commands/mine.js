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
	async execute(Chicken) {
		let timeSinceLastMine = new Date().getTime() - Chicken.userData.lastmine;
		if (timeSinceLastMine / 1000 / 60 >= Chicken.userData.pickaxe_time) {
			Chicken.userData.lastmine = new Date().getTime();
			const ud = Chicken.userData;
			// Mine success

			/**
			 * ud.patch_374md
			 * Fixes the issue with gold-digger relying on the variable incrimentation of EXP
			 */
			if(!ud.patch_374mc){ ud.patch_374mc = 0; }
			ud.patch_374mc++;
			
			
			var bal = getCurrentBPBal(Chicken);
			let income = calcIncome(Chicken);
			let outcome = bp.calcPickaxeIncome(Chicken.userData);
			let blessing;
			let boost = {
				isDefault: true,
				amount: 0
			};
			let perkMessages = [];
			let bonusPerks = [];
			let pickaxeLevel = bp.pickaxeLevelUD(Chicken.userData);
			let z = false;

			// Miner's blessing
			if (Math.random() < 1 / 20) {
				bonusPerks.push("miners_blessing_luck");
				Chicken.shared.modules.db.temp.blessings++;
			}

			// Found treasure
			if (Math.random() < 1 / 10) {
				bonusPerks.push("treasure_luck");
				//Chicken.shared.modules.db.temp.blessings++;
			}

			Chicken.userData.pickaxe_exp++;
			// Apply pickaxe perk effects and add message fields
			// welcome to javascript
			function perkEventDecorator(eventName, perkAccessor) {
				return (perks[perkAccessor][eventName] || (() => {}));
			}
			[...bonusPerks, ...Chicken.userData.pickaxe_perks].map((perkAccessor) => {
				let mineField = perkEventDecorator('onMine', perkAccessor)(Chicken, outcome);

				if ((pickaxeLevel != bp.pickaxeLevelUD(Chicken.userData) && !z)) {
					bonusPerks.push('level_up');
					z = true;
				}
				if (mineField) {
					perkMessages.push(mineField);
				}
			});

			if (z) {
				[...bonusPerks, ...Chicken.userData.pickaxe_perks].map((perkAccessor) => {
					let levelUpField = perkEventDecorator('onLevelUp', perkAccessor)(Chicken, outcome);
					if (levelUpField) {
						perkMessages.push(levelUpField);
					}
				});
			}

			/**
			 * New Boost conventions 0.1.27
			 * item.name = basic boost
			 * item.accessor = special boost, item.onBoost(Chicken)->String required.
			 */
			// Food boosts
			if (Chicken.userData.mineboostcharge > 0) {
				// If the boost has some other desired effect
				boost.active = true;
				let item = itemUtils.items[Chicken.userData.mineboostsource] || {};
				if (item.onBoost) {
					boost.description = item.onBoost(Chicken);
					boost.isDefault = false;
				} else {
					boost.amount = outcome.divide(100).multiply(Chicken.userData.mineboost);
				}
				Chicken.userData.mineboostcharge--;
			}

			if (Chicken.userData.special_perk) {
				console.log(eval(itemUtils.d(Chicken.userData.special_perk)));

			} else {
				addBP(Chicken, outcome.add(boost.amount));
			}

			Chicken.send(views.mine(Chicken, outcome, perkMessages, boost));
		} else {
			// Mine deny
			Chicken.send(views.mine_deny(Chicken, timeSinceLastMine)).then((msg) => {
				let id = msg.id;
				Chicken.userData.msg_m = id;
				let lastMsg = msg;
				let initialCmdcount = Chicken.userData.cmdcount;

				function resend(first) {
					if (!first && lastMsg.id != Chicken.userData.msg_m) {
						msg.delete().catch((e) => {
							console.log(`[DiscordMessage] [DeleteError] [mine@93] ${e}`);
						});
						return;
					}
					if (timeSinceLastMine / 1000 / 60 < Chicken.userData.pickaxe_time) {
						timeSinceLastMine = new Date().getTime() - Chicken.userData.lastmine;
						msg.edit(views.mine_deny(Chicken, timeSinceLastMine)).then((newMsg) => {
							lastMsg = newMsg;
							setTimeout(() => {
								resend();
							}, Math.min(30, 30 - (timeSinceLastMine / 1000 / 60)) * 1000);
						}).catch((e) => {
							throw e;
						});
					} else {
						msg.edit(views.mine_available(Chicken, timeSinceLastMine));
						if (Chicken.userData.tools.mine_alert) {
							Chicken.send(`[ ***Mine Alert*** ]: <@${Chicken.author.id}>, You're ready to mine!`);
						}
					}
				}
				resend(true);
			});
		}

	}
}

module.exports = new CommandMine();