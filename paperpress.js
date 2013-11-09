var fs = require("fs"),
	md = require("node-markdown").Markdown,
	swig = require("swig"),
	express = require("express"),
	Feed = require("feed"),
	_ = require("underscore");

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
	this.directory   = config.directory || "static";
	this.basePath = config.basePath;
	this.pagesPath = config.pagesPath;
	this.articlesPerPage = config.articlesPerPage || 5;

	this.singleTpl = swig.compileFile(this.directory + "/layouts/single.html");
	this.multipleTpl = swig.compileFile(this.directory + "/layouts/multiple.html");

	var description = fs.readFileSync('./' + config.directory + '/blog-description.json', 'utf8');
	this.blogDescription = JSON.parse(description);
};

Paperpress._titleToSlug = function (title) {
	var slug = title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

	return slug;
};

Paperpress.prototype._directoryToArticle = function (directory) {
	var article = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!article.path){
		article.path = Paperpress._titleToSlug(article.title);
	}

	article.uri = this.basePath + '/' + article.path;
	article.date = new Date(article.date);

	var content = fs.readFileSync(directory.path + '/content.md').toString();

	article.content = md(content, true, "h1|h2|h3|h4|p|strong|span|a", {
		"a":"href",			// 'href' for links
		"*":"title|style"	// 'title' and 'style' for all
	});

	return article;
};

Paperpress.prototype.getArticlesInPage = function (page) {
	var articles = _.clone(this.articles);

	return articles.splice(page * this.articlesPerPage, this.articlesPerPage);
};

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
};

Paperpress._sortArticles = function (article) {
	return article.sort(function (a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime() <= 0 ? 1 : -1;
	});
};

Paperpress.prototype.attach = function(server) {
	var paperpress = this;

	// Get articles
	var articles = this.articles = [];

	fs.readdirSync(this.directory + '/articles').forEach(function (article) {
		var path  = paperpress.directory + '/articles/' + article,
			stats = fs.statSync(path);

		if(stats.isDirectory()){
			articles.push(paperpress._directoryToArticle({
				path  : path,
				stats : stats,
			}));
		}
	});

	articles = Paperpress._sortArticles(articles);

	// Add blog routes
	var listHandler = function (req, res) {
		var page;
		if(!req.params.page){
			page = 0;
		}else{
			page = req.params.page - 1;
		}

		var articles = paperpress.getArticlesInPage(page);

		if(!articles.length){
			res.send(404);
			return;
		}

		var renderedHtml = paperpress.multipleTpl.render({
			static  : paperpress.basePath,
			baseUrl : paperpress.basePath,
			articles : articles
		});

		res.send(renderedHtml);
	};

	server.get(this.basePath, listHandler);
	server.get(this.basePath + '/page/:page', listHandler);

	articles.forEach(function (article) {
		server.get(paperpress.basePath + '/' + article.path, function(req, res){
			var renderedHtml = paperpress.singleTpl.render({
				static  : paperpress.basePath,
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
				static  : paperpress.basePath,
				baseUrl : paperpress.pagesPath,
				article : page
			});

			res.send(renderedHtml);
		});
	});

	// Since new articles arent added on real time, feed is created
	// just once, when the server is booted.
	var feed = new Feed(this.blogDescription);

	articles.forEach(function (item) {
		item.link = paperpress.blogDescription.link + item.uri;
		item.date = new Date(item.date);

		feed.item(item);
	});

	server.get('/rss', function (req, res) {
		res.set('Content-Type', 'text/xml');
		res.send(feed.render('rss-2.0'));
	});

	// Add static files
	server.use(paperpress.basePath, express.static(paperpress.directory + '/public') );
};

exports.Paperpress = Paperpress;