let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemJungleJuice extends Item{
	constructor(){
		super();
		this.name = "Jungle Juice"; // Required
		this.accessor = "jungle_juice"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 1;
		this.boost = 2100;
		this.effect = `Drinking this will reduce your current mining cooldown by 50% your pickaxe's base cooldown. Also, your next mine will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You drink some ${ufmt.block(this.name)}! You feel ${ufmt.block('Ho Chi Minh')}'s presence surge within you...`;
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	
	use( lToken, itemData ){
		lToken.userData.mineboost = this.boost; // Percent
		lToken.userData.mineboostcharge = this.charge;
		lToken.userData.mineboostsource = this.name;
		lToken.userData.lastmine = lToken.userData.lastmine - Math.floor(lToken.userData.pickaxe_time*1000*60/2);
		lToken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
			"*A cocktail of juices from vietnam!*",
			ufmt.denote('Type', [ufmt.block('Mining Boost'), ufmt.block('Cooldown Reduction')].join(' ')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemJungleJuice();