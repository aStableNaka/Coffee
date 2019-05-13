module.exports = function( lToken ){
    return {
        embed:{
            title:"Credits/Contributors",
            fields:[
                {
					"name": "Author",
					"value": `${ufmt.block("Naka")} <https://repl.it/@DrankArizonaIce>`
                },
                {
                    "name":"Contributors",
                    "value":`[ Database ] ${ufmt.block("Kpostal")} <https://repl.it/@kpostal10>`
                },
                {
					"name": "System Info",
					"value": `< NodeJS/Express >\n< Mongo/Mongoose >`
				}
            ]
        }
    }
}