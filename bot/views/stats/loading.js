const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken){
	let message = {
		embed:{
			title:`Please wait`,
			description:"I am retrieving the data..."
		}
	};
	return message;
}