const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken){
	let itemData = Chicken.mArgs.item;
	let message = {
		embed:{
			title:"Please hold...",
			description:"I am creating your market listing..."
		}
	}
	return message;
}