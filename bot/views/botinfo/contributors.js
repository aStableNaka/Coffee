const ufmt = require("../../utils/fmt.js");

module.exports = function( Chicken ){
	return {
		embed:{
			title:"Credits/Contributors",
			fields:[
				{
					"name": "Author",
					"value": `${ufmt.block("Naka")}\n${ufmt.join([
						ufmt.denote('Repl.it','<https://repl.it/@DrankArizonaIce>'),
						ufmt.denote('Github','<https://github.com/aStableNaka>')
					])}`
				},
				{
					"name":"Contributors",
					"value":ufmt.join([
						`${ufmt.block("Kpostal")} [ Database ]\n${ufmt.denote('Repl.it','<https://repl.it/@kpostal10>')}`,
						`${ufmt.block("A5Rocks")} [ Lead Wiki Writer ]\n${ufmt.denote('Repl.it','<https://repl.it/@a5rocks>')}\n${ufmt.denote('Github','<https://github.com/A5rocks>')}`,
						`${ufmt.block("[Insert Username Here]")} [ Wiki Writer ]\n${ufmt.denote('Github','<https://github.com/AmbiguousUsername>')}`,
						`${ufmt.block("HarditS")} [ Beta Tester ]\nIn memory of our first beta tester.`
					],"\n\n")
				},
				{
					"name": "System Info",
					"value": `< NodeJS/Express >\n< Mongo/Mongoose >`
				}
			]
		}
	}
}