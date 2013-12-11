var fs = require('fs'),
    path = require('path');

var title = 'i.js';
var workdir = ".scrapbooks";

function error(res, err) {
    console.log(err);
    res.send(500, err);
}

exports.index = function (req, res) {
    if (fs.existsSync(workdir)) {
        fs.readdir(workdir, function (err, files) {
            if (err) {
                error(res, err);
            } else {
                var scrapbooks = [];
                for (var i = 0; i < files.length; i++) {
                    // TODO ends with
                    scrapbooks[i] = files[i].replace(/\.[^/.]+$/, "");
                }
                res.render('index', { title: title, scrapbooks: scrapbooks });
            }
        });
    }
};

exports.scrapbook = function (req, res) {
    res.render('scrapbook', { title: title });
};

exports.save = function (req, res) {
    if (req.body && req.body.data && req.body.id) {
        if (fs.existsSync(workdir)) {
            var stat = fs.statSync(workdir);
            if (!stat.isDirectory()) {
                error(res, workdir + " should be a directory");
                return;
            }
        } else {
            fs.mkdirSync(workdir);
        }

        var file = path.join(workdir, req.body.id + ".json");
        fs.writeFile(file, JSON.stringify(req.body.data), function (err) {
            if (err) {
                error(err);
            } else {
                console.log("The file was saved!");
            }
        });
    }
};

exports.load = function (req, res) {
    console.log("load");
    if (req.query && req.query.id) {
        var file = path.join(workdir, req.query.id + ".json");
        fs.readFile(file, function (err, data) {
            //if (err) throw err; //TODO reuse!
            if (err) {data = "[]";}
            console.log("data: " + data);
            res.send(JSON.parse(data));
        });
    }
};