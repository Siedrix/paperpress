var assert = require('assert'),
	express = require('express'),
	Paperpress = require('../paperpress').Paperpress,
	_ = require('underscore');

var server = express();

var paperpress = new Paperpress({
	directory : 'test/static',
	themePath : '/test/static/layouts',
	basePath  : '/blog',
	pagesPath : '/pages',
	articlesPerPage : 2
});

describe('Paperpress', function(){
	describe('Init paperpress', function(){
		it('Paperpress shoud be a function', function(){
			assert.equal(typeof Paperpress, 'function');
		});

		it('paperpress shoud be an object with articles, pages and other config elements', function(){
			assert.equal(typeof paperpress, 'object');
			assert.equal(typeof paperpress.blogDescription , 'object');

			assert.equal(_.isArray(paperpress.articles) , true);
			assert.equal(_.isArray(paperpress.pages) , true);

			assert.equal(paperpress.basePath, '/blog');
			assert.equal(paperpress.pagesPath, '/pages');
			assert.equal(paperpress.directory, 'test/static');

			assert.equal(paperpress.articlesPerPage, 2);
		});

		it('paperpress should have the next set of private function', function () {
			assert.equal(typeof paperpress._titleToSlug, 'function');
			assert.equal(typeof paperpress._sortArticles, 'function');
			assert.equal(typeof paperpress._directoryToPage, 'function');
			assert.equal(typeof paperpress._directoryToArticle, 'function');
		});

		it('paperpress should have the next set of public function', function () {
			assert.equal(typeof paperpress.attach, 'function');
			assert.equal(typeof paperpress.getArticlesInPage, 'function');
			assert.equal(typeof paperpress.readArticles, 'function');
			assert.equal(typeof paperpress.readPages, 'function');
		});
	});
});

describe.skip('Paperpress Blog Description', function(){
	describe('#paperpress.blogDescription', function(){
		it('paperpress blog description should have this attributes', function(){
			assert.equal(true , false);
		});
	});
});

describe.skip('Paperpress Read Pages', function(){
	describe('#paperpress.readPages()', function(){
		paperpress.readPages();

		it('paperpress should have pages', function () {
			assert.equal(paperpress.pages.length > 0, true);
		});
	});
});

describe('Paperpress Read Articles', function(){
	describe('#paperpress.readArticles()', function(){
		paperpress.readArticles();

		it('paperpress should have articles', function () {
			assert.equal(paperpress.articles.length, 7);
		});
	});
});

describe.skip('Paperpress getArticlesInPage', function(){
	describe('#paperpress.getArticlesInPage() if 2 per page', function(){
		it('getArticlesInPage for page 1', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 2', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 3', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 4', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 5', function(){
			assert.equal(true , false);
		});
	});

	describe('#paperpress.getArticlesInPage() if 5 per page', function(){
		it('getArticlesInPage for page 1', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 2', function(){
			assert.equal(true , false);
		});

		it('getArticlesInPage for page 3', function(){
			assert.equal(true , false);
		});
	});
});

