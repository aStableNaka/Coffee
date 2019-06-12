let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const bp = require("../utils/bp.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemKingstonsStone extends Item{
	constructor(){
		super();
		this.name = "Kingstone's Stone"; // Required
		this.accessor = "kingstones_stone"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 5;
		this.meta = {};

		this.icon = "https://i.imgur.com/690A2to.png";
        this.isDroppedByLootbox = true;
        this.canUseMulti = true;

        this.increaseValue = 2;
        this.effect = `Using this will add ${ this.increaseValue } LvLs to your active pickaxe`;
    }
    
    	formatName( itemData ){
		return "Kingstone's Stone";
	}

	
	use( lToken, itemData ){
		let amount = lToken.mArgs.amount || 1;
        let increase = 16*amount*this.increaseValue;
        let oldLevel = bp.pickaxeLevelUD( lToken.userData );
        lToken.userData.pickaxe_exp+=increase;
        lToken.send( ufmt.join(
		[
			`You hit yourself on the head with ${ufmt.block("Kingstone's Stone")} x${amount} and`,
			`your ${ufmt.block( lToken.userData.pickaxe_name )} magically levels up!\n${ufmt.block( oldLevel )} -> ${ufmt.block( oldLevel+this.increaseValue*amount )}`
		]
	  ) );
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
            "*A rock with embedded knowledge*",
            ufmt.denote('Type', ufmt.block('Level Modifier')),
            ufmt.denote('Usage', this.effect)
        ]);
	}
}

module.exports = new ItemKingstonsStone();