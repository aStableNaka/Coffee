let ezhash = require("../modules/ezhash");
let ufmt = require("../utils/formatting");

class Item{
	constructor( createInstance ){
		this.name = "Item"; // Required
		this.accessor = "item"; // Virtural
		this.restrictedAccessor = this.accessor;
		this.consumable = false;
		this.value = 0;
		this.rank = 0;
		this.meta = {};
		this.isItemObject = true;
		this.icon = "https://i.imgur.com/Sw5XtmO.png";

		if(!createInstance){ return; }
		this.instance = this.createItemData();
	}

	get recipies(){
		return {};
	}

	computeMetaString( meta=null ){
		if(!meta){
			meta = this.meta;
		}
		return JSON.stringify(meta);
	}

	computeMetaHash( itemData ){
		return ezhash( `${this.name}_${this.computeMetaString( itemData.meta )}` )
	}

	createItemData( amount = 1, meta, name ){
		return { accessor:this.accessor, amount: amount, name:name || this.accessor, meta:meta || this.meta }
	}

	getUniqueRank( itemData ){
		return itemData.rank || this.rank;
	}

	migrateItem( itemData, itemKey ){
		itemData.name=itemKey;
	}

	// Item name modifier
	formatName( itemData ){
		return itemData.name || this.name;
	}

	/**
	 * Clear up the entry inside the user's inventory
	 * @param {*} userData 
	 * @param {*} itemData 
	 */
	cleanup( userData, itemData ){
		return;
	}

/**
Drop		Rank	Label
60% 		0 		Common
25% 		1 		Uncommon
10% 		2 		RARE
3% 		3 		SUPER RARE
0.9% 		4 		ULTRA RARE
0.0997% 	5 		LEGENDARY
0.0003% 	6 		EXOTIC
0.00001%	7 		RELIC
0%		8 		HARMONIC
0%		9 		GIFTED
0%		10		ADMIN
0%		11		DEBUG
0%		12		PICKAXE
 */

	static get ranks(){
		return [
			"COMMON", // 0
			"UNCOMMON", // 1
			"RARE", // 2
			"SUPER-RARE", // 3
			"ULTRA-RARE", // 4
			"LEGENDARY", // 5
			"EXOTIC", // 6
			"RELIC",
			"HARMONIC",
			"GIFTED",
			"ADMIN",
			"DEBUG",
			"PICKAXE"
		];
	}

	static get rankColors(){
		return [
			0x666666 ,
			0x49d162,
			0x3ab9d8,
			0xffe260,
			0xbc70ff,
			0xce5ce8,
			0xffc472,
			0xffc472,
			0xffc472,
			0xffc472,
			0xffc472,
			0xffc472,
			0xffc472
		]
	}

	static get useStatus(){
		return {
			"NO_CONSUME":"NO_CONSUME"
		}
	}

	static fmtUseMsg( title, descArray, name ){
		let content = {
			embed:{
				title:title,
				description: descArray.join("\n")/*,
				footer:{
					text:`Tip: Use '~iteminfo ${name||this.accessor}' to see this item's information`
				}*/
			}
		};
		return content;
	}

	use( lToken, itemData ){}
	desc( lToken, itemData ){ return "Item description based on itemData"; }
}

module.exports = Item;

/**

Cmd] < Naka > :~E "https://i.imgur.com/u3RS3gh.png lootbox"
"https://i.imgur.com/u3RS3gh.png lootbox"
[Cmd] < Naka > :~E "https://i.imgur.com/fT8lZ9R.png apple"
"https://i.imgur.com/fT8lZ9R.png apple"
[Cmd] < Naka > :~E "https://i.imgur.com/wiLRgGk.png news"
"https://i.imgur.com/wiLRgGk.png news"

*/