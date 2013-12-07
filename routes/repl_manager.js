var net = require('net'),
    repl = require("repl");

net.createServer(function (socket) {
    console.log("repl server started")
    var repl_server = repl.start({
        prompt: "",
        input: socket,
        output: socket
    });
    repl_server.on('exit', function () {
        socket.end();
    });
}).listen(5001);

var socket = net.connect(5001);

exports.eval = function (req, res) {
    if (req.body && req.body.js) {
        var js = req.body.js;
        console.log("JS to execute: " + js);

        socket.once('data', function (b) {
            var result = b.toString().trim();
            console.log('result: ' + result);
            res.send(result);
        });
        socket.write(js.trim() + '\n');
        socket.write('.break\n');
    }
};