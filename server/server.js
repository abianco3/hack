const express = require('express');

const app = express();

app.use(express.static('public'));

app.all('/alchemy', (req, res) => res.send('a426cc16207269a76ec3bd51f0711dffd1783d4d'));

app.all('/nyt', (req, res) => res.send('626edab52a884bcda6a6bd4b405fa60a'));

/*app.get('/', function (req, res) {
  res.sendFile('public/index_alt.html', {root : '/Users/administrator/Sites/hack'});
});

app.post('/', function (req, res) {
  res.sendFile('public/index_alt.html', {root: '/Users/administrator/Sites/hack'});
});*/

const port = process.env.PORT || 8080;

const server = app.listen(port);
