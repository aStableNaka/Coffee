let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemPumpkinSpiceLatte extends Item {
	constructor() {
		super();
		this.name = "Pumpkin Spice Latte"; // Required
		this.accessor = "pumpkin_spice_latte"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 2;
		this.meta = {};
		this.emoji = "<:psl:631425153179320320>";
		this.icon = "https://i.imgur.com/uBdLv4Z.png";

		this.effect = "Resets your mining cooldown and lets you immediately mine again. Only use this after you've just mined.";
		this.useDialogue = 'You drink some pumpkin spice latte';
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}


	use(Chicken, itemData) {
		Chicken.userData.lastmine = 0; // Percent
		Chicken.send(Item.fmtUseMsg(this.useDialogue, [ufmt.denote('Effect', this.effect)]));
	}

	desc(Chicken, itemData) {
		return `*"A spoopy drink available during the spooky seasons!"*\nType: ${ufmt.block('Cooldown Reduction')}\nUsage: ${this.effect}`;
	}
}

module.exports = new ItemPumpkinSpiceLatte();