const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const Item = require("../../class/item.js");
module.exports = function( lToken, itemObject='', itemData='' ){
	let itemRank = itemObject.getUniqueRank( itemData );
	let embed = {
		"embed": {
			"title": ufmt.block( Item.ranks[itemRank] ) +' '+ ufmt.itemNameNoBlock(itemData.name || itemObject.name),
			"description": itemObject.desc( lToken, itemData ),
			"color": Item.rankColors[itemRank],
			"author":{
				"name":"Item Info",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			},
			"thumbnail":{
				"url":itemObject.icon
			}
		}
	}
	return embed;
}
