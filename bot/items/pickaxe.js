let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const bp = require("../utils/bp.js");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
let ezhash = require("../modules/ezhash");


const tierAdjectives = [
	['weak', 'shifty', 'terrible', 'dull', 'bland', 'rusty', 'tarnished', 'awful'],
	['iron', 'copper', 'metal', 'polished', 'fine', 'strapped', 'grey', 'red', 'blue', 'cyan', 'orange', 'yellow', 'purple', 'green', 'strong', 'sturdy', 'pleasnt'],
	['great', 'epic', 'awesome', 'youthful', 'glazed', 'electrified', 'glistening', 'poppin', 'firey', 'flamboyant', 'cheesy', 'dorky', 'nerdy', 'hunky_dory', 'elastic', 'genuine', 'tragic', 'killer', 'gassy', 'open', 'lost', 'ancient', 'jealous', 'zealous', 'tasty', 'tasteful', 'living', 'greatful', 'rainbow', 'cat', 'monkey', 'titanium', 'adamantium' ],
	['ravenging', 'recursive', 'godly', 'flowing', 'holy', 'radiant', 'resonant', 'molecular', 'nano_tech', 'ethereal', 'ephemeral']
];
const tierNouns = [
	['pickaxe'],
	['pickaxe', 'shovel', 'hand_drill'],
	['pickaxe', 'power_drill', 'shovel'],
	['pickaxe', 'power_drill', 'shovel', 'laser_drill', 'hole_maker']
];

/**
 * Clones objects with recursive capabilities
 * @param {Object} object
 * @param {Number} depth Leave at 0 for shallow copy
 */
Object.clone = function( object, depth=5 ){
	let out = {};
	if(typeof(object)!='object'){return object;}
	
	if(Array.isArray( object )){
		
		if(Array.isEmpty(object)){return [];}
		return object.map(x=>Object.clone(x, depth-1));;
	}
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

// similar to object.assign, but only acts if a field does not exist
Object.ensure = function( target, source ){
	Object.keys(source).map( (key)=>{
		if(typeof(target[key])=='undefined'){
			target[key] = source[key];
		}
	})
}

class ItemPickaxe extends Item{
	constructor(){
		super( false );
		this.name = "Pickaxe"; // Required
		this.accessor = "pickaxe"; // Virtural

		this.consumable = false;
		this.value = 0;
		this.rank = 12;
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
			maxPerkSlots:2,
			tier:0,
			created: new Date().getTime().toString()
		};

		this.icon = "https://i.imgur.com/miBhBjt.png";

		this.isDroppedByLootbox = false;
	}

	formatName( itemData ){
		let name = itemData.name;
		if(itemData.name.indexOf('pick')==-1){
			name+=" ( pick )";
		}
		return name;
	}

	cleanup( userData, itemData ){
		delete userData.items[itemData.meta.accessor];
		return;
	}
	
	generateMeta( tier=0 ){
		let adjective = ufmt.pick( tierAdjectives[tier] || ['transcendent'], 1 )[0];
		let noun = ufmt.pick( tierNouns[tier] || ['quantum tunneler'], 1 )[0];
		let name = `${adjective}_${noun}`;
		return {
			name: name,
			accessor: name,
			perks:[],
			exp: 0,
			time: 5+tier*2,
			multiplier: 0,
			creator:"Grandmaster Blacksmith",
			imgIndex:0,
			maxPerkSlots:(tier+2),
			tier:tier,
			created: new Date().getTime().toString(),
			lDescIndex:tier+8,
			adjective: adjective,
			noun: noun
		};
	}

	getTier( itemData ){
		return itemData.meta.tier||0;
	}

	getMultiplier( itemData ){
		let tier = this.getTier(itemData)
		return 25**tier*(1+bp.pickaxeLevelExp( itemData.meta.exp )*10*(tier+1));
	}

	computeMetaHash( itemData ){
		return ezhash( `${this.name}_${this.computeMetaString( itemData.meta )}` )
	}

	createItemData(amount, meta, name, tier=0){
		meta = meta || this.generateMeta( tier );
		return { accessor:this.accessor, amount: amount, name: meta.name || name || this.accessor, meta:meta } 
	}
	
	getMaxPerkSlots( itemData ){
		return itemData.meta.maxPerkSlots||2;
	}

	getUniqueRank( itemData ){
		if(!itemData){return 12;}
		return Math.min( this.getTier( itemData ) * 2, Item.ranks.length-1 ) ;
	}

	addPerk( itemData, perkName ){
		if(!itemUtils.perks[perkName]){
			console.warn(`[Pickaxe] perk ${perkName} is not a valid perk!`);
		}
		itemData.meta.perks.push(perkName);
	}

	ensureUserHasDefaultPickaxe( userData ){
		if((!userData.hasFirstPickaxe && userData.pickaxe_accessor=="shifty_pickaxe") || (Object.values(userData.items).filter( (x)=>{return x.equipped;} ).length==0) ){
			let itemData = this.createItemData(0, Object.clone(this.meta));
			itemData.equipped = true;
			itemUtils.addItemToUserData( userData, itemData );
			userData.hasFirstPickaxe = true;
		}
	}

	/**
	 * Migrate item override
	 * @param {*} itemData 
	 * @param {*} newName 
	 */
	migrateItem( itemData, itemKey ){
		itemData.name = itemKey;
		itemData.meta.accessor = itemKey;
		itemData.meta.name = itemKey;
	}

	getActivePickaxeItemData( userData ){
		this.ensureUserHasDefaultPickaxe( userData );
		return userData.items[userData.pickaxe_accessor];
	}

	
	use( Chicken, itemData ){
		// Create shifty pickaxe item if it didn't already exist
		this.ensureUserHasDefaultPickaxe( Chicken.userData );

		let unequippedPickItemData = Chicken.userData.items[ Chicken.userData.pickaxe_accessor ];
		Object.ensure( itemData.meta, Object.clone( this.meta ) );

		// Unequip the pickaxe, save its data
		Object.keys(Chicken.userData).filter(x=>x.indexOf('pickaxe')==0).map((x)=>{
			let n = x.split("_")[1];
			unequippedPickItemData.meta[n] = Chicken.userData[x];
		})
		unequippedPickItemData.amount++;
		unequippedPickItemData.equipped = false;

		unequippedPickItemData.meta.perks.map( (perkName)=>{
			let unequip = itemUtils.pickPerks[perkName].onUnequip || (()=>{});
			unequip( Chicken, unequippedPickItemData );
		});

		// Equip the new pickaxe
		Object.keys( itemData.meta ).map( ( key )=>{
			//console.log(key);
			Chicken.userData[`pickaxe_${key}`] = itemData.meta[key];
		});
		itemData.amount--;
		itemData.equipped = true;

		Chicken.send(`You've swapped your ${ ufmt.itemName(unequippedPickItemData.name, 0, "***") } for your ${ ufmt.itemName(itemData.name, 0, "***") }`)
	}

	/**
	 * 
	 * @param {*} Chicken 
	 * @param {*} itemData 
	 */
	desc( Chicken, itemData ){
		if(!itemData){
			itemData = this.getActivePickaxeItemData( Chicken.userData );
		}
		let pickaxeDescription = locale.pickaxe.descriptions[itemData.meta.lDescIndex] || `Not much is known about this mysterious pickaxe...`;
		// if the pickaxe is currenrly equipped.
		if(itemData.meta.accessor == Chicken.userData.pickaxe_accessor){
			itemData.meta.exp = Chicken.userData.pickaxe_exp;
		}
		return ufmt.join([
			`${ufmt.block(itemData.name)} LvL ${ufmt.block(bp.pickaxeLevelExp(itemData.meta.exp))} tier ${ufmt.block(this.getTier(itemData))}`,
			`${pickaxeDescription}`,
			'\n',
			ufmt.denote('Multiplier', `x${ufmt.block(this.getMultiplier( itemData ))}`),
			ufmt.denote(`Exp`, ufmt.block(itemData.meta.exp || 1) ),
			ufmt.denote('Cooldown', `${ufmt.block(itemData.meta.time*60 || 1)} seconds`),
			ufmt.denote('Perk Slots', `${itemData.meta.perks.length}/${ this.getMaxPerkSlots( itemData ) }`),
			ufmt.denote('Perks', `\n${ufmt.join(itemData.meta.perks.map((x)=>{
				let perk = itemUtils.pickPerks[ x ];
				return `- ${ufmt.block(perk.name)}: *${perk.desc || "No description"}*`;
			}))}`),
			'\n',
			ufmt.denote('Unique ID', '`#'+this.computeMetaHash(itemData)+'`')
		]);
	}
}

module.exports = new ItemPickaxe();