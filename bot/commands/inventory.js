const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader( "./bot/views/inventory", "./views/inventory" );
const data = loader( "./bot/data", "./data" );
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/fmt.js");
var emojis = require("../utils/emojis");
var pages = require("../utils/page");
class CommandInventory extends Command{
	
	constructor(){
		super();
		//this.wip = true;
	}

	get botAdminOnly(){ return false; }
	get usesDatabase(){ return true; }

	get accessors(){ return ["inv", "inventory", "items", "item"]; }

	get mimics(){ return [
		{name:"iteminfo",cmd:"inv info"},
		{name:"info",cmd:"inv info"},
		{name:"ii",cmd:"inv info"},
		{name:"use", cmd:"inv use"},
		{name:"open", cmd:"inv use"},
		{name:"equip", cmd:"inv use"},
		{name:"eat", cmd:"inv use"},
		{name:"give", cmd:"inv give"},
		{name:"daily", cmd:"inv daily"}
	]; }

	get help(){ return {
		name:"Inventory",
		value:`experimental Inventory command`
	}; }

	get helpExamples(){ return [
		["inventory", '', 'View your inventory!'],
		["daily", '', 'Claim your daily reward!'],
		["use", '< item name > < amount >', 'Use an item in your inventory, example "~use apple"'],
		["give", '< @user > < item name >', 'Give somebody one of your items!'],
		["ii", '< item name >', 'View an item\'s information. (Only works if you own the item)']
	];}

	get helpName(){ return "Inventory/Items"; }
	get helpGroup(){ return "Items"; }
	get helpPage(){ return 1; /*Field for the help command*/ }
	modifyArgs( args, Chicken ){
		let option = args[0];
		let mArgs = {
			option:null,
			page: Chicken.numbers[0] || 1,
			userQuery: null
		}
		if((['use', 'info', 'give', 'daily', 'trade'].includes(option))){
			mArgs.option = option;
			if(args[1]){
				var itemAccessor = args.slice(1).join(' ').match(/([^!@\d\s])[\d?\w?\.?]+/gi).join("_").toLowerCase();
			}
			
			if(option=='give'||option=='trade'){
				mArgs.itemAccessor = itemAccessor;
				mArgs.to = Chicken.mentions[0] || null;
				mArgs.amount = Math.abs( Chicken.numbers[0] || 1);
			}else{
				mArgs.itemAccessor = itemAccessor;
				mArgs.amount = Math.abs( Chicken.numbers[0] || 1 );
			}
		}else{
			
			// Used to look up other people's invs
			mArgs.userQuery = args.join(" ");
			mArgs.page = Math.max(0, Chicken.numbers[0]-1||0);
		}
		return mArgs;
	}

	execDaily(Chicken){
		if(new Date().getTime() - Chicken.userData.daily >= 22*60*60*1000 ){
			let itemData = itemUtils.addItemToUserData(Chicken.userData,itemUtils.items.lootbox.createItemData(2, 'daily_box'));
			Chicken.send( `${ufmt.name(Chicken.userData)}, here's your daily reward: ${ ufmt.item(itemData) }` );
			Chicken.userData.daily = new Date().getTime();
		}else{
			Chicken.send( `${ufmt.name(Chicken.userData)}, you've already claimed your daily reward! You can claim one again in ${ufmt.elapsedTime( Chicken.userData.daily+22*60*60*1000 - (new Date().getTime()) )}.` )
		}
	}

	execGive( Chicken, itemData ){
		if( itemData && itemData.amount > 0){
			if(Chicken.mArgs.to){
				Chicken.database.get( Chicken.mArgs.to.id.toString(), ( toUserData )=>{
					let amount = Math.min( itemData.amount, Chicken.mArgs.amount);
					itemUtils.transferItemToUserData( Chicken.userData, toUserData, itemData, amount );
					Chicken.send( `You've given ${ ufmt.nameMention( Chicken.mArgs.to ) } ${ ufmt.item( itemData,amount ) }` );
					let itemObject = itemUtils.getItemObject( itemData );
					if(itemObject.isUnique){
						itemObject.cleanup( Chicken.userData, itemData )
					}
					//console.log("SUPER WASABI")
				});
				//console.log("GUUAWUU")
			}
		}else{
			Chicken.send( views.item_not_owned( Chicken, itemData ) );
		}
	}

	execTrade( Chicken, itemData ){

	}

	// Only executed if itemData exists
	execUse( Chicken, itemData ){
		
		// For special items (ie. "MSPS Boost" which is a meta-form of "Item Boost")
		// userData.items["msps_boost"] -> accessor=item_boost;
		// TODO finish
		if(!itemData){
			Chicken.send( views.item_not_owned( Chicken, Chicken.mArgs.amount ) );
			return;
		}
		let itemObject = itemUtils.getItemObject( itemData );

		// If the item can't be stacked
		if(!itemObject.canUseMulti){
			Chicken.mArgs.amount = 1;
		}

		if(itemData.amount >= Chicken.mArgs.amount && itemObject){
			var useStatus = itemObject.use( Chicken, itemData );

			// If the item is consumable, non-persistent and doesn't pass the NO_CONSUME status when used
			if( itemObject.consumable && !itemObject.persistent && useStatus != "NO_CONSUME" ){
				itemData.amount-=Chicken.mArgs.amount;
				if(!itemData.used){
					itemData.used=0;
				}
				itemData.used++;
			}

		}else{
			Chicken.send( views.item_not_owned( Chicken, Chicken.mArgs.amount ) );
		}
	}

	execInfo( Chicken, itemObject, itemData ){
		Chicken.send(views.info( Chicken, itemObject, itemData ));
	}
	
	/*
		Reported issue:
		"~inv 3211263 automatically displays the second page of my inventory and doesn't let me change to earlier pages
		suspicion for above: ~inv [page] is the problem since inv thinks I'm looking at page 3211263 and so pressing the left arrow doesn't help because it only decrements by one"

		Dev Response:
		"I can't seem to replicate the issue. But I'll leave this comment here in case it appears again"
	*/
	execOverview( Chicken, userData ){
		if(!userData){userData = Chicken.userData}
		let numberOfItems = Object.values( userData.items ).filter( ( itemData )=>{ return itemData.amount > 0 } ).length;
		let itemsPerPage = 15;
		let numberOfPages = Math.ceil( numberOfItems/itemsPerPage );

		// Name filter, uses Chicken.keyPair filter:"query"
		let filter = ( itemData )=>{
			if(Chicken.keyPairs.filter){
				//console.log(Chicken.keyPairs.filter, itemData.name, itemData.accessor, itemData.name.includes(Chicken.keyPairs.filter) || itemData.accessor.includes(Chicken.keyPairs.filter))
				return itemData.name.includes(Chicken.keyPairs.filter) || itemData.accessor.includes(Chicken.keyPairs.filter);
			}
			return true;
		};

		function send(){
			Chicken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, Chicken.mArgs.page||Chicken.numbers[0]-1||0) );
			Chicken.send( views.overview(Chicken, Chicken.mArgs.page, userData, numberOfItems, itemsPerPage, numberOfPages, filter) ).then( pageThing );
		};

		

		function pageThing( hookMsg ){
			// Starting conditions
			let pageOperators = [];

			numberOfItems = Object.values( userData.items ).filter( ( itemData )=>{ return itemData.amount > 0 } ).length;
			numberOfPages = Math.ceil( numberOfItems/itemsPerPage );

			Chicken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, Chicken.mArgs.page||Chicken.numbers[0]-1||0) );
			
			
			if(Chicken.mArgs.page > 0){
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_left, ()=>{

						// Backwards operation
						Chicken.mArgs.page--;
						send();
					} )
				);
			}
			if( Chicken.mArgs.page < numberOfPages-1 ){
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_right,
					()=>{
	
						// Forewards operation
						Chicken.mArgs.page++;
						send();
					} )
				)
			}
			
			pages.createPageManager( Chicken, hookMsg, pageOperators );
		}
		send();
	}

	async execute( Chicken ){ 
		let option = Chicken.mArgs.option;
		if(!option){
			if( Chicken.args.length != Chicken.numbers.length ){
				let userQuery = Chicken.mArgs.userQuery;
				let searchStatus = Chicken.queryUser( userQuery, ( snowflake )=>{
					Chicken.database.get( snowflake, ( userData )=>{
						
						this.execOverview( Chicken, userData )
						Chicken.shared.modules.db.updateLeaderboards( userData );
					});
				}, ( results )=>{
					Chicken.send( views.found(Chicken, results) );
				}, ()=>{} );
	
				// If the search succeeds, theres no need to continue
				if( searchStatus ){ return; }
			}
			this.execOverview( Chicken )
			
		}else{
			if(option == 'daily'){
				this.execDaily( Chicken );
				return;
			}

			// Checkpoint 1, assume item is explicitly typed
			let itemData = Chicken.userData.items[ Chicken.mArgs.itemAccessor ];
			let itemObject = itemUtils.items[ Chicken.mArgs.itemAccessor ];
			if(!itemData && !itemObject){

				// Checkpoint 2, item isn't explicitly stated, find matches.
				let itemsFound = Object.keys(Chicken.userData.items).filter( ( itemName )=>{
					return itemName.includes(Chicken.mArgs.itemAccessor);
				});
				if( itemsFound[0] ){
					if(itemsFound.length==1){
						
						// Single item found -> Assume user wants *that* item -> Continue on
						let accessor = itemsFound[0];
						itemData = Chicken.userData.items[accessor];
						itemObject = itemUtils.items[ accessor ];
						Chicken.mArgs.itemAccessor = accessor;
					}else{
						
						// Multiple items found -> Give the user a list of all items found
						Chicken.send( views.query(Chicken, itemsFound) );
						return;
					}
				}else{
					Chicken.send( views.item_not_found(Chicken) );
					return;
				}
			}

			// Checkpoint 3, continue on with the itemObject and itemData
			switch( option ){
				case 'use':
					return this.execUse( Chicken, itemData );
				case 'give':
					return this.execGive( Chicken, itemData );
				case 'trade':
					return this.execTrade( Chicken, itemData );
				case 'info':
					if(!itemObject){
						itemObject = itemUtils.getItemObject( itemData );
					}
					if(!itemObject){
						Chicken.send( views.item_not_found(Chicken) );
						return;
					}
					this.execInfo(Chicken, itemObject, itemData );
			}
		}
	}
}

module.exports = new CommandInventory();