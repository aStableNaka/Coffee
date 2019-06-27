const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function( Chicken, amount = 1 ){
	let embed = {
		"embed": {
			"title": "You don't own this item!",
			"description": `You don't own ${ufmt.block( Chicken.mArgs.itemAccessor )} x${amount}!`,
			"color": 0xff6666,
			"author":{
				"name":"Inventory",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			}
		}
	}
	return embed;
}
