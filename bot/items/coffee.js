let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemCoffee extends Item{
	constructor(){
		super();
		this.name = "Coffee"; // Required
		this.accessor = "coffee"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 2;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";

		this.effect = "Resets your mining cooldown and lets you immediately mine again. Only use this after you've just mined.";
		this.useDialogue = 'You drink some coffee';
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.lastmine = 0; // Percent
		lToken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( lToken, itemData ){
		return `*"A good source of energy!"*\nType: ${ufmt.block('Cooldown Reduction')}\nUsage: ${this.effect}`;
	}
}

module.exports = new ItemCoffee();