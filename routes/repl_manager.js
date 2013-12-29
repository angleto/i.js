var logger = require('log4js').getLogger("repl_manager"),
    net = require('net'),
    repl = require("repl");

var prompt = ">";

var createServer = function (port) {
    logger.info("createServer()");

    var server = {
        repl_server: null,
        listener : function(socket) {
            logger.info("repl server started");

            this.repl_server = repl.start({
                prompt: prompt,
                input: socket,
                output: socket
            });

            this.repl_server.on('exit', function () {
                socket.end();
            });
        }
    };

    net.createServer(server.listener()).listen(port);

    return {socket: net.connect(port), server: server.repl_server};
};

var getServer = function () {
    logger.info("getServer()");

    var id2server = {};
    var nextPort = 5001;
    return function (id) {
        if (!id2server[id]) {
            logger.info('create server on port: ' + nextPort);
            id2server[id] = createServer(nextPort++);
        }
        return id2server[id];
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

        var socket = getServer(id).socket;

        socket.once('data', function (b) {
            var result = 'undefined';
            var out = b.toString().split(prompt);
            for (var i = out.length - 1; i >= 0; i--) {
                result = out[i].trim().replace(/^(\.\.+\s+)+/, "");
                if (result.length > 0) {
                    break;
                }
            }
            logger.debug('result: ' + result);
            res.send(result);
        });
        socket.write(js.trim() + '\n' + '.break\n');
    }
};


exports.autocomplete = function (req, res) {
    logger.info("autocomplete()");
    if (!req.body) {
        logger.info("missing request body");
        return;
    }

    var id = req.body.id;
    var token = req.body.token;
    if (id && token) {
        logger.info("id: " + id);
        logger.debug("token: " + token);

        var server = getServer(id).server;

        var complete = repl.REPLServer.prototype.complete;
        complete.apply(server, [token, function(err, completions) {
            if (err) {
                throw err;
            }
            res.send(completions);
        }]);
    }
};