let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const bp = require("../utils/bp.js");
const itemUtils = require("../utils/item.js");
const BigInt = require("big-integer");


function fmtLootboxOutcome( outcomes, mobile ){
	let strLen = outcomes.map(x=>x.length).reduce( (acc, val)=>{ return Math.max(acc, val); } )+2;
	let spoilers = mobile ? '' : "||";
	let ws = ufmt.embedWS;
	let content = outcomes.map( (x)=>{
		return `\`[ ${ufmt.padCenter(`${x}`, strLen)} ]\``}
	);
	return `${spoilers}${content.join("\n")}${spoilers}`;
}

/**
 * Why are the lootbox helpers located under itemUtils and not here?
 * 
 * Because it's easier to debug under itemUtils
 */

class ItemLootbox extends Item{
	constructor(){
		super();
		this.name = "Lootbox"; // Required
		this.accessor = "lootbox"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 1;
		this.meta = {};
		this.icon = "https://i.imgur.com/u3RS3gh.png";
		
		this.canUseMulti = true; // Can the item be used multiple times? ( amount modifier )
	}

	meta_lunchbox( lToken, itemData ){
		let stochasticOutcomes = ufmt.pick( itemUtils.lunchboxDropStoch, 2*lToken.mArgs.amount );
		let outcomes = stochasticOutcomes.map(( rank, i )=>{
			// Might want to cache this for performance increase
			let filteredDrops = itemUtils.dropsByRank[rank].filter( itemUtils.lunchboxDropFilter ).filter((x)=>{return !!x;});
			
			//console.log(itemUtils.dropsByRank);
			return ufmt.pick( filteredDrops, 1 )[0];
		});
		//console.log(outcomes);
		let accessors = outcomes.map( (itemObject)=>{return itemObject.accessor} );

		// This is a tally snippet
		let m = {}
		accessors.map((accessor)=>{
			if(!m[accessor]){m[accessor]=1;}
			else{
				m[accessor]++;
			}
		})
		let z = Object.keys(m).map( (accessor)=>{
			return ufmt.itemName(accessor, m[accessor], '', false);
		} );
		let useDialogue = `You open up your home-made ${ ufmt.item( itemData, lToken.mArgs.amount ) }\nand inside it, you find...`;
		lToken.send( Item.fmtUseMsg( useDialogue, [fmtLootboxOutcome( z, lToken.mobile )]) );
		outcomes.map( ( itemObject )=>{
			itemUtils.addItemObjectToInventory( lToken.userData, itemObject );
		});
	}

	meta_test( lToken, itemData ){
		lToken.send("Whoa... You're not supposed to have this item!!");
	}

	// Virural function
	use( lToken, itemData ){
		// Test
		if(this[`meta_${itemData.meta}`]){
			this[`meta_${itemData.meta}`](lToken, itemData);
		} else {
			//lToken.send(":D how did you find me?");
			this.meta_test(lToken, itemData);
		}
		
	}

	desc( lToken, itemData ){
		if(itemData.meta=='lunchbox'){
			return [
				`*A wooden box full of food!*`,
				ufmt.denote("Usage",`Drops ${ufmt.block(2)} random consumables or gold.` ),
				ufmt.denote("Possible Drops", `${itemUtils.drops_lootbox_lunchbox.map((itemObject)=>{
					return ufmt.block( itemObject.name );
				}).join(', ')}`)
			].join('\n');
		}if(itemData.meta=='large_lunchbox'){
			return ufmt.join([
				`*A large wooden box full of food*`,
				ufmt.denote("Usage",`Drops ${ufmt.block(`3-5`)} random consumables or gold.` ),
				ufmt.denote("Possible Drops", `${itemUtils.drops_lootbox_lunchbox.map((itemObject)=>{
					return ufmt.block( itemObject.name );
				}).join(', ')}`)
			]);
		}
		return ufmt.join([
			`Lootboxes contain loot!`,
			`There are several types of lootboxes...`,
			(['Lunchbox', 'Large Lunchbox']).map((x)=>{return ufmt.block(x);}).join(", ")
		]);
	}
}

module.exports = new ItemLootbox();