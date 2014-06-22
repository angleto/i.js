var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorhandler = require('errorhandler'),
    favicon = require('serve-favicon'),
    morgan  = require('morgan'),
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
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// development only
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

app.get('/', routes.index);

app.post('/repl', repl_manager.eval);
app.post('/autocomplete', repl_manager.autocomplete);

app.get('/scrapbook/*', scrapbook.scrapbook);
app.get('/load', scrapbook.load);
app.post('/save', scrapbook.save);
app.post('/delete', scrapbook.delete);

config.setup();

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
