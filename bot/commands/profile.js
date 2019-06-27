const Command = require("../class/command");
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
		['profile', '< name search | @user | @discordID >', 'View your game profile!']
	];/*[["command", "< parameters >", "desc"]];*/ }
	get helpGroup(){ return "Profile"; }
	get helpName(){ return "Profile"; }
	get helpPage(){ return 2; }
	modifyArgs( args ){ return args; }
	async execute( Chicken ){
		if(Chicken.mentions[0]){
			Chicken.database.get( String( Chicken.mentions[0].id ), ( userData )=>{
				Chicken.shared.modules.db.updateLeaderboards( userData );
				Chicken.send( views.overview(Chicken, Chicken.mentions[0], userData) );
			});
		}else{
			if( Chicken.args[0] ){
				// Query users
				let userQuery = Chicken.args.join(" ");
				let searchStatus = Chicken.queryUser( userQuery, ( snowflake )=>{
					Chicken.database.get( snowflake, ( userData )=>{
						Chicken.shared.modules.db.updateLeaderboards( userData );
						Chicken.send( views.overview(Chicken, Chicken.mentions[0], userData) );
					});
				}, ( results )=>{
					Chicken.send( views.found(Chicken, results) );
				}, ()=>{} );

				// If the search succeeds, theres no need to continue
				if( searchStatus ){ return; }

				/*
				let results = Object.values( Chicken.database.global.leaderboards ).filter((ldata)=>{
					return ldata.name.toLowerCase().includes( .toLowerCase() );
				});
				
				// If there is only one query result...
				if(results.length==1){
					let snowflake = results[0].id;
					Chicken.database.get( snowflake, ( userData )=>{
						Chicken.send( views.overview(Chicken, Chicken.mentions[0], userData) );
						Chicken.shared.modules.db.updateLeaderboards( userData );
					});
					return;
				}else if(results.length){
					// If there are multiple query results
					Chicken.send( views.found(Chicken, results) );
					return;
				}
				*/
			}
			Chicken.shared.modules.db.updateLeaderboards( Chicken.userData );
			// By default, send the user's own profile
			Chicken.send( views.overview(Chicken, Chicken.author) );
		}
		
	}
}

module.exports = new CommandTemplate();