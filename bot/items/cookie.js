let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemCookie extends Item{
	constructor(){
		super();
		this.name = "Cookie"; // Required
		this.accessor = "cookie"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 2;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 2;
		this.boost = 160;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You eat a cookie!`;
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
			"*A homemade cookie. It's still warm!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemCookie();