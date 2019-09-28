let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const bp = require("../utils/bp.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");
const itemUtils = require("../utils/item.js");

class ItemArthursTablet extends Item{
	constructor(){
		super();
		this.name = "Arthur's Tablet"; // Required
		this.accessor = "arthurs_tablet"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 5;
		this.meta = {};

		this.icon = "https://i.imgur.com/690A2to.png";
		this.isDroppedByLootbox = true;
		this.canUseMulti = true;

		this.increaseValue = 2;
		this.effect = `Using this will add ${ this.increaseValue } LvL to your active pickaxe`;
	}

	get recipies(){
		return {
			"arthurs_tablet":{
				ingredients:[
					{
						key:"kingstones_stone",
						amount:10
					},
					{
						key:"silver",
						amount:1
					}
				],
				onCraft: (Chicken, amount=1) => { // returns itemData
					return itemUtils.items.arthurs_tablet.createItemData(amount);
				}
			}
		}
	}
	
	formatName( itemData ){
		return "Arthur's Tablet";
	}

	
	use( Chicken, itemData ){
		let amount = Chicken.mArgs.amount || 1;
		let increase = 16*amount*this.increaseValue;
		let oldLevel = bp.pickaxeLevelUD( Chicken.userData );
		Chicken.userData.pickaxe_exp+=increase;
		Chicken.send( ufmt.join(
		[
			`You hit yourself on the head with ${ufmt.plural(amount, '', 'a few')}${ufmt.block(ufmt.plural(amount,"Arthur's Tablet", "Arthur's Tablets"))} x${amount} and`,
			`your ${ufmt.block( Chicken.userData.pickaxe_name )} magically levels up!\n${ufmt.block( oldLevel )} -> ${ufmt.block( oldLevel+this.increaseValue*amount )}`
		]
	  ) );
	}

	desc( Chicken, itemData ){
		return ufmt.itemDesc([
			"*A rock tablet with embedded knowledge*",
			ufmt.denote('Type', ufmt.block('Level Modifier')),
			ufmt.denote('Usage', this.effect)
		]);
	}
}

module.exports = new ItemArthursTablet();