const Command = require("../class/command.js");
const env = require("../env.js");
const loader = require("../loader");
const views = loader("./bot/views/bp", "./views/bp");
delete require.cache[require.resolve("../data/shop.json")];
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const locale = require("../data/EN_US.json");
const {
	dataShop,
	dataShopCatalogue,
	getItemByAlias,
	confirmBuy,
	calcIncome,
	getAmountOwned,
	calcMax,
	calcNextCost,
	getCurrentBPBal
} = require("../utils/bp");
const bpUtils = require("../utils/bp");
const emojis = require("../utils/emojis");
const pages = require("../utils/page");

class CommandBlobPoints extends Command {
	constructor() {
		super();
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ["bp", "blob", "bpoints", "blobpoints", "bal"];
	}
	get mimics() {
		return [{
				name: "shop",
				cmd: "bp shop"
			},
			{
				name: "buy",
				cmd: "bp buy"
			},
			{
				name: "store",
				cmd: "bp shop"
			},
			{
				name: "leaderboards",
				cmd: "bp leaderboards"
			},
			{
				name: "leaders",
				cmd: "bp leaderboards"
			},
			{
				name: "leaderboard",
				cmd: "bp leaderboards"
			},
			{
				name: "gens",
				cmd: "bp gens"
			}
		];
	}
	get modifiers() {
		return ['shop', 'leaderboards', 'buy', 'give', 'prestige', 'gens']
	}

	get help() {
		return locale.bp.help.field;
	}

	get helpExamples() {
		return [
			["bal", "", locale.bp.help.summary.bal],
			["shop", "< page >", locale.bp.help.summary.shop],
			["buy", "<generator code> <amount | 'max'>", locale.bp.help.summary.buy],
			//["donate", "< @person > < amount >", "Give away some of your bp!"],
			["leaderboards", "< page >", locale.bp.help.summary.leaderboards]
		];
	}
	get helpName() {
		return "Blob-Points";
	}
	get helpGroup() {
		return "BlobPoints";
	}

	modifyArgs(args, Chicken) {
		if (this.modifiers.includes(args[0])) {
			if (args[0] == 'buy') {
				Chicken.eArgsLen = 2; // Make sure there are enough arguments
				return {
					type: 'buy',
					itemAlias: String(args[1] || "Nothing").toUpperCase(),
					max: (args[2] || '').toLowerCase() == "max",
					amount: args[2] ? (Number.isNaN(parseInt(args[2])) ? 0 : Math.abs(parseInt(args[2]))) : 1
				}
			} else if (args[0] == 'shop') {
				return {
					type: 'shop',
					page: Chicken.numbers[0] || 0
				}
			} else if ((args[0] == 'give' || args[0] == 'donate') && false) {
				return {
					type: 'give',
					amount: Chicken.numbers[0],
					to: Chicken.mentions[0]
				}
			} else if (args[0] == 'gens') {
				return {
					type: 'gens',
					user: Chicken.mentions[0]
				}
			} else if (args[0] = 'leaderboards') {
				return {
					type: 'leaderboards',
					local: Chicken.words.indexOf('local') > -1,
					page: Chicken.numbers[0]
				}
			}
			return {
				type: args[0]
			}
		}
		return {
			type: "overview",
			userQuery: args.join(" ")
		};
	}

	execGens(Chicken) {
		if (Chicken.mArgs.user) {
			Chicken.database.get(Chicken.mArgs.user.id, (userData) => {
				Chicken.send(views.gens(Chicken, userData))
			});
		} else {
			Chicken.send(views.gens(Chicken, Chicken.userData))
		}
	}

	// Display the overview
	execOverview(Chicken, bal, income) {
		var self = this;

		function onFoundOne(snowflake) {
			Chicken.database.get(snowflake, (userData) => {
				Chicken.userData = userData;
				let income = calcIncome(Chicken);
				let bal = Math.floor(getCurrentBPBal(Chicken)); // BINTCONV
				Chicken.shared.modules.db.updateLeaderboards(Chicken.userData);
				self.sendOverview(Chicken, bal, income);
			});
		}

		function onFoundNone() {
			self.sendOverview(Chicken, bal, income);
		}

		Chicken.queryUser(Chicken.mArgs.userQuery, onFoundOne, onFoundNone, onFoundNone)
		Chicken.author = Chicken.mentions[0];
	}

	sendOverview(Chicken, bal, income) {
		let count = Chicken.oFlags.watch || String(Math.floor(income)).length * 3;
		let initialCount = count;
		let lastBal = getCurrentBPBal(Chicken); // BINTCONV
		let newBal = lastBal;
		let initialCmdcount = Chicken.userData.cmdcount;
		Chicken.send(views.overview(Chicken, bal, income, count, initialCount)).then((msg) => {
			Chicken.userData.lastbpcheckmsgid = msg.id;
			if (income.lt(1)) {
				return;
			}
			let sameMsg = msg;
			async function resend() {
				if (count > 0) {
					count--;
				} else {
					return;
				}
				let deltaCmdcount = Chicken.userData.cmdcount - initialCmdcount;
				setTimeout(() => {
					lastBal = newBal;
					newBal = getCurrentBPBal(Chicken); // BINTCONV
					let currentIncome = calcIncome(Chicken);
					if (sameMsg.id != Chicken.userData.lastbpcheckmsgid) {
						msg.delete().catch((e) => {
							console.log(`[DiscordMessage] [DeleteError] [bp@128] ${e}`);
						});
						return;
					}
					msg.edit(
						views.overview(Chicken, newBal, currentIncome, count, initialCount)
					).then((n) => {
						sameMsg = n;
						// Only resend if the user can still see the overview
						if (deltaCmdcount < 4) {
							resend();
						}
					}).catch((e) => {
						throw e;
					});
				}, Math.max(2200 * Math.max(1, deltaCmdcount - 3), 2500 ** Math.max(1, deltaCmdcount - 3) - initialCount * 50));
			}


			resend();
		});
	}

	// Display the shop
	execShop(Chicken, bal) {
		let view = views.shop;

		function pageThing(hookMsg) {
			// Starting conditions
			Chicken.mArgs.page = Math.max(0, Chicken.mArgs.page);

			let pageOperators = [];
			if (Chicken.mArgs.page > 0) {
				pageOperators.push(
					pages.createPageOperator(emojis.arrow_backward, () => {

						// Backwards operation
						Chicken.mArgs.page = 0;

						Chicken.send(view(Chicken, bal, Chicken.mArgs.page)).then(pageThing);
					})
				)
				pageOperators.push(
					pages.createPageOperator(emojis.arrow_left, () => {

						// Backwards operation
						Chicken.mArgs.page--;

						Chicken.send(view(Chicken, bal, Chicken.mArgs.page)).then(pageThing);
					})
				)
			}
			pageOperators.push(
				pages.createPageOperator(emojis.arrow_right,
					() => {

						// Forewards operation
						Chicken.mArgs.page++;

						Chicken.send(view(Chicken, bal, Chicken.mArgs.page)).then(pageThing);
					})
			)

			pageOperators.push(
				pages.createPageOperator(emojis.arrow_forward,
					() => {

						// Forewards operation
						Chicken.mArgs.page = 1000;

						Chicken.send(view(Chicken, bal, Chicken.mArgs.page)).then(pageThing);
					})
			)

			pages.createPageManager(Chicken, hookMsg, pageOperators);
		}

		Chicken.send(view(Chicken, bal, Chicken.mArgs.page)).then(pageThing);
		//Chicken.send(views.shop(Chicken, bal, Chicken.mArgs.page));
	}

	// When buying
	execBuy(Chicken, bal, income) {
		if (typeof (dataShopCatalogue[Chicken.mArgs.itemAlias]) != "undefined") {
			// If the catalogue alias exists
			if (Chicken.mArgs.max) {
				Chicken.mArgs.amount = calcMax(Chicken.mArgs.itemAlias, bal, getAmountOwned(Chicken, Chicken.mArgs.itemAlias));
				Chicken.mArgs.amount = (Chicken.mArgs.amount || 1);
			}
			let nextCost = calcNextCost(Chicken);
			if (bal.lt(nextCost)) { // BINTCONV
				// Insufficent funds
				Chicken.send(views.insufficient_funds(Chicken, bal, nextCost, getItemByAlias(Chicken.mArgs.itemAlias)));
			} else {
				// Buy success

				let [item, owned] = confirmBuy(Chicken, Chicken.mArgs.itemAlias, nextCost);
				let newBal = getCurrentBPBal(Chicken); // BINTCONV
				let newIncome = calcIncome(Chicken);
				Chicken.send(views.buy_success(Chicken, newBal, nextCost, income, newIncome, item, owned));
			}
		} else {
			// error catalogue doesn't exist
			Chicken.send(views.item_nonexistent(Chicken));
		}
	}

	// Remove later
	execGive(Chicken, bal) {
		return;
		Chicken.send("This command is super broken. Bad math or something. I'll fix once repl stops lagging.\n-naka").then((msg) => {
			setTimeout(() => {
				msg.delete();
			}, 15000);
		});
		return;
		let amount = Math.abs(Chicken.numbers[0]) || 1;
		let to2 = Chicken.mentions[0];
		if (Chicken.max) {
			amount = bal;
		}
		if (new Date().getTime() - ((Chicken.userData.lastGive) || 1) < 1000 * 60 * 5) {
			Chicken.send(`Nope. Wait ${ parseInt( 60 * 5 - (new Date().getTime() - ((Chicken.userData.lastGive)))/1000 )} seconds.`);
			return;
		}
		if (!amount || !to2) {
			Chicken.send(views.give_argm(Chicken));
			return;
		}
		if (bal >= amount) {
			Chicken.mentions.map((to) => {
				Chicken.database.get(to.id, (toUD) => {
					let fromUD = Chicken.userData;
					let a = amount;
					if (amount < toUD.bpbal) {
						a = toUD.bpbal;
					}
					bpUtils.transferBP(fromUD, toUD, a);
					// Give success layout goes nHere
					Chicken.shared.modules.db.updateLeaderboards(fromUD);
					Chicken.shared.modules.db.updateLeaderboards(toUD);

					Chicken.userData.lastGive = new Date().getTime();
				})
			})
			Chicken.send(views.give_success(Chicken, amount));
		}
	}

	execLeaderboards(Chicken) {
		let globals = Chicken.shared.modules.db.global;
		if (Chicken.numbers[0]) {
			let view = views.lb_all;

			function pageThing(hookMsg) {
				// Starting conditions
				Chicken.numbers[0] = Math.max(0, Chicken.numbers[0]);

				let pageOperators = [];
				if (Chicken.numbers[0] > 0) {
					pageOperators.push(
						pages.createPageOperator(emojis.arrow_backward, () => {

							// Backwards operation
							Chicken.numbers[0] = 0;

							Chicken.send(view(Chicken, globals, Chicken.numbers[0])).then(pageThing);
						})
					)
					pageOperators.push(
						pages.createPageOperator(emojis.arrow_left, () => {

							// Backwards operation
							Chicken.numbers[0] -= 2;

							Chicken.send(view(Chicken, globals, Chicken.numbers[0])).then(pageThing);
						})
					)
				}
				pageOperators.push(
					pages.createPageOperator(emojis.arrow_right,
						() => {

							// Forewards operation
							Chicken.numbers[0] += 2;

							Chicken.send(view(Chicken, globals, Chicken.numbers[0])).then(pageThing);
						})
				)

				pageOperators.push(
					pages.createPageOperator(emojis.arrow_forward,
						() => {

							// Forewards operation
							Chicken.numbers[0] = 1000;

							Chicken.send(view(Chicken, globals, Chicken.numbers[0])).then(pageThing);
						})
				)

				pages.createPageManager(Chicken, hookMsg, pageOperators);
			}

			Chicken.send(view(Chicken, globals, Chicken.numbers[0])).then(pageThing);

			//Chicken.send(views.lb_all(Chicken, globals, Chicken.numbers[0]));
		} else {
			Chicken.send(views.leaderboards(Chicken, globals));
		}

	}

	async execute(Chicken) {
		let income = calcIncome(Chicken);
		let bal = getCurrentBPBal(Chicken); // BINTCONV
		let type = Chicken.mArgs.type;
		Chicken.shared.modules.db.updateLeaderboards(Chicken.userData);
		if (type == "overview") {
			this.execOverview(Chicken, bal, income);
		} else if (type == "shop") {
			this.execShop(Chicken, bal);
		} else if (type == "buy") {
			this.execBuy(Chicken, bal, income);
		} else if (type == "give") {
			this.execGive(Chicken, bal, income);
		} else if (type == "leaderboards") {
			this.execLeaderboards(Chicken);
		} else if (type == "gens") {
			this.execGens(Chicken);
		}
		//console.log(Chicken.mArgs);
		Chicken.shared.modules.db.updateLeaderboards(Chicken.userData);
	}
}

module.exports = new CommandBlobPoints();