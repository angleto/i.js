var fs = require('fs'),
    logger = require('log4js').getLogger("config");

var workdir = ".scrapbooks";

exports.title = 'i.js';
exports.workdir = workdir;

exports.setup = function () {
    logger.info("setup()");
    if (fs.existsSync(workdir)) {
        if (!fs.statSync(workdir).isDirectory()) {
            throw new Error(workdir + " should be a directory");
        }
    } else {
        fs.mkdirSync(workdir);
    }
}