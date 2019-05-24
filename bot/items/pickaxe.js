let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const bp = require("../utils/bp.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");

class ItemPickaxe extends Item{
	constructor(){
		super();
		this.name = "Pickaxe"; // Required
		this.accessor = "pickaxe"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 6;
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
        //this.isUnique = true;
		this.icon = "https://i.imgur.com/miBhBjt.png";
		
		this.isDroppedByLootbox = false;
	}

	// Virural function
	use( lToken, itemData ){
        // Create shifty pickaxe item if it didn't already exist
        if(!lToken.userData.items.shifty_pickaxe && lToken.userData.pickaxe_accessor=="shifty_pickaxe"){
            itemUtils.addItemObjectToInventory( lToken.userData, this, 1, "Shifty Pickaxe", {
                name: "Shifty Pickaxe",
                accessor:"shifty_pickaxe",
                perks:[],
                exp: lToken.userData.pickaxe_exp,
                time: 5,
                multiplier: 0,
                lDescIndex:0,
                creator:"Grandmaster Blacksmith",
                imgIndex:0
            });
        }

        // Unequip the pickaxe, save it's exp
        let oldItemData = lToken.userData.items[ lToken.userData.pickaxe_accessor ];
        //console.log(oldItemData);
        oldItemData.meta.exp = lToken.userData.pickaxe_exp;
        oldItemData.amount++;

        // Equip the new pickaxe
        Object.keys( itemData.meta ).map( ( key )=>{
            lToken.userData[`pickaxe_${key}`] = itemData.meta[key];
        });
        itemData.amount--;

        lToken.send(`You've swapped your ${ ufmt.itemName(oldItemData.name, 0, "***") } for your ${ ufmt.itemName(itemData.name, 0, "***") }`)
    }

    formatName(itemData){
        return itemData.meta.name;
    }

	desc( lToken, itemData ){
        if(!itemData){

            return [
                `- **Pickaxe** items can be equipped with the ~use command`,
                `- **Each** pickaxe has it's own unique experience level and perk which stay with the pickaxe. You can switch between different pickaxes at any time!`,
                `- **Only** a single pickaxe can be used at any given time.`,
                `||- **Pickaxes** can be disenchanted for their perks, which lets you apply that perk onto a different pickaxe!|| [WIP]`,
                `- **Already** have a pickaxe? use \`~iteminfo pickname\` for more detailed information on it!`
            ].join("\n")
        }
        let pickaxeDescription = locale.pickaxe.descriptions[itemData.meta.lDescIndex] || `Not much is known about this mysterious pickaxe...`;
        // if the pickaxe is currenrly equipped.
        if(itemData.meta.accessor == lToken.userData.pickaxe_accessor){
            itemData.meta.exp = lToken.userData.pickaxe_exp;
        }
        return [
            pickaxeDescription,
            `**Name**: ${ufmt.itemName(itemData.name, 0, "***")}`,
            `**LvL**: ${ufmt.itemName(bp.pickaxeLevelExp(itemData.meta.exp), 0, "***")}`,
            `**Exp**: ${ufmt.itemName(itemData.meta.exp || 1, 0, "***")} mines`,
            `**Cooldown**: ${ufmt.itemName(itemData.meta.time*60 || 1, 0, "***")} seconds`,
            `**Perks**:\n${itemData.meta.perks.map((x)=>{
                let perk = itemUtils.minePerks[ x ];
                return `- ${ufmt.itemName(perk.name, 0, "***")}: *${perk.desc || "No description"}*`;
            })}`,
            `**Creator**: ${ufmt.itemName( itemData.meta.creator, 0, "***" )}`
        ].join("\n");
	}
}

module.exports = new ItemPickaxe();