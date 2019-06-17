let ufmt = require("../../utils/fmt");
module.exports = function(lToken, found){
	let list = found.sort( (a,b)=>{
		return a.rank - b.rank;
	} ).slice(0,25);

	let desc = `${ufmt.block('@discordID')} ${ufmt.block('Name')}, ${ufmt.block('Rank')}\n${
		list.map((ldata)=>{
			return `${ufmt.block( `@${ldata.id}`, "***`" )} ${ufmt.block( ldata.name )}, Rank ${ufmt.block(ldata.rank+1)}`
		}).join("\n")
	}`;

	let embed = {
		embed:{
			title:`Here are the users I found matching ${ufmt.block(lToken.args.join(" "))}`,
			description:desc,
			footer:{
				text:"Tip: Use '~prof @discordID' to view a specific profile."
			}
		}
	}
	return embed;
}