const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function( Chicken, itemsFound ){
	let embed = {
		"embed": {
			"title": `I found multiple items with the term ${ufmt.block(Chicken.mArgs.itemAccessor)}`,
			"description": `${itemsFound.join("\n")}`,
			"color": 0x666666
		}
	}
	return embed;
}
