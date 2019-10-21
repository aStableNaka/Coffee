let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemStatCard extends Item {
	constructor() {
		super();
		this.name = "Stat Card"; // Required
		this.accessor = "stat_card"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 4;
		this.meta = {};

		this.icon = "https://i.imgur.com/5jC8IIi.png";
		this.isDroppedByLootbox = true;
	}


	use(Chicken, itemData) { }

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*A card giving you access to statistics commands!*",
			ufmt.denote('Type', ufmt.block('Command enabler')),
			ufmt.denote('Transcript', 'Statistics are expensive. But I want them to be accessable to everybody. Owning this item will allow you to use the `~stat` command')
		]);
	}
}

module.exports = new ItemStatCard();