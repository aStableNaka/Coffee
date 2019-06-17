let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemOrbOfAlmanac extends Item{
	constructor(){
		super();
		this.name = "Orb of Amlanac"; // Required
		this.accessor = "orb_of_almanac"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 6;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.isSaleRestricted = true;
		//this.isDroppedByLootbox = true;
		//this.isDroppedByLunchbox = true;
		//this.canUseMulti = true;

		//this.increaseValue = 8;
	}

	
	use( lToken, itemData ){
		let amount = lToken.mArgs.amount || 1;
		let outcome = new BigInt( bpUtils.getCurrentBPBal( lToken ) ).divide( 100 ).multiply(this.increaseValue*(amount));
		bpUtils.addBP( lToken, outcome );
		lToken.send( Item.fmtUseMsg( `You exchange your ${ ufmt.itemName("Gold", amount)} for BP!`,[`+ ${ ufmt.numPretty( outcome ) } BP \n( + ${ufmt.numPretty( this.increaseValue*(amount) )}% )`]) );
	}

	desc( lToken, itemData ){
		return `A shiny metal coin worth ${this.increaseValue}% of your current BP bal.`;
	}
}

module.exports = new ItemOrbOfAlmanac();