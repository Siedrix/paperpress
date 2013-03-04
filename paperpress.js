var fs = require("fs"),
	md = require("node-markdown").Markdown,
	swig = require("swig"),
	express = require("express");

swig.init({
  allowErrors: false,
  autoescape: true,
  cache: true,
  encoding: 'utf8',
  filters: {},
  root: "./",
  tags: {},
  extensions: {},
  tzOffset: 0
});	

var Paperpress = function (config) {
	this.directory   = config.directory;
	this.basePath = config.basePath;
	this.pagesPath = config.pagesPath;

	this.singleTpl = swig.compileFile(this.directory + "/layouts/single.html");
	this.multipleTpl = swig.compileFile(this.directory + "/layouts/multiple.html");
}

Paperpress._titleToSlug = function (title) {
	var slug = title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

	return slug
}

Paperpress._directoryToArticle = function (directory) {
	var article = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!article.path){
		article.path = Paperpress._titleToSlug(article.title);
	}

	var content = fs.readFileSync(directory.path + '/content.md').toString();

	article.content = md(content, true, "h1|h2|h3|h4|p|strong|span|a", {
	    "a":"href",        // 'href' for links
	    "*":"title|style"  // 'title' and 'style' for all
	});

	return article;
}

Paperpress._directoryToPage = function (directory) {
	var page = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!page.path){
		page.path = Paperpress._titleToSlug(page.title);
	}

	var content = fs.readFileSync(directory.path + '/content.md').toString();

	page.content = md(content, true, "h1|h2|h3|h4|p|strong|span|a", {
	    "a":"href",        // 'href' for links
	    "*":"title|style"  // 'title' and 'style' for all
	});

	return page;
}

Paperpress._sortArticles = function (article) {
	return article.sort(function (a, b) {
		return new Date(a.date).getTime(), new Date(b.date).getTime() ? 1 : -1;
	});
}

Paperpress.prototype.attach = function(server) {
	var paperpress = this;

	// Get articles
	var articles = [];

	fs.readdirSync(this.directory + '/articles').forEach(function (article) {
		var path  = paperpress.directory + '/articles/' + article,
			stats = fs.statSync(path);

		if(stats.isDirectory()){
			articles.push(Paperpress._directoryToArticle({
				path  : path,
				stats : stats,
			}));
		}
	});

	articles = Paperpress._sortArticles(articles);

	// Add blog routes
	server.get(this.basePath, function (req, res) {
		var renderedHtml = paperpress.multipleTpl.render({
			baseUrl : paperpress.basePath,
			articles : articles
		});

		res.send(renderedHtml);
	});

	articles.forEach(function (article) {
		server.get(paperpress.basePath + '/' + article.path, function(req, res){
			var renderedHtml = paperpress.singleTpl.render({
				baseUrl : paperpress.basePath,
				article : article
			});

			res.send(renderedHtml);
		});
	});

	// Get pages
	var pages = [];
	fs.readdirSync(this.directory + '/pages').forEach(function (article) {
		var path  = paperpress.directory + '/pages/' + article,
			stats = fs.statSync(path);

		if(stats.isDirectory()){
			pages.push(Paperpress._directoryToPage({
				path  : path,
				stats : stats,
			}));
		}
	});

	pages.forEach(function (page) {
		server.get(paperpress.pagesPath + '/' + page.path, function(req, res){
			var renderedHtml = paperpress.singleTpl.render({
				baseUrl : paperpress.pagesPath,
				article : page
			});

			res.send(renderedHtml);
		});
	});

	// Add static files
	server.use(paperpress.basePath, express.static(paperpress.directory + '/public') );
};

exports.Paperpress = Paperpress;