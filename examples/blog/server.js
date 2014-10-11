var express = require('express'),
	Paperpress = require('../../paperpress').Paperpress;

var server = express();

var paperpress = new Paperpress({
	directory : 'static',
	themePath : '/static/themes/base',
	basePath  : '/blog',
	pagesPath : '',
	articlesPerPage : 10
});

paperpress.attach(server);

server.get('/', function (req, res) {
	res.redirect('/blog');
});

server.listen(3000);