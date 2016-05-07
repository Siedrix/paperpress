/* global describe, it */
var _ = require('underscore')
var fs = require('fs')
var assert = require('assert')
var Paperpress = require('../paperpress')

/**
**************************************
**************** SET UP **************
**************************************
**/
var paperpressBaseConfig = {
	baseDirectory: 'test/static',
	uriPrefix: '/blog'
}

console.error = function () {}
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

		it('paperpress should load default baseDirectory when config is undefined', function () {
			var paperpress = new Paperpress()
			assert.equal(typeof paperpress, 'object')
			assert.equal(paperpress.baseDirectory, 'static')
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
			assert.equal( paperpress.items.length, 11 )
		})

		it('paperpress should get collection into items array with out repetition', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress._loadCollection('articles')
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 11 )
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
			assert.equal( paperpress.items.length, 11 )
			assert.equal( paperpress.items[0].hookRunning, true )
			assert.equal( paperpress.items[0].secondHookRunning, true )
		})
	})

	describe('#paperpress.load()', function () {
		it('paperpress should load all collections', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			assert.equal( _.isArray( paperpress.items ), true )
			assert.equal( paperpress.items.length, 15 )
		})
	})

	describe('#paperpress.getCollection()', function () {
		it('paperpress should get collection into items array running the hooks', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			var articles = paperpress.getCollection('articles')
			assert.equal( _.isArray( articles ), true )
			assert.equal( articles.length, 11 )

			var pages = paperpress.getCollection('pages')
			assert.equal( _.isArray( pages ), true )
			assert.equal( pages.length, 2 )

			var snippets = paperpress.getCollection('snippets')
			assert.equal( _.isArray( snippets ), true )
			assert.equal( snippets.length, 2 )
		})
	})

	describe('#paperpress.getCollections()', function () {
		it('paperpress should get collection into items array running the hooks', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			var articlesAndSnippets = paperpress.getCollections(['articles', 'snippets'])
			assert.equal( _.isArray( articlesAndSnippets ), true )
			assert.equal( articlesAndSnippets.length, 13 )

			var pagesAndSnippets = paperpress.getCollections(['pages', 'snippets'])
			assert.equal( _.isArray( pagesAndSnippets ), true )
			assert.equal( pagesAndSnippets.length, 4 )
		})
	})
})

describe('Paperpress items', function () {
	it('#paperpress slugs', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		var stringsToSlug = {
			'OH! YOU PRETTY THINGS!': 'oh-you-pretty-things',
			'¿Is there life on Mars?': 'is-there-life-on-mars',
			'áçéñtósylálétráéÑéÁÇÉNTÓS': 'acentosylaletraeneacentos',
			'If you\'re reading this, you\'ve been in a coma for almost 20 years now. We`re trying a new technique. We don\'t know where this message will end up in your dream, but we hope it works. Please wake up, we miss you.': 'if-youre-reading-this-youve-been-in-a-coma-for-almost-20-years-now-were-trying-a-new-technique-we-dont-know-where-this-message-will-end-up-in-your-dream-but-we-hope-it-works-please-wake-up-we-miss-you',
			'Roses are \u001b[0;31mred\u001b[0m, violets are \u001b[0;34mblue. Hope you enjoy terminal hue': 'roses-are-0-31mred0m-violets-are-0-34mblue-hope-you-enjoy-terminal-hue',
			'But now...\u001b[20Cfor my greatest trick...\u001b[8m': 'but-now20cfor-my-greatest-trick8m',
			'We.Could-Be-Heroes... Just_For One...Day!': 'wecould-be-heroes-just-for-oneday'
		}
		for (var str in stringsToSlug) {
			assert.equal(paperpress._titleToSlug(str), stringsToSlug[str])
		}
	})

	it('#paperpress items urls', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static'
		})
		paperpress.load()
		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-four-comes-five'})

		assert.equal( article.slug, 'after-four-comes-five' )
		assert.equal( article.path, '/articles/after-four-comes-five' )
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

		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-four-comes-five'})

		assert.equal( article.slug, 'after-four-comes-five' )
		assert.equal( article.path, '/blog/articles/after-four-comes-five' )
	})

	it('#paperpress items urls using builder', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/static',
			pathBuilder: function (item, collectionName) {
				return '/' + item.slug
			}
		})
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type: 'articles', slug: 'after-four-comes-five'})
		assert.equal( article.slug, 'after-four-comes-five' )
		assert.equal( article.path, '/after-four-comes-five' )
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

	it('#paperpress snippet markdown file', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var snippet = _.findWhere(paperpress.items, {type: 'snippets', slug: 'header'})
		assert.equal(snippet.date instanceof Date, true)
		delete snippet.date

		assert.deepEqual(snippet, {
			type: 'snippets',
			title: 'header',
			slug: 'header',
			path: '/blog/snippets/header',
			content: '<h2>This is the header</h2>\n'
		})
	})

	it('#paperpress snippet html file', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var snippet = _.findWhere(paperpress.items, {type: 'snippets', slug: 'title-section-with-htmltest'})
		assert.equal(snippet.date instanceof Date, true)
		delete snippet.date

		assert.deepEqual(snippet, {
			type: 'snippets',
			title: 'title section-with _html.test',
			slug: 'title-section-with-htmltest',
			path: '/blog/snippets/title-section-with-htmltest',
			content: '<div id="title"><h1>Ground Control to Major Tom</h1></div>\n'
		})
	})

	it('#paperpress item with front matter', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var frontMatterItem = _.findWhere(paperpress.items, {type: 'articles', slug: 'life-on-mars'})
		assert.equal(frontMatterItem.date instanceof Date, true)
		delete frontMatterItem.date

		assert.deepEqual(frontMatterItem, {
			title: 'Is there life on Mars?',
			slug: 'life-on-mars',
			content: '<p><strong>Content</strong></p>\n',
			path: '/blog/articles/life-on-mars',
			type: 'articles'
		})
	})

	it('#paperpress item with front matter in html', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var frontMatterItem = _.findWhere(paperpress.items, {type: 'articles', path: '/ashes-to-ashes'})
		assert.equal(frontMatterItem.date instanceof Date, true)
		delete frontMatterItem.date

		assert.deepEqual(frontMatterItem, {
			title: 'frontmatter-missing-attr-test',
			slug: 'frontmatter-missing-attr-test',
			content: '<h1>Dust to dust</h1>\n\n',
			path: '/ashes-to-ashes',
			video: 'https://www.youtube.com/watch?v=CMThz7eQ6K0',
			type: 'articles'
		})
	})

	it('#paperpress item from json file', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var jsonItem = _.findWhere(paperpress.items, {type: 'articles', slug: 'item-as-json'})

		assert.equal(jsonItem.date instanceof Date, true)
		delete jsonItem.date

		assert.deepEqual(jsonItem, {
			title: 'item as json',
			slug: 'item-as-json',
			description: 'This is a fast article',
			path: '/blog/articles/item-as-json',
			type: 'articles'
		})
	})

	it('#paperpress item from json file with date', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var jsonItem = _.findWhere(paperpress.items, {type: 'articles', slug: 'item-as-json-with-date'})

		assert.equal(jsonItem.date instanceof Date, true)
		delete jsonItem.date

		assert.deepEqual(jsonItem, {
			title: 'item-as-json-with-date',
			slug: 'item-as-json-with-date',
			description: 'This is a faster article',
			path: '/blog/articles/item-as-json-with-date',
			type: 'articles'
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

	it('#paperpress duplicate paths', function () {
		var paperpress = new Paperpress({
			baseDirectory: 'test/duplicate-paths',
			uriPrefix: '/blog'
		})
		var duplicatePaths = [ '/blog/articles/article', '/blog/pages/home', '/blog/snippets/header' ]
		paperpress.load()
		assert.equal(_.isArray(paperpress._getDuplicatePaths()), true)
		assert.equal(_.isEqual(paperpress._getDuplicatePaths(), duplicatePaths), true)
	})
})

describe('Paperpress reload', function () {
	it('should load new items', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		assert.equal( _.isArray( articles ), true )
		assert.equal( articles.length, 11 )

		var pages = paperpress.getCollection('pages')
		assert.equal( _.isArray( pages ), true )
		assert.equal( pages.length, 2 )

		var snippets = paperpress.getCollection('snippets')
		assert.equal( _.isArray( snippets ), true )
		assert.equal( snippets.length, 2 )

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

describe('Paperpress markdown render', function () {
	it('markdown rendering should be equal to the rendered file', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()
		var articles = paperpress.getCollection('articles')
		var article = _.findWhere(articles, {type: 'articles', slug: 'githubs-markup'})
		var content = fs.readFileSync('./test/static/articles/markup/test-content-rendered.html').toString()
		assert.equal(typeof paperpress, 'object')
		assert.equal(_.isArray(articles), true)
		assert.equal(typeof article, 'object')
		assert.equal(article.content, content)
	})

	it('syntax highlighting on markdown', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()
		var articles = paperpress.getCollection('articles')
		var article = _.findWhere(articles, {type: 'articles', slug: 'markdown-test'})
		var content = fs.readFileSync('./test/static/articles/markdown-test/test-content-rendered.html').toString()
		assert.equal(typeof paperpress, 'object')
		assert.equal(_.isArray(articles), true)
		assert.equal(typeof article, 'object')
		assert.equal(article.content, content)
	})
})

describe('Paperpress feed helper', function () {
	it('feed shoud be an object with title, description, items and a render function', function () {
		var paperpress = new Paperpress(paperpressBaseConfig)
		var feedDescription = require('./feed-description.json')
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		articles.forEach(function (item) {
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
		articles.forEach(function (item) {
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
		articles.forEach(function (item) {
			item.suggestedUri = '/blog/' + item.slug
		})
		var feed = Paperpress.helpers.createFeed({}, articles)
		assert.equal(feed, null)
	})
})
