let Item = require("../class/item");
const ufmt = require("../utils/formatting.js");

class ItemMineAlert extends Item{
	constructor(){
		super();
		this.name = "Mine Alert"; // Required
		this.accessor = "mine_alert"; // Virtural

		this.consumable = true;
		this.persistent = true;
		this.value = 0;
		this.rank = 6;
		this.meta = {};

		this.icon = "https://i.imgur.com/fT8lZ9R.png";

		this.effect = "This will alert you when you're ready to mine.";
		this.effect_on = "You will receive a ping when you're ready to mine *if you try mining before your cooldown ends*.";
		this.effect_off = "You will no longer recieve a ping when you're ready to mine.";
	}

	// Virural function
	use( lToken, itemData ){
		lToken.userData.tools.mine_alert = !lToken.userData.tools.mine_alert;
		lToken.send(`*You press the big red button on the [ **Mine Alert** ] machine.*\n*\*Boop!\**\nEffect: ${lToken.userData.tools.mine_alert ? this.effect_on : this.effect_off}`);
	}

	desc( lToken, itemData ){
		return `*"A simple looking machine with a large red button in it's center."*\nType: [ ***Tool*** ]\nUsage: ${this.effect}`;
	}
}

module.exports = new ItemMineAlert();