var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader( "./bot/views/inventory", "./views/inventory" );
const data = loader( "./bot/data", "./data" );
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/formatting.js");
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
	get helpPage(){ return 2; /*Field for the help command*/ }
	modifyArgs( args, lToken ){
		let option = args[0];
		let mArgs = {
			option:null,
			page: lToken.numbers[0] || 1,
			userQuery: null
		}
		if((['use', 'info', 'give', 'daily', 'trade'].includes(option))){
			mArgs.option = option;
			
			if(option=='give'||option=='trade'){
				mArgs.itemAccessor = lToken.words.slice(1).join("_").toLowerCase();
				mArgs.to = lToken.mentions[0] || null;
				mArgs.amount = Math.abs( lToken.numbers[0] || 1);
			}else{
				mArgs.itemAccessor = lToken.words.slice(1).join("_").toLowerCase();
				mArgs.amount = Math.abs( lToken.numbers[0] || 1 );
			}
		}else{
			
			// Used to look up other people's invs
			mArgs.userQuery = lToken.words.join(" ");
			mArgs.page = Math.max(0, lToken.numbers[0]-1||0);
		}
		return mArgs;
	}

	execDaily(lToken){
		if(new Date().getTime() - lToken.userData.daily >= 22*60*60*1000 ){
			let itemData = itemUtils.addItemToInventory(lToken.userData,itemUtils.items.lootbox.createItemData(2, 'daily_box'));
			lToken.send( `${ufmt.name(lToken.userData)}, here's your daily reward: ${ ufmt.item(itemData) }` );
			lToken.userData.daily = new Date().getTime();
		}else{
			lToken.send( `${ufmt.name(lToken.userData)}, you've already claimed your daily reward! You can claim one again in ${ufmt.timeLeft( new Date().getTime() - lToken.userData.daily, 22*60*60*1000 )}.` )
		}
	}

	execGive( lToken, itemData ){
		if( itemData && itemData.amount > 0){
			if(lToken.mArgs.to){
				lToken.database.get( lToken.mArgs.to.id.toString(), ( toUserData )=>{
					itemUtils.transferItemToInventory( lToken.userData, toUserData, itemData, lToken.mArgs.amount );
					lToken.send( `You've given ${ ufmt.nameMention( lToken.mArgs.to ) } ${ ufmt.item( itemData,lToken.mArgs.amount ) }` );
					//console.log("SUPER WASABI")
				});
				//console.log("GUUAWUU")
			}
		}else{
			lToken.send( views.item_not_owned( lToken, itemData ) );
		}
	}

	execTrade( lToken, itemData ){

	}

	// Only executed if itemData exists
	execUse( lToken, itemData ){
		
		// For special items (ie. "MSPS Boost" which is a meta-form of "Item Boost")
		// userData.items["msps_boost"] -> accessor=item_boost;
		// TODO finish
		if(!itemData){
			lToken.send( views.item_not_owned( lToken, lToken.mArgs.amount ) );
			return;
		}
		let itemObject = itemUtils.getItemObject( itemData );

		// If the item can't be stacked
		if(!itemObject.canUseMulti){
			lToken.mArgs.amount = 1;
		}

		if(itemData.amount >= lToken.mArgs.amount && itemObject){
			var useStatus = itemObject.use( lToken, itemData );

			// If the item is consumable, non-persistent and doesn't pass the NO_CONSUME status when used
			if( itemObject.consumable && !itemObject.persistent && useStatus != "NO_CONSUME" ){
				itemData.amount-=lToken.mArgs.amount;
			}

		}else{
			lToken.send( views.item_not_owned( lToken, lToken.mArgs.amount ) );
		}
	}

	execInfo( lToken, itemObject, itemData ){
		lToken.send(views.info( lToken, itemObject, itemData ));
	}

	execOverview( lToken, userData ){
		if(!userData){userData = lToken.userData}
		let numberOfItems = Object.values( userData.items ).filter( ( itemData )=>{ return itemData.amount > 0 } ).length;
		let itemsPerPage = 20;
		let numberOfPages = Math.ceil( numberOfItems/itemsPerPage );

		function send(){
			lToken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, lToken.mArgs.page||lToken.numbers[0]-1||0) );
			lToken.send( views.overview(lToken, lToken.mArgs.page, userData, numberOfItems, itemsPerPage, numberOfPages) ).then( pageThing );
		}

		function pageThing( hookMsg ){
			// Starting conditions
			let pageOperators = [];

			numberOfItems = Object.values( userData.items ).filter( ( itemData )=>{ return itemData.amount > 0 } ).length;
			itemsPerPage = 20;
			numberOfPages = Math.ceil( numberOfItems/itemsPerPage );

			lToken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, lToken.mArgs.page||lToken.numbers[0]-1||0) );
			
			
			if(lToken.mArgs.page > 0){
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_left, ()=>{

						// Backwards operation
						lToken.mArgs.page--;
						send();
					} )
				);
			}
			if( lToken.mArgs.page < numberOfPages-1 ){
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_right,
					()=>{
	
						// Forewards operation
						lToken.mArgs.page++;
						send();
					} )
				)
			}
			
			pages.createPageManager( lToken, hookMsg, pageOperators );
		}
		send();
	}

	async execute( lToken ){ 
		let option = lToken.mArgs.option;
		if(!option){
			if( lToken.args[0] ){
				let userQuery = lToken.words.join(" ");
				let searchStatus = lToken.queryUser( userQuery, ( snowflake )=>{
					lToken.database.get( snowflake, ( userData )=>{
						
						this.execOverview( lToken, userData )
						lToken.shared.modules.db.updateLeaderboards( userData );
					});
				}, ( results )=>{
					lToken.send( views.found(lToken, results) );
				}, ()=>{} );
	
				// If the search succeeds, theres no need to continue
				if( searchStatus ){ return; }
			}
			this.execOverview( lToken )
			
		}else{
			if(option == 'daily'){
				this.execDaily( lToken );
				return;
			}

			// Checkpoint 1, assume item is explicitly typed
			let itemData = lToken.userData.items[ lToken.mArgs.itemAccessor ];
			let itemObject = itemUtils.items[ lToken.mArgs.itemAccessor ];
			if(!itemData && !itemObject){

				// Checkpoint 2, item isn't explicitly stated, find matches.
				let itemsFound = Object.keys(lToken.userData.items).filter( ( itemName )=>{
					return itemName.includes(lToken.mArgs.itemAccessor);
				});
				if( itemsFound[0] ){
					if(itemsFound.length==1){
						
						// Single item found -> Assume user wants *that* item -> Continue on
						let accessor = itemsFound[0];
						itemData = lToken.userData.items[accessor];
						itemObject = itemUtils.items[ accessor ];
						lToken.mArgs.itemAccessor = accessor;
					}else{
						
						// Multiple items found -> Give the user a list of all items found
						lToken.send( views.query(lToken, itemsFound) );
						return;
					}
				}else{
					lToken.send( views.item_not_found(lToken) );
					return;
				}
			}

			// Checkpoint 3, continue on with the itemObject and itemData
			switch( option ){
				case 'use':
					return this.execUse( lToken, itemData );
				case 'give':
					return this.execGive( lToken, itemData );
				case 'trade':
					return this.execTrade( lToken, itemData );
				case 'info':
					if(!itemObject){
						itemObject = itemUtils.getItemObject( itemData );
					}
					if(!itemObject){
						lToken.send( views.item_not_found(lToken) );
						return;
					}
					this.execInfo(lToken, itemObject, itemData );
			}
		}
	}
}

module.exports = new CommandInventory();