let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");

class ItemStarfruit extends Item{
	constructor(){
		super();
		this.name = "Starfruit"; // Required
		this.accessor = "starfruit"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 2;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 1;
		this.boost = 45;
		this.cdrs = 150; // Cooldown reduction in seconds
		this.effect = `This will reduce your current mining cooldown by ${ufmt.block(this.cdrs)} seconds and your next mine will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You've eaten a starfruit!`;
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	
	use( Chicken, itemData ){
		Chicken.userData.mineboost = this.boost; // Percent
		Chicken.userData.mineboostcharge = this.charge;
		Chicken.userData.mineboostsource = this.name;
		Chicken.userData.lastmine -= 1000*this.cdrs;
		Chicken.send(Item.fmtUseMsg( this.useDialogue,[
			ufmt.denote('Cooldown Reduction', `Your current mining cooldown is reduced by ${ufmt.block(this.cdrs)} seconds.`),
			ufmt.denote('Mining Boost', `Your next mine will produce ${ufmt.block(this.boost)} % more profit.`)
		]));
	}

	desc( Chicken, itemData ){
		return ufmt.itemDesc([
			"*A bizzare tropical delicacy!*",
			ufmt.denote('Type', [ufmt.block('Mining Boost'),ufmt.block('Cooldown Reduction')].join(' ')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemStarfruit();