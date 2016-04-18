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
	this.baseDirectory   = config.baseDirectory || 'static';
	this.uriPrefix   = config.uriPrefix;

	this.items = [];

	this._hooks   = config.hooks || [];
};

/****************************************/
/********** Private Functions ***********/
/****************************************/
Paperpress.prototype._getCollections = function(){
	var collections = fs.readdirSync(this.baseDirectory).filter((collection) => {
		var path = this.baseDirectory + '/' + collection,
			stats = fs.statSync(path)

		return stats.isDirectory()
	})

	return collections
}

Paperpress.prototype._titleToSlug = function (title) {
	var slug = title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')

	return slug
}

Paperpress.prototype._directoryToItem = function (directory) {
	var item = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString());

	if(!item.path){
		item.path = this._titleToSlug(item.title);
	}

	item.sugestedUri = '/' + directory.collectionName +'/' + item.path;
	if(this.uriPrefix){
		item.sugestedUri = this.uriPrefix + item.sugestedUri
	}

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

	var sugestedUri = '/' + file.collectionName +'/' + slug
	if(this.uriPrefix){
		sugestedUri = this.uriPrefix + sugestedUri
	}	

	return {
		title: name,
		slug: slug,
		sugestedUri: sugestedUri,
		content: marked(fileContent)
	}
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
Paperpress.prototype.load = function() {
	var self = this

	var collections = this._getCollections()

	collections.forEach((collection) => {
		this._loadCollection(collection)
	})
}

Paperpress.prototype.addHook = function(hook) {
	this._hooks.push(hook)
}
/****************************************/
/********** Helpers Functions ***********/
/****************************************/
Paperpress.helpers = {}
Paperpress.helpers.createFeed = function(description, items){
	var feed = new Feed(description)

	items.forEach(function (item) {
		item.link = description.link + item.sugestedUri
		item.date = new Date(item.date)

		feed.addItem(item)
	});

	return feed
}

exports.Paperpress = Paperpress;
