module.exports = function (userID) {
	return {
		"id": String(userID),
		"userID": String(userID),
		"version": 0,
		"bpbal": 10,
		"bptotal": 10,
		"bpps": 0,

		//"bibpbal":"0",
		//"bibptotal":"0",
		//"bibps":"0",

		"mineboost": 0,
		"mineboostcharge": 0,
		"mineboostsource": "none",

		"prestige": 0,
		"prestige_last": 0,
		"prestige_bonus": "1",
		"permissions": 0,
		"reset_0": false,
		"tester": true, // Chance once the reset happens
		"lastbpcheckmsgid": 0,
		"lastmine": 0,
		"msg_m": 0,
		"pickaxe_name": "Shifty Pickaxe",
		"pickaxe_exp": 0,
		"pickaxe_time": 5,
		"pickaxe_multiplier": 0,
		"pickaxe_perks": [],
		"pickaxe_accessor": "shifty_pickaxe",
		"pickaxe_creator": "Grandmaster Blacksmith",
		"pickaxe_lDescIndex": 0,
		"daily": 0,
		"cmdcount": 0,
		"fmt_pref": 0, // 0 Default, 1 Colored, 2 Mobile

		"lastbpcheck": new Date().getTime(),
		"firstuse": new Date().getTime(),
		"lastuse": new Date().getTime(),
		"nickname": null,
		"name": null,
		"tags": [],
		"bpitems": {},
		"bpmultipliers": {},
		"items": {},
		"auctions": {},
		"bpboosters": {},
		"modifiers": [],
		"lastaccess": new Date().getTime(),
		"isNew": true,
		"ismobile": false,
		"attributes": {
			"luck": 1,
			"sneak": 1
		},
		"guilds": [],
		"tools": {},
		"a": [0, 0, 0, 0, 0, 0, 0, 0],
		"monitored": false,
		"monitor": [],
		"blacklisted": false,
		"blReason": "",
		"blEvidenceURL": ""
	}
}