const ufmt = require("../bot/utils/fmt");

test("timeLeft function", ()=>{
	expect(ufmt.timeLeft( 1000, 1000, '' )).toBe('[ 0 ] seconds');
	expect(ufmt.timeLeft( 0, 1000, '' )).toBe('[ 1 ] seconds');
	expect(ufmt.timeLeft( 0, 30000, '' )).toBe('[ 30 ] seconds');
	expect(ufmt.timeLeft( 0, 60000, '' )).toBe('[ 60 ] seconds');
	expect(ufmt.timeLeft( 0, 61000, '' )).toBe('[ 1 ] minutes');
	expect(ufmt.timeLeft( 0, 30*60000, '' )).toBe('[ 30 ] minutes');
	expect(ufmt.timeLeft( 0, 61*60000, '' )).toBe('[ 1 ] hours');
});