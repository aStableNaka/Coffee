let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
class ItemGoldenApple extends Item{
	constructor(){
		super();
		this.name = "Golden Apple"; // Required
		this.accessor = "golden_apple"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 4;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 6;
		this.boost = 75*30;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You eat a Golden Apple!`;
	}

	get recipies(){
		return {
			"golden_apple":{
				ingredients:[{key:'apple',amount:15},{key:'gold',amount:3}],
				onCraft:(Chicken, amount=1)=>{
						return itemUtils.items.golden_apple.createItemData( amount );
				}
			}
		};
	}
	  
	use( Chicken, itemData ){
		Chicken.userData.mineboost = this.boost; // Percent
		Chicken.userData.mineboostcharge = this.charge;
		Chicken.userData.mineboostsource = this.name;
		Chicken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( Chicken, itemData ){
		return ufmt.itemDesc([
			"*Be aware of gold poisoning!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemGoldenApple();