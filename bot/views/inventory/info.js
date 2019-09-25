const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const Item = require("../../class/item.js");
module.exports = function( Chicken, itemObject='', itemData='' ){
	let itemRank = itemObject.getUniqueRank( itemData );
	let message = {
		"embed": {
			"title": ufmt.block( Item.ranks[itemRank] ) +' '+ ufmt.itemNameNoBlock(itemData.name || itemObject.name),
			"description": itemObject.desc( Chicken, itemData ),
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
	if(Object.keys(itemObject.recipies)[0]){
		message.embed.fields = message.embed.fields||[];
		message.embed.fields.push({
			"name":"***Crafting Recipies***",
			"value":ufmt.join(Object.keys(itemObject.recipies).map(( recipieName )=>{
				let recipie = itemObject.recipies[recipieName];
				return `> ${ufmt.itemName(recipieName, 1, "***")} \n> - ${ufmt.join(recipie.ingredients.map((ingredient)=>{
					return ufmt.itemName( ingredient.key, ingredient.amount);
				}),'\n> - ')}`;
			}),'\n\n')
		});
	}
	return message;
}
