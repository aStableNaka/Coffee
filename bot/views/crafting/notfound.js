/**
 * Invoked when the user tries to craft something that cannot be crafted
 */

const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/formatting.js");
const recipies = itemUtils.craftingRecipies;

module.exports = function( lToken, itemAccessor ){
      return `"${itemAccessor}" can't be crafted! Use \`~craft\` to view all crafting options!`;
}