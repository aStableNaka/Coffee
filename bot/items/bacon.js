let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemBacon extends Item{
	constructor(){
		super();
		this.name = "Bacon"; // Required
		this.accessor ="bacon"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 0;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 4;
		this.boost = 20;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
        this.useDialogue = `You eat a slice of bacon!`
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
			"*An American favorite!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect),,
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemBacon();