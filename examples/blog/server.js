var express = require("express"),
	Paperpress = require("../../paperpress").Paperpress;

var server = express();

var blog = new Paperpress({
	directory : 'static',
	basePath  : '/blog',
	pagesPath : ''
});

blog.attach(server);

server.get('/', function (req, res) {
	res.send('Welcome');
});

server.listen(3000);