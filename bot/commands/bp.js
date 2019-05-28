var Command = require("../class/command.js");
const env = require("../env.js");
const loader = require("../loader");
const views = loader("./bot/views/bp", "./views/bp");
delete require.cache[require.resolve("../data/shop.json")];
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const locale = require("../data/EN_US.json");
var {
	dataShop, dataShopCatalogue, getItemByAlias, confirmBuy, calcIncome, getAmountOwned, calcMax, calcNextCost, getCurrentBPBal
} = require("../utils/bp");
var bpUtils = require("../utils/bp");
var emojis = require("../utils/emojis");
var pages = require("../utils/page");

class CommandBlobPoints extends Command {
	constructor() {
		super();
	}
	get usesDatabase() { return true; }
	get accessors() { return ["bp", "blob", "bpoints", "blobpoints", "bal"]; }
	get mimics() { return [
		{ name: "shop", cmd: "bp shop" }, 
		{ name: "buy", cmd: "bp buy" }, 
		{ name: "store", cmd: "bp shop" }, 
		{ name: "donate", cmd: "bp give" }, 
		{ name: "leaderboards", cmd: "bp leaderboards" }, 
		{ name: "leaders", cmd: "bp leaderboards" }, 
		{ name: "leaderboard", cmd: "bp leaderboards" },
		{ name: "donate", cmd: "bp give" },
		{ name: "gens", cmd: "bp gens" }
	];}
	get modifiers() { return ['shop', 'leaderboards', 'buy', 'give', 'prestige', 'gens'] }

	get help() {
		return locale.bp.help.field;
	}

	get helpExamples() {
		return [
			["bp", "< shop | buy | leaderboards >", locale.bp.help.summary.base],
			["bal", "", locale.bp.help.summary.bal],
			["shop", "< page >", locale.bp.help.summary.shop],
			["buy", "<generator code> <amount | 'max'>", locale.bp.help.summary.buy],
			//["donate", "< @person > < amount >", "Give away some of your bp!"],
			["leaderboards", "< page >", locale.bp.help.summary.leaderboards ]
		];
	}
	get helpName() { return "BP"; }
	get helpGroup() { return "BP"; }

	modifyArgs(args, lToken) {
		if (this.modifiers.includes(args[0])) {
			if (args[0] == 'buy') {
				lToken.eArgsLen = 2; // Make sure there are enough arguments
				return {
					type: 'buy',
					itemAlias: String(args[1] || "Nothing").toUpperCase(),
					max: (args[2] || '').toLowerCase() == "max",
					amount: args[2] ? (Number.isNaN(parseInt(args[2])) ? 0 : Math.abs(parseInt(args[2]))) : 1
				}
			} else if (args[0] == 'shop') {
				return { type: 'shop', page: lToken.numbers[0] || 0 }
			} else if (args[0] == 'give' || args[0] == 'donate' ) {
				return { type: 'give', amount: lToken.numbers[0], to: lToken.mentions[0] }
			}else if( args[0] == 'gens' ){
				return{
					type:'gens',
					user: lToken.mentions[0]
				}
			}else if( args[0]='leaderboards' ){
				return {type:'leaderboards', local:lToken.words.indexOf('local')>-1, page:lToken.numbers[0]}
			}
			return { type: args[0] }
		}
		return { type: "overview", userQuery: args.join(" ") };
	}

	execGens( lToken ){
		if(lToken.mArgs.user){
			lToken.database.get( lToken.mArgs.user.id, (userData)=>{
				lToken.send( views.gens( lToken, userData ) )
			});
		}else{
			lToken.send( views.gens( lToken, lToken.userData ) )
		}
	}

	// Display the overview
	execOverview(lToken, bal, income) {
		var self = this;
		function onFoundOne( snowflake ){
			lToken.database.get( snowflake, ( userData )=>{
				lToken.userData = userData;
				let income = calcIncome(lToken);
				let bal = Math.floor(getCurrentBPBal(lToken));  // BINTCONV
				lToken.shared.modules.db.updateLeaderboards( lToken.userData );
				self.sendOverview( lToken, bal, income );
			} );
		}

		function onFoundNone(){
			self.sendOverview( lToken, bal, income );
		}
		
		lToken.queryUser( lToken.mArgs.userQuery, onFoundOne, onFoundNone, onFoundNone )
		lToken.author = lToken.mentions[0];
	}

	sendOverview( lToken, bal, income ){
		let count = lToken.oFlags.watch || String(Math.floor(income)).length * 3;
		let initialCount = count;
		let lastBal = getCurrentBPBal(lToken);  // BINTCONV
		let newBal = lastBal;
		let initialCmdcount = lToken.userData.cmdcount;
		lToken.send(views.overview(lToken, bal, income, count, initialCount)).then((msg) => {
			lToken.userData.lastbpcheckmsgid = msg.id;
			if (income.lt(1)) { return; }
			let sameMsg = msg;
			async function resend() {
				if (count > 0) { count--; } else { return; }
				let deltaCmdcount = lToken.userData.cmdcount-initialCmdcount;
				setTimeout(() => {
					lastBal = newBal;
					newBal = getCurrentBPBal(lToken);  // BINTCONV
					let currentIncome = calcIncome(lToken);
					if (sameMsg.id != lToken.userData.lastbpcheckmsgid) {
						msg.delete();
						return;
					}
					msg.edit(
						views.overview(lToken, newBal, currentIncome, count, initialCount)
					).then((n) => {
						sameMsg = n;
						// Only resend if the user can still see the overview
						if(deltaCmdcount < 4){
							resend();
						}
					}).catch((e)=>{
						throw e;
					});
				}, Math.max(2200*Math.max(1,deltaCmdcount-3), 2500**Math.max(1,deltaCmdcount-3) - initialCount * 50));
			}

			
			resend();
		});
	}

	// Display the shop
	execShop(lToken, bal) {
		let view = views.shop;
		function pageThing( hookMsg ){
			// Starting conditions
			lToken.mArgs.page = Math.max(0, lToken.mArgs.page);

			let pageOperators = [];
			if(lToken.mArgs.page > 0){
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_backward, ()=>{

						// Backwards operation
						lToken.mArgs.page=0;

						lToken.send( view( lToken, bal, lToken.mArgs.page ) ).then(pageThing);	
					} )
				)
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_left, ()=>{

						// Backwards operation
						lToken.mArgs.page--;

						lToken.send( view( lToken, bal, lToken.mArgs.page ) ).then(pageThing);	
					} )
				)
			}
			pageOperators.push(
				pages.createPageOperator( emojis.arrow_right,
				()=>{

					// Forewards operation
					lToken.mArgs.page++;

					lToken.send( view( lToken, bal, lToken.mArgs.page ) ).then(pageThing);
				} )
			)

			pageOperators.push(
				pages.createPageOperator( emojis.arrow_forward,
				()=>{

					// Forewards operation
					lToken.mArgs.page=1000;

					lToken.send( view( lToken, bal, lToken.mArgs.page ) ).then(pageThing);
				} )
			)
			
			pages.createPageManager( lToken, hookMsg, pageOperators );
		}

		lToken.send( view( lToken, bal, lToken.mArgs.page ) ).then( pageThing );
		//lToken.send(views.shop(lToken, bal, lToken.mArgs.page));
	}

	// When buying
	execBuy(lToken, bal, income) {
		if (typeof (dataShopCatalogue[lToken.mArgs.itemAlias]) != "undefined") {
			// If the catalogue alias exists
			if (lToken.mArgs.max) {
				lToken.mArgs.amount = calcMax(lToken.mArgs.itemAlias, bal, getAmountOwned(lToken, lToken.mArgs.itemAlias));
				lToken.mArgs.amount = (lToken.mArgs.amount || 1);
			}
			let nextCost = calcNextCost(lToken);
			if (bal.lt( nextCost )) {  // BINTCONV
				// Insufficent funds
				lToken.send(views.insufficient_funds(lToken, bal, nextCost, getItemByAlias(lToken.mArgs.itemAlias)));
			} else {
				// Buy success

				let [item, owned] = confirmBuy(lToken, lToken.mArgs.itemAlias, nextCost);
				let newBal = getCurrentBPBal(lToken); // BINTCONV
				let newIncome = calcIncome(lToken);
				lToken.send(views.buy_success(lToken, newBal, nextCost, income, newIncome, item, owned));
			}
		} else {
			// error catalogue doesn't exist
			lToken.send(views.item_nonexistent(lToken));
		}
	}

	// Remove later
	execGive(lToken, bal) {
		return;
		lToken.send("This command is super broken. Bad math or something. I'll fix once repl stops lagging.\n-naka").then( (msg)=>{
			setTimeout( ()=>{
				msg.delete();
			}, 15000);
		} );
		return;
		let amount = Math.abs( lToken.numbers[0] ) || 1; 
		let to2 = lToken.mentions[0];
		if(lToken.max){
			amount = bal;
		}
		if(new Date().getTime() - ((lToken.userData.lastGive)||1) < 1000 * 60 * 5 ){
			lToken.send( `Nope. Wait ${ parseInt( 60 * 5 - (new Date().getTime() - ((lToken.userData.lastGive)))/1000 )} seconds.` );
			return;
		}
		if( !amount || !to2 ){
			lToken.send( views.give_argm( lToken ) );
			return;
		}
		if( bal >= amount ){
			lToken.mentions.map( (to)=>{
				lToken.database.get( to.id, ( toUD )=>{
					let fromUD = lToken.userData;
					let a = amount;
					if(amount<toUD.bpbal){
						a = toUD.bpbal;
					}
					bpUtils.transferBP( fromUD, toUD, a );
					// Give success layout goes nHere
					lToken.shared.modules.db.updateLeaderboards( fromUD );
					lToken.shared.modules.db.updateLeaderboards( toUD );
					
					lToken.userData.lastGive = new Date().getTime();
				})
			})
			lToken.send( views.give_success( lToken, amount ) );
		}
	}

	execLeaderboards( lToken ) {
		let globals = lToken.shared.modules.db.global;
		if(lToken.numbers[0]){
			let view = views.lb_all;
			function pageThing( hookMsg ){
				// Starting conditions
				lToken.numbers[0] = Math.max(0, lToken.numbers[0]);

				let pageOperators = [];
				if(lToken.numbers[0] > 0){
					pageOperators.push(
						pages.createPageOperator( emojis.arrow_backward, ()=>{

							// Backwards operation
							lToken.numbers[0]=0;

							lToken.send( view( lToken, globals, lToken.numbers[0] ) ).then(pageThing);	
						} )
					)
					pageOperators.push(
						pages.createPageOperator( emojis.arrow_left, ()=>{

							// Backwards operation
							lToken.numbers[0]-=2;

							lToken.send( view( lToken, globals, lToken.numbers[0] ) ).then(pageThing);	
						} )
					)
				}
				pageOperators.push(
					pages.createPageOperator( emojis.arrow_right,
					()=>{

						// Forewards operation
						lToken.numbers[0]+=2;

						lToken.send( view( lToken, globals, lToken.numbers[0] ) ).then(pageThing);
					} )
				)

				pageOperators.push(
					pages.createPageOperator( emojis.arrow_forward,
					()=>{

						// Forewards operation
						lToken.numbers[0]=1000;

						lToken.send( view( lToken, globals, lToken.numbers[0] ) ).then(pageThing);
					} )
				)
				
				pages.createPageManager( lToken, hookMsg, pageOperators );
			}

			lToken.send( view( lToken, globals, lToken.numbers[0] ) ).then( pageThing );
			
			//lToken.send(views.lb_all(lToken, globals, lToken.numbers[0]));
		}else{
			lToken.send(views.leaderboards(lToken, globals));
		}
		
	}

	async execute(lToken) {
		let income = calcIncome(lToken);
		let bal = getCurrentBPBal(lToken);  // BINTCONV
		let type = lToken.mArgs.type;
		lToken.shared.modules.db.updateLeaderboards( lToken.userData );
		if (type == "overview") {
			this.execOverview(lToken, bal, income);
		} else if (type == "shop") {
			this.execShop(lToken, bal);
		} else if (type == "buy") {
			this.execBuy(lToken, bal, income);
		} else if (type == "give") {
			this.execGive(lToken, bal, income);
		} else if (type=="leaderboards"){
			this.execLeaderboards( lToken );
		}else if (type=="gens"){
			this.execGens( lToken );
		}
		console.log(lToken.mArgs);
		lToken.shared.modules.db.updateLeaderboards( lToken.userData );
	}
}

module.exports = new CommandBlobPoints();