var config = require('./config'),
    events = require('events'),
    fs = require('fs'),
    logger = require('log4js').getLogger("repl_manager"),
    net = require('net'),
    path = require('path'),
    repl = require('repl'),
    util = require('util');

var prompt = "@\n",
    commandsWhiteList = [".break", ".clear"],
    scripts = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'repl_scripts.json'), 'utf8'));


var createServer = function (port, callback) {
    logger.info("createServer()");

    var clientSocket;
    net.createServer(function (serverSocket) {
        logger.info("repl server started");

        var repl_server = repl.start({
            prompt: prompt,
            input: serverSocket,
            output: serverSocket
        })
        .on('exit', function () {
            serverSocket.end();
        });

        function ServerConnection(clientSocket, replServer) {
            events.EventEmitter.call(this);
            this.server = replServer;

            this.eval = function (js, callback) {
                logger.debug("server_connection.eval(" + js + ")");
                clientSocket.once('data', function (data) {
                    if (callback) {
                        callback(data);
                    }
                })
                .write(js);
            };
        }

        ServerConnection.prototype.__proto__ = events.EventEmitter.prototype;

        var server_connection = new ServerConnection(clientSocket, repl_server);
        server_connection.eval(util.format(scripts['setupBaseDir'], config.base_dir));
        server_connection.eval(util.format(scripts['setupModulesDir'], config.modules_dir));

        callback(server_connection);
    }).listen(port);

    clientSocket = net.connect(port);
};

var getServer = function () {
    logger.info("getServer()");

    var id2server = {};
    var nextPort = 5001;
    return function (id, callback) {
        var server = id2server[id];
        if (server) {
            callback(server);
        } else {
            logger.info('create server on port: ' + nextPort);
            createServer(nextPort++, function (server_connection) {
                id2server[id] = server_connection;
                callback(server_connection);
            });
        }
    };
}();

exports.eval = function (req, res) {
    logger.info("eval()");
    if (!req.body) {
        logger.info("missing request body");
        return;
    }

    var id = req.body.id;
    var js = req.body.js;
    if (id && js) {
        logger.info("id: " + id);
        logger.debug("js: " + js);
        js = preprocessJS(js);
        logger.debug("preprocessed js: " + js);

        getServer(id, function (server_connection) {
            server_connection.eval(js, function (data) {
                logger.debug("data from repl socket: " + data);
                var result = 'undefined';
                var out = data.toString().split(prompt);
                for (var i = out.length - 1; i >= 0; i--) {
                    result = out[i].trim().replace(/^(\.\.+\s+)+/, "");
                    if (result.length > 0) {
                        break;
                    }
                }
                logger.debug('send to client: ' + result);
                res.send(result);
            });
        });
    }
};

/* Support multi-line function calls and ignore all non-whitelisted REPL control commands*/
function preprocessJS(js) {
    return filterREPLCommands(filterMultiLineExpressions(js));
}

/* Support multi-line function calls */
function filterMultiLineExpressions(js) {
    var lines = js.split('\n');

    // We want to separate REPL commands from the source code: source code should be wrapped into a try/catch
    var commands = [];
    var sourceCode = [];

    /* Support multi-line function calls */
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        var command = false;
        var startsWithDot = false;
        var trimmedLine = line.trim();

        if (trimmedLine.charAt(0) === '.') {
            startsWithDot = true;

            for (var j = 0; j < commandsWhiteList.length; j++) {
                if (trimmedLine === commandsWhiteList[j]) {
                    commands.push(trimmedLine);
                    command = true;
                    break;
                }
            }
        }

        if (!command) {
            if (startsWithDot) {
                if (sourceCode.length > 0) {
                    sourceCode[sourceCode.length - 1] = sourceCode[sourceCode.length - 1] + trimmedLine;
                }
            } else {
                if (trimmedLine.length > 0) {
                    sourceCode.push(trimmedLine);
                }
            }
        }
    }
    return util.format(scripts['evalWrapper'], commands.join("\n"), sourceCode.join("\n"));
}

/* Ignore all non-whitelisted REPL control commands */
function filterREPLCommands(js) {
    if (js.match(/^\..+$/)) {
        var whiteListed = false;
        for (var j = 0; j < commandsWhiteList.length; j++) {
            if (js === commandsWhiteList[j]) {
                whiteListed = true;
                break;
            }
        }
        if (!whiteListed) {
            js = '';
        }
    }
    return js;
}

exports.autocomplete = function (req, res) {
    logger.info("autocomplete()");
    if (!req.body) {
        logger.info("missing request body");
        return;
    }

    var id = req.body.id;
    var s = req.body.string;
    if (id && s) {
        logger.info("id: " + id);
        logger.debug("s: " + s);

        getServer(id, function (server_connection) {
            var server = server_connection.server;
            var complete = repl.REPLServer.prototype.complete;
            complete.apply(server, [s, function (err, completions) {
                if (err) {
                    throw err;
                }
                //var completions = flatten(completions);
                if (completions.length >= 2) {
                    // The last suggestion is the original token text,
                    // we will use it to filter out auto-completion prefixes.
                    var head = completions[0];
                    var tail = completions[1];

                    var result = head.filter(function (item) {
                        return item.length > 0;
                    });
                    res.send([tail, result]);
                } else {
                    res.send(completions);
                }
            }]);
        });
    }
};