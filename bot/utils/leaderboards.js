/*
	To find the rank of player (p), query {bpbal:{$gt:p.bpbal}}
	Edit: This will not work
*/

/*
	Given a ranking model like this,
	here is a table of what a value/non-value
	in each attribute means:

	rank:{
		head: "987213981748297"
		tail: "",
		pivot:80,
		cache: 0,
		needsUpdate: true,
		seasons:{}
	}

		| pA-f		| pA-t 		|
	pB-f	| Unranked		| Last Place	|
	pB-t	| First Place	| Ranked

	Terms:
		LPP - Last place player
		FPP - First place player

	// 
	// When (Inserting/Updating) a new document (G):
	function update(G):
		if not G.head:
			set G.head to LPP.id;
		Let H =  Documents[G.head] || {bal:null,rank:{head:null}}
		while( G.bal > H.bal ):
			H = Documents[H.head]
		G.head = H.head
		H.head = G.id
		G.tail = H.id
*/

const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

function update(Chicken, userData) {
	const psc = Chicken.database.playerIsCached;
	const cache = Chicken.database.cache;

	Chicken.database.api.wrapper43('users', (collection) => {
		function thirtyEight(tailUser) {
			collection.findOne({ id: { $eq: userData.rank.head } }, (abUserData) => {
				// perform operations on cached data if exists
				if (psc(abUserData.id)) {
					abUserData = cache[abUserData.id];
				}
				let userBalGreater = new BigInt(userData.bpbal).gt(abUserData)
				if (userBalGreater) {
					userData.rank.head = abUserData.id;
					thirtyEight(abUserData);
					// TODO account for pivot shifts
				} else {
					userData.rank.head = abUserData.id;
					userData.rank.tail = tailUser.id;
					if (tailUser.pivot) {
						userData.rank.pivot = tailUser.rank.pivot;
					}
					// Before updating, check if cached. If cached, don't bother updating
					function fiftySeven(ud) {
						ud.rank.head = userData.id;
						ud.rank.pivot = null;
					}
					fiftySeven(cache[tailUser.id])
					if (!psc(tailUser.id)) {
						// Update the document since tailUser isn't cached
						Chicken.database.update(tailUser.id, tailUser);
					}
				}
			});
		}
		if (!userData.rank.head) {
			collection.findOne({ rank: { tail: { $eq: null } } }, (lppUserData) => {
				userData.rank.head = lppUserData.id;
				thirtyEight();
			});
			return;
		}
		thirtyEight();
	})
}

function getRank(Chicken, userData, callback) {

}
/*
	Only 1 pivot exists
	The pivot is assiged to the first person that reaches rank 80

	Start off with no pivot,
	once there are at least 80 players on the leaderboards, give the last player the pivot
	(delayed leaderboards)

	The iterations will likely be low because people don't often move up the ladder a massive amount.
	As long as there is an insertion point ( the bot's account ) , everything will be good.

	the leaderboards will only show the top 80 players

	Caching
	Caching the leaderboards is possible as long as the pivot exists
*/

module.exports.update = update;