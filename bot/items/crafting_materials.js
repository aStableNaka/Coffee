let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");

class ItemCraftingMaterials extends Item{
	constructor(){
		super();
		this.name = "Crafting Materials"; // Required
		this.accessor = "crafting_materials"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		
		this.isDroppedByLootbox = true;
	}

	// Virural function
	use( lToken, itemData ){}

	desc( lToken, itemData ){
		return `This is used as an ingredient for crafting!`;
	}
}

module.exports = new ItemCraftingMaterials();