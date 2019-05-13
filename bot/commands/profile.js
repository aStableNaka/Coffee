var Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader( "./bot/views/profile", "./views/profile" );
class CommandTemplate extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return false; }
	get usesDatabase(){ return true; }
	get accessors(){ return ['profile', 'prof', `pick`, `pickaxe`]; }
	get mimics(){ return [/*{name:"buy",cmd:"bp buy"}*/]; }
	get help(){ return 1;/*["A simple command!"];*/ }
	get helpExamples(){ return [
		['profile', '< name search | @user | @discordID >', 'View your game profile!'],
		['pickaxe', '< name search | @user | @discordID >', 'View your pickaxe stats!']
	];/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return "Profile"; }
	get helpName(){ return "Profile"; }
	get helpPage(){ return 2; }
	modifyArgs( args ){ return args; }
	async execute( lToken ){
		if(lToken.mentions[0]){
			lToken.database.get( String( lToken.mentions[0].id ), ( userData )=>{
				lToken.send( views.overview(lToken, lToken.mentions[0], userData) );
			});
		}else{
			if( lToken.args[0] ){
				// Query users
				let userQuery = lToken.args.join(" ");
				let searchStatus = lToken.queryUser( userQuery, ( snowflake )=>{
					lToken.database.get( snowflake, ( userData )=>{
						lToken.send( views.overview(lToken, lToken.mentions[0], userData) );
						lToken.shared.modules.db.updateLeaderboards( userData );
					});
				}, ( results )=>{
					lToken.send( views.found(lToken, results) );
				}, ()=>{} );

				// If the search succeeds, theres no need to continue
				if( searchStatus ){ return; }

				/*
				let results = Object.values( lToken.database.global.leaderboards ).filter((ldata)=>{
					return ldata.name.toLowerCase().includes( .toLowerCase() );
				});
				
				// If there is only one query result...
				if(results.length==1){
					let snowflake = results[0].id;
					lToken.database.get( snowflake, ( userData )=>{
						lToken.send( views.overview(lToken, lToken.mentions[0], userData) );
						lToken.shared.modules.db.updateLeaderboards( userData );
					});
					return;
				}else if(results.length){
					// If there are multiple query results
					lToken.send( views.found(lToken, results) );
					return;
				}
				*/
			}
			lToken.shared.modules.db.updateLeaderboards( lToken.userData );
			// By default, send the user's own profile
			lToken.send( views.overview(lToken, lToken.author) );
		}
		
	}
}

module.exports = new CommandTemplate();