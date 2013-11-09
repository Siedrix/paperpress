var express = require("express"),
	Paperpress = require("../../paperpress").Paperpress;

var server = express();

var blog = new Paperpress({
	directory : 'static',
	basePath  : '/blog',
	pagesPath : '',
	articlesPerPage : 2
});

blog.attach(server);

server.get('/', function (req, res) {
	res.redirect('/blog');
});

server.listen(3000);