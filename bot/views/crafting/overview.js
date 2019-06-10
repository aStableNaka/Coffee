/**
 * Displays available crafting options
 * - Page support
 * - Only display what is available
 */

const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
const recipies = itemUtils.craftingRecipies;

module.exports = function( lToken, availbleCraftingOptions ){
      const ingSep = `\n${ufmt.embedWS.multiply(6)}`;
      let desc = ufmt.join([
            '\n',
            ...availbleCraftingOptions.map( ( ingredientKey )=>{
                  return `${ufmt.block(ingredientKey)} needs${ingSep}${ recipies[ingredientKey].ingredients.map(( ingredient )=>{
                        return `${ufmt.block(ingredient.key)} x${ingredient.amount}`;
                  }).join(ingSep)}`;
            })
      ], '\n\n');
      
      const payload = {
		"embed": {
			"title": `Here's a list of your crafting options, ${ ufmt.name( lToken.userData )}`,
			"description": desc,
                  "color": 0x66ff66
		}
      }
      
      return payload;
}