let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const locale = require("../data/EN_US");

class ItemPickPerk extends Item{
	constructor(){
		super();
		this.name = "PickPerk"; // Required
		this.accessor = "pickperk"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 6;
		this.meta = {};

        this.icon = "https://i.imgur.com/fT8lZ9R.png";
        
		this.isDroppedByLunchbox = false;
		this.isDroppedByLootbox = false;
    }
    
    createItemData( amount=1, meta=0 ){
        let name = this.name+"_"+meta;
        return { accessor:this.accessor, amount: amount, name:name || this.accessor, meta:meta || this.meta }
    }

	// Virural function
	use( lToken, itemData ){
		if(itemData.meta){

		}else{
			lToken.send( "How did you get this? :)");
		}
		
	}

	desc( lToken, itemData ){
        if(itemData.meta){

        }else{
            ufmt.itemDesc([
                "*Makes your pickaxe better!*",
                ufmt.denote('Type', ufmt.block('Pickaxe Enchantment')),
                ufmt.denote('Usage', this.effect)
            ]);
        }
	}
}

module.exports = new ItemPickPerk();