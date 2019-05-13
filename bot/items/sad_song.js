let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");

class ItemSadSong extends Item{
	constructor(){
		super();
		this.name = "Sad Song"; // Required
		this.accessor = "sad_song"; // Virtural

		this.consumable = true;
		this.value = 0;
		this.rank = 3;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";

		this.effect = "Your next [ ***3*** ] mines will produce [ ***60%*** ] more profit.";

		//this.isDroppedByLunchbox = true;
		this.isDroppedByLootbox = false;
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.mineboost = 60; // Percent
		lToken.userData.mineboostcharge = 3;
		lToken.userData.mineboostsource = this.name;
		lToken.send(`You've eaten an apple!\nEffect: ${this.effect}`)
	}

	desc( lToken, itemData ){
		return `*"This item should not exist. Use it if you have it."*\nType: [ ***Mining boost*** ]\nUsage: ${this.effect}\n*(Using this will override previous mining boosts)*`;
	}
}

module.exports = new ItemSadSong();