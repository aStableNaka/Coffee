let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const itemUtils = require("../utils/item.js");
const locale = require("../data/EN_US");

class ItemFoxtailAmulet extends Item{
	constructor(){
		super();
		this.name = "Foxtail Amulet"; // Required
		this.accessor = "foxtail_amulet"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 4;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";
		this.charge = 1;
		this.boost = 18500;
		this.effect = `Your next mine will produce ${ ufmt.block(this.boost) }%. Also, you will attract nearby lunchboxes.`;
		this.useDialogue = `You activate the ${ufmt.block('Foxtail Amulet')}.`;
		this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = true;
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.mineboost = this.boost; // Percent
		lToken.userData.mineboostcharge = this.charge;
        lToken.userData.mineboostsource = this.name;
        let amount = Math.floor(Math.random()*3+2)
        itemUtils.addItemObjectToInventory( lToken.userData, itemUtils.getItemObjectByAccessor("lootbox"), amount, "lunchbox", "lunchbox" );
		lToken.send(Item.fmtUseMsg( this.useDialogue,[
            "It breaks in the progress, but *you suddenly feel smarter*...",
            "Your increased intelligence has lead you to discover *better* methods of mining!",
            "Out of nowhere: *a couple stray lunchboxes fall right into your hands!*",
            `+ ${ufmt.itemName('Lunchbox', amount, '**')}`,
            ufmt.denote('Effect', this.effect)
        ]));
	}

	desc( lToken, itemData ){
		return ufmt.itemDesc([
            "An amulet made from a **real fox's tail**!",
            "- ( *We won't discuss the ethics behind cutting off foxes' tails to make amulets* )",
            "- *It's said that activating this will boost your Intelligence enough for you to finally understand Rick and Morty.*",
			ufmt.denote('Type', [ufmt.block('Mining Boost'), ufmt.block('Lootbox')].join(' ')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemFoxtailAmulet();