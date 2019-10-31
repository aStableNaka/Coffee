const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const marketUtils = require("../utils/market");
const itemUtils = require("../utils/item");
const views = loader("./bot/views/market", "./views/market");

class CommandMarket extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return false;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ["market", "mark"];
	}
	get mimics() {
		return [{
			name: "catalogue",
			cmd: "mark catalogue"
		},
		{
			name: "cat",
			cmd: "mark catalogue"
		},
		{
			name: "sell",
			cmd: "mark sell"
		}
		];
	}
	get help() {
		return null; /*["A simple command!"];*/
	}
	get helpExamples() {
		return null; /*[["command", "< parameters >", "desc"]];*/
	}
	get helpGroup() {
		return null;
	}
	get helpName() {
		return null;
	}
	modifyArgs(args, Chicken) {
		let validOptions = ['catalogue', 'sell', 'bid'];
		let mArgs = {
			valid:validOptions.indexOf(args[0])>-1,
			type:args[0],
		};
		if (args[0] == 'sell') {
			mArgs.itemAccessor = Chicken.keyPairs.item || (args.slice(1).join(' ').match(/([^!@\d\s])[\d?\w?\.?]+/gi)||[]).join("_").toLowerCase() || false;
			mArgs.amount = parseInt(Chicken.keyPairs.amount) || Chicken.numbers[0] || 1;
			mArgs.price = parseInt(Chicken.keyPairs.price) || Chicken.numbers[1] || 0;
			if(!mArgs.itemAccessor){
				mArgs.valid = false;
			}
		}else if( args[0] == 'catalogue'){
			mArgs.itemAccessor = Chicken.keyPairs.item || (args.slice(1).join(' ').match(/([^!@\d\s])[\d?\w?\.?]+/gi)||[]).join("_").toLowerCase() || false;
		}
		return mArgs;
	}
	
	exec_catalogue(Chicken) {
		const limit = 25;
		let query = null, options = {sort:{date:-1},limit:limit};
		if(!Chicken.mArgs.itemAccessor){
			query = {v:{$gte:0}};
		}else{
			query = {accessor:{$regex:`.*${Chicken.mArgs.itemAccessor}.*`}};
		}
		Chicken.database.api.wrapper43('market', (collection)=>{
			collection.find(query, options).toArray().then((results)=>{
				Chicken.send(views.catalogue(Chicken, results));
			});
			
		});
	}

	exec_sell(Chicken) {
		let userData = Chicken.userData;
		let items = userData.items;
		let searchResults = itemUtils.inventorySearch( items, Chicken.mArgs.itemAccessor );
		if(searchResults[0]){
			let itemAccessor = searchResults[0];
			if(items[itemAccessor].amount>=Chicken.mArgs.amount){
				let tempInv = {};
				itemUtils.transferItemToInventory(items, tempInv,items[itemAccessor], Chicken.mArgs.amount);
				Chicken.mArgs.item = tempInv[itemAccessor];

				/**
				 * Continue the sale
				 */
				function continueSale(){
					Chicken.send(views.creating_listing(Chicken)).then((message)=>{
						marketUtils.createMarketListing( Chicken, Chicken.mArgs.item, Chicken.mArgs.price, (a, listing)=>{
							if(userData.items.silver){
								if(items.silver.amount>=listing.deposit){
									items.silver.amount-=listing.deposit;
									if(env.beta){ listing.beta = true; }
									Chicken.database.api.wrapper43('market', ( collection )=>{
										collection.insertOne( listing ).then(()=>{
											message.edit(views.listing(Chicken, listing, true));
											userData.listings.push(listing.id);
											console.log(`[Market] Listing created ${listing.id}`);``
										}).catch(()=>{
											message.edit(views.error_creating_listing(Chicken, listing));
											items.silver.amount+=listing.deposit;
										})
									})
								}else{
									Chicken.send("You cannot sell this item, you don't have enough silver for the deposit.");
									return;
								}
							}else{
								Chicken.send("You cannot sell this item, you don't have enough silver for the deposit.");
								return;
							}
						})
					})
				}

				/**
				 * Cancel the sale
				 */
				function calcelSale(){
					Chicken.send("Item Sale canceled");
					itemUtils.addItemToInventory(items, Chicken.mArgs.item);
				}

				/**
				 * Making sure all the args are in place
				 */
				if(!Chicken.mArgs.price){
					Chicken.send(views.sale_receipt(Chicken)).then(( receiptMessage )=>{
						Chicken.prompt("How much would you like to sell it for (silver)?", (response)=>{
							if(response.numbers[0]){
								Chicken.mArgs.price = Math.max(1, response.numbers[0]);
								continueSale();
							}else{
								cancelSale();
							}
						})
					});
				}else{
					continueSale();
				}
				
			}else{
				return;
			}
		}else if( searchResults.length == 0 ){
			
		}
	}
	async execute(Chicken) {
		if(!Chicken.mArgs.valid){this.exec_catalogue(Chicken)}
		this[`exec_${Chicken.mArgs.type}`](Chicken);
		return null;
	}
}

module.exports = new CommandMarket();