let Item = require("../class/item");
const ufmt = require("../utils/fmt.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
var bpUtils = require("../utils/bp");

class ItemBPTusDeletus extends Item {
	constructor() {
		super();
		this.name = "BPtus Deletus"; // Required
		this.accessor = "bptus_deletus"; // Virtural

		this.consumable = true;
		this.value = 1;
		this.rank = 10;
		this.meta = {};

		this.icon = "https://tenor.com/view/shaggy-scooby-doo-meme-memes-gif-13387002";
		this.emoji = "<:proletariat:642819804541222912>";
		this.isSaleRestricted = false;
	}

	use(Chicken, itemData) {
		let url = "https://tenor.com/view/shaggy-scooby-doo-meme-memes-gif-13387002";
		let msg = Item.fmtUseMsg(`BP-TUS DELETUS`,['BPTUSDELETUS','BPTUSDELETUS','BPTUSDELETUS','BPTUSDELETUS','BPTUSDELETUS'])
		msg.embed.image = {url:url}
		Chicken.userData.bpbal = "0";
		Chicken.userData.bpps = "0";
		Chicken.send(msg);
	}

	desc(Chicken, itemData) {
		return ufmt.itemDesc([
			`Delet all ur bp lol`
		]);
	}
}

module.exports = new ItemBPTusDeletus();