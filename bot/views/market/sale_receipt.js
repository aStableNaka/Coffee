const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken){
	let itemData = Chicken.mArgs.item;
	let message = {
		embed:{
			title:"Sale Recept",
			description:ufmt.join([
				ufmt.denote('Item', ufmt.item(itemData)),
				ufmt.denote('Price', `${Chicken.mArgs.price?ufmt.currency(Chicken.mArgs.price, Chicken.guild.me.missingPermissions(["USE_EXTERNAL_EMOJIS"])[0]):'Undecided'}`)
			])
		}
	}
	return message;
}