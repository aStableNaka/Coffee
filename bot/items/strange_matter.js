let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
/**
 * "I have this great idea for an item."
 * "It's actually every single item-"
 * 
 * 
 * "But also it's not."
 */
class ItemStrangeMatter extends Item {
	constructor() {
		super();
		this.name = "Strange Matter"; // Required
		this.accessor = "strange_matter"; // Virtural

		this.consumable = true;
		this.canUseMulti = false;
		this.value = 0;
		this.rank = 3;
		this.meta = {};
		this.emoji = "<:apple:631407099888533515>";
		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.isDroppedByLootbox = true;
		this.isDroppedByLunchbox = true;
	}

	pick() {
		let item = itemUtils.items.lootbox.pickItemsFromDistribution([128, 64, 32, 16, 8, 4, 2, 1], 1, itemUtils.lootboxDropFilter)[0];
		let itemObject = itemUtils.items[item.accessor];
		if (!itemObject.persistent && itemObject.consumable) {
			return item;
		}
		return itemUtils.items.strange_matter.pick();
	}

	use(Chicken, itemData) {
		let outcomeData = this.pick();
		let actions = ['break the', 'stomp on the', 'shatter the', 'graze the', 'look at the', 'taste the', 'hold the', 'throw the', 'eat the', 'ram the', 'sing to the', 'rendezvous with the', 'utilize the', 'extract the essence of', 'talk to the', 'shuffle the', 'yell at the poor', 'flinch at the', 'open the', 'close the', 'drill a hole into the', 'stare at the', 'cook the', 'poke at the', 'launch the', 'munch on the', 'trip over the', 'tell your mom about the', 'tell your dad about the', 'tell your dog about the', 'jump at the', 'release the', 'smooch the', 'read a bedtime story to the']
		let descriptions = ['splurges', 'plops', 'poofs', 'spoops', 'churns', 'turns', 'flonks', 'floks', 'runks', 'trisks', 'fleks', 'yorshes', 'unggfhujhs']
		Chicken.send(`You ${ufmt.pick(actions, 1)[0]} ${ufmt.block('Strange Matter')} and it ${ufmt.pick(descriptions, 1)[0]} into ${ufmt.aoran(outcomeData.accessor)} ${ufmt.item(outcomeData)}, which immediately activates!`).then(() => {
			itemUtils.items[outcomeData.accessor].use(Chicken, outcomeData);
		});

	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			"*There's something very weird about this matter...*",
			ufmt.denote('Type', ufmt.block('Crafting Ingredient')),
			ufmt.denote('Type', ufmt.block('?')),
			ufmt.denote('Transcript', `*\`"There's something off about this... It seems to be nothing and everything at the same time. What is the meaning behind this?"\`*`)
		]);
	}
}

module.exports = new ItemStrangeMatter();