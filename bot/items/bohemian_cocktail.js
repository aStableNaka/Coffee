let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");

class ItemBohemianCocktail extends Item{
	/**
	 * Gilded slurries guarantees that your next 2 mines will
	 * give you 1-10 gold coins.
	 */
	constructor(){
		super();
		this.name = "Bohemian Cocktail"; // Required
		this.accessor = "bohemian_cocktail"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 5;
		this.meta = {};

		this.icon = "https://piskel-imgstore-b.appspot.com/img/f52acb23-df31-11e9-826e-81af7574a4ed.gif";
		this.charge = 2;
		this.effect = `Your next ${ufmt.block(this.charge)} mines will grant you ${ufmt.block('1-2') } ${ufmt.block('Foxtail Amulets')}.`;
		this.useDialogue = `You down a Bohemian Cocktail!`;
	}

	// When a user mines and the boost is active
	// Must return a boost description
	onBoost( Chicken ){
		let outcome = Math.round(Math.random()*1)+1;
		let item = itemUtils.items.foxtail_amulet.createItemData(outcome);
		itemUtils.addItemToUserData( Chicken.userData, item);

		return ufmt.join([
			'Your ', ufmt.block(this.name),
			' has led you to find ', ufmt.item( item ),
			'!'
		], '');
	}

	get recipies(){
		return {
			"bohemian_cocktail": {
				ingredients: [{
					key: 'jungle_juice',
					amount: 1
				},{
					key:'cola',
					amount:1
				},{
					key: 'gilded_slurry',
					amount: 1
				}],
				onCraft: (Chicken, amount=1) => { // returns itemData
					return itemUtils.items.bohemian_cocktail.createItemData(amount);
				}
			}
		};
	}
	
	use( Chicken, itemData ){
		Chicken.userData.mineboostcharge = this.charge;
		Chicken.userData.mineboostsource = this.accessor;
		Chicken.send(Item.fmtUseMsg( this.useDialogue,[ufmt.denote('Effect', this.effect)]));
	}

	desc( Chicken, itemData ){
		return ufmt.itemDesc([
			"*Weird mix, but ok.*",
			ufmt.denote('Type', ufmt.block('Special Mining Boost')),
			ufmt.denote('Usage', this.effect),
			ufmt.denote('Warning', "Mining Boosts do NOT stack")
		]);
	}
}

module.exports = new ItemBohemianCocktail();