var assert = require('assert'),
	Paperpress = require('../paperpress').Paperpress,
	_ = require('underscore');


/****************************************/
/**************** SET UP ****************/
/****************************************/
var paperpressBaseConfig = {
	baseDirectory : 'test/static',
	uriPrefix  : '/blog'
};


/****************************************/
/**************** TESTS *****************/
/****************************************/
describe('Paperpress', function(){
	describe('Init paperpress', function(){
		it('Paperpress shoud be a function', function(){
			assert.equal(typeof Paperpress, 'function');
		});

		it('paperpress shoud be an object with articles, pages and other config elements', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress, 'object');

			assert.equal(_.isArray(paperpress.items) , true);
			assert.equal(paperpress.baseDirectory, 'test/static');
		});

		it('paperpress should have the next set of private function', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress._getCollections, 'function');
			assert.equal(typeof paperpress._titleToSlug, 'function');
			assert.equal(typeof paperpress._sortByDate, 'function');
			assert.equal(typeof paperpress._directoryToItem, 'function');
			assert.equal(typeof paperpress._fileToItem, 'function');
			assert.equal(typeof paperpress._loadCollection, 'function');
		});

		it('paperpress should have the next set of public function', function () {
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal(typeof paperpress.getCollection, 'function');
			assert.equal(typeof paperpress.load, 'function');
			assert.equal(typeof paperpress.addHook, 'function');
		});
	});

	describe('#paperpress.hooks()', function(){
		it('paperpress should add hook', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			assert.equal( _.isArray( paperpress._hooks ) , true );
			assert.equal( paperpress._hooks.length , 0 );

			paperpress.addHook(function(){});

			assert.equal( _.isArray( paperpress._hooks ) , true );
			assert.equal( paperpress._hooks.length , 1 );
		});
	});

	describe('#paperpress._getCollections()', function(){
		it('paperpress should get main folders', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			var collections = paperpress._getCollections()

			assert.equal( _.isArray( collections ) , true );
			assert.equal( collections.length , 3 );
			assert.deepEqual( collections, [ 'articles', 'pages', 'snippets' ])
		});
	});

	describe('#paperpress._loadCollection()', function(){
		it('paperpress should get collection into items array', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ) , true );
			assert.equal( paperpress.items.length , 7 );
		});

		it('paperpress should get collection into items array with out repetition', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress._loadCollection('articles')
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ) , true )
			assert.equal( paperpress.items.length , 7 )
		})

		it('paperpress should get collection into items array running the hooks', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.addHook(function(item){
				item.hookRunning = true
			})
			paperpress.addHook(function(item){
				item.secondHookRunning = true
			})			
			paperpress._loadCollection('articles')

			assert.equal( _.isArray( paperpress.items ) , true )
			assert.equal( paperpress.items.length , 7 )
			assert.equal( paperpress.items[0].hookRunning , true )
			assert.equal( paperpress.items[0].secondHookRunning , true )
		})
	})

	describe('#paperpress.load()', function(){
		it('paperpress should load all collections', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			assert.equal( _.isArray( paperpress.items ) , true )
			assert.equal( paperpress.items.length , 9 )
		})
	})

	describe('#paperpress.getCollection()', function(){
		it('paperpress should get collection into items array running the hooks', function(){
			var paperpress = new Paperpress(paperpressBaseConfig)
			paperpress.load()

			var articles = paperpress.getCollection('articles')
			assert.equal( _.isArray( articles ) , true )
			assert.equal( articles.length , 7 )

			var pages = paperpress.getCollection('pages')
			assert.equal( _.isArray( pages ) , true )
			assert.equal( pages.length , 1 )

			var snippets = paperpress.getCollection('snippets')
			assert.equal( _.isArray( snippets ) , true )
			assert.equal( snippets.length , 1 )
		})
	})
})

describe('Paperpress items', function(){
	it('#paperpress items urls', function(){
		var paperpress= new Paperpress({
			baseDirectory : 'test/static'
		})
		paperpress.load()
		var article = _.findWhere(paperpress.items, {type:'articles', slug: 'after-five-comes-six'})

		assert.equal( article.slug , 'after-five-comes-six' )
		assert.equal( article.sugestedUri , '/articles/after-five-comes-six' )
	})

	it('#paperpress items urls with prefix', function(){
		var paperpress= new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type:'articles', slug: 'after-five-comes-six'})

		assert.equal( article.slug , 'after-five-comes-six' )
		assert.equal( article.sugestedUri , '/blog/articles/after-five-comes-six' )
	})

	it('#paperpress single file items', function(){
		paperpress= new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var snippet = paperpress.getCollection('snippets')[0]

		assert.deepEqual(snippet, {
			type: 'snippets',
			title: 'header',
			slug: "header",
			sugestedUri: "/blog/snippets/header",
  			content: '<h2 id="this-is-the-header">This is the header</h2>\n'
		})
	})
})

describe('Paperpress reload', function(){
	it('should load new items', function(){
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		assert.equal( _.isArray( articles ) , true )
		assert.equal( articles.length , 7 )

		var pages = paperpress.getCollection('pages')
		assert.equal( _.isArray( pages ) , true )
		assert.equal( pages.length , 1 )

		var snippets = paperpress.getCollection('snippets')
		assert.equal( _.isArray( snippets ) , true )
		assert.equal( snippets.length , 1 )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()

		var articles = paperpress.getCollection('articles')
		assert.equal( _.isArray( articles ) , true )
		assert.equal( articles.length , 8 )

		var pages = paperpress.getCollection('pages')
		assert.equal( _.isArray( pages ) , true )
		assert.equal( pages.length , 2 )

		var snippets = paperpress.getCollection('snippets')
		assert.equal( _.isArray( snippets ) , true )
		assert.equal( snippets.length , 2 )
	})

	it('should update items', function(){
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var article = _.findWhere(paperpress.items, {type:'articles', slug: 'lucky-seven'})
		assert.equal( article.description , undefined )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()
		var article = _.findWhere(paperpress.items, {type:'articles', slug: 'lucky-seven'})
		assert.equal( article.description , 'This articles has a description now')
	})

	it('should load new collections', function(){
		var paperpress = new Paperpress(paperpressBaseConfig)
		paperpress.load()

		var shortStories = paperpress.getCollection('short-stories')
		assert.equal( _.isArray( shortStories ) , true )
		assert.equal( shortStories.length , 0 )

		paperpress.baseDirectory = 'test/reload'
		paperpress.load()

		var shortStories = paperpress.getCollection('short-stories')
		assert.equal( _.isArray( shortStories ) , true )
		assert.equal( shortStories.length , 1 )
	})
})

describe('Paperpress helpers', function(){})
