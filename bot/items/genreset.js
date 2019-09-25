let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

/**
 * Resets a generator, but the user keeps the income
 */
class ItemGenReset extends Item{
	constructor(){
		super();
		this.name = "Gen Reset"; // Required
		this.accessor = "genreset"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 3;
		this.meta = {};
		this.usesMeta=true;
		this.icon = "https://i.imgur.com/fT8lZ9R.png";

		this.increaseValue = 8;
	  }
	  
	  createItemData( amount, meta ){
			let name = `gr_${meta}`;
			return {amount:amount, meta:meta, name:name}
	  }

	
	use( Chicken, itemData ){
		
	}

	desc( Chicken, itemData ){
		return `A shiny metal coin worth ${this.increaseValue}% of your current BP bal.`;
	}
}

module.exports = new ItemGenReset();