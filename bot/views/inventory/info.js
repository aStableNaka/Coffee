const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const Item = require("../../class/item.js");
module.exports = function( Chicken, itemObject='', itemData='' ){
	let itemRank = itemObject.getUniqueRank( itemData );
	let skin = itemObject.skin? itemObject.skin(itemData) : null;
	let message = {
		"embed": {
			"title": ufmt.block( Item.ranks[itemRank] ) +' '+ ufmt.itemNameNoBlock(itemData.name || itemObject.name),
			"description": itemObject.desc( Chicken, itemData ),
			"color": skin?skin.color:Item.rankColors[itemRank],
			"author":{
				"name":"Item Info",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			},
			"thumbnail":{
				"url":skin ? skin.image : itemObject.icon
			}
		}
	}
	if(skin && !skin.default){
		message.embed.image = {
			url:skin.imageHR || skin.image
		}
		message.embed.footer = {
			icon_url:skin.image,
			text:`${ufmt.block(skin.name, '')} "${skin.description}"`
		}
	}
	if(Object.keys(itemObject.recipes)[0]){
		function getAmountAvailable( recipieName ){
			let recipie = itemObject.recipes[recipieName];
			return recipie.ingredients.map( ( ingredient )=>{
				let ownedItem = Chicken.userData.items[ingredient.key] || {amount:0}
				return Math.floor( ownedItem.amount / ingredient.amount );
			}).reduce( (a,b)=>{return a < b ? a : b;} );
		}
		message.embed.fields = message.embed.fields||[];
		message.embed.fields.push({
			"name":"***Crafting recipes***",
			"value":ufmt.join(Object.keys(itemObject.recipes).map(( recipieName )=>{
				let recipie = itemObject.recipes[recipieName];
				return `${ufmt.itemName(recipieName, recipie.amount||1, "***")} ( *x${getAmountAvailable( recipieName )} Available* )\n> - ${ufmt.join(recipie.ingredients.map((ingredient)=>{
					return ufmt.itemName( ingredient.key, `**${ingredient.amount}**/${(Chicken.userData.items[ingredient.key]||{amount:0}).amount}`);
				}),'\n> - ')}`;
			}),'\n')
		});
	}
	return message;
}
