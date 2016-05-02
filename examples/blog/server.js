var express = require('express'),
	_ = require('underscore'),
	Paperpress = require('../../paperpress');

var server = express();

var paperpress = new Paperpress({
	baseDirectory : 'static',
	uriPrefix  : '/blog'
});
paperpress.load();

server.get('/', function (req, res) {
	res.redirect('/blog');
});

server.get('/blog', function (req, res) {
	var articles = paperpress.getCollection('articles')

	res.send(articles)
})

server.get('/blog/articles/:article', function(req,res){
	var articles = paperpress.getCollection('articles')
	var article = _.findWhere(articles,{type:'articles', slug:req.params.article})

	if(!article){
		res.status(404)
		return res.send('404')
	}

	res.send(article)
})

server.listen(3000);
console.log('Paperpress example running at http://localhost:3000')
