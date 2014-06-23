var REPL_manager = require('../routes/REPL_manager');

describe("preprocessJS", function() {
    var preprocessJS = REPL_manager.preprocessJS;
    function cleanup(s) {
        return s.replace(/\n/g, ' ').trim();
    }

    it("does not modify empty strings", function() {
        expect(preprocessJS("")).toBe("");
    });

    it("wraps code in try/catch", function() {
        var js = "var a = 1;";
        expect(cleanup(preprocessJS(js))).toBe("try { " + js + " } catch (e) { e.message } .break");
    });

    it("removes REPL commands", function() {
        expect(cleanup(preprocessJS(".clear"))).toBe("");
        expect(cleanup(preprocessJS(".break"))).toBe("");
        expect(cleanup(preprocessJS(".exit"))).toBe("");
    });

    it("converts %reset to .clear", function() {
        expect(cleanup(preprocessJS("%reset"))).toBe(".clear");
    });

    it("removes line-feeds from the chained method calls (to workaround node REPL limitations)", function() {
        expect(cleanup(preprocessJS("var a = o\n.trim()"))).toBe("try { var a = o.trim() } catch (e) { e.message } .break");
    });
});

