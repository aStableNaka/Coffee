module.exports = function( Chicken ){
	let embed = {
		embed:{
			title:"Hey! You've been blacklisted! Congrats! :)",
			description: `**Reason**: ${Chicken.userData.blReason}\n**Evidence**: ${Chicken.userData.blEvidenceURL}`,
			footer:{
				text:"Do you believe this was a mistake? You can appeal if you can provide sufficient evidence against this claim. DM the bot owner for more details."
			}
		}
	}
	return embed;
}