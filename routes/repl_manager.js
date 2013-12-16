var logger = require('log4js').getLogger("repl_manager"),
    net = require('net'),
    repl = require("repl");

var prompt = ">";

var createServer = function (port) {
    logger.info("createServer()");
    net.createServer(function (socket) {
        logger.info("repl server started");

        var repl_server = repl.start({
            prompt: prompt,
            input: socket,
            output: socket
        });

        repl_server.on('exit', function () {
            socket.end();
        });
    }).listen(port);

    return net.connect(port);
};

var getServer = function () {
    logger.info("getServer()");

    var id2socket = {};
    var nextPort = 5001;
    return function (id) {
        if (!id2socket[id]) {
            logger.info('create server on port: ' + nextPort);
            id2socket[id] = createServer(nextPort++);
        }
        return id2socket[id];
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

        var socket = getServer(id);

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