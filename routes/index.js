var fs = require('fs'),
    path = require('path');

var title = 'i.js';
var workdir = ".scrapbooks";

exports.index = function (req, res) {
    res.render('index', { title: title });
};

exports.scrapbook = function (req, res) {
    res.render('scrapbook', { title: title });
};

exports.save = function (req, res) {
    if (req.body && req.body.data && req.body.id) {

        if (fs.existsSync(workdir)) {
            var stat = fs.statSync(workdir);
            if (!stat.isDirectory()) {
                res.send(500, workdir + " should be a directory");
                return;
            }
        } else {
            fs.mkdirSync(workdir);
        }

        var file = path.join(workdir, req.body.id + ".json");
        fs.writeFile(file, JSON.stringify(req.body.data), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
    }
};