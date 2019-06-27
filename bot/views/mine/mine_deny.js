const ufmt = require("../../utils/fmt.js");
const itemUtils = require("../../utils/item.js");
const pN = ufmt.numPretty;
const BigInt = require("big-integer");

module.exports = function( Chicken, timeSinceLastMine ){
	let embed = {
		"embed": {
			"title": "\"I don't think so!\"",
			"description": `*You're still tired from the last mining session!*\nYou can mine again in [ ***${ Math.max(0,Math.floor((Chicken.userData.pickaxe_time * 60 * 1000 - timeSinceLastMine)/1000)) }*** ] Seconds.`,
			"color": 0xff6666,
			"author":{
				"name":"Mr. M. Iner",
				"icon_url": "https://i.imgur.com/Uuo8HMu.png"
			}
		}
	}

	if(itemUtils.userHasItem(Chicken.userData, "coffee")){
		embed.embed.description+="\n*You have coffee in your inventory. You can use it to skip this cooldown.*";
	}

	if( new BigInt( Chicken.userData.bpbal ).lt( 100000 ) ){
		embed.embed.footer = {
			text:"Tip: Use ~bal to view your BP balance!"
		};
	}

	if( Chicken.userData.tools.mine_alert){
		embed.embed.footer = {
			text:"[ Mine Alert ] is active."
		};
	}

	return embed;
}
