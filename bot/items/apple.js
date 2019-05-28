let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemApple extends Item{
	constructor(){
		super();
		this.name = "Apple"; // Required
		this.accessor = "apple"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 1;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 3;
		this.boost = 60;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You eat an apple!`;
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.mineboost = this.boost; // Percent
		lToken.userData.mineboostcharge = this.charge;
		lToken.userData.mineboostsource = this.name;
		lToken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
			"*A healthy snack with sick benefits!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemApple();