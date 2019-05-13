const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
module.exports = function( lToken, itemsFound ){
	let embed = {
		"embed": {
			"title": `I found multiple items with the term ${ufmt.block(lToken.mArgs.itemAccessor)}`,
			"description": `${itemsFound.join("\n")}`,
			"color": 0x666666
		}
	}
	return embed;
}
