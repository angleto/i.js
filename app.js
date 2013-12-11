var express = require('express'),
    http = require('http'),
    path = require('path');

var routes = require('./routes'),
    config = require('./routes/config'),
    repl_manager = require('./routes/repl_manager'),
    scrapbook = require('./routes/scrapbook');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

app.post('/repl', repl_manager.eval);

app.get('/scrapbook/*', scrapbook.scrapbook);
app.post('/save', scrapbook.save);
app.get('/load', scrapbook.load);

config.setup();

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
