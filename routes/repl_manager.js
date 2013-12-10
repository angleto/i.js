var net = require('net'),
    repl = require("repl");

var prompt = ">";

var createServer = function (port) {
    net.createServer(function (socket) {
        console.log("repl server started");
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
    var id2socket = {};
    var nextPort = 5001;
    return function (id) {
        if (!id2socket[id]) {
            console.log('create server on port: ' + nextPort);
            id2socket[id] = createServer(nextPort++);
        }
        return id2socket[id];
    };
}();

exports.eval = function (req, res) {
    if (req.body && req.body.js && req.body.id) {
        var js = req.body.js;
        console.log("JS to execute: " + js);

        var id = req.body.id;
        console.log("ID: " + id);

        var socket = getServer(id);

        socket.once('data', function (b) {
            var result = 'undefined';
            var out = b.toString().split(prompt);
            for (var i = out.length - 1; i >= 0; i--) {
                result = out[i].trim();
                if (result.length > 0) {
                    break;
                }
            }
            console.log('result: ' + result);
            res.send(result);
        });
        socket.write(js.trim() + '\n');
        socket.write('.break\n');
    }
};