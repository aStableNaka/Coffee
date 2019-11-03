let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");
const itemUtils = require("../utils/item.js");

class ItemOrbOfAlmanac extends Item {
	constructor() {
		super();
		this.name = "Orb of Almanac"; // Required
		this.accessor = "orb_of_almanac"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 6;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.isSaleRestricted = true;
		this.isDroppedByLootbox = true;
		//this.isDroppedByLunchbox = true;
		this.canUseMulti = true;

		//this.increaseValue = 8;
	}

	get recipes() {
		return {
			"orb_of_almanac": {
				ingredients: [{
						key: "box_box",
						amount: 30
					},
					{
						key: "crafting_materials",
						amount: 20
					},
					{
						key: "kingstones_stone",
						amount: 50,
					},
					{
						key: "gold",
						amount: 20
					},
					{
						key: "gilded_slurry",
						amount: 5
					},
					{
						key: "foxtail_amulet",
						amount: 2
					}
				],
				onCraft: (Chicken, amount = 1) => { // returns itemData
					return itemUtils.items.orb_of_almanac.createItemData(amount);
				}
			}
		}
	}


	use(Chicken, itemData) {
		let amount = Chicken.mArgs.amount || 1;
		Chicken.userData.orbs += amount;
		Chicken.send(Item.fmtUseMsg(`*You shatter the ${ufmt.plural(amount, 'Orb', 'Orbs')} of Almanac and a mysterious flash of light rushes into your pockets.*`, [
			ufmt.denote('Effect', `All income is permanently increased by ${ufmt.block(Math.pow(2,amount))} x`)
		]));
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			`An enigma surrounded by an ominous glow...`,
			ufmt.denote('Usage', 'Permanently increases all income by x2 per orb applied.')
		]);
	}
}

module.exports = new ItemOrbOfAlmanac();