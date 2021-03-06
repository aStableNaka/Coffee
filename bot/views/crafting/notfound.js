/**
 * Invoked when the user tries to craft something that cannot be crafted
 */

const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const recipes = itemUtils.craftingRecipes;

module.exports = function( Chicken, itemAccessor ){
	  return `"${itemAccessor}" can't be crafted! Use \`~craft\` to view all crafting options!`;
}