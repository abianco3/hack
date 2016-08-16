var http = require('http');
var router = require('./router');

var port = process.env.PORT;
var ip = process.env.IP;

var server = http.createServer(router.handleRequest);

console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);