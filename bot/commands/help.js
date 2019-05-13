var Command = require("../class/command");
const env = require("../env");
const OLDMESSAGE = "**~bp** <buy | shop>\n**~shop** <page>\n**~mine**\n**~buy** <itemCode> <amount | max>";
const loader = require("../loader");
const views = loader( "./bot/views/helps", "./views/helps" );

const emojis = require("../utils/emojis");
const page = require("../utils/page");

class CommandHelp extends Command{
	constructor(){
		super();
	}

	get accessors(){ return ['help']; }

	modifyArgs( args ){
		return { cmd: args[0], group: args[1]=='group'};
	}
	async execute( lToken ){
		if(!lToken.mArgs.group){

			// Dynamic view
			let view = views.help;
			function pageThing( hookMsg ){
				// Starting conditions
				lToken.numbers[0] = Math.min(2, Math.max(0, lToken.numbers[0] || 1));

				let pageOperators = [];
					if(lToken.numbers[0] > 1){
						pageOperators.push(
							page.createPageOperator( emojis.arrow_left, ()=>{

								// Backwards operation
								lToken.numbers[0]--;

								lToken.send( view( lToken ) ).then(pageThing);	
							} )
						)
					}
					if(lToken.numbers[0]<2){
						pageOperators.push(
							page.createPageOperator( emojis.arrow_right,
							()=>{

								// Forewards operation
								lToken.numbers[0]++;

								lToken.send( view( lToken ) ).then(pageThing);
							} )
						)
					}
					
				page.createPageManager( lToken, hookMsg, pageOperators );
			}

			lToken.send( view( lToken ) ).then( pageThing );
		}
	}
}

module.exports = new CommandHelp();