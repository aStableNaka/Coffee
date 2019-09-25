/**
 * Displays available crafting options
 * - Page support
 * - Only display what is available
 */

const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const recipies = itemUtils.craftingRecipies;

module.exports = function( Chicken, availbleCraftingOptions ){
	  const ingSep = `\n${ufmt.embedWS.multiply(6)}`;
	  let desc = ufmt.join([
			'\n',
			...(Object.values(itemUtils.items).filter((itemObject)=>{return Object.keys(itemObject.recipies).length>0;}).map((x)=>{
				return x.name || x.accessor;
			}).map((name)=>{return ufmt.block(name)}))
	  ], '\n');
	  
	  const message = {
		"embed": {
			"title": `Here's a list of your crafting options, ${ ufmt.name( Chicken.userData )}`,
			"description": desc,
			"color": 0x66ff66,
			"footer":{
				"text":"Type '~ii <itemName>' to view available recipies associated with that item!"
			}
		}
	  }
	  
	  return message;
}