module.exports = function( lToken ){
	return {
		"embed": {
			"title": "\"Whoops! You didn't add enough args!\"",
			"description": `This command expected ***${lToken.eArgsLen}*** but you only gave me ${lToken.args.length}`,
			"color": 0xff0000,
			"author":{
				"name":"Coffee",
				"icon_url": "https://i.imgur.com/hrESbAW.png"
			},
			"footer": {
				"icon_url": "https://i.imgur.com/ttHY5Ki.png",
				"text": "Need help? Type \"~help <commandname>\" :)"
			},
		}
	}
}
