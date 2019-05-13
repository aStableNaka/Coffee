const itemUtils = require("../../utils/item.js");
module.exports = function( lToken ){
	let embed = {
		"embed": {
			"title": "Item not found",
			"description": `The item "${lToken.mArgs.itemAccessor}" doesn't exist!`,
			"color": 0xff6666,
			"author":{
				"name":"Inventory",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			}
		}
	}
	return embed;
}
