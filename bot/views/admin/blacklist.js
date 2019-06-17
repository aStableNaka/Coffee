module.exports = function( lToken ){
	let embed = {
		embed:{
			title:"Hey! You've been blacklisted! Congrats! :)",
			description: `**Reason**: ${lToken.userData.blReason}\n**Evidence**: ${lToken.userData.blEvidenceURL}`,
			footer:{
				text:"Do you believe this was a mistake? You can appeal if you can provide sufficient evidence against this claim. DM the bot owner for more details."
			}
		}
	}
	return embed;
}