var express = require('express'),
	Paperpress = require('../../paperpress').Paperpress;

var server = express();

var blog = new Paperpress({
	directory : 'static',
	themePath : 'static/layouts',
	basePath  : '/blog',
	pagesPath : '',
	articlesPerPage : 5
});

blog.attach(server);

server.get('/', function (req, res) {
	res.redirect('/blog');
});

server.listen(3000);