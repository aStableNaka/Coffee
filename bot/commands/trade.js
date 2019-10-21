const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

const views = loader("./bot/views/prestige", "./views/prestige");

const trades = {};

/**
 * States: offer, recieve
 * @param {*} Chicken 
 * @param {*} state 
 */
function promptTrade(Chicken) {


	Chicken.prompt("What is your offer?", (Chicken) => {
		console.log(Chicken);
	});

	function doOffer() {
		Chicken.prompt
	}
}

class CommandPrestige extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return true;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ["trade"];
	}
	get mimics() {
		return [];
	}
	get help() {
		return null; /*["A simple command!"];*/
	}
	get helpExamples() {
		return null; /*[["command", "< parameters >", "desc"]];*/
	}
	get helpGroup() {
		return null;
	}
	get helpName() {
		return null;
	}
	modifyArgs(args, Chicken) {
		let mArgs = {
			valid: false,
			offer: [],
			want: []

		};
		let tradeString = args.split(' ').slice(1).join(' ').join(" ").toLowerCase();
		let sections = tradeString.split(" for ");
		let reciever = Chicken.mentions[0];

		// if the tradestring is invalid or the reciever isn't specified
		if (sections.length != 2 || !reciever) {
			return mArgs;
		}

		sections.map((sectionString, i) => {
			const mapping = ['offer', 'want'];
			mArgs[mapping[i]] = sectionString.split(", ");
		});

		return mArgs;
	}
	async execute(Chicken) {
		if (Chicken.mentions[0]) {
			let tradeDetails = {
				from: Chicken.userData.id,
				to: Chicken.mentions[0],
				offer: {}, // Inventory
				want: {} // Inventory
			};
			console.log(Chicken.mArgs);
			trades[Chicken.userData.id] = tradeDetails;


		}
	}
}

module.exports = new CommandPrestige();