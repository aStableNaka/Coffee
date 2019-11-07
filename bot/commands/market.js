const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const marketUtils = require("../utils/market");
const itemUtils = require("../utils/item");
const ufmt = require("../utils/fmt.js");
const views = loader("./bot/views/market", "./views/market");
const emojis = require("../utils/emojis");
const pages = require("../utils/page");

class CommandMarket extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return false;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ["market", "mark"];
	}
	get mimics() {
		return [{
				name: "catalogue",
				cmd: "mark catalogue"
			},
			{
				name: "cat",
				cmd: "mark catalogue"
			},
			{
				name: "sell",
				cmd: "mark sell"
			},
			{
				name: "mcat",
				cmd: "mark catalogue"
			},
			{
				name: "msell",
				cmd: "mark sell"
			},
			{
				name: "mbuy",
				cmd: "mark buy"
			},
			{
				name: "minfo",
				cmd: "mark info"
			}
		];
	}
	get help() {
		return true; /*["A simple command!"];*/
	}
	get helpExamples() {
		return [
			["cat", "< itemName >", "View the market catalogue, or search for an item"],
			["sell", "< itemName > <amount> <price>", "Sell an item on the market."],
			["mbuy", "< marketCode >", "Buy an item on sale using its market code."],
			["minfo", "< marketCode >", "View a market listing's info."]
		]
	}
	get helpGroup() {
		return "Market";
	}
	get helpName() {
		return "Market";
	}
	get helpPage() {
		return 2;
	}
	modifyArgs(args, Chicken) {
		let validOptions = ['catalogue', 'sell', 'buy', 'info'];
		let mArgs = {
			valid: validOptions.indexOf(args[0]) > -1,
			type: args[0],
		};
		if (args[0] == 'sell') {
			mArgs.itemAccessor = Chicken.keyPairs.item || (args.slice(1).join(' ').match(/([^!@\d\s])[\d?\w?\.?]+/gi) || []).join("_").toLowerCase() || false;
			mArgs.amount = parseInt(Chicken.keyPairs.amount) || Chicken.numbers[0] || 1;
			mArgs.price = parseInt(Chicken.keyPairs.price) || Chicken.numbers[1] || 0;
			if (!mArgs.itemAccessor) {
				mArgs.valid = false;
			}
		} else if (args[0] == 'catalogue') {
			mArgs.itemAccessor = Chicken.keyPairs.filter || (args.slice(1).join(' ').match(/([^!@\d\s])[\d?\w?\.?]+/gi) || []).join("_").toLowerCase() || false;
		} else if (args[0] == 'buy' || args[0] == 'info') {
			mArgs.marketCode = escape(Chicken.keyPairs.code || args[1].toLowerCase()) || null;
		}
		return mArgs;
	}

	exec_buy(Chicken) {
		function nahBrother() {
			Chicken.send(`Market code ${ufmt.block(Chicken.mArgs.marketCode||'None')} not available.`);
		}
		console.log(Chicken.mArgs);
		if (Chicken.mArgs.marketCode) {
			Chicken.database.api.wrapper43('market', (collection) => {
				collection.find({
					id: Chicken.mArgs.marketCode,
					sold: false,
					locked: false
				}).toArray((err, data) => {

					let marketEntry = data[0];
					if (marketEntry) {
						let pouch = Chicken.userData.items.silver || {
							amount: 0
						};
						if (pouch.amount >= marketEntry.price) {
							pouch.amount -= marketEntry.price;
							Chicken.database.get(marketEntry.owner, (ownerUD) => {
								let silverItemData = itemUtils.items.silver.createItemData(marketEntry.price + marketEntry.deposit)
								itemUtils.addItemToUserData(ownerUD, silverItemData);
								itemUtils.addItemToUserData(Chicken.userData, marketEntry.itemData);
								marketEntry.sold = true;
								marketEntry.recipient = Chicken.userData.id;
								marketEntry.soldDate = new Date().getTime();
								collection.update({
									id: Chicken.mArgs.marketCode
								}, marketEntry).then(() => {
									Chicken.send(views.buy(Chicken, marketEntry, silverItemData));
								})
							});
						} else {
							Chicken.send("Insufficient silver.");
						}
					} else {
						nahBrother();
					}
				})
			})
		} else {
			nahBrother();
		}
	}

	exec_info(Chicken) {
		function nahBrother() {
			Chicken.send(`Market code ${ufmt.block(Chicken.mArgs.marketCode||'None')} not available.`);
		}
		console.log(Chicken.mArgs);
		if (Chicken.mArgs.marketCode) {
			Chicken.database.api.wrapper43('market', (collection) => {
				collection.find({
					id: Chicken.mArgs.marketCode
				}).toArray((err, data) => {

					let marketEntry = data[0];
					if (marketEntry) {
						Chicken.send(views.listing(Chicken, marketEntry));
					} else {
						nahBrother();
					}
				})
			})
		} else {
			nahBrother();
		}
	}

	exec_catalogue(Chicken) {
		const limit = 15;

		/**
		 * 
		 * @param {Number} skip Skip index
		 */
		function createOptions(skip) {
			return {
				sort: {
					date: -1
				},
				limit: limit,
				skip: skip * limit
			};
		}
		let query = null;
		if (!Chicken.mArgs.itemAccessor) {
			query = {
				v: {
					$gte: 0
				},
				sold: false,
				locked: false
			};
		} else {
			query = {
				accessor: {
					$regex: `.*${Chicken.mArgs.itemAccessor}.*`
				},
				sold: false,
				locked: false
			};
		}
		Chicken.database.api.wrapper43('market', (collection) => {
			collection.aggregate([{
				$group: {
					_id: "Market Stats",
					unsoldCount: {
						$sum: {
							$toInt: {
								$and: ["$sold", {
									$not: "$locked"
								}]
							}
						}
					}
				}
			}]).toArray((err, stats) => {
				let marketStatistics = stats[0];
				let numberOfPages = Math.ceil(marketStatistics.unsoldCount / limit);
				Chicken.mArgs.maxPages = numberOfPages;

				/*
					Modified ssfwbwpWrapper for catalogue pages
				*/

				let send = pages.ssfwbwpWrapper(Chicken, () => {}, [], numberOfPages, () => {
					let options = createOptions(Chicken.mArgs.page);
					collection.find(query, options).toArray().then((results) => {
						Chicken.mArgs.page = Math.min(numberOfPages - 1, Math.max(0, Chicken.mArgs.page || Chicken.numbers[0] - 1 || 0));
						Chicken.send(views.catalogue(Chicken, results, marketStatistics)).then(send.pageThing);
					});
				});
				send();
			})
		});
	}

	exec_sell(Chicken) {
		let userData = Chicken.userData;
		let items = userData.items;
		let searchResults = itemUtils.inventorySearch(items, Chicken.mArgs.itemAccessor);
		if (searchResults[0]) {
			let itemAccessor = searchResults[0];
			let itemData = items[itemAccessor];
			let itemObject = itemUtils.getItemObject(itemData);
			if (itemObject.isSaleRestricted) {
				Chicken.send("That item cannot be sold.");
				return;
			}
			if (itemData.amount >= Chicken.mArgs.amount) {
				let tempInv = {};
				itemUtils.transferItemToInventory(items, tempInv, itemData, Chicken.mArgs.amount);
				Chicken.mArgs.item = tempInv[itemAccessor];

				/**
				 * Cancel the sale
				 */
				function calcelSale() {
					Chicken.send("Item Sale canceled");
					itemUtils.addItemToInventory(items, Chicken.mArgs.item);
				}

				/**
				 * Continue the sale
				 */
				function continueSale() {
					Chicken.send(views.creating_listing(Chicken)).then((message) => {
						marketUtils.createMarketListing(Chicken, Chicken.mArgs.item, Chicken.mArgs.price, (a, listing) => {
							if (userData.items.silver) {
								if (items.silver.amount >= listing.deposit) {
									items.silver.amount -= listing.deposit;
									if (env.beta) {
										listing.beta = true;
									}
									Chicken.database.api.wrapper43('market', (collection) => {
										collection.insertOne(listing).then(() => {
											message.edit(views.listing(Chicken, listing, true));
											userData.listings.push(listing.id);
											console.log(`[Market] Listing created ${listing.id}`);
											``
										}).catch(() => {
											message.edit(views.error_creating_listing(Chicken, listing));
											items.silver.amount += listing.deposit;
										})
									})
								} else {
									calcelSale();
									message.edit("You cannot sell this item, you don't have enough silver for the deposit.");
									return;
								}
							} else {
								calcelSale();
								message.edit("You cannot sell this item, you don't have enough silver for the deposit.");
								return;
							}
						})
					})
				}

				

				/**
				 * Making sure all the args are in place
				 */
				if (!Chicken.mArgs.price) {
					Chicken.send(views.sale_receipt(Chicken)).then((receiptMessage) => {
						Chicken.prompt("How much would you like to sell it for (silver)?", (response) => {
							if (response.numbers[0]) {
								Chicken.mArgs.price = Math.max(1, response.numbers[0]);
								continueSale();
							} else {
								cancelSale();
							}
						})
					});
				} else {
					continueSale();
				}

			} else {
				Chicken.send(`You don't have ${ufmt.item(itemData, Chicken.mArgs.amount)}`);
				return;
			}
		} else if (searchResults.length == 0) {

		}
	}
	async execute(Chicken) {
		if (!Chicken.mArgs.valid) {
			return;
		}
		this[`exec_${Chicken.mArgs.type}`](Chicken);
		return null;
	}
}

module.exports = new CommandMarket();