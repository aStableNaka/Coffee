const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const bp = require("./bp.js");
const ufmt = require("./formatting.js");
const loader = require("../loader");

const locale = require("../data/EN_US");

const items = loader( "./bot/items", "./items" );
const Item = require("../class/item.js");

function lunchboxDropFilter(itemObject){
	return itemObject.isDroppedByLunchbox;
}
function lootboxDropFilter(itemObject){
	return itemObject.isDroppedByLootbox;
}

// Raw item utilities
function getItemObject( itemData ){
	return items[ itemData.accessor ];
}

function getItemObjectByAccessor( itemAccessor ){
	return items[ itemAccessor ];
}

// Determines the itemKey, userData.items[itemKey]
function getItemLookupKey( itemData, itemName = null ){
	return (itemName || itemData.name || itemData.accessor).toLowerCase().split(" ").join("_");
}

/**
 * Adds an existing item to a user's inventory
 * 
 * @param {UserData} userData 
 * @param {ItemData} itemData 
 * @param {Number} amount 
 * @param {String} itemName 
 */
function addItemToInventory( userData, itemData, amount, itemName = null ){
	if(!amount){amount=itemData.amount}
	let itemKey = getItemLookupKey(itemData, itemName );  // Special inventory itemKey or default
	if( userData.items[ itemKey ] ){
		userData.items[ itemKey ].amount+=amount;
	}else{
		userData.items[ itemKey ] = itemData;
	}
	if(!itemName){ itemName = itemData.name; } // Undefined or whatever
	if(itemName){
		userData.items[ itemKey ].name = itemName;
	}
	return itemData;
}
module.exports.addItemToInventory = addItemToInventory;

/**
 * Creates new itemData from passed itemObject which
 * gets added to a user's inventory
 * 
 * @param {UserData} userData 
 * @param {Item} itemObject 
 * @param {Number} amount 
 * @param {String} itemName 
 * @param {Any} itemMeta 
 */
function addItemObjectToInventory( userData, itemObject, amount = 1, itemName = null, itemMeta = null ){
	let itemData = itemObject.createItemData( amount, itemMeta );
	return addItemToInventory( userData, itemData, amount, itemName );
}
module.exports.addItemObjectToInventory = addItemObjectToInventory;

/**
 * Transfers an existing item (thats already in an inventory)
 * to a different inventory
 * @param {UserData} userData 
 * @param {UserData} toUserData 
 * @param {ItemData} itemData 
 * @param {Number} amount 
 */
function transferItemToInventory( userData, toUserData, itemData, amount = 1 ){
	let itemKey = (itemData.name || itemData.accessor).toLowerCase().split(" ").join("_");
	amount = Math.min( Math.max(0, amount), itemData.amount );
	let meta = itemData.meta;
	// Safe cloning of the meta
	// Meta should be flat AT ALL TIMES
	if(typeof(meta)=="object"){
		meta = Object.assign({}, itemData.meta);
	}
	let itemDataClone = Object.assign({}, itemData);
	itemDataClone.meta = meta;
	// Just for safe measure, we'll do a check here to make sure the user has enough to give.
	if(amount && itemData.amount >= amount){
		itemDataClone.amount=amount;
		addItemToInventory( toUserData, itemDataClone, amount, itemKey );
		itemData.amount-=amount;
	}	
}
module.exports.transferItemToInventory = transferItemToInventory;

/**
 * Check to see if a user owns an item
 * @param {UserData} userData 
 * @param {String} itemKey 
 */
function userHasItem( userData, itemKey ){
	let itemData = userData.items[itemKey];
	return itemData ? itemData.amount > 0 : false;
}
module.exports.userHasItem = userHasItem;

const minePerks = {
	"matts_charity":{
		name:locale.perks.matts_charity.name,
		desc:locale.perks.matts_charity.desc,
		onMine:(lToken, outcome)=>{
			let income = bp.calcIncome( lToken );
			let blessing;
			if(income.eq(0)){
				let lvl = bp.pickaxeLevelExp(lToken.userData.pickaxe_exp);
				blessing = BigInt.randBetween(2, new BigInt(250).add(new BigInt(5).pow(lvl)));
				return {
					"name":`${ufmt.block("Perk")} Matt's Charity`,
					"value":`Your ${ufmt.block("Matt's Charity")} has increased your profits to \n\`\`\`fix\n+ ${ ufmt.bp(outcome.multiply(blessing), "") }\n( +${ ufmt.numPrettyIllion( blessing ) } % )\`\`\` `
				}
			}
		}
	},
	"food_boost":{
		name:"Full Belly",
		desc:"Your sated stomach increases your mining profits.",
		onMine:(lToken, outcome)=>{
			
		}
	},
	"miners_blessing":{
		name:"Miner's Blessing",
		desc:"",
		onMine:(lToken, outcome)=>{
			let blessing = BigInt.randBetween(1, 10);
			lToken.database.temp.blessings++;
			bp.addBP( lToken, outcome.multiply(blessing || 1) );
			return {
				"name":`${ufmt.block("Perk")} Miner's Blessing`,
				"value":`You've been granted ${ufmt.block("Miner's Blessing")}\n\`\`\`fix\n+ ${ ufmt.bp(outcome.multiply(blessing), "") } ( + ${ blessing.toString() }00% )\`\`\` `
			}
		}
	},
	"miners_blessing_luck":{
		name:"Miner's Blessing",
		desc:"",
		onMine:(lToken, outcome)=>{
			let blessing = BigInt.randBetween(2, 20);
			lToken.database.temp.blessings++;
			bp.addBP( lToken, outcome.multiply(blessing || 1) );
			return {
				"name":`${ufmt.block( 'Luck' )} Miner's Blessing`,
				"value":`While digging, you stumble upon an ancient relic which grants you the [ ***Miner's Blessing*** ].\n\`\`\`fix\n+ ${ ufmt.bp(outcome.multiply(blessing), "") } ( + ${ blessing.toString() }00% )\`\`\` `
			}
		}
	},
	"determined_endurance":{
		name:"Determined Endurance",
		desc:"Your recovery time between mines reduces as your pickaxe gains experience. [ **-3.5 sec/lvl** ] with a hard cap of 30 seconds.",
		onMine:( lToken, outcome )=>{
			let lvl = bp.pickaxeLevelExp(lToken.userData.pickaxe_exp);
			let reduction = Math.floor(Math.min( (lToken.userData.pickaxe_time-0.5) * 60 * 1000, 3.5 * lvl * 1000 ));
			lToken.userData.lastmine-=reduction;
			//lToken.send(lvl);
			return {
				"name":`${ufmt.block( 'Perk' )} Determined Endurance`,
				"value":`Your ${ufmt.block("Determined Endurance")} has reduced your mining cooldown by [ ***${reduction/1000}*** ] seconds!`
			}
		}
	},
	"treasure_luck":{
		name:"Treasure",
		desc:"Good fortune comes to those who persist",
		onMine:(lToken)=>{
			let itemData = addItemObjectToInventory(lToken.userData,items.lootbox,1,"lunchbox","lunchbox");
			//lToken.send( `` );
			return {
				"name":`${ufmt.block( 'Luck' )} Treasure`,
				"value":`You stumble upon a treasure while mining!\nYou found ${ ufmt.itemName("lunchbox", 1) }`
			};
		}
	}
}

/**
60% 	0 Common
25% 	1 Uncommon
10% 	2 RARE
3% 		3 SUPER RARE
1.5% 	4 ULTRA RARE
0.35% 	5 LEGENDARY
0.15% 	6 GODLY
0%		7 PICKAXE
 */

let dropProbabilities = [
	60,
	25,
	10,
	3,
	0.9,
	0.0997,
	0.0003
]

// Fills an array with item ranks
// The item rank will determine the subset of items that will be dropped
// Pick from the drop array to determine the rank of the item that will be dropped
let globalDropStoch = [];
dropProbabilities.map((p, itemRank)=>{
	new Array(Math.ceil( p*10000 )).fill(itemRank).map((rank)=>{
		globalDropStoch.push(rank);
	})
})

let lunchboxDropStoch = [];
let lootboxDropStoch = [];
// Lunchbox stochiometry
[ 6000, 2500, 1000, 300 ].map((p, itemRank)=>{
	new Array(Math.ceil( p )).fill(itemRank).map((rank)=>{
		lunchboxDropStoch.push(rank);
	});
});

// Categorizes items by their rank
let dropsByRank = new Array(7).fill(1).map(x=>new Array());
Object.values(items).map( ( itemObject )=>{
	return dropsByRank[itemObject.rank].push(itemObject);
});


module.exports.items = items;
module.exports.Item = Item;
module.exports.drops_lootbox_lunchbox = Object.values(items).filter( lunchboxDropFilter );
module.exports.drops_lootbox_lootbox = Object.values(items).filter( lootboxDropFilter );
module.exports.rankNames = Item.ranks;
module.exports.rankColors = Item.rankColors;
module.exports.lunchboxDropFilter = lunchboxDropFilter;
module.exports.lootboxDropFilter = lootboxDropFilter;

module.exports.getItemObject = getItemObject;
module.exports.getItemObjectByAccessor = getItemObjectByAccessor;

module.exports.minePerks = minePerks;

module.exports.dropProbabilities = dropProbabilities;
module.exports.globalDropStoch = globalDropStoch;
module.exports.lunchboxDropStoch = lunchboxDropStoch;
module.exports.dropsByRank = dropsByRank;