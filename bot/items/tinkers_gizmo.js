let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const itemUtils = require("../utils/item.js");
const locale = require("../data/EN_US");

class ItemTinkersGizmo extends Item {
	constructor() {
		super(false);
		this.name = "Tinkers Gizmo"; // Required
		this.accessor = "tinkers_gizmo"; // Virtural
		this.consumable = true;
		this.value = 0;
		this.rank = 6;
		this.canUseMulti = true;
		this.effect = "Increases amount of perk slots for your active pickaxe.";
		this.emoji = "<:pp:631407099657715712>";
		this.icon = "https://i.imgur.com/5jC8IIi.png";
		this.isDroppedByLootbox = true;
	}

	use(Chicken, itemData) {
		itemUtils.items.pickaxe.ensureUserHasDefaultPickaxe(Chicken.userData);
		let pickaxeItemData = Chicken.userData.items[Chicken.userData.pickaxe_accessor];
		let slots = itemUtils.items.pickaxe.getMaxPerkSlots(pickaxeItemData);
		let amount = Chicken.mArgs.amount || 1;
		pickaxeItemData.meta.maxPerkSlots += amount;
		Chicken.userData.pickaxe_maxPerkSlots += amount; // TODO depreciate pickaxe_*

		Chicken.send(ufmt.itemUsedResponse(
			`You use ${ufmt.plural(amount, 'a', 'some')} ${ufmt.block(`Tinkers ${ufmt.plural(amount, 'Gizmo', 'Gizmos')}!`)}`,
			[
				`Your ${ufmt.block(pickaxeItemData.name)} has recieved more perk slots.`,
				`${ufmt.block(slots)} -> ${ufmt.block(slots+amount)}`
			]
		));
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*Not enough perk slots? Not a problem!*",
			ufmt.denote('Type', ufmt.block('Pickaxe Modification')),
			ufmt.denote('Usage', this.effect)
		]);
	}
}

module.exports = new ItemTinkersGizmo();