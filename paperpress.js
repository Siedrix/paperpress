var fs = require('fs'),
	Feed = require('feed'),
	marked = require('marked'),
	path = require('path'),
	highlighter = require('highlight.js');

marked.setOptions({
	highlight: function (code) {
		return highlighter.highlightAuto(code).value
	}
});

var Paperpress = function (config) {
	var self = this

	this.baseDirectory   = config.baseDirectory || 'static'
	this.uriPrefix   = config.uriPrefix
	this.pathBuilder = config.pathBuilder || function(item, collectionName){
		var suggestedPath = '/' + collectionName +'/' + item.slug;
		if(self.uriPrefix){
			suggestedPath = this.uriPrefix + suggestedPath
		}

		return suggestedPath
	}

	this.items = []
	this._hooks   = config.hooks || []
};

/****************************************/
/********** Private Functions ***********/
/****************************************/
Paperpress.prototype._getCollections = function(){
	try {
		var collections = fs.readdirSync(this.baseDirectory).filter((collection) => {
			var path = this.baseDirectory + '/' + collection,
				stats = fs.statSync(path)

			return stats.isDirectory()
		})
		return collections
	} catch (e) {
		// console.error('\033[31m[Paperpress] ERROR\033[0m - Can\'t read directory:',this.baseDirectory)
	}
}

Paperpress.prototype._titleToSlug = function (title) {
	var slug = title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')

	return slug
}

Paperpress.prototype._directoryToItem = function (directory) {
	var item = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if (item.slug === undefined) {
		item.slug = this._titleToSlug(item.title);
	}

	item.suggestedPath = this.pathBuilder(item, directory.collectionName)

	item.slug = item.path
	item.date = new Date(item.date);

	if(item.contentType === 'html'){
		item.content = fs.readFileSync(directory.path + '/content.html').toString();
	}else{
		var content = fs.readFileSync(directory.path + '/content.md').toString();
		item.content = marked(content);
	}

	return item;
}

Paperpress.prototype._fileToItem = function(file){
	var fileContent = fs.readFileSync(file.path).toString()
	var name = file.name.replace('.md', '')
	var slug = this._titleToSlug(name)

	var item = {
		title: name,
		slug: slug,
	}

	item.suggestedPath = this.pathBuilder(item, file.collectionName)
	item.content = marked(fileContent)

	return item
}

Paperpress.prototype._loadCollection = function (collectionName) {
	var self = this;

	self.items = self.items.filter(function(item){
		return item.type !== collectionName
	})

	fs.readdirSync(this.baseDirectory + '/' + collectionName).forEach(function (itemName) {
		var path  = self.baseDirectory + '/'+ collectionName +'/' + itemName,
			stats = fs.statSync(path);

		if(itemName.indexOf('.') === 0){return;}

		var item
		if(stats.isDirectory()){
			item = self._directoryToItem({
				path  : path,
				stats : stats,
				collectionName : collectionName
			});
		}else{
			item = self._fileToItem({
				name : itemName,
				path : path,
				collectionName : collectionName
			})
		}
		item.type = collectionName
		self._hooks.forEach(function(fn){
			fn(item)
		});

		self.items.push(item)
	})
}

Paperpress.prototype._sortByDate = function (items) {
	return items.sort(function (a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime() <= 0 ? 1 : -1
	})
}

/****************************************/
/********** Public Functions ************/
/****************************************/
Paperpress.prototype.getCollection = function(collectionName) {
	var collection = this.items.filter((item) => {
		return item.type === collectionName
	})

	return this._sortByDate(collection)
}

Paperpress.prototype.getCollections = function(collectionsName) {
	var collection = this.items.filter((item) => {
		return collectionsName.indexOf(item.type) >= 0
	})

	return this._sortByDate(collection)
}

Paperpress.prototype.load = function() {
	var collections = this._getCollections()
	if (collections !== undefined ) {
		collections.forEach((collection) => {
			this._loadCollection(collection)
		})
	}
}

Paperpress.prototype.addHook = function(hook) {
	this._hooks.push(hook)
}
/****************************************/
/********** Helpers Functions ***********/
/****************************************/
Paperpress.helpers = {}
Paperpress.helpers.createFeed = function(description, items){
	// Create the Feed instance
	try {
		var feed = new Feed(description)
	} catch (e) {
		return null
		// console.error('\033[31m[Paperpress] ERROR\033[0m - Feed. Can\'t create the feed check the description object')
	}

	//Load the items on the feed
	if (feed) {
		try {
			items.forEach(function (item) {
				item.link = description.link + item.suggestedPath
				item.date = new Date(item.date)

				feed.addItem(item)
			})
		} catch(e) {
			// console.error('\033[31m[Paperpress] ERROR\033[0m - Feed. Undefined array for items')
			return null
		}
	}

	// Test if there is no error with the feed render function
	try {
		feed.render()
	} catch (e) {
		// console.error('\033[31m[Paperpress] ERROR\033[0m - Feed', e)
		return null
	}

	return feed
}

exports.Paperpress = Paperpress;
