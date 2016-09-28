var express = require('express');

var app = express();

app.use(express.static('public'));

/*app.get('/', function (req, res) {
  res.sendFile('public/index_alt.html', {root : '/Users/administrator/Sites/hack'});
});

app.post('/', function (req, res) {
  res.sendFile('public/index_alt.html', {root: '/Users/administrator/Sites/hack'});
});*/

var port = 8080;

var server = app.listen(port);
