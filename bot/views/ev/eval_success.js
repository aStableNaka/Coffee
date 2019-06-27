module.exports = function( Chicken, result ){
	return {
		"embed": {
			"title": "\"Beep Boop! Eval Success!\"",
			"description": "```" + Chicken.mArgs + "```",
			"color": 0x66ff66,
			"author":{
				"name":"Coffee Eval",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			},
			"fields": [
				{
					"name": "result",
					"value": String( result )
				}
			]
		}
	}
}
