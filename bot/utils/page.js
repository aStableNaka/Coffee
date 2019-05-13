function createPageManager( lToken, msg, pageOperators, lifetime=120000 ){
    pageOperators.reverse();
    function doTheThing(){
        if(pageOperators[0]){
            let operator = pageOperators.pop();
            lToken.addReactionHook( msg, operator.emojiName, ()=>{
                operator.callback();
                msg.delete();
            }, lifetime );
            msg.react( operator.emojiName ).then( doTheThing );
        }
    }
    doTheThing();
}

function createPageOperator( emojiName, callback ){
    return {emojiName:emojiName, callback:callback}
}

module.exports.createPageManager = createPageManager;
module.exports.createPageOperator = createPageOperator;