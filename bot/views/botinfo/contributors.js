const ufmt = require("../../utils/formatting.js");

module.exports = function( lToken ){
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
                        `${ufmt.block("HarditS")} [ Beta Tester ] In memory of our first beta tester.`
                    ])
                },
                {
					"name": "System Info",
					"value": `< NodeJS/Express >\n< Mongo/Mongoose >`
				}
            ]
        }
    }
}