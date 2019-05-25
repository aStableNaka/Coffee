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
                    "value":`${ufmt.block("Kpostal")} [ Database ]\n${ufmt.denote('Repl.it','<https://repl.it/@kpostal10>')}`
                },
                {
					"name": "System Info",
					"value": `< NodeJS/Express >\n< Mongo/Mongoose >`
				}
            ]
        }
    }
}