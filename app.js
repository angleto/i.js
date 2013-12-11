var express = require('express'),
    routes = require('./routes'),
    repl_manager = require('./routes/repl_manager'),
    scrapbook = require('./routes/scrapbook'),
    http = require('http'),
    path = require('path');

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

app.post('/repl', express.bodyParser(), repl_manager.eval);

app.get('/scrapbook/*', scrapbook.scrapbook);
app.post('/save', express.bodyParser(), scrapbook.save);
app.get('/load', scrapbook.load);


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
