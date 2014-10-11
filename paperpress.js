var fs = require('fs'),
	marked = require('marked'),
	swig = require('swig'),
	express = require('express'),
	Feed = require('feed'),
	_ = require('underscore'),
	highlighter = require('highlight.js'),
	path = require('path');

marked.setOptions({
	highlight: function (code) {
		var highlighted =highlighter.highlightAuto(code).value;

		return highlighted;
	}
});

var Paperpress = function (config) {
	this.directory   = config.directory || 'static';
	this.themeStatic   = config.themePath + '/public';
	this.themePath   = config.themePath + '/layouts' || (this.directory + '/layouts');
	this.staticPath = config.staticPath || 'static';
	this.basePath    = config.basePath;
	this.pagesPath   = config.pagesPath;
	this.articlesPerPage = config.articlesPerPage || 5;

	this.articles = [];
	this.pages    = [];
	this.snippets = {};

	this._hooks   = config.hooks || {};

	swig.setDefaults({ cache: false });

	var themePath = path.join(process.cwd(), this.themePath);

	this.pageTpl     = swig.compileFile(themePath + '/page.html');
	this.singleTpl   = swig.compileFile(themePath + '/single.html');
	this.multipleTpl = swig.compileFile(themePath + '/multiple.html');

	var description = fs.readFileSync('./' + config.directory + '/feed-description.json', 'utf8');
	this.blogDescription = JSON.parse(description);
};

/****************************************/
/********** Private Functions ***********/
/****************************************/
Paperpress.prototype._titleToSlug = function (title) {
	var slug = title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

	return slug;
};

Paperpress.prototype._directoryToArticle = function (directory) {
	var paperpress = this;
	var article = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!article.path){
		article.path = paperpress._titleToSlug(article.title);
	}

	article.uri = this.basePath + '/' + article.path;
	article.date = new Date(article.date);

	if(article.contentType === 'html'){
		article.content = fs.readFileSync(directory.path + '/content.html').toString();
	}else{
		var content = fs.readFileSync(directory.path + '/content.md').toString();
		article.content = marked(content);
	}

	return article;
};

Paperpress.prototype._directoryToPage = function (directory) {
	var page = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!page.path){
		page.path = Paperpress._titleToSlug(page.title);
	}

	var content = fs.readFileSync(directory.path + '/content.md').toString();
	page.content = marked(content);

	return page;
};

Paperpress.prototype._fileToSnippet = function (filepath) {
	var file = fs.readFileSync(filepath).toString();

	return marked(file);
};

Paperpress.prototype._sortArticles = function (article) {
	return article.sort(function (a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime() <= 0 ? 1 : -1;
	});
};

/****************************************/
/********** Public Functions ************/
/****************************************/
Paperpress.prototype.buildContext = function (locals) {
	var paperpress = this;

	locals = locals || {};

	locals.snippets = paperpress.snippets;
	locals.pages = Math.ceil(paperpress.articles.length / paperpress.articlesPerPage);
	locals.currentPage = locals.currentPage || 0;

	if (locals.currentPage < locals.pages) {
		locals.nextUrl = paperpress.basePath + '/' + (locals.currentPage + 1);
	}

	if (locals.currentPage > 0) {
		locals.prevUrl = paperpress.basePath + '/' + (locals.currentPage - 1);
	}

	return locals;
};

Paperpress.prototype.hooks = function(hookName, hook) {
	if(!this._hooks[hookName]){
		this._hooks[hookName] = [];
	}

	this._hooks[hookName].push(hook);
};

Paperpress.prototype.readArticles = function () {
	var paperpress = this;
	paperpress.articles = [];

	fs.readdirSync(this.directory + '/articles').forEach(function (article) {
		var path  = paperpress.directory + '/articles/' + article,
			stats = fs.statSync(path);

		if(stats.isDirectory()){
			paperpress.articles.push(paperpress._directoryToArticle({
				path  : path,
				stats : stats,
			}));
		}

		if(paperpress._hooks && paperpress._hooks.readArticles){
			paperpress._hooks.readArticles.forEach(function(fn){
				fn(paperpress.articles);
			});
		}
	});
};

Paperpress.prototype.readPages = function () {
	var paperpress = this;

	paperpress.pages = [];
	fs.readdirSync(this.directory + '/pages').forEach(function (page) {
		var path  = paperpress.directory + '/pages/' + page,
			stats = fs.statSync(path);

		if(stats.isDirectory()){
			paperpress.pages.push(paperpress._directoryToPage({
				path  : path,
				stats : stats,
			}));
		}

		if(paperpress._hooks && paperpress._hooks.readPages){
			paperpress._hooks.readPages.forEach(function(fn){
				fn(paperpress.pages);
			});
		}
	});
};

Paperpress.prototype.readSnippets = function () {
	var paperpress = this;

	paperpress.snippets = {};

	var snippets = fs.readdirSync(this.directory + '/snippets');

	snippets.forEach(function (article) {
		if(article.indexOf('.') === 0){return;}

		var path  = paperpress.directory + '/snippets/' + article,
			stats = fs.statSync(path),
			articleName = article.replace('.md', '');

		if(!stats.isDirectory()){
			paperpress.snippets[articleName] = paperpress._fileToSnippet(path);
		}
	});
};

Paperpress.prototype.readThemeFiles = function () {
	var paperpress = this;

	var themePath = path.join(process.cwd(), paperpress.themePath);

	paperpress.pageTpl     = swig.compileFile(themePath + '/page.html');
	paperpress.singleTpl   = swig.compileFile(themePath + '/single.html');
	paperpress.multipleTpl = swig.compileFile(themePath + '/multiple.html');

};

Paperpress.prototype.getSnippets = function(name){
	return this.snippets[name];
};

Paperpress.prototype.getArticlesInPage = function (page) {
	var articles = _.clone(this.articles);

	return articles.splice(page * this.articlesPerPage, this.articlesPerPage);
};

/****************************************/
/**** Add Paperpress to express *********/
/****************************************/
Paperpress.prototype.attach = function(server) {
	var paperpress = this;

	// Add static files
	server.use( '/'+paperpress.staticPath , express.static( process.cwd() + '/' + paperpress.themeStatic ) );

	server.use(function(req, res, next){
		res.locals.paperpress = paperpress.buildContext({
			currentPage: parseInt(req.query.page, 10)
		});

		next();
	});

	this.readArticles();
	this.readPages();
	this.readSnippets();

	// Get articles
	var articles = this.articles;
	var pages = this.pages;

	articles = paperpress._sortArticles(articles);

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

		var renderedHtml = paperpress.multipleTpl({
			static  : '/' + paperpress.staticPath,
			baseUrl : paperpress.basePath,
			articles : articles
		});

		res.send(renderedHtml);
	};

	server.get( this.basePath, listHandler );

	// Attach article base path
	server.get(paperpress.basePath + '/*', function(req, res){
		var article = _.find(paperpress.articles, function(item){return item.uri === req.path;});

		if(!article){
			return res.status(404).end();
		}

		var renderedHtml = paperpress.singleTpl({
			static  : '/' + paperpress.staticPath,
			baseUrl : paperpress.basePath,
			article : article
		});

		res.send(renderedHtml);
	});

	pages.forEach(function (page) {
		server.get(paperpress.pagesPath + '/' + page.path, function(req, res){
			var renderedHtml = paperpress.pageTpl({
				static  : '/' + paperpress.staticPath,
				baseUrl : paperpress.pagesPath,
				page    : page
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

		feed.addItem(item);
	});

	server.get('/rss', function (req, res) {
		res.set('Content-Type', 'text/xml');
		res.send(feed.render('rss-2.0'));
	});
};

exports.Paperpress = Paperpress;
