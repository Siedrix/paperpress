/* global describe, it */
var assert = require('assert')
var	Paperpress = require('../paperpress').Paperpress
var	_ = require('underscore')

/**
**************************************
**************** SET UP **************
**************************************
**/
var paperpressBaseConfig = {
	baseDirectory: 'test/static',
	uriPrefix: '/blog'
}

console.warn = function () {}

/**
**************************************
**************** TESTS ***************
**************************************
**/
describe('Paperpress', function () {
	describe('Init paperpress', function () {
		it('Paperpress shoud be a function', function () {
			assert.equal(typeof Paperpress, 'function')
		})

		it('paperpress shoud be an object with articles, pages and other config elements', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress, 'object')

			assert.equal(_.isArray(paperpress.items), true)
			assert.equal(paperpress.baseDirectory, 'test/static')
		})

		it('paperpress should have the next set of private function', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress._getCollections, 'function')
			assert.equal(typeof paperpress._titleToSlug, 'function')
			assert.equal(typeof paperpress._sortByDate, 'function')
			assert.equal(typeof paperpress._directoryToItem, 'function')
			assert.equal(typeof paperpress._fileToItem, 'function')
			assert.equal(typeof paperpress._loadCollection, 'function')
		})

		it('paperpress should have the next set of public function', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress.getCollection, 'function')
			assert.equal(typeof paperpress.getCollections, 'function')
			assert.equal(typeof paperpress.load, 'function')
			assert.equal(typeof paperpress.addHook, 'function')
		})

		it('paperpress load should return null when baseDirectory doesn\'t exist', function () {
			var paperpress = new Paperpress({baseDirectory: 'foo'})
			assert.equal(typeof paperpress, 'object')
			assert.equal(paperpress.load(), null)
		})
	})

	describe('#paperpress.hooks()', function () {
		it('paperpress should add hook', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal( _.isArray( paperpress._hooks ), true )
			assert.equal( paperpress._hooks.length, 0 )

			paperpress.addHook(function () {})

			assert.equal( _.isArray( paperpress._hooks ), true )
			assert.equal( paperpress._hooks.length, 1 )
		})
	})

	describe('#paperpress._getCollections()', function () {
		it('paperpress should get main folders', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			var collections = paperpress._getCollections()

			assert.equal( _.isArray( collections ), true )
			assert.equal(collections.length, 3)
			assert.deepEqual( collections, [ 'articles', 'pages', 'snippets' ])
		})
	})

	describe('#paperpress._loadCollection()', function () {
		it('paperpress should get collection into items array', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 7 )
		})

		it('paperpress should get collection into items array with out repetition', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress._loadCollection('articles')
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 7 )
		})

		it('paperpress should get collection into items array running the hooks', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.addHook(function (item) {
				item.hookRunning = true
			})
			paperpress.addHook(function (item) {
				item.secondHookRunning = true
			})
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 7 )
			assert.equal( paperpress.items[0].hookRunning, true )
			assert.equal( paperpress.items[0].secondHookRunning, true )
		})
	})

	describe('#paperpress.load()', function () {
		it('paperpress should load all collections', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 10 )
		})
	})

	describe('#paperpress.getCollection()', function () {
		it('paperpress should get collection into items array running the hooks', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			var articles = paperpress.getCollection('articles')
			assert.equal( _.isArray( articles ), true )
			assert.equal( articles.length, 7 )

			var pages = paperpress.getCollection('pages')
			assert.equal( _.isArray( pages ), true )
			assert.equal( pages.length, 2 )

			var snippets = paperpress.getCollection('snippets')
			assert.equal( _.isArray( snippets ), true )
			assert.equal( snippets.length, 1 )
		})
	})

	describe('#paperpress.getCollections()', function () {
		it('paperpress should get collection into items array running the hooks', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			var articlesAndSnippets = paperpress.getCollections(['articles', 'snippets'])
			assert.equal( _.isArray( articlesAndSnippets ), true )
			assert.equal( articlesAndSnippets.length, 8 )

			var pagesAndSnippets = paperpress.getCollections(['pages', 'snippets'])
			assert.equal( _.isArray( pagesAndSnippets ), true )
			assert.equal( pagesAndSnippets.length, 3 )
		})
	})
})

describe('Paperpress items', function () {
	it('#paperpress items urls', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static'
		})
		paperpress.load()
		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-five-comes-six'})

		assert.equal( article.slug, 'after-five-comes-six' )
		assert.equal( article.path, '/articles/after-five-comes-six' )
	})

	it('#paperpress items urls from title', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static'
		})
		paperpress.load()
		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'githubs-markup'})

		assert.equal( article.slug, 'githubs-markup' )
		assert.equal( article.path, '/articles/githubs-markup' )
	})

	it('#paperpress items urls with prefix', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-five-comes-six'})

		assert.equal( article.slug, 'after-five-comes-six' )
		assert.equal( article.path, '/blog/articles/after-five-comes-six' )
	})

	it('#paperpress items urls using builder', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static',
			pathBuilder: function (item, collectionName) {
				return '/' + item.slug
			}
		})
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-five-comes-six'})
		assert.equal( article.slug, 'after-five-comes-six' )
		assert.equal( article.path, '/after-five-comes-six' )
	})

	it('#paperpress items paths in info.json', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static',
			pathBuilder: function (item, collectionName) {
				return '/' + item.slug
			}
		})
		paperpress.load()

		var home = _.findWhere(paperpress.items, {type: 'pages', path: '/home'})
		assert.equal( home.slug, 'home' )
		assert.equal( home.path, '/home' )
	})

	it('#paperpress single file items', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var snippet = paperpress.getCollection('snippets')[0]

		assert.deepEqual(snippet, {
			type: 'snippets',
			title: 'header',
			slug: 'header',
			suggestedPath: '/blog/snippets/header',
			content: '<h2 id="this-is-the-header">This is the header</h2>\n'
		})
	})
})

describe('Paperpress invalid items', function () {
	it('#paperpress item with no date', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var invalidItem = _.findWhere(paperpress.items, {slug: 'invalid-date'})
		assert.equal( invalidItem, undefined )
	})

	it('#paperpress item with no title', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var invalidItem = _.findWhere(paperpress.items, {slug: undefined})
		assert.equal( invalidItem, undefined )
	})
})

describe('Paperpress reload', function () {
	it('should load new items', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		assert.equal( _.isArray( articles ), true )
		assert.equal( articles.length, 7 )

		var pages = paperpress.getCollection('pages')
		assert.equal( _.isArray( pages ), true )
		assert.equal( pages.length, 2 )

		var snippets = paperpress.getCollection('snippets')
		assert.equal( _.isArray( snippets ), true )
		assert.equal( snippets.length, 1 )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()

		var newArticles = paperpress.getCollection('articles')
		assert.equal( _.isArray( newArticles ), true )
		assert.equal( newArticles.length, 8 )

		var newPages = paperpress.getCollection('pages')
		assert.equal( _.isArray( newPages ), true )
		assert.equal( newPages.length, 2 )

		var newSnippets = paperpress.getCollection('snippets')
		assert.equal( _.isArray( newSnippets ), true )
		assert.equal( newSnippets.length, 2 )
	})

	it('should update items', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'lucky-seven'})
		assert.equal( article.description, undefined )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()
		var newArticle = _.findWhere(paperpress.items, {type: 'articles', slug: 'lucky-seven'})
		assert.equal( newArticle.description, 'This articles has a description now')
	})

	it('should load new collections', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var shortStories = paperpress.getCollection('short-stories')
		assert.equal( _.isArray( shortStories ), true )
		assert.equal( shortStories.length, 0 )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()

		var newShortStories = paperpress.getCollection('short-stories')
		assert.equal( _.isArray( newShortStories ), true )
		assert.equal( newShortStories.length, 1 )
	})
})

describe('Paperpress feed helper', function () {
	it('feed shoud be an object with title, description, items and a render function', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		var feedDescription = require('./feed-description.json')
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		articles.forEach((item) => {
			item.suggestedUri = '/blog/' + item.slug
		})
		var feed = Paperpress.helpers.createFeed(feedDescription, articles)

		assert.equal(typeof feed, 'object')
		assert.equal(feed.title, feedDescription.title)
		assert.equal(feed.description, feedDescription.description)
		assert.equal(_.isArray(feed.items), true)
		assert.equal(typeof feed.render, 'function')
		assert.equal(feed.items.length, articles.length)
	})

	it('feed item should be equal to article', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		var feedDescription = require('./feed-description.json')
		paperpress.load()
		var articles = paperpress.getCollection('articles')
		articles.forEach((item) => {
			item.suggestedUri = '/blog/' + item.slug
		})
		var feed = Paperpress.helpers.createFeed(feedDescription, articles)
		assert.equal(feed.items[0].title, articles[0].title)
		assert.equal(feed.items[0].link, articles[0].link)
		assert.equal(feed.items[0].date, articles[0].date)
		assert.equal(feed.items[0].content, articles[0].content)
	})

	it('feed should return null when description are undefined', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()
		var feed = Paperpress.helpers.createFeed()
		assert.equal(feed, null)
	})

	it('feed should return null when articles are undefined', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		var feedDescription = require('./feed-description.json')
		paperpress.load()
		var feed = Paperpress.helpers.createFeed(feedDescription)
		assert.equal(feed, null)
	})

	it('feed should return null when feedDescription is invalid ', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()
		var articles = paperpress.getCollection('articles')
		articles.forEach((item) => {
			item.suggestedUri = '/blog/' + item.slug
		})
		var feed = Paperpress.helpers.createFeed({}, articles)
		assert.equal(feed, null)
	})
})
