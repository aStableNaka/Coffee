let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");

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

	
	use( lToken, itemData ){

	}

	desc( lToken, itemData ){
		return `Item`;
	}
}

module.exports = new ItemTemplate();