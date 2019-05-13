module.exports = function( lToken ){
	return {
		"embed": {
			"title": "\"Beep Boop! Eval Success!\"",
			"description": "```" + lToken.mArgs + "```",
			"color": 0xfec31b,
			"author":{
				"name":"Coffee",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			},
			"fields": [
				{
					"name": "name",
					"value": "value"
				}
			]
		}
	}
}
