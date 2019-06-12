const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const bp = require("./bp.js");
const ufmt = require("./formatting.js");
const loader = require("../loader");

const locale = require("../data/EN_US");

const items = loader( "./bot/items", "./items" );
const Item = require("../class/item.js");
const itemUtils = module.exports;
const craftingRecipies = {}

Object.values(items).map( ( itemObject )=>{
	Object.assign( craftingRecipies, itemObject.recipies );
} )

function lunchboxDropFilter(itemObject){
	return itemObject.isDroppedByLunchbox;
}
function lootboxDropFilter(itemObject){
	return itemObject.isDroppedByLootbox;
}
function testboxDropFilter(itemObject){
	return !itemObject.testboxRestricted;
}

// Raw item utilities
function getItemObject( itemData ){
	return items[ itemData.accessor ];
}

function getItemObjectByAccessor( itemAccessor ){
	return items[ itemAccessor ];
}

const trialDiscriminator = "_no.";

// Inventories are just object dictionaries
function createInventory(){
	return {};
}

// Determines the itemKey, userData.items[itemKey]
function getItemLookupKey( itemData, itemName, trial ){
	let firstSection = (itemName || itemData.name || itemData.accessor || "unnamed item").split(trialDiscriminator)[0]; // removes trial marker
	return (`${firstSection}${(()=>{if(trial){return `${trialDiscriminator}${trial}`;}else{return '';}})()}`).toLowerCase().split(" ").join("_");
}

/**
 * Empty in this case means the meta is either
 * a string
 * a null value
 * or an empty object
 * @param {*} meta 
 */
function itemMetaIsEmpty( meta ){
	// Makes sure the meta is an object
	if(meta.toString()=="[object Object]"){
		return Object.keys(meta).length == 0;
	}
	return true;
}

/**
 * Adds an existing item to a user's inventory
 * 
 * @param {UserData} userData 
 * @param {ItemData} itemData 
 * @param {Number} amount 
 * @param {String} itemName 
 */
function addItemToUserData( userData, itemData, amount, itemName = null, trial=0 ){
	return addItemToInventory( userData.items, itemData, amount, itemName = null, trial=0 );
}

function addItemToInventory( inventory, itemData, amount, itemName = null, trial=0 ){
	clearEmptyUniques(inventory);
	if(typeof(amount)=='undefined'){amount=itemData.amount}
	let itemKey = getItemLookupKey(itemData, itemName, trial );  // Special inventory itemKey or default
	let itemObject = getItemObject(itemData);
	let existingItemData = inventory[ itemKey ];
	if(trial){
		itemObject.migrateItem( itemData, itemKey );
	}
	if( existingItemData ){

		// If item meta doesn't match, and the mea is not empty (metas are either strings or objects)
		// rename the item recursively
		if(((existingItemData.meta!=itemData.meta || itemObject.isUnique) && !itemMetaIsEmpty(itemData.meta))){
			addItemToInventory( inventory, itemData, amount, itemName, trial+1 );
			console.warn(`itemname collision ${itemData.name} ${existingItemData.name}`)
			return;
		}

		

		existingItemData.amount+=amount;
	}else{
		// Todo format itemname as itemKey
		itemData.name = itemKey;
		inventory[ itemKey ] = itemData;
	}
	if(!itemName){ itemName = itemData.name; } // Undefined or whatever
	if(itemName){
		inventory[ itemKey ].name = itemName;
	}
	return itemData;
}

/**
 * Deletes unique items that are not equipped and also empty
 * @param {*} inventory 
 */
function clearEmptyUniques( inventory ){
	Object.keys(inventory).map( ( key )=>{
		let itemData = inventory[key];
		let itemObject = getItemObject( itemData );

		// Ensures item-name consistency
		itemData.name = key;

		if(itemObject.isUnique && itemData.amount==0 && !itemData.equipped){
			console.log(`[Itemutils] deleting empty unique item ${JSON.stringify(itemData)}`);
			delete inventory[ key ];
		}
	});
}

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
function addItemObjectToUserData( userData, itemObject, amount, itemName = null, itemMeta = null ){
	if(typeof(amount)=='undefined'){amount=1;} // Unless stated, amount defaults to 1
	let itemData = itemObject.createItemData( amount, itemMeta );
	return addItemToUserData( userData, itemData, amount, itemName );
}

/**
 * Transfers an existing item (thats already in an inventory)
 * to a different inventory
 * @param {UserData} userData 
 * @param {UserData} toUserData 
 * @param {ItemData} itemData 
 * @param {Number} amount 
 */
function transferItemToUserData( userData, toUserData, itemData, amount = 1 ){
	return transferItemToInventory( userData.items, toUserData.items, itemData, amount );
}

function transferItemToInventory( fromInventory, toInventory, itemData, amount = 1 ){
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
		addItemToInventory( toInventory, itemDataClone, amount, itemKey );
		itemData.amount-=amount;
		if(itemData.amount==0){}
	}
}

/**
 * Merges two inventories,
 * takes from the source and transfers to the destination
 * @returns destinationInventory
 */
function mergeInventory( sourceInventory, destinationInventory ){
	Object.values(sourceInventory).map( ( itemData )=>{
		addItemToInventory( destinationInventory, itemData );
		itemData.amount = 0;
	});
}

/**
 * Check to see if a user owns an item
 * @param {UserData} userData 
 * @param {String} itemKey 
 */
function userHasItem( userData, itemKey, amount = 1 ){
	let itemData = userData.items[itemKey];
	return itemData ? itemData.amount >= amount : false;
}



function perkTreasureHelper( userData ){
	
	let itemData = itemUtils.items.lootbox.createItemData(1, "box_box");
	itemUtils.addItemToUserData( userData, itemData );
	return itemData;
}

const pickPerks = {
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
		desc:"Your mining cooldown reduces as your pickaxe gains experience. [ **-3.5 sec/lvl** ] with a hard cap of 120 seconds.",
		onMine:( lToken, outcome )=>{
			let lvl = bp.pickaxeLevelExp(lToken.userData.pickaxe_exp);
			let reduction = Math.floor(Math.min( (lToken.userData.pickaxe_time-2) * 60 * 1000, 3.5 * lvl * 1000 ));
			lToken.userData.lastmine-=reduction;
			//lToken.send(lvl);
			return {
				"name":`${ufmt.block( 'Perk' )} Determined Endurance`,
				"value":`Your ${ufmt.block("Determined Endurance")} has reduced your mining cooldown by [ ***${reduction/1000}*** ] seconds!`
			}
		}
	},
	"level_up":{
		name:"Level Up",
		desc:"Triggered when a pickaxe levels up.",
		onMine:( lToken )=>{
			return {
				"name":`${ufmt.block( 'Pickaxe' )} Level Up!`,
				"value":`Your pickaxe is now level ${ufmt.block(bp.pickaxeLevelExp(lToken.userData.pickaxe_exp)+1)}.`
			};
		}
	},
	"no_cooldown":{
		name:"No Cooldown",
		desc:"Your pickaxe has no mining cooldown.",
		onMine:( lToken )=>{
			lToken.userData.lastmine = 0;
		}
	},
	"treasure_hunter":{
		name:"Treasure Hunter",
		desc:`You gain [ **Box Box** ] x3 every time your pickaxe levels up!`,
		onMine:( lToken )=>{
			let expProgress = bp.pickaxeExpProgress(lToken.userData.pickaxe_exp);

			// If the progress is at 0
			if(!expProgress){
				let itemData = itemUtils.items.lootbox.createItemData(3, 'box_box');
				itemUtils.addItemToUserData( lToken.userData, itemData );
				return {
					"name":`${ufmt.block( 'Perk' )} Treasure Hunter`,
					"value":`Your ${ufmt.block("Treasure Hunter")} perk has given you ${ufmt.item(itemData)}!`
				}
			}
		}
	},
	"treasure_luck":{
		name:"Treasure",
		desc:"Good fortune comes to those who persist",
		onMine:(lToken)=>{
			let itemData = perkTreasureHelper( lToken.userData );
			//lToken.send( `` );
			return {
				"name":`${ufmt.block( 'Luck' )} Treasure`,
				"value":`You stumble upon a treasure while mining!\nYou found ${ ufmt.item(itemData) }!`
			};
		}
	},

	"dumb_luck":{
		name:"Dumb Luck",
		desc:"Your pickaxe is more likely to find treasure.",
		onMine:( lToken )=>{
			if( Math.random() > 1/8 ){ return; }
			let itemData = perkTreasureHelper( lToken.userData );
			return ufmt.perkMessage('Perk', 'Dumb Luck',
				`You randomly trip on something... It's a ${ ufmt.item(itemData) }!`
			);
		}
	},

	"soft_handle":{
		name:"Soft Handle",
		desc:`Your pickaxe's handle is softer, allowing you to mine more, increasing overall profits by ${50}%!`,
		onMine:(lToken, outcome)=>{
			let coefficient = 50;
			let boost = outcome.divide(100).multiply( coefficient );
			bp.addBP( lToken, boost );
			return ufmt.perkMessage( 'Perk', 'Soft Handle', 
				`Your Pickaxe's ${ufmt.block('Soft Handle')} has increased profits by ${coefficient}%\n+ ${ufmt.bp(boost)}`
			);
		}
	},

	"gold_digger":{
		name:"Gold Digger",
		desc:"Every 4 mines, you get a [ **Gold** ] x1",
		onMine:( lToken )=>{
			if( !(lToken.userData.pickaxe_exp%4) ){
				let itemData = items.gold.createItemData(1);
				addItemToUserData( lToken.userData, itemData );
				return ufmt.perkMessage('Perk', 'Gold Digger',
					`You found ${ufmt.item(itemData)} while mining!`
				);
			}
		}
	},

	"adaptable":{
		name:"Adaptable",
		desc:"Your pickaxe levels up 2x faster!",
		onMine:( lToken )=>{
			lToken.userData.pickaxe_exp++;
		}
	},

	"scrapper":{
		name:"Scrapper",
		desc:`You have a chance to find [ **Crafting Materials** ] x1 whenever you mine!`,
		onMine:( lToken )=>{
			if( (Math.random()<1/2.5) ){
				let itemData = itemUtils.items.crafting_materials.createItemData(1);
				addItemToUserData( lToken.userData, itemData );
				return ufmt.perkMessage('Perk', 'Scrapper',
					`You found ${ufmt.item(itemData)} while mining!`
				);
			}
		}
	},

	"hungry":{
		name:"Hungry",
		desc:`Your pickaxe will produce 35% more profit if you have an active mine boost.`,
		onMine:( lToken, outcome )=>{
			if(lToken.userData.mineboostcharge==0){return;}
			let coefficient = 35;
			let boost = outcome.divide(100).multiply( coefficient );
			bp.addBP( lToken, boost );
			return ufmt.perkMessage( 'Perk', 'Hungry', 
				`Your sated belly has increased profits by ${coefficient}%\n+ ${ufmt.bp(boost)}`
			);
		}
	},

	"starved":{
		name:"Starved",
		desc:`Your pickaxe will produce 3% More profit per LvL. if you have an active mine boost`,
		onMine:( lToken, outcome )=>{
			if(lToken.userData.mineboostcharge==0){return;}
			let level = bp.pickaxeLevelUD( lToken.userData );
			let coefficient = 3;
			let boost = outcome.divide(100).multiply( coefficient*level );
			bp.addBP( lToken, boost );
			return ufmt.perkMessage( 'Perk', 'Starved', 
				`Your sated belly has increased profits by ${coefficient*level}%\n+ ${ufmt.bp(boost)}`
			);
		}
	},

	"badperk":{
		name:"Bad Perk",
		desc:"The monkey that wrote this code gave you this useless perk. It does nothing.",
		onMine:()=>{}
	},

	"veteran":{
		name:"Veteran",
		desc:"Mining profits"
	},

	"chrimson_king":{
		// is that a jojo refrence
		name:"Chrimson King",
		desc:"Your a portion of your mining cooldown gets deleted based on your pickaxe level. [ **-5 sec/lvl** ] with a hard cap of 120 seconds.",
		onMine:( lToken, outcome )=>{
			let lvl = bp.pickaxeLevelExp(lToken.userData.pickaxe_exp);
			let reduction = Math.floor(Math.min( (lToken.userData.pickaxe_time-2) * 60 * 1000, 5 * lvl * 1000 ));
			lToken.userData.lastmine-=reduction;
			//lToken.send(lvl);
			return {
				"name":`${ufmt.block( 'Perk' )} Chrimson King`,
				"value":`Your ${ufmt.block("Chrimson King")} has deleted [ ***${reduction/1000}*** ] seconds from your cooldown!`
			}
		}
	},

	"sculptor":{
		name:"Sculptor",
		desc:`Your pickaxe is is fine-tuned for sculpting. You are likeley to accidentally make some ${ufmt.block("Kingstone's Stones")} on your mining adventures.`,
		onMine:(lToken)=>{
			if(Math.random()<1/10){ return; }
			let itemData = itemUtils.items.kingstones_stone.createItemData(1);
			addItemToUserData( lToken.userData, itemData );
			return ufmt.perkMessage('Perk', 'Sculptor',
				`While mining, you \**accidentally*\* carve out some emblems into a rock and it turned into a ${ufmt.item(itemData)}!`
			);
		}
	},

	"regurgitation":{
		name:"Regurgitation",
		desc:"Your pickaxe has a chance of increasing the charge of your last-used mine boost by +1 ( even if the last mine boost is all used up ) but the mine boost becomes half as effective if the charge was already at 0.",
		onMine:(lToken)=>{
			if(Math.random()>1/8){ return; }
			if(!lToken.userData.mineboostcharge){
				lToken.userData.mineboost = Math.floor(lToken.userData.mineboost/2);
			}
			lToken.userData.mineboostcharge++;
			return ufmt.perkMessage('Perk', 'regurgitation',
				`You burp but some extra stuff came up... *Gross*...\nOn the bright side, your mine boost has recieved an extra charge!`
			);
		}
	},

	"carb_scrapper":{
		name:"Carb Scrapper",
		desc:`If you have an active ${ufmt.block('Bread')} mine boost, you are guaranteed to find ${ufmt.block('Crafting Materials')} when mining!`,
		onMine:(lToken)=>{
			if(lToken.userData.mineboostsource.toLowerCase()=='bread' && lToken.userData.mineboostcharge>0){
				let itemData = itemUtils.items.crafting_materials.createItemData(1);
				addItemToUserData( lToken.userData, itemData );
				return ufmt.perkMessage('Perk', 'Carb Scrapper',
					`Your carbs gave you an edge... You found ${ufmt.item(itemData)} while mining!`
				);
			}
		}
	}
};

const availablePerks = [
	'determined_endurance',
	'dumb_luck',
	'treasure_hunter',
	'soft_handle',
	'gold_digger',
	'adaptable',
	'scrapper',
	'hungry',
	'starved',
	'chrimson_king',
	'sculptor',
	'regurgitation',
	'carb_scrapper'
]

/**
60% 		0 	Common
25% 		1 	Uncommon
10% 		2 	RARE
3% 		3 	SUPER RARE
0.9% 		4 	ULTRA RARE
0.0997% 	5 	LEGENDARY
0.0003% 	6 	EXOTIC
0.00001%	7 	RELIC
0%		8 	HARMONIC
0%		9 	GIFTED
0%		10	ADMIN
0%		11	DEBUG
0%		12	Pickaxe
 */

let dropProbabilities = [
	60,
	25,
	10,
	3,
	0.9,
	0.197,
	0.03,
	0.001
]

let dropDistribution = dropProbabilities.map(x=>x*1000000);

// Fills an array with item ranks
// The item rank will determine the subset of items that will be dropped
// Pick from the drop array to determine the rank of the item that will be dropped
// This is VERY resource intensive. I recommend using a functional approach
let globalDropStoch = [];
/*dropProbabilities.map((p, itemRank)=>{
	new Array(Math.ceil( p*10000 )).fill(itemRank).map((rank)=>{
		globalDropStoch.push(rank);
	})
})*/

let lunchboxDropStoch = [];
let lootboxDropStoch = [];
// Lunchbox stochiometry
/*[ 6000, 2500, 1000, 300 ].map((p, itemRank)=>{
	new Array(Math.ceil( p )).fill(itemRank).map((rank)=>{
		lunchboxDropStoch.push(rank);
	});
});*/

// Categorizes items by their rank
let dropsByRank = new Array(dropProbabilities.length).fill(0).map(x=>new Array());
Object.values(items).map( ( itemObject )=>{
	if(!dropsByRank[itemObject.rank]){return;}
	return dropsByRank[itemObject.rank].push(itemObject);
});

 /**
  * Picks an a sample index, n, based on the weight at element e[i]
  * @param {Distribution} distribution 
  * @param {*} amount 
  * @returns {Number[]}
  */
function pickFromDistribution( distribution, amount){
	let sum = distribution.reduce((acc,t)=>{return acc+t});
	let doPick = function(){
		let n = Math.floor( Math.random()*sum );
		let i = -1;
		while( n > 0 ){
			i++;
			n -= distribution[i];
		}
		if(i<0){return 0;}
		return i;
	};
	return new Array(amount).fill(0).map( doPick );
}

/**
 * Changes the name of an item
 * @param {userData} userData 
 * @param {String} itemName 
 * @param {String} newItemName 
 */
function migrateItem( userData, itemName, newItemName ){
	let itemData = userData.items[itemName];
	let itemObject = getItemObject( itemData );

	itemObject.migrateItem( itemData, newItemName );

	itemData.name = newItemName;
	delete userData.items[itemName];
	addItemToUserData( userData, itemData );
	return itemData;
}

/**
 * Adds a perk to a user's active pickaxe
 * @param {*} userData 
 * @param {*} perkName 
 */
function addActivePickaxePerk( userData, perkName ){
	userData.pickaxe_perks.push(perkName);
}

function inventoryFromArrayOfItemDatas( itemDatas ){
	let accessors = itemDatas.map( (itemObject)=>{return itemObject.name||itemObject.accessor} );
	// This is a tally snippet
	let tallyObject = {}
	accessors.map((accessor)=>{
		if(!tallyObject[accessor]){tallyObject[accessor]=1;}
		else{
			tallyObject[accessor]++;
		}
	})
	return tallyObject;
}

function formatTalliedOutcomes( tallyObject ){
	return Object.keys(tallyObject).map( (accessor)=>{
		return itemName(accessor, tallyObject[accessor], '', false);
	} );
}

module.exports.craftingRecipies = craftingRecipies;
module.exports.userHasItem = userHasItem;
module.exports.addItemToUserData = addItemToUserData;
module.exports.addItemObjectToUserData = addItemObjectToUserData;
module.exports.transferItemToUserData = transferItemToUserData;
module.exports.addItemToInventory = addItemToInventory;
module.exports.transferItemToInventory = transferItemToInventory;
module.exports.dropDistribution = dropDistribution;
module.exports.lootboxDistribution = dropDistribution;
module.exports.availablePerks = availablePerks;
module.exports.addActivePickaxePerk = addActivePickaxePerk;
module.exports.migrateItem = migrateItem;
module.exports.pickFromDistribution = pickFromDistribution;
module.exports.items = items;
module.exports.Item = Item;
module.exports.rankNames = Item.ranks;
module.exports.rankColors = Item.rankColors;
module.exports.lunchboxDropFilter = lunchboxDropFilter;
module.exports.lootboxDropFilter = lootboxDropFilter;
module.exports.testboxDropFilter = testboxDropFilter;
module.exports.getItemObject = getItemObject;
module.exports.getItemObjectByAccessor = getItemObjectByAccessor;
module.exports.pickPerks = pickPerks;
module.exports.dropProbabilities = dropProbabilities;
module.exports.globalDropStoch = globalDropStoch;
module.exports.lunchboxDropStoch = lunchboxDropStoch;
module.exports.dropsByRank = dropsByRank;

module.exports.drops_lootbox_lunchbox = Object.values(items).filter( lunchboxDropFilter );
module.exports.drops_lootbox_lootbox = Object.values(items).filter( lootboxDropFilter );