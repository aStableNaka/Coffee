let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const bp = require("../utils/bp.js");
const itemUtils = require("../utils/item.js");
const BigInt = require("big-integer");

/**
 * 
 * @param {String} outcomes 
 * @param {*} mobile 
 */
function fmtLootboxOutcome(outcomes, mobile) {
	let strLen = outcomes.map(x => x.length).reduce((acc, val) => {
		return Math.max(acc, val);
	}) + 2;
	let spoilers = mobile ? '' : "||";
	let ws = ufmt.embedWS;
	let content = outcomes.map((x) => {
		return `[ \`${ufmt.padCenter(`${x}`, strLen)}\` ]`
	});
	return `${spoilers}${content.join("\n")}${spoilers}`;
}

const enabledLootboxes = ['lootbox', 'lunchbox', 'goldbox'];
const boxboxDropDistribution = [90, 100, 15];
const allLootboxes = [
	'lootbox', 'lunchbox', 'daily_box',
	'box_box', 'pickbox', 'goldbox',
	'testbox', 'good_pickbox', 'greater_pickbox',
	'legendary_pickbox', 'pickperk_box'
];

const uniqueRankings = {
	'goldbox': 2,
	'box_box': 3,
	'pickbox': 4,
	'adminbox1000': 11,
	'itembox1000': 11,
	'testbox': 11,
	'good_pickbox': 5,
	'greater_pickbox': 6,
	'legendary_pickbox': 7
}

/**
 * Why are the lootbox helpers located under itemUtils and not here?
 * 
 * Because it's easier to debug under itemUtils
 */

class ItemLootbox extends Item {
	constructor() {
		super(false);
		this.name = "Lootbox"; // Required
		this.accessor = "lootbox"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 1;
		this.meta = {};
		this.usesMeta = true;
		this.icon = "https://i.imgur.com/u3RS3gh.png";
		this.emoji = "<:lootbox:631407099678556161>";
		// Can the item be used multiple times?
		this.canUseMulti = true; // Enables amount modifier

		// Create an instance of each type of lootbox for use later
		this.metaInstances = {};
		allLootboxes.map((itemMetaLabel) => {
			this.metaInstances[itemMetaLabel] = this.createItemData(1, itemMetaLabel);
		}, this);
	}

	get recipies() {
		return {
			"lootbox": {
				ingredients: [{
						key: 'crafting_materials',
						amount: 1
					},
					{
						key: 'silver',
						amount: 1
					}
				],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'lootbox');
				}
			},
			"box_box": {
				ingredients: [{
						key: 'crafting_materials',
						amount: 5
					},
					{
						key: 'lootbox',
						amount: 1
					}
				],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'box_box');
				}
			},
			"good_pickbox": {
				ingredients: [{
					key: 'box_box',
					amount: 4
				}, {
					key: 'gold',
					amount: 10
				}, {
					key: 'crafting_materials',
					amount: 20
				}],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'good_pickbox');
				}
			},
			"greater_pickbox": {
				ingredients: [{
					key: 'box_box',
					amount: 10
				}, {
					key: 'crafting_materials',
					amount: 80
				}, {
					key: 'gold',
					amount: 20
				}, {
					key: 'foxtail_amulet',
					amount: 5
				}],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'greater_pickbox');
				}
			},
			"legendary_pickbox": {
				ingredients: [{
					key: 'box_box',
					amount: 50
				}, {
					key: 'crafting_materials',
					amount: 210
				}, {
					key: 'gold',
					amount: 50
				}, {
					key: 'orb_of_almanac',
					amount: 1
				}],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'legendary_pickbox');
				}
			},
			"pickperk_box": {
				ingredients: [{
					key: 'box_box',
					amount: 2
				}, {
					key: 'crafting_materials',
					amount: 10
				}, {
					key: 'gold',
					amount: 5
				}],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.lootbox.createItemData(amount, 'pickperk_box');
				}
			}
		};
	}

	/**
	 * Override
	 */
	getUniqueRank(itemData) {
		return uniqueRankings[itemData.meta] || this.rank;
	}

	/**
	 * Override
	 * @param {*} amount 
	 * @param {*} meta 
	 * @param {*} name 
	 * @param {*} adminRigs 
	 */
	createItemData(amount = 1, meta, name, adminRigs) {
		let drops = adminRigs || enabledLootboxes;
		if (!meta) {
			if (adminRigs) {
				meta = ufmt.pick(drops, 1)[0];
			} else {
				meta = drops[itemUtils.pickFromDistribution(boxboxDropDistribution, 1)[0]];
			}
		}
		return {
			accessor: 'lootbox',
			amount: amount,
			name: meta,
			meta: meta
		}
	}

	pickItemsFromDistribution(distribution, amount, dropFilter = itemUtils.lunchboxDropFilter) {
		// Picks indecies based on distribution defined by the element at a given index
		let indexSamples = itemUtils.pickFromDistribution(distribution, amount);
		let itemObjectOutcomes = indexSamples.map((rank, i) => {
			// Might want to cache this for performance increase

			// If there is available drop for this rank, try for the rank directly below it.
			function doPick(r) {
				let filteredDrops = itemUtils.dropsByRank[r].filter(dropFilter).filter((x) => {
					return !!x;
				});
				let chosenDrop = ufmt.pick(filteredDrops, 1)[0];
				if (r == -1) {
					// if it fails to find something, give the user gold instead.
					return itemUtils.items.gold;
				}
				if (!chosenDrop) {
					return doPick(r - 1);
				}
				return chosenDrop;
			}
			return doPick(rank);
		});
		return itemObjectOutcomes;
	}

	tallyItemOutcomes(outcomes) {
		let accessors = outcomes.map((itemData) => {
			return itemData.name || itemData.accessor
		});
		// This is a tally snippet
		let tallyObject = {}
		accessors.map((accessor, i) => {
			if (!tallyObject[accessor]) {
				tallyObject[accessor] = 1;
			} else {
				tallyObject[accessor] += outcomes[i].amount || 1;
			}
		});
		return tallyObject;
	}

	formatTalliedOutcomes(tallyObject) {
		return Object.keys(tallyObject).map((accessor) => {
			return ufmt.itemName(accessor, tallyObject[accessor], '', false);
		});
	}

	processLootboxOutcomes(Chicken, distribution, amount, dropFilter) {
		let outcomes = this.pickItemsFromDistribution(distribution, amount, dropFilter);
		let itemDatas = outcomes.map((itemObject) => {
			// Since it's generated, we let the item decide how its going to generate its itemdata
			return itemObject.createItemData();
		});
		let tallyObject = this.tallyItemOutcomes(itemDatas);
		let formattedTallies = this.formatTalliedOutcomes(tallyObject);

		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		return formattedTallies;
	}





	/**
	 * A lootbox that drops food items
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_lunchbox(Chicken, itemData) {
		let formattedTallies = this.processLootboxOutcomes(Chicken, itemUtils.dropDistribution, 2 * Chicken.mArgs.amount, itemUtils.lunchboxDropFilter);
		let useDialogue = `You open up your home-made ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	/**
	 * A lootbox that drops any sort of items
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_lootbox(Chicken, itemData) {
		let formattedTallies = this.processLootboxOutcomes(Chicken, itemUtils.dropDistribution, 3 * Chicken.mArgs.amount, itemUtils.lootboxDropFilter);
		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	meta_testbox(Chicken, itemData) {
		let formattedTallies = this.processLootboxOutcomes(Chicken, itemUtils.dropDistribution, 10 * Chicken.mArgs.amount, itemUtils.testboxDropFilter);
		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	/**
	 * Drops crafting materials
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_materialsbox(Chicken, itemData) {
		let amount = Chicken.mArgs.amount;
		let outcome = 0;
		new Array(amount).fill(0).map(() => {
			outcome += Math.ceil(Math.random() * 2);
		})
		let dropItemData = itemUtils.items.crafting_materials.createItemData(outcome);
		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [`\`${ufmt.item( dropItemData, null, '', null, null, null, false )}\``]));
		itemUtils.addItemToUserData(Chicken.userData, dropItemData);
	}

	/**
	 * A lootbox that drops a pickaxe
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_pickbox(Chicken, itemData, tier = 0) {
		let amount = Chicken.mArgs.amount;
		let itemDatas = new Array(amount).fill(0).map(() => {
			return itemUtils.items.pickaxe.createItemData(1, null, null, tier);
		})
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	meta_good_pickbox(Chicken, itemData) {
		this.meta_pickbox(Chicken, itemData, 1);
	}

	meta_greater_pickbox(Chicken, itemData) {
		this.meta_pickbox(Chicken, itemData, 2);
	}

	meta_legendary_pickbox(Chicken, itemData) {
		this.meta_pickbox(Chicken, itemData, 3);
	}

	/**
	 * A lootbox that drops gold
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_goldbox(Chicken, itemData) {
		let amount = Chicken.mArgs.amount;
		let outcome = 0;
		new Array(amount).fill(0).map(() => {
			outcome += Math.ceil(Math.random() * 1);
		})
		let dropItemData = itemUtils.items.gold.createItemData(outcome);
		let useDialogue = `You open up ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [`\`${ufmt.item( dropItemData, null, '', null, null, null, false )}\``]));
		itemUtils.addItemToUserData(Chicken.userData, dropItemData);
	}

	/**
	 * A lootbox that drops other lootboxes!
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_box_box(Chicken, itemData) {
		let amount = 2 * Chicken.mArgs.amount;
		let itemDatas = new Array(amount).fill(0).map(() => {
			return this.createItemData();
		})
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	meta_badbox(Chicken, itemData) {
		//Chicken.send(":D how did you find me?");
		Chicken.messageAdmin(ufmt.join([
			ufmt.denote('Type', 'Invalid Lootbox used'),
			ufmt.denote('User', ufmt.name(Chicken.userData)),
			ufmt.denote('Command', ufmt.code(Chicken.msg)),
			ufmt.denote('ItemData', ufmt.code(JSON.stringify(itemData, null, "\t"), "json"))
		]));
		let newLootboxData = itemUtils.items.lootbox.createItemData(Chicken.mArgs.amount, 'lootbox');
		Chicken.send(`Whoa... You're not supposed to have this item!!. Here, have a ${ufmt.item(newLootboxData)} instead.`);
		itemUtils.addItemToUserData(Chicken.userData, newLootboxData);
	}

	/**
	 * Drops Pick Perk
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_pickperk_box(Chicken, itemData) {
		let amount = Chicken.mArgs.amount;
		let itemDatas = new Array(amount).fill(0).map(() => {
			return itemUtils.items.pickperk.createItemData(1);
		})
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	/**
	 * A special lootbox you can only obtain once a day!
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_daily_box(Chicken, itemData) {
		let amount = 2 * Chicken.mArgs.amount;
		let itemDatas = new Array(amount).fill(0).map(() => {
			return this.createItemData();
		})
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}

	/**
	 * For debugging purposes
	 * gives the user 1000 random lootboxes
	 * uses enabledLootboxes
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_adminbox1000(Chicken, itemData) {
		let amount = 1000 * Chicken.mArgs.amount;
		let itemDatas = new Array(amount).fill(0).map(() => {
			return this.createItemData(1, null, null, allLootboxes);
		})
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}


	/**
	 * For debugging purposes
	 * gives the user 1000 of each non-unique item
	 * uses enabledLootboxes
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	meta_itembox1000(Chicken, itemData) {
		let amount = 1000 * Chicken.mArgs.amount;
		let itemDatas = Object.values(itemUtils.items).map((item) => {
			if (!item.isUnique && !item.usesMeta) {
				return item.createItemData(1000);
			}
			return null;
		}).filter((itemData) => {
			return !!itemData;
		});
		let formattedTallies = this.formatTalliedOutcomes(this.tallyItemOutcomes(itemDatas));
		itemDatas.map((outcomeItemData) => {
			itemUtils.addItemToUserData(Chicken.userData, outcomeItemData);
		});

		let useDialogue = `You open up a ${ ufmt.item( itemData, Chicken.mArgs.amount ) }\nand inside it, you find...`;
		Chicken.send(Item.fmtUseMsg(useDialogue, [fmtLootboxOutcome(formattedTallies, Chicken.mobile)]));
	}



	use(Chicken, itemData) {
		// Test
		if (this[`meta_${itemData.meta}`]) {
			this[`meta_${itemData.meta}`](Chicken, itemData);
		} else {
			this.meta_badbox(Chicken, itemData);
		}

	}

	desc(Chicken, itemData) {
		switch (itemData.meta) {
			case 'lunchbox':
				return ufmt.join([
					`*A wooden box full of food!*`,
					ufmt.denote("Usage", `Drops ${ufmt.block(2)} random consumables.`),
					ufmt.denote("Possible Drops", `\n${ufmt.joinGrid(itemUtils.drops_lootbox_lunchbox.map((itemObject)=>{
						return ufmt.block( itemObject.name );
					}),', ',4)}`)
				]);
			case 'lootbox':
				return ufmt.join([
					`*A box full of loot*`,
					ufmt.denote("Usage", `Drops ${ufmt.block(2)} random items.`),
					ufmt.denote("Possible Drops", `\n${ufmt.joinGrid(itemUtils.drops_lootbox_lootbox.map((itemObject)=>{
						return ufmt.block( itemObject.name );
					}),', ',4)}`)
				]);
			case 'goldbox':
				return ufmt.join([
					`*A box full of gold*`,
					ufmt.denote("Usage", `Drops ${ufmt.block('1')} gold.`),
					ufmt.denote("Possible Drops", `\n${ufmt.block( "gold" )}`)
				]);
			case 'daily_box':
				return ufmt.join([
					`*A special lootbox you can only obtain once a day*`,
					ufmt.denote("Usage", `Drops ${ufmt.block('3')} random types of lootboxes.`),
					ufmt.denote("Possible Drops", `\n${ufmt.joinGrid([
						'Lootbox', 'Lunchbox', 'Gold Box'
					].map((itemObject)=>{
						return ufmt.block( itemObject.name );
					}),', ',4)}`)
				])
			case 'good_pickbox':
				return ufmt.join([
					`*A box that drops a good pickaxe*`,
					ufmt.denote("Usage", `Drops a tier ${ufmt.block('1')} pickaxe.`)
				])
			case 'greater_pickbox':
				return ufmt.join([
					`*A box that drops a greater pickaxe*`,
					ufmt.denote("Usage", `Drops a tier ${ufmt.block('2')} pickaxe.`)
				])
			case 'legendary_pickbox':
				return ufmt.join([
					`*A box that drops a legendary pickaxe*`,
					ufmt.denote("Usage", `Drops a tier ${ufmt.block('3')} pickaxe.`)
				])
			case 'pickperk_box':
				return ufmt.join([
					`*A box that drops a pick perk*`,
					ufmt.denote("Usage", `Drops a random pickperk (PP).`)
				])
			default:
				return ufmt.join([
					`Lootboxes contain loot!`,
					`There are several types of lootboxes...`,
					(enabledLootboxes).map((x) => {
						return ufmt.block(x);
					}).join(", ")
				]);

		}
	}
}

module.exports = new ItemLootbox();