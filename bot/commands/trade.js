const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');

const views = loader("./bot/views/prestige", "./views/prestige");

const trades = {};

/**
 * States: offer, recieve
 * @param {*} lToken 
 * @param {*} state 
 */
function promptTrade( lToken ){
	
	
	lToken.prompt("What is your offer?", ( lToken )=>{
		console.log(lToken);
	});
	
	function doOffer(){
		lToken.prompt
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
	modifyArgs(args, lToken) {
		let mArgs = { 
			valid: false,
			offer:[],
			want:[]

		};
		let tradeString = args.split(' ').slice(1).join(' ').join(" ").toLowerCase();
		let sections = tradeString.split(" for ");
		let reciever = lToken.mentions[0];

		// if the tradestring is invalid or the reciever isn't specified
		if(sections.length!=2 || !reciever){return mArgs;}

		sections.map( ( sectionString, i )=>{
			const mapping = ['offer', 'want'];
			mArgs[mapping[i]] = sectionString.split(", ");
		});

		return mArgs;
	}
	async execute(lToken) {
		if(lToken.mentions[0]){
			let tradeDetails = {
				from: lToken.userData.id,
				to: lToken.mentions[0],
				offer: {},  // Inventory
				want: {} // Inventory
			};
			console.log(lToken.mArgs);
			trades[lToken.userData.id] = tradeDetails;

			
		}
	}
}

module.exports = new CommandPrestige();