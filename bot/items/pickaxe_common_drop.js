let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const bp = require("../utils/bp.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
const fs = require("fs");
const adjectives = fs.readFileSync( "./bot/data/english-adjectives.txt" ).toString().split("\n");
// This is a special item, it does not drop ItemCommonPickaxe, it drops pickaxe.

// I want to make each pickaxe unique. Adjective-pickaxes are one of a kind.
class ItemCommonPickaxe extends Item{
	constructor(){
		super();
		this.name = "Pickaxe"; // Required
		this.accessor = "pickaxe"; // Virtural
        
		this.icon = "https://i.imgur.com/miBhBjt.png";
		this.meta = {
            name: "Shifty Pickaxe",
            accessor: "shifty_pickaxe",
            perks:[],
            exp: 0,
            time: 5,
            multiplier: 0,
            creator:"Grandmaster Blacksmith",
            imgIndex:0
        };

        this.testboxRestricted = true;
		this.isDroppedByLootbox = false;
	}

	// Virural function
	use( lToken, itemData ){}

    createItemData( amount = 1, meta, name ){
        let genAdj = ufmt.pick(adjectives,1)[0];
        let genName = `${ufmt.capitalize( genAdj )} Pickaxe`;
        let genAccessor = `${genAdj}_pickaxe`;
        let genMeta = {
            name: genName,
            accessor: genAccessor,
            perks:[],
            exp: 0,
            time: 5,
            multiplier: 0,
            creator:"Grandmaster Blacksmith",
            imgIndex:0
        }
		return { accessor:this.accessor, amount: amount, name:genName , meta:genMeta }
	}

    formatName(itemData){
        return itemData.meta.name;
    }

	desc( lToken, itemData ){}
}

module.exports = new ItemCommonPickaxe();