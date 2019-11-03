const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/crafting", "./views/crafting");
const locale = require("../data/EN_US");
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/fmt.js");
const recipes = itemUtils.craftingRecipes;

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
	async execute(Chicken) {
		function searchForAvailableCraftingOptions( userData ){
			return Object.keys( recipes );
			let availableOptions = Object.keys( recipes ).filter(( product )=>{
				let ingredients = recipes[product].ingredients;
				let available = ingredients.map( ( ingredientData )=>{
					return itemUtils.userHasItem( userData, ingredientData.key, ingredientData.amount ) | 0;
				}).reduce((p, t)=>{return p+t;}) == ingredients.length;

				return available;
			});
			return availableOptions;
		}

		let availableCraftingOptions = searchForAvailableCraftingOptions( Chicken.userData );
		let itemAccessor = Chicken.words.slice(1).join('_').toLowerCase();
		let amount = Math.abs( Chicken.numbers[0]||1 );
		let userData = Chicken.userData;
		if(itemAccessor){
			let search = [
				...Object.keys(recipes).filter( ( itemName )=>{
					return itemName.includes(itemAccessor);
				})
			];
			if(search[0]){
				if(search.length>1 && !recipes[search[0]]){
					Chicken.send(views.query(Chicken, search));
					return;
				}
				itemAccessor = search[0];
				let recipie = recipes[itemAccessor];
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
						itemUtils.transferItemToInventory( userData.items, ingredientsUsedInventory, Chicken.userData.items[ingredient.key], ingredient.amount*amount );
						return {key:ingredient, amount:ingredient.amount*amount}
					});

					//add new item(s) to inventory
					let itemData = recipie.onCraft( Chicken, amount );
					itemUtils.addItemToUserData( userData, itemData );
					Chicken.send( views.success( Chicken, itemData, ingredientsUsedInventory ) );
				}else{
					// do something else if it's negative
					let ingredientsNeeded = recipie.ingredients.filter( (ingredient)=>{
						return !itemUtils.userHasItem( userData, ingredient.key, ingredient.amount*amount );
					}).map( (ingredient)=>{
						return {key:ingredient.key, amount:ingredient.amount*amount-(userData.items[ingredient.key]||{amount:0}).amount}
					});
					Chicken.send( views.insufficient( Chicken, amount, itemAccessor, ingredientsNeeded ) );
				}
			}else{
				Chicken.send( views.notfound( Chicken, itemAccessor ) );
			}
		}else{
			Chicken.send( views.overview(Chicken, availableCraftingOptions ) );
		}
	}
}

module.exports = new CommandCraft();