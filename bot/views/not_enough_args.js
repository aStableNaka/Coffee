module.exports = function( Chicken ){
	return {
		"embed": {
			"title": "\"Whoops! You didn't add enough args!\"",
			"description": `This command expected ***${Chicken.eArgsLen}*** but you only gave me ${Chicken.args.length}`,
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
