/**
 * Invoked when the user tries to craft something without
 * sufficient ingredients
 */

 const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const recipes = itemUtils.craftingRecipes;

module.exports = function( Chicken, amount, itemAccessor, ingredientsNeeded ){
	  let desc = ufmt.join([
			`You don't have enough ingredients to craft ${ufmt.block(itemAccessor)} x${amount}!\n`,
			`You need:`,
			...ingredientsNeeded.map( (ingredient)=>{
				  return `${ufmt.block(ingredient.key)} x${ingredient.amount}`;
			})
	  ]);
	  
	  const payload = {
		"embed": {
			"title": "You're missing a few items...",
			"description": desc,
			"color": 0xff6666
			
		}
	  }
	  
	  return payload;
}