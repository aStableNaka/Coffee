let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
let ezhash = require("../modules/ezhash");

class ItemPickSkin extends Item {
	constructor() {
		super();
		this.name = "PS"; // Required
		this.accessor = "pick_skin"; // Virtural
		this.consumable = true;
		this.value = 7500;
		this.rank = 7;
		this.meta = {};
		this.emoji = "<:apple:631407099888533515>";
		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.isDroppedByLootbox = true;
		this.nonUniqueSkins = this.gatherThemLeathersBaby();
	}

	gatherThemLeathersBaby(){
		this.nonUniqueIndexes = locale.pickaxe.skins.filter((x)=>{ return !x.isUnique; });
	}

	/*
	Example:

		{
                "i": 2,
                "color": 11184810,
                "name": "impact_ivory",
                "description": "Awarded to Season 1 Top 5",
                "image": "https://i.imgur.com/QGVBklr.png",
                "imageHR": "https://i.imgur.com/RsuomKz.png",
                "unique": true,
                "emoji": "<:s1top5:631746999204708355>",
                "time": "1hr"
            }
	*/

	customEmoji(itemData){
		return this.skin(itemData).emoji;
	}

	customImage(itemData){
		let sd = this.skin(itemData);
		return sd.imageHR || sd.image;
	}

	generateMeta(){
		return ufmt.pick(this.nonUniqueIndexes,1)[0].i;
	}

	createItemData(amount, meta) {
		meta = meta || this.generateMeta();
		let skin = locale.pickaxe.skins[meta];
		return  {
			accessor: this.accessor,
			amount: amount,
			name: `ps_${skin.name}`,
			meta: meta
		};
	}

	formatName(itemData) {
		return itemData.name.replace("ps_", 'PS_');
	}
	
	skin(itemData){
		return locale.pickaxe.skins[itemData.meta];
	}

	use(Chicken, itemData) {
		itemUtils.items.pickaxe.ensureUserHasDefaultPickaxe(Chicken.userData);
		let pickaxeItemData = itemUtils.items.pickaxe.getActivePickaxeItemData(Chicken.userData);
		pickaxeItemData.meta.imgIndex = itemData.meta;
		let skin = this.skin(itemData);
		let response = ufmt.itemUsedResponse(`You equip the ${ufmt.item(itemData, 1)} onto your current pickaxe.`, ['Your pickaxe now sports new colors.']);
		response.color = skin.color;
		Chicken.send(response);
	}

	desc(Chicken, itemData) {
		let skin = this.skin(itemData);
		return ufmt.itemDesc([
			`*${skin.description}*`,
			ufmt.denote('Name', skin.name),
			ufmt.denote('Type', ufmt.block('Pickaxe Skin')),
			ufmt.denote('Usage', `Apply this skin to your current pickaxe`),
			ufmt.denote('Warning', `Once you apply a new skin, any skin previously attached to your pickaxe will disappear FOREVER.`)
		]);
	}
}

module.exports = new ItemPickSkin();