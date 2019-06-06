const dataShop = require("../data/shop.json");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const itemUtils = require('./item.js');
const dataShopCatalogue = {};
Object.values( dataShop.catalogue ).map( (c, i)=>{ dataShopCatalogue[ c.alias ] = i; } );



Math.logB = function( base, n ){
	return Math.log(n) / Math.log(base);
}

function getItemByAlias( itemAlias ){
	return dataShop.catalogue[ dataShopCatalogue[ itemAlias ] ];
}

// BigInt complete
function addBP( lToken, amount ){
	lToken.userData.bpbal = BigInt( lToken.userData.bpbal ).add( amount );
	lToken.userData.bptotal = BigInt( lToken.userData.bptotal ).add( amount );
}

// BigIntcomplete
function transferBP( fromUD, toUD, amount ){
	fromUD.bpbal = BigInt( fromUD.bpbal ).subtract( amount );
	addBP_UD( toUD, amount );
}

module.exports.transferBP = transferBP;

//BigIntc
function addBP_UD( userData, amount ){
	userData.bpbal = BigInt( BigNum( userData.bpbal ).integerValue().toString() ).add( amount );
	userData.bptotal = BigInt( BigNum( userData.bptotal ).integerValue().toString() ).add( amount );
}

//BigIntc
function confirmBuy( lToken, itemAlias, nextCost ){
	if(typeof( lToken.userData.bpitems[itemAlias] ) == "undefined"){
		lToken.userData.bpitems[itemAlias] = 0; // Will be a number, how many owned
	}
	lToken.userData.bpitems[itemAlias] += lToken.mArgs.amount;
	let item = getItemByAlias( itemAlias );
	lToken.userData.bpbal = BigInt( lToken.userData.bpbal).subtract(nextCost);
	return [item, lToken.userData.bpitems[itemAlias]];
}

//BigIntc
function calcIncome( lToken ){
	return calcIncome_UD(lToken.userData);
}

// Production per single generator, with included level factor
function calcGenProduction_x1( userData, itemAlias ){
	let item = getItemByAlias( itemAlias );
	let levelFactor = calcGenMultiplier( getGenLevel_UD( userData, itemAlias ) );
	let amountOwned = getAmountOwned_UD( userData, itemAlias );
	return BigInt( item.baseIncome ).multiply( levelFactor );
}
module.exports.calcGenProduction_x1 = calcGenProduction_x1;

//BigIntc
function calcIncome_UD( userData ){
	var income = BigInt( 0 );
	Object.keys( userData.bpitems ).map( ( itemAlias )=>{
		let amountOwned = getAmountOwned_UD( userData, itemAlias );
		let production_x1 = calcGenProduction_x1(userData, itemAlias);
		income = income.add( production_x1.multiply( amountOwned ).multiply( userData.bpmultipliers[itemAlias] || 1 ) );
	});
	income = income.add( userData.bpps );
	return income;
}
module.exports.calcIncome_UD = calcIncome_UD;

//BigIntc
function calcCurrentBal( lToken ){
	return calcBal_UD( lToken.userData );
}

//BigIntc
function calcBal_UD( userData ){
	var diff = new Date().getTime() - userData.lastbpcheck;
	addBP_UD( userData, calcIncome_UD( userData ).multiply( Math.floor( diff/1000) ) );
	userData.lastbpcheck = new Date().getTime();
	return userData.bpbal;
}
module.exports.calcBal_UD = calcBal_UD;

function getAmountOwned( lToken, itemAlias ){
	if(typeof( lToken.userData.bpitems[itemAlias] ) == "undefined"){
		lToken.userData.bpitems[itemAlias] = 0;
	}
	return lToken.userData.bpitems[itemAlias];
}

function getAmountOwned_UD( userData, itemAlias ){
	if(typeof( userData.bpitems[itemAlias] ) == "undefined"){
		userData.bpitems[itemAlias] = 0;
	}
	return userData.bpitems[itemAlias];
}
module.exports.getAmountOwned_UD = getAmountOwned_UD;

const levelPerOwned = 80;
function getGenLevel_UD( userData, itemAlias ){
	let owned = getAmountOwned_UD( userData, itemAlias );
	return Math.floor( owned / levelPerOwned );
}
module.exports.getGenLevel_UD = getGenLevel_UD;

function calcGenMultiplier( level ){
	//let item = getItemByAlias( itemAlias );
	return new BigInt(1); //BigInt( 2 ).pow( level );
}
module.exports.calcGenMultiplier = calcGenMultiplier;

function getPersonalMultiplier( lToken, itemAlias ){
	if(typeof( lToken.userData.bpitems[itemAlias] ) == "undefined"){
		lToken.userData.bpmultipliers[itemAlias] = 1;
	}
	return lToken.userData.bpmultipliers[itemAlias];
}

function calcCost( itemAlias, amount, owned ){
	let item = getItemByAlias( itemAlias );
	/*return Math.floor( item.baseCost * (  ( Math.pow(item.baseGrowth, amount ) - 1 ) * Math.pow(item.baseGrowth, owned  )
			/ (item.baseGrowth - 1) ));*/
	let baseCost = item.baseCost;
	return BigInt( BigNum( BigNum( baseCost ).times(  ( (BigNum( item.baseGrowth ).pow( amount ).minus( 1 ) ).times( BigNum( item.baseGrowth ).pow( owned )  ) ).div(item.baseGrowth - 1) )).integerValue().toString());
}

function pickaxeLevelUD( userData ){
	return pickaxeLevelExp( userData.pickaxe_exp );
}

module.exports.pickaxeLevelUD = pickaxeLevelUD;

function pickaxeLevelExp( exp ){
	return Math.max( 1, Math.floor( exp/16 )+1 );
}
module.exports.pickaxeLevelExp = pickaxeLevelExp;

function pickaxeExpProgress( exp ){
	return (exp+1) % 16;
}
module.exports.pickaxeExpProgress = pickaxeExpProgress;

function calcMax( itemAlias, c, owned ){
	let item = getItemByAlias( itemAlias );
	let r = item.baseGrowth;
	let b = item.baseCost;
	let k = owned;
	//return Math.floor( Math.logB( r, ( c * ( r - 1 ) ) / ( b * Math.pow(r,k) ) + 1 ) );
	let out = Math.logB( r, (BigNum( c ).times( r - 1 ).div( BigNum( b ).times( BigNum(r).pow(k) ) ).plus( 1 )).toString());
	//console.log("[Calc Max]", out, itemAlias);
	if(!Number.isFinite(out)){ out = 0; }
	return Math.floor( out );
}


// Calculate the next cost of a lToken
function calcNextCost( lToken ){
	let { itemAlias, amount } = lToken.mArgs;
	return calcCost( itemAlias, amount, getAmountOwned( lToken, itemAlias ) );
}


// Temporary
function getCurrentBPBal( lToken ){
	return calcCurrentBal(lToken);
}

function calcPrestigeGoldReward( userData ){
	return Math.floor((calcBal_UD( userData ).toString().length * 5));
}

function calcPrestigeBonusReward( userData ){
	return new BigInt( new BigNum(( new BigInt( userData.bptotal ).divide( Math.pow(10,(11.4*3))).toString() )).sqrt().integerValue() );
}

function calcPrestigeBoxReward( userData ){
	return Math.floor((calcBal_UD( userData ).toString().length ));
}

function calcPickaxeIncome( userData ){
	let pickaxe = itemUtils.items.pickaxe;
	let itemData = pickaxe.getActivePickaxeItemData( userData );
	let tierModifier = pickaxe.getMultiplier(itemData);
	return BigInt.max( 1, calcIncome_UD(userData) ).multiply(60).multiply( 20 + 10 * pickaxeLevelUD( userData )).multiply(tierModifier);
}

module.exports.calcPickaxeIncome = calcPickaxeIncome;
module.exports.calcPrestigeBoxReward = calcPrestigeBoxReward;
module.exports.calcPrestigeBonusReward = calcPrestigeBonusReward;
module.exports.calcPrestigeGoldReward = calcPrestigeGoldReward;
module.exports.addBP = addBP;
module.exports.addBP_UD = addBP_UD;
module.exports.dataShop = dataShop;
module.exports.dataShopCatalogue = dataShopCatalogue;
module.exports.getItemByAlias = getItemByAlias;
module.exports.confirmBuy = confirmBuy;
module.exports.calcIncome = calcIncome;
module.exports.calcCurrentBal = calcCurrentBal;
module.exports.calcBal_UD = calcBal_UD;
module.exports.getAmountOwned = getAmountOwned;
module.exports.getAmountOwned_UD = getAmountOwned_UD;
module.exports.calcCost = calcCost;
module.exports.calcMax = calcMax;
module.exports.calcNextCost = calcNextCost;
module.exports.getCurrentBPBal = getCurrentBPBal;
module.exports.calcIncome_UD = calcIncome_UD;