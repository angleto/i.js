exports.index = function (req, res) {
    res.render('index', { title: 'I.js' });
};

exports.scrapbook = function (req, res) {
    res.render('scrapbook', { title: 'I.js' });
};