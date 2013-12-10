var title = 'i.js';

exports.index = function (req, res) {
    res.render('index', { title: title });
};

exports.scrapbook = function (req, res) {
    res.render('scrapbook', { title: title });
};