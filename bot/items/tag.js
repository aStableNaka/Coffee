let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

/**
Tags can only be handed out by admins
 */
class ItemTag extends Item {
	constructor() {
		super();
		this.name = "Tag"; // Required
		this.accessor = "tag"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 7;
		this.meta = {};
		this.isUnique = true;
		this.usesMeta = true;

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
	}


	use(Chicken, itemData) {

	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*A one-time use tag that appears on your profile!*",
			ufmt.denote('Type', ufmt.block('cosmetic')),
			ufmt.denote('Usage', 'Adds a perminant tag to your profile!'),
			ufmt.denote('Warning', "You cannot apply the same tag twice.")
		]);
	}
}

module.exports = new ItemTag();