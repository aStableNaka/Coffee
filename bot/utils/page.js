var emojis = require("./emojis");

function createPageManager( Chicken, msg, pageOperators, lifetime=120000 ){
	pageOperators.reverse();
	function doTheThing(){
		if(pageOperators[0]){
			let operator = pageOperators.pop();
			Chicken.addReactionHook( msg, operator.emojiName, ()=>{
				operator.callback();
				msg.delete().catch((e)=>{console.log(`[DiscordMessage] [DeleteError] [page@8] ${e}`);});
			}, lifetime );
			msg.react( operator.emojiName ).then( doTheThing );
		}
	}
	doTheThing();
}

function createPageOperator( emojiName, callback ){
	return {emojiName:emojiName, callback:callback}
}

// Super-Simple-Forward-Backward-Pages-Wrapper
// Assumes the view uses Chicken.mArgs.page
function ssfwbwpWrapper( Chicken, view, args, numberOfPages, send ){
	numberOfPages = numberOfPages || Chicken.mArgs.maxPages || 1;
	const pages = module.exports;
	send = send || function(){
		Chicken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, Chicken.mArgs.page||Chicken.numbers[0]-1||0) );
		Chicken.send(view(...args)).then(pageThing);
	}

	function pageThing( hookMsg ){
		// Starting conditions
		let pageOperators = [];
		// In case the view decides it wants to change the max number of pages
		numberOfPages = Chicken.mArgs.maxPages || numberOfPages || 1;
		Chicken.mArgs.page = Math.min(numberOfPages-1, Math.max(0, Chicken.mArgs.page||Chicken.numbers[0]-1||0) );

		if(Chicken.mArgs.page > 0){
			pageOperators.push(
				pages.createPageOperator( emojis.arrow_left, ()=>{
					// Backwards operation
					Chicken.mArgs.page--;
					send();
				} )
			);
		}
		if( Chicken.mArgs.page < numberOfPages-1 ){
			pageOperators.push(
				pages.createPageOperator( emojis.arrow_right,
				()=>{
					// Forewards operation
					Chicken.mArgs.page++;
					send();
				} )
			)
		}
		
		pages.createPageManager( Chicken, hookMsg, pageOperators );
	}
	send.pageThing = pageThing;
	return send;
}

module.exports.ssfwbwpWrapper = ssfwbwpWrapper;
module.exports.createPageManager = createPageManager;
module.exports.createPageOperator = createPageOperator;