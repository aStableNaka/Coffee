/**
 * Displays available crafting options
 * - Page support
 * - Only display what is available
 */

const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
const recipes = itemUtils.craftingRecipes;

module.exports = function( Chicken, n, page ){
	// Gets all available recipes and the amount the user is able to craft
	let availablerecipes = (Object.values(itemUtils.items).filter((itemObject)=>{return Object.keys(itemObject.recipes).length>0;}).map((itemObject)=>{
		const recipes = itemObject.recipes;
		function getAmountAvailable( recipieName ){
			let recipie = recipes[recipieName];
			return recipie.ingredients.map( ( ingredient )=>{
				let ownedItem = Chicken.userData.items[ingredient.key] || {amount:0};
				return Math.floor( ownedItem.amount / ingredient.amount );
			}).reduce( (a,b)=>{return a < b ? a : b;} );
		}
		return Object.keys(recipes).map(( recipieName )=>{
			return {accessor:recipieName, amount:getAmountAvailable(recipieName)};
		});
	})).flat().sort((a,b)=>{return b.amount-a.amount;});
	// TODO change to accomodate pages
	let desc = ufmt.join([
		'\n',
		...availablerecipes.map((craftableItem)=>{return `${craftableItem.amount?'':''}${ufmt.block(craftableItem.accessor, craftableItem.amount?'***':'')} x${ufmt.surround(craftableItem.amount, craftableItem.amount?'***':'')}`;})
	], '\n');
	
	const message = {
		"embed": {
			"title": `Here's a list of your crafting options, ${ ufmt.name( Chicken.userData )}`,
			"description": desc,
			"color": 0xfec31b
		}
	}
	
	return message;
}