let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemBread extends Item {
	constructor() {
		super();
		this.name = "Bread"; // Required
		this.accessor = "bread"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 0;
		this.meta = {};
		this.emoji = "<:bread:631422259361349633>";
		this.icon = "https://i.imgur.com/f7CZtQD.png";
		this.charge = 2;
		this.boost = 25;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You eat a loaf of bread`;
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
			"*Not recommended for keto diets!*",
			ufmt.denote('Type', ufmt.block('Mining Boost')),
			ufmt.denote('Usage', this.effect), ,
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemBread();