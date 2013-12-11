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
                    error(res, err);
                } else {
                    var scrapbooks = [];
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (/\.json$/.test(file)) {
                            var id = file.replace(/\.[^/.]+$/, "");
                            logger.info("id:" + id);

                            var json = fs.readFileSync(path.join(shared.workdir, file));
                            var name = JSON.parse(json).name;
                            logger.info("name:" + name);

                            scrapbooks[i] = {id: id, name: name};
                        }
                    }
                    res.render('index', { title: shared.title, scrapbooks: scrapbooks });
                }
            });
        }
    });
};

