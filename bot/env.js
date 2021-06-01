const fs = require("fs");

/**
 * Generates env file. You have to fill in the details.
 * 
 * Now you may be wondering, why the hell would i use JSON for the env file structure
 * instead of standard env structure
 * 
 * The answer is pretty simple, really
 * 
 * json is more organized but also i'm pretty stupid lol
 */
function checkEnv(){
	if(!fs.existsSync("./.env.json")){
		// #IMPORTANT
		// DO NOT replace any values in this file.
		// This will generate a new hidden file called ./.env.json
		// Edit the values in the env file ONLY.
		const structure = {
			"discord":{
				// Ger this from the 
				"token":"INSERT_DISCORD_TOKEN_HERE",
				// Pre generated permission integers
				"permissionInts":{
					"basic":"3263552", // Includes functionality to manage role colors
					"elevated":"70634561", // For testing
					"moderator":"267775431", // For more testing
					"admin":"8", // For even more testing
					"default": "0" // for public servers
				},
				"inviteLinks":{
					"default":"PUT_INVITE_LINK_HERE",
					"example":"https://discordapp.com/api/oauth2/authorize?client_id=350823530377773057&permissions=0&scope=bot",
				}
			},
			"defaults":{
				"guild":{
					// Change this if you want
					"prefix":"~"
				}
			},
			"bot":{
				// A list of admins. DiscordUserSnowflake: true
				// THIS IS AN EXAMPLE. REMOVE THESE TWO AND REPLACE WITH YOUR OWN
				// DISCORD SNOWFLAKE
				"admins":{
					"133169572923703296":false,
					"130548661892546560":false
				},

				// A list of users able to use commands that have the beta flag
				"whitelist":[
					// 531498187249287178
				]
			},

			// Mongo Atlas Link
			"db_mongo":{
				"link":"PUT_MONGO_ATLAS_LINK_HERE"
			}
		}
		fs.writeFileSync("./.env.json", JSON.stringify(structure, null, "\t"));
	}
	
	// check the integrity of the env configuration
	const config = JSON.parse( fs.readFileSync("./.env.json").toString() );
	if(config.discord.token == "INSERT_DISCORD_TOKEN_HERE"){
		console.error("[ CONFIG ERROR ] discord token not added, please add a discord token to .env.json")
		process.exit(0);
	}
	if(config.db_mongo.link=="PUT_MONGO_ATLAS_LINK_HERE"){
		console.error("[ CONFIG ERROR ] mongo atlas link not added, please add a mongo atlas link to .env.json")
		process.exit(0);
	}
}

checkEnv();


module.exports = (function(){
	return JSON.parse( fs.readFileSync("./.env.json").toString() );
})()