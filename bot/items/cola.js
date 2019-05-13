let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemCola extends Item{
	constructor(){
		super();
		this.name = "Cola"; // Required
		this.accessor = "cola"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 1;
		this.boost = 1600;
		this.effect = `Drinking this will immediately reset your mining cooldown. Also, your next mine will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You drink some cola! You feel a sudden surge of energy...`;
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.mineboost = this.boost; // Percent
		lToken.userData.mineboostcharge = this.charge;
		lToken.userData.mineboostsource = this.name;
		lToken.userData.lastmine = 0; // Percent
		lToken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
			"*Made with real cocai- Sugar!*",
			ufmt.denote('Type', [ufmt.block('Mining Boost'), ufmt.block('Cooldown Reduction')].join(' ')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemCola();