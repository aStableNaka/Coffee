let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemGem extends Item{
	constructor(){
		super();
		this.name = "Gem"; // Required
		this.accessor = "gem"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 6;
		this.meta = {};

		this.icon = "https://i.imgur.com/xuNt9P2.png";
		this.isSaleRestricted = false;
		this.canUseMulti = true;

		this.increaseValue = 334;
	}

	use( lToken, itemData ){
		let amount = lToken.mArgs.amount || 1;
		let bal = bpUtils.getCurrentBPBal( lToken );
		let outcome = new BigInt( new BigNum( bal.toString() ).times(new BigNum(1+this.increaseValue*0.01).pow( amount )).integerValue().toString() ).subtract(bal);
		bpUtils.addBP( lToken, outcome );
		lToken.send( Item.fmtUseMsg( `You exchange your ${ ufmt.itemName("Gem", amount)} for BP!`,[`+ ${ ufmt.numPretty( outcome ) } BP \n( + ${ufmt.numPretty( Math.round( (Math.pow(1+0.01*this.increaseValue, amount)-1)*100) )}% )`]) );
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
                  `A shiny gem worth ${this.increaseValue}% of your current BP bal.`,
                  `Only one lucky individual can find a ${ufmt.block('Gem')} *per day*. This applies globally.`
            ]);
	}
}

module.exports = new ItemGem();