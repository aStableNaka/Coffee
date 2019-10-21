let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemBacon extends Item {
	constructor() {
		super();
		this.name = "Bacon"; // Required
		this.accessor = "bacon"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 0;
		this.meta = {};
		this.emoji = "<:bacon:631422259369869322>";
		this.icon = "https://i.imgur.com/ppz3ami.png";
		this.charge = 4;
		this.boost = 20;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You eat a slice of bacon!`
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}


	use(Chicken, itemData) {
		Chicken.userData.mineboost = this.boost; // Percent
		Chicken.userData.mineboostcharge = this.charge;
		Chicken.userData.mineboostsource = this.name;
		Chicken.send(Item.fmtUseMsg(this.useDialogue, [ufmt.denote('Effect', this.effect)]));
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*An American favorite!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect), ,
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemBacon();