var fs = require('fs'),
    logger = require('log4js').getLogger("index"),
    path = require('path'),
    config = require('./config');

exports.index = function (req, res) {
    logger.info("index()");

    fs.readdir(config.workdir, function (err, files) {
        if (err) {
            logger.error(err);
            throw err;
        }

        var scrapbooks = [];
        if (files.length == 0) {
            res.render('index', { title: config.title, scrapbooks: scrapbooks });
            return
        }

        var filesRead = 0;
        files = files.filter(function (file) {return /\.json$/.test(file);});
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var id = file.replace(/\.[^/.]+$/, "");
            logger.info("id:" + id);

            var scanFile = function (id) {
                return function(err, data) {
                    if (err) {
                        logger.error(err);
                        throw err;
                    }

                    var name = JSON.parse(data).name;
                    logger.info("name: " + name);
                    scrapbooks.push({id: id, name: name});
                    filesRead++;
                    if (filesRead == files.length) {
                        scrapbooks = scrapbooks.sort(function (a, b) {
                            if (a.name < b.name) return -1;
                            if (b.name < a.name) return 1;
                            return 0;
                        });
                        res.render('index', { title: config.title, scrapbooks: scrapbooks });
                    }
                }
            }(id);
            fs.readFile(path.join(config.workdir, file), scanFile);
        }
    });
};

