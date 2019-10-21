let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");

class ItemGnome extends Item {
	constructor() {
		super();
		this.name = "Cola"; // Required
		this.accessor = "cola"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://piskel-imgstore-b.appspot.com/img/76af36e1-94fc-11e9-bf7d-9722320997e8.gif";
		this.charge = 1;
		this.boost = 1600;
		this.effect = `Drinking this will immediately reset your mining cooldown. Also, your next mine will produce ${ufmt.block(this.boost)} % more profit.`;
		this.useDialogue = `You drink some cola! You feel a sudden surge of energy...`;
	}


	use(Chicken, itemData) {
		Chicken.userData.mineboost = this.boost; // Percent
		Chicken.userData.mineboostcharge = this.charge;
		Chicken.userData.mineboostsource = this.name;
		Chicken.userData.lastmine = 0; // Percent
		Chicken.send(Item.fmtUseMsg(this.useDialogue, [ufmt.denote('Effect', this.effect)]));
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*Made with real cocai- Sugar!*",
			ufmt.denote('Type', [ufmt.block('Mining Boost'), ufmt.block('Cooldown Reduction')].join(' ')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemGnome();