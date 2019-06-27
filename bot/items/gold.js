let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemGold extends Item{
	constructor(){
		super();
		this.name = "Gold"; // Required
		this.accessor = "gold"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://i.imgur.com/506QOWO.png";
		this.isSaleRestricted = true;
		this.isDroppedByLootbox = true;
		this.isDroppedByLunchbox = true;
		this.canUseMulti = true;

		this.increaseValue = 8;
	}

	
	use( Chicken, itemData ){
		let amount = Chicken.mArgs.amount || 1;
		let bal = bpUtils.getCurrentBPBal( Chicken );
		let outcome = new BigInt( new BigNum( bal.toString() ).times(new BigNum(1+this.increaseValue*0.01).pow( amount )).integerValue().toString() ).subtract(bal);
		bpUtils.addBP( Chicken, outcome );
		Chicken.send( Item.fmtUseMsg( `You exchange your ${ ufmt.itemName("Gold", amount)} for BP!`,[`+ ${ ufmt.bp( outcome ) } BP \n( + ${ufmt.numPretty( Math.round( (Math.pow(1+0.01*this.increaseValue, amount)-1)*100) )}% )`]) );
		
		/*
		let outcome = new BigInt( bpUtils.getCurrentBPBal( Chicken ) ).divide( 100 ).multiply(this.increaseValue*(amount));
		bpUtils.addBP( Chicken, outcome );
		Chicken.send( Item.fmtUseMsg( `You exchange your ${ ufmt.itemName("Gold", amount)} for BP!`,[`+ ${ ufmt.numPretty( outcome ) } BP \n( + ${ufmt.numPretty( this.increaseValue*(amount) )}% )`]) );
		*/
	}

	desc( Chicken, itemData ){
		let desc = `A shiny metal coin worth ${this.increaseValue}% of your current BP bal.`;
		if(!itemData){ return desc; }
		let amount = itemData.amount || 0;
		let bal = bpUtils.getCurrentBPBal( Chicken );
		let outcome = new BigInt( new BigNum( bal.toString() ).times(new BigNum(1+this.increaseValue*0.01).pow( itemData.amount )).integerValue().toString() ).subtract(bal);
		return ufmt.itemDesc([
			desc,
			ufmt.denote('Currently owned', amount ),
			ufmt.denote('Worth', ufmt.bp(outcome))
		]);
	}
}

module.exports = new ItemGold();