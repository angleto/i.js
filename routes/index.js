var fs = require('fs'),
    logger = require('log4js').getLogger("index"),
    path = require('path'),
    shared = require('./shared');

exports.index = function (req, res) {
    logger.info("index()");

    fs.exists(shared.workdir, function (exists) {
        if (exists) {
            fs.readdir(shared.workdir, function (err, files) {
                if (err) {
                    logger.error(err);
                    throw err;
                } else {
                    var scrapbooks = [];
                    var filesRead = 0;
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (/\.json$/.test(file)) {
                            var id = file.replace(/\.[^/.]+$/, "");
                            logger.info("id:" + id);

                            fs.readFile(path.join(shared.workdir, file), function (err, data) {
                                if (err) {
                                    logger.error(err);
                                    throw err;
                                } else {
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
                                        res.render('index', { title: shared.title, scrapbooks: scrapbooks });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    });
};

