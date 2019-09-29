const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function( Chicken, page, userData, numberOfItems, itemsPerPage, numberOfPages, filter ){
	userData = userData || Chicken.userData;
	let embed = {
		"embed":{
			"title":`${ufmt.name( userData )}'s inventory`,
			"description":"",
			"footer":{text:`Page ${(page+1)}/${numberOfPages} - Showing ${itemsPerPage} items.${Chicken.keyPairs.filter?` Filtering for "${Chicken.keyPairs.filter}"`:''}`}
		}
	};
	//console.log(page);
	let formattedInventory = ufmt.inventory( userData.items, itemsPerPage, page, filter );
	if(!formattedInventory){ 
		embed = "You have no items in your inventory.";
		return embed;
	}
	//console.log(formattedInventory);
	embed.embed.description = formattedInventory;
	return embed;
};