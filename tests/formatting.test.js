const ufmt = require("../bot/utils/fmt");

test("Test for zero-time-left", ()=>{ expect(ufmt.timeLeft( 1000, 1000, '' )).toBe('[ 0 ] seconds');});
test("Test for 1 second", ()=>{ expect(ufmt.timeLeft( 0, 1000, '' )).toBe('[ 1 ] seconds');});
test("Test for 30 seconds", ()=>{ expect(ufmt.timeLeft( 0, 30000, '' )).toBe('[ 30 ] seconds');});
test("Test for 60 seconds", ()=>{ expect(ufmt.timeLeft( 0, 60000, '' )).toBe('[ 60 ] seconds');});
test("Test for 1 minute", ()=>{ expect(ufmt.timeLeft( 0, 61000, '' )).toBe('[ 1 ] minutes'); });
test("Test for 30 minutes", ()=>{ expect(ufmt.timeLeft( 0, 30*60000, '' )).toBe('[ 30 ] minutes'); });
test("Test for 1 hour", ()=>{ expect(ufmt.timeLeft( 0, 61*60000, '' )).toBe('[ 1 ] hours'); });