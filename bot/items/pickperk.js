let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const itemUtils = require("../utils/item.js");
const locale = require("../data/EN_US");

class ItemPickPerk extends Item{
	constructor(){
		super( false );
		this.name = "PP"; // Required
		this.accessor = "pickperk"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 4;
		this.meta = "badperk";
		this.effect = "Apply this perk to your active pickaxe.";

		this.icon = "https://i.imgur.com/5jC8IIi.png";
		
		this.isDroppedByLunchbox = false;
		this.isDroppedByLootbox = true;
	}
	
	createItemData( amount=1, meta ){
		if(!meta){
			// Pick a perk to award
			meta = ufmt.pick( itemUtils.availablePerks, 1 )[0];
		}
		let name = this.name+"_"+(meta||this.meta);
		return { accessor:this.accessor, amount: amount, name:name, meta:meta || this.meta }
	}

	
	use( Chicken, itemData ){
		if(itemData.meta){
			itemUtils.items.pickaxe.ensureUserHasDefaultPickaxe( Chicken.userData );

			let pickaxeItemData = Chicken.userData.items[Chicken.userData.pickaxe_accessor];
			let slots = itemUtils.items.pickaxe.getMaxPerkSlots( pickaxeItemData );
			if(Chicken.userData.pickaxe_perks.indexOf(itemData.meta)>-1){
				Chicken.send( "Your pickaxe already has this perk!" );
				return Item.useStatus.NO_CONSUME;
			}

			// If there are slots available for perks
			if( slots > pickaxeItemData.meta.perks.length ){

				// This process will ensure perks are always synced
				pickaxeItemData.meta.perks.push( itemData.meta );
				Chicken.userData.pickaxe_perks = pickaxeItemData.meta.perks;

				Chicken.send(`You've applied ${ufmt.item(itemData, 1)} to your current pickaxe!`);
				return;
			}else{
				Chicken.send("Your pickaxe doesn't have enough perk slots!");
				return Item.useStatus.NO_CONSUME;
			}
		}else{
			Chicken.send( "How did you get this? :)");
		}
		return Item.useStatus.NO_CONSUME;
		
	}

	desc( Chicken, itemData ){
		if(itemData.meta){
			let perk = itemUtils.pickPerks[itemData.meta];
			return ufmt.itemDesc([
				ufmt.block("PickPerk"),
				ufmt.denote('Perk Name', ufmt.block( perk.name )),
				ufmt.denote('Perk Effect', perk.desc),
				ufmt.denote('\nType', ufmt.block('Pickaxe Enchantment')),
				ufmt.denote('Usage', this.effect),
				ufmt.denote('Warning', 'Perks will only be applied if your pickaxe has an available perk slot.'),
				ufmt.denote('Warning', 'Once applied, perks cannot be removed.')
			]);
		}else{
			return ufmt.itemDesc([
				"*Makes your pickaxe better!*",
				ufmt.denote('Type', ufmt.block('Pickaxe Enchantment')),
				ufmt.denote('Usage', this.effect),
				ufmt.denote('Warning', 'Perks will only be applied if your pickaxe has an available perk slot.'),
				ufmt.denote('Warning', 'Once applied, perks cannot be removed.')
			]);
		}
	}
}

module.exports = new ItemPickPerk();