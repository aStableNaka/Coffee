let ezhash = require("../modules/ezhash");
let ufmt = require("../utils/formatting");

class Item{
	constructor(){
		this.name = "Item"; // Required
		this.accessor = "item"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 0;
		this.meta = {};

		this.icon = "https://i.imgur.com/Sw5XtmO.png";
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

	// Item name modifier
	formatName( itemData ){
		return null;
	}

	static get ranks(){
		return [
			"COMMON", // 0
			"UNCOMMON", // 1
			"RARE", // 2
			"SUPER-RARE", // 3
			"ULTRA-RARE", // 4
			"LEGENDAY", // 5
			"EXOTIC" // 6
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
			0xffc472
		]
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

	// Virural functions
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