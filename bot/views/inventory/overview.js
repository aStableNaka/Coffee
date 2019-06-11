const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
module.exports = function( lToken, page, userData, numberOfItems, itemsPerPage, numberOfPages, filter ){
	userData = userData || lToken.userData;
	let embed = {
		"embed":{
			"title":`${ufmt.name( userData )}'s inventory`,
			"description":"",
			"footer":{text:`Page ${(page+1)}/${numberOfPages} - Showing ${itemsPerPage} items.${lToken.keyPairs.filter?` Filtering for "${lToken.keyPairs.filter}"`:''}`}
		}
	};
	//console.log(page);
	let formattedInventory = ufmt.inventory( userData.items, itemsPerPage, page, filter );
	if(!formattedInventory){ 
		embed = "You have no items in your inventory.";
		return embed;
	}
	embed.embed.description = formattedInventory;
	return embed;
};