let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");


/**
 * WIP
 * I want to make it either change the name of a
 */
class ItemNametag extends Item{
	constructor(){
		super();
		this.name = "Nametag"; // Required
		this.accessor = "nametag"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 2;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		
		//this.isDroppedByLootbox = true;
	}

	
	use( lToken, itemData ){
		lToken.send('Crafting is not available yet!');
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
                  `Use this to rename your currently equipped pickaxe!`,
                  ufmt.denote('Usage', 'You will be prompted to pick a new name for your current pickaxe.')
            ]);
	}
}

module.exports = new ItemNametag();