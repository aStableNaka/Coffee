module.exports = function( Chicken, error ){
	return {
		"embed": {
			"title": "\"Beep Boop! Eval Fail!\"",
			"description": "```" + Chicken.mArgs + "```",
			"color": 0xff6666,
			"author":{
				"name":"Coffee Eval",
				"icon_url": "https://i.imgur.com/ZavHtvs.png"
			},
			"fields": [
				{
					"name": `\`${error.message|| "Error OMEGALUL"}\``,
					"value": "```javascript"+(error.stack.slice( 0, 600 ) || "Stacktrace unavailable")+"```"
				}
			]
		}
	}
}