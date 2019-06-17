const ufmt = require("../../utils/fmt.js");
module.exports = function( lToken, userData ){
	let embed = {
		embed:{
			description:""
		}
	};

	embed.embed.description += Object.keys( userData.bpitems ).map( (itemCode)=>{
		return `${ufmt.block( itemCode )} x${userData.bpitems[itemCode]}`;
	}).join("\n");

	return embed;
}