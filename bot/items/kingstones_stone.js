let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const bp = require("../utils/bp.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemKingstonsStone extends Item {
	constructor() {
		super();
		this.name = "Kingstone's Stone"; // Required
		this.accessor = "kingstones_stone"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 1;
		this.meta = {};

		this.icon = "https://i.imgur.com/690A2to.png";
		this.isDroppedByLootbox = true;
		this.canUseMulti = true;
		this.emoji = "<:kingstone:631407101637427200>";
		this.increaseValue = 1;
		this.effect = `Using this will add ${ this.increaseValue } exp to your active pickaxe`;
	}

	formatName(itemData) {
		return "Kingstone's Stone";
	}


	use(Chicken, itemData) {
		let amount = Chicken.mArgs.amount || 1;
		let increase = amount * this.increaseValue;
		let oldLevel = Chicken.userData.pickaxe_exp;
		Chicken.userData.pickaxe_exp += increase;
		Chicken.send(ufmt.join(
			[
				`You hit yourself on the head with ${ufmt.block("Kingstone's Stone")} x${amount} and`,
				`your ${ufmt.block( Chicken.userData.pickaxe_name )} gains exp!\n${ufmt.block( oldLevel )} -> ${ufmt.block( Chicken.userData.pickaxe_exp )}`
			]
		));
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*A rock with embedded knowledge*",
			ufmt.denote('Type', ufmt.block('Exp Modifier')),
			ufmt.denote('Usage', this.effect)
		]);
	}
}

module.exports = new ItemKingstonsStone();