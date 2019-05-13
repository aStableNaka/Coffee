let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");

class ItemTemplate extends Item{
	constructor(){
		super();
		this.name = "Item"; // Required
		this.accessor = "item"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 1;
		this.meta = {};

		this.icon = "https://i.imgur.com/u3RS3gh.png";
	}

	// Virural function
	use( lToken, itemData ){

	}

	desc( lToken, itemData ){
		return `Item`;
	}
}

module.exports = new ItemTemplate();