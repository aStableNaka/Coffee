const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/crafting", "./views/crafting");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/formatting.js");
const recipies = itemUtils.craftingRecipies;

class CommandCraft extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return false;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ['craft'];
	}
	get mimics() {
		return [];
	}
	get help() {
		return 1;
	}
	get helpExamples() {
		return [
			['craft', '', 'View a list of available crafting options!'],
			['craft', '< item name > < amount >', 'craft an item!']
		];
	}
	get helpGroup() {
		return "Crafting";
	}
	get helpName() {
		return "Crafting";
	}
	get helpPage() {
		return 2;
	}
	modifyArgs(args) {
		return args;
	}
	async execute(lToken) {
		function searchForAvailableCraftingOptions( userData ){
			let availableOptions = Object.keys( recipies ).filter(( product )=>{
				let ingredients = recipies[product].ingredients;
				let available = ingredients.map( ( ingredientData )=>{
					return itemUtils.userHasItem( userData, ingredientData.key, ingredientData.amount ) | 0;
				}).reduce((p, t)=>{return p+t;}) == ingredients.length;

				return available;
			});
			return availableOptions;
		}

		let availableCraftingOptions = searchForAvailableCraftingOptions( lToken.userData );
		let itemAccessor = lToken.words.slice(1).join('_').toLowerCase();
		let amount = Math.abs( lToken.numbers[0]||1 );
		let userData = lToken.userData;
		if(itemAccessor){
			if(recipies[itemAccessor]){
				let recipie = recipies[itemAccessor];
				// something here to check if the requested amount is available for crafting
				let hasEnoughIngredients = recipie.ingredients.filter( (ingredient)=>{
					return itemUtils.userHasItem( userData, ingredient.key, ingredient.amount*amount );
				}).length == recipie.ingredients.length;
				if( hasEnoughIngredients ){
					// use said something if it's positive
					// turn ingredient data into ineventory for easier formatting later
					let ingredientsUsedInventory = {};
					
					// Transfers ingredients to throwaway inventory
					recipie.ingredients.map( (ingredient)=>{
						itemUtils.transferItemToInventory( userData.items, ingredientsUsedInventory, lToken.userData.items[ingredient.key], ingredient.amount*amount );
						return {key:ingredient, amount:ingredient.amount*amount}
					});

					//add new item(s) to inventory
					let itemData = recipie.onCraft( lToken, amount );
					itemUtils.addItemToUserData( userData, itemData );
					lToken.send( views.success( lToken, itemData, ingredientsUsedInventory ) );
				}else{
					// do something else if it's negative
					let ingredientsNeeded = recipie.ingredients.filter( (ingredient)=>{
						return !itemUtils.userHasItem( userData, recipie.key, recipie.amount*amount );
					}).map( (ingredient)=>{
						return {key:ingredient.key, amount:ingredient.amount*amount-(userData.items[ingredient.key]||{amount:0}).amount}
					});
					lToken.send( views.insufficient( lToken, amount, itemAccessor, ingredientsNeeded ) );
				}
			}else{
				lToken.send( views.notfound( lToken, itemAccessor ) );
			}
		}else{
			lToken.send( views.overview(lToken, availableCraftingOptions ) );
		}
	}
}

module.exports = new CommandCraft();