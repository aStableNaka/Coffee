const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
module.exports = function( lToken, amount = 1 ){
	let embed = {
		"embed": {
			"title": "You don't own this item!",
			"description": `You don't own ${ufmt.block( lToken.mArgs.itemAccessor )} x${amount}!`,
			"color": 0xff6666,
			"author":{
				"name":"Inventory",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			}
		}
	}
	return embed;
}
