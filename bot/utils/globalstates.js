const STATE_LOCKED = Symbol("LOCKED");
const STATE_UNLOCKED = Symbol("UNLOCKED");

let lockedState = STATE_UNLOCKED;

/**
 * true = locked
 * false = unlocked
 */
function isBotLocked(){
	return lockedState == STATE_LOCKED;
}

/**
 * lock the bot if the bot is unlocked
 * unlock the bot if the bot is locked
 */
function toggleBotLock(){
	if(lockedState==STATE_UNLOCKED){
		lockedState = STATE_LOCKED;
	} else {
		lockedState = STATE_UNLOCKED;
	}
	return lockedState;
}

function lockBot(){
	lockedState = STATE_LOCKED;
}

function unlockBot(){
	lockedState = STATE_UNLOCKED;
}

module.exports = {
	STATE_LOCKED: STATE_LOCKED,
	STATE_UNLOCKED: STATE_UNLOCKED,
	isBotLocked: isBotLocked,
	toggleBotLock: toggleBotLock,
	lockBot: lockBot,
	unlockBot: unlockBot
}