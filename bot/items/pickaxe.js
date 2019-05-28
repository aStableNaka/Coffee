let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");
const bp = require("../utils/bp.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
let ezhash = require("../modules/ezhash");

/**
 * Clones objects with recursive capabilities
 * @param {Object} object
 * @param {Number} depth Leave at 0 for shallow copy
 */
Object.clone = function( object, depth=0 ){
    let out = {};
    if(typeof(object)!='object'){return object;}
    Object.keys(object).map( (key)=>{
        if(typeof(object[key])=='object'){
            if(depth>0){
                if(Array.isArray( object[key] )){
                    out[key] = object[key].map(x=>Object.clone(x, depth-1));
                }else{
                    out[key] = Object.clone( object[key], depth-1 );
                }
            }
        }else{
            out[key] = object[key];
        }
    });
    return out;
};

class ItemPickaxe extends Item{
	constructor(){
		super( false );
		this.name = "Pickaxe"; // Required
		this.accessor = "pickaxe"; // Virtural

		this.consumable = false;
		this.value = 0;
        this.rank = 6;
        this.isUnique = true;
		this.meta = {
            name: "Shifty Pickaxe",
            accessor: "shifty_pickaxe",
            perks:[],
            exp: 0,
            time: 5,
            multiplier: 0,
            creator:"Grandmaster Blacksmith",
            imgIndex:0,
            maxPerkSlots:2
        };
        //this.isUnique = true;
		this.icon = "https://i.imgur.com/miBhBjt.png";

		this.isDroppedByLootbox = false;
    }

    computeMetaHash( itemData ){
		return ezhash( `${this.name}_${this.computeMetaString( itemData.meta )}` )
	}

    createItemData(amount, meta, name){
        return { accessor:this.accessor, amount: amount, name:name || this.accessor, meta:meta || Object.clone( this.meta ) } 
    }
    
    getMaxPerkSlots( itemData ){
        return itemData.meta.maxPerkSlots||2;
    }

    getUniqueRank( itemData ){
		return Math.max( this.getMaxPerkSlots( itemData ) * 2, Item.ranks.length ) ;
	}

    addPerk( itemData, perkName ){
        if(!itemUtils.perks[perkName]){
            console.warn(`[Pickaxe] perk ${perkName} is not a valid perk!`);
        }
        itemData.meta.perks.push(perkName);
    }

    ensureUserHasDefaultPickaxe( userData ){
        if(!userData.hasFirstPickaxe && userData.pickaxe_accessor=="shifty_pickaxe"){
            itemUtils.addItemObjectToInventory( userData, this, 0, "Shifty Pickaxe", {
                name: "Shifty Pickaxe",
                accessor:"shifty_pickaxe",
                perks:[],
                exp: userData.pickaxe_exp,
                time: 5,
                multiplier: 0,
                lDescIndex:0,
                creator:"Grandmaster Blacksmith",
                imgIndex:0,
                maxPerkSlots:2,
            });
            userData.hasFirstPickaxe = true;
        }
    }

    // TODO change tag if an item with the same name is given to a player
    migrateItem( itemData, newName ){
        let newAccessor = newName.toLowerCase().split(" ").join(" ");
        itemData.name = newName;
        itemData.meta.accessor = newAccessor;
        itemData.meta.name = newName;
    }

    getActivePickaxeItemData( userData ){
        this.ensureUserHasDefaultPickaxe( userData );
        return userData.items[userData.pickaxe_accessor];
    }

	// Virural function
	use( lToken, itemData ){
        // Create shifty pickaxe item if it didn't already exist
        this.ensureUserHasDefaultPickaxe( lToken.userData );

        // Unequip the pickaxe, save it's exp
        let oldItemData = lToken.userData.items[ lToken.userData.pickaxe_accessor ];
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
        return ufmt.join([
            pickaxeDescription,
            `**Name**: ${ufmt.block(itemData.name)}`,
            `**Creator**: ${ufmt.block( itemData.meta.creator )}`,
            `**LvL**: ${ufmt.block(bp.pickaxeLevelExp(itemData.meta.exp))}`,
            `**Exp**: ${ufmt.block(itemData.meta.exp || 1)} mines`,
            `**Cooldown**: ${ufmt.block(itemData.meta.time*60 || 1)} seconds`,
            `**Perks**:\n${ufmt.join(itemData.meta.perks.map((x)=>{
                let perk = itemUtils.pickPerks[ x ];
                return `- ${ufmt.block(perk.name)}: *${perk.desc || "No description"}*`;
            }))}`,
            '\n',ufmt.denote('Unique ID', '`#'+this.computeMetaHash(itemData)+'`')
        ]);
	}
}

module.exports = new ItemPickaxe();