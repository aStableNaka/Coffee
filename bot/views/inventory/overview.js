const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
module.exports = function( lToken, page, userData ){
	userData = userData || lToken.userData;
	let embed = {
		"embed":{
			"title":`${ufmt.name( userData )}'s inventory`,
			"description":""
		}
	};
	let itemAccessors = Object.keys( userData.items );
	let listOfTruths = itemAccessors.filter((itemAccessor)=>{ // Only show items that aren't amount 0
		return userData.items[itemAccessor].amount > 0;
	}).slice(0, 15);

	//embed+='```';
	if(listOfTruths.length == 0){
		embed = "You have no items in your inventory.";
		return embed;
	}

	// calculate the padding and such
	let itemNamePaddingLength = listOfTruths.map(x=>x.length).reduce( (acc, val)=>{ return Math.max(acc, val); } )+2;
	let itemAmountPaddingLength = listOfTruths.map((itemAccessor)=>{
		let itemData = userData.items[itemAccessor];
		return String( itemData.amount ).length;
	}).reduce( (acc, val)=>{ return Math.max(acc, val); } )+2;

	// Format the itemData into list view
	listOfTruths.map( ( itemAccessor )=>{
		let itemData = userData.items[itemAccessor];
		let itemObject = itemUtils.getItemObject( itemData );
		// ${ itemObject.consumable? "< usable >" : '' }
		// add back for usable label

		// Add back for rank
		//  (${new Array( itemObject.rank+1 ).fill('⭐').join("")})
		embed.embed.description+=`\n\`${ ufmt.item(itemData, itemData.amount, '', true, itemNamePaddingLength, itemAmountPaddingLength) }\` *${itemUtils.rankNames[ itemObject.getUniqueRank( itemData ) ].toLocaleLowerCase()}*`;
		return true;
	});
	
	return embed;
}
