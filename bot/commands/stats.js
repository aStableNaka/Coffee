const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/fmt.js");
const views = loader("./bot/views/stats", "./views/stats");
const page = require("../utils/page");
const emojis = require("../utils/emojis")

class CommandStats extends Command {
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
		return ["statistics", "stats"];
	}
	get mimics() {
		return [
			{ name: "istat", cmd: "stats item" },
			{ name: "iustat", cmd: `stats item sort:"useddescending"` },
			{ name: "istats", cmd: "stats item" },
			{ name: "iustats", cmd: `stats item sort:"useddescending"` },
			{ name: "icstat", cmd: "stats" },
			{ name: "icustat", cmd: `stats sort:"useddescending"` },
			{ name: "icstats", cmd: "stats" },
			{ name: "icustats", cmd: `stats sort:"useddescending"` },
		];
	}
	get help() {
		return null; /*["A simple command!"];*/
	}
	get helpExamples() {
		return; /*[["command", "< parameters >", "desc"]];*/
	}
	get helpGroup() {
		return null;
	}
	get helpName() {
		return null;
	}
	get helpPage() {
		return 2;
	}
	get blacklist() {
		return ['350823530377773057', '133169572923703296'];
	}
	modifyArgs(args, Chicken) {
		const validOptions = ['item'];
		let mArgs = {};
		switch ((Chicken.argwords || [])[0]) {
			case 'item':
				const defaultItem = 'silver';
				mArgs.type = 'item';
				mArgs.itemAccessor = (Chicken.argwords[1] || defaultItem);
				let itemAccessor = itemUtils.superDeepItemSearch(Chicken, mArgs.itemAccessor)[0];
				if (!itemAccessor) {
					mArgs.itemAccessor = defaultItem;
				} else {
					mArgs.itemAccessor = itemAccessor;
				}
				break;
			default:
				mArgs.type = 'itempop';
		}
		return mArgs;
	}

	queryUsingMongoose_item(Chicken, itemAccessor, sortingMethod, callback) {
		let self = this;
		Chicken.database.query({ id: { $exists: true } }, (userDatas) => {
			let n = userDatas.filter((userData) => {
				if (self.blacklist.indexOf(userData.id) > -1) { return false; }
				if (userData.blacklisted) { return false; }
				let item = userData.items[itemAccessor];
				if (!item) { return false }
				return item.amount > 0;
			}).sort(sortingMethod);
			callback(n);
		})
	}

	queryUsingMongoDB_item(Chicken, itemAccessor, sortingMethod, callback) {
		let self = this;
		Chicken.database.api.wrapper43('users', (collection) => {
			let query = {};
			let projection = { name: 1, items: 1, blacklisted: 1 };
			query[`items.${itemAccessor}`] = { $exists: true };
			projection[`items.${itemAccessor}`] = 1;
			query.$and = this.blacklist.map((id) => {
				return { id: { $ne: id } };
			})
			collection.find(query, { projection: projection, sort: sortingMethod(), limit: 50 }).toArray((err, data) => {
				if (!data || data.length == 0) { return []; }
				callback(data.filter((userData) => {
					if (self.blacklist.indexOf(userData.id) > -1 || userData.blacklisted) { return false; }
					return true;
				}));
			})
		})
	}


	queryUsingMongoose_itempop(Chicken, callback) {
		let self = this;
		Chicken.database.query({ id: { $exists: true } }, (userDatas) => {
			let n = userDatas.filter((userData) => {
				if (self.blacklist.indexOf(userData.id) > -1) { return false; }
				if (userData.blacklisted) { return false; }
				return true;
			});
			callback(n);
		})
	}

	queryUsingMongoDB_itempop(Chicken, callback) {
		Chicken.database.api.wrapper43('users', (collection) => {
			let group = { _id: null };
			Object.keys(itemUtils.items).map((ia) => {
				group[ia] = {}
			})
			// Using aggregation instead of map does not take into acount meta-specific items
			// like lootboxes/special pickaxes/etc

			// Using map can be very resource intensiv
			collection.aggregate()
		})
	}

	/**
	 * Item count statistics
	 * Catalogues a single item
	 * @param {Chicken} Chicken 
	 */
	exec_item(Chicken) {
		let self = this;
		let itemAccessor = Chicken.mArgs.itemAccessor;

		function sortByAmountOwnedDecending() { let sort = {}; sort[`items.${itemAccessor}.amount`] = -1; return sort; }
		function sortByAmountOwnedAscending() { let sort = {}; sort[`items.${itemAccessor}.amount`] = 1; return sort; }
		function sortByAmountUsedDecending() { let sort = {}; sort[`items.${itemAccessor}.used`] = -1; return sort; }
		function sortByAmountUsedAscending() { let sort = {}; sort[`items.${itemAccessor}.used`] = 1; return sort; }
		let sortingMethods = {
			"ownedascending": sortByAmountOwnedAscending,
			"owneddescending": sortByAmountOwnedDecending,
			"usedascending": sortByAmountUsedAscending,
			"useddescending": sortByAmountUsedDecending
		};
		let chosenSortingMethod = sortingMethods[Chicken.keyPairs.sort] || sortByAmountOwnedDecending;
		Chicken.send(views.loading(Chicken)).then((sentMessage) => {
			self.queryUsingMongoDB_item(Chicken, itemAccessor, chosenSortingMethod, (userDatas) => {
				if (userDatas.length == 0) { sentMessage.edit(views.no_match(Chicken)); return; }
				sentMessage.edit(views.item(Chicken, userDatas.sort(chosenSortingMethod)));
			});
		});
	}

	/**
	 * Item popularity statistics
	 * Which items are used the most
	 * catalogues every item
	 * @param {*} Chicken 
	 */
	exec_itempop(Chicken) {
		let self = this;
		let itemAccessor = Chicken.mArgs.itemAccessor;
		let itemSummations = {};
		function createItemSummation(itemAccessor) {
			return { accessor: itemAccessor, amount: 0, used: 0, total: 0 };
		}
		function sortByAmountOwnedDecending(a, b) { return b.amount - a.amount; }
		function sortByAmountOwnedAscending(a, b) { return a.amount - b.amount; }
		function sortByAmountUsedDecending(a, b) { return b.used - a.used; }
		function sortByAmountUsedAscending(a, b) { return a.used - b.used; }
		let sortingMethods = {
			"ownedascending": sortByAmountOwnedAscending,
			"owneddescending": sortByAmountOwnedDecending,
			"usedascending": sortByAmountUsedAscending,
			"useddescending": sortByAmountUsedDecending
		};
		let chosenSortingMethod = sortingMethods[Chicken.keyPairs.sort] || sortByAmountOwnedDecending;
		Chicken.send(views.loading(Chicken)).then((sentMessage) => {
			self.queryUsingMongoose_itempop(Chicken, (userDatas) => {
				if (userDatas.length == 0) { sentMessage.edit(views.no_match(Chicken)); return; }
				userDatas.map((userData) => {
					let items = Object.values(userData.items || {});
					items.map((itemData) => {
						let accessor = itemData.accessor;
						if(accessor == "lootbox"){
							accessor = itemData.meta;
						}
						if (!itemSummations[accessor]) { itemSummations[accessor] = createItemSummation(accessor); }
						let summation = itemSummations[accessor];
						summation.amount += itemData.amount || 0;
						summation.used += itemData.used || 0;
						summation.total += (itemData.amount || 0) + (itemData.used || 0);
					});
				});

				const data = Object.values(itemSummations).sort(chosenSortingMethod);

				let numberOfPages = Math.ceil(data.length / 20);
				Chicken.mArgs.maxPages = numberOfPages;
				
				const send = page.ssfwbwpWrapper( Chicken, views.item_pop, [Chicken, data], numberOfPages, ()=>{
					Chicken.mArgs.page = Math.min(numberOfPages - 1, Math.max(0, Chicken.mArgs.page || Chicken.numbers[0] - 1 || 0));
					Chicken.send(views.item_pop(Chicken, data)).then(send.pageThing);
				});
				send();
				sentMessage.delete();
			});
		});
	}
	exec_overview(Chicken) {

	}
	async execute(Chicken) {
		let statCard = Chicken.userData.items.stat_card;
		if (!statCard || statCard.amount < 1) {
			Chicken.send(`You need a ${ufmt.block('Stat Card')}x1 to use this command!`);
			return;
		}
		statCard.used++;
		statCard.amount--;
		this[`exec_${Chicken.mArgs.type}`](Chicken);
	}
}

module.exports = new CommandStats();