var fs = require('fs')
var path = require('path')
var Feed = require('feed')
var sm = require('sitemap')

var Remarkable = require('remarkable')
var highlighter = require('highlight.js')
var frontMatter = require('front-matter')

var sluglify = function (str) {
	str = str.replace(/^\s+|\s+$/g, '') // trim
	str = str.toLowerCase()

	// remove accents, swap ñ for n, and other invalid chars
	var invChar = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
	var invCharTo = 'aaaaeeeeiiiioooouuuunc------'

	for (var i = 0, l = invChar.length; i < l; i++) {
		str = str.replace(new RegExp(invChar.charAt(i), 'g'), invCharTo.charAt(i))
	}

	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-') // collapse dashes

	return str
}

var Paperpress = function (config) {
	var self = this
	if (config === undefined) {
		config = {}
	}
	this.baseDirectory = config.baseDirectory || 'static'
	this.uriPrefix = config.uriPrefix
	this.pathBuilder = config.pathBuilder || function (item, collectionName) {
		var path = '/' + collectionName + '/' + item.slug
		if (self.uriPrefix) {
			path = this.uriPrefix + path
		}

		return path
	}

	this.remarkableOptions = config.remarkableOptions || {
		html: true,
		linkify: true,
		highlight: function (code) {
			return highlighter.highlightAuto(code).value
		}
	}

	this.items = []
	this.paths = []

	this._marked = new Remarkable(this.remarkableOptions)
	this._hooks = config.hooks || []
}

/**
**************************************
********** Private Functions *********
**************************************
**/
Paperpress.prototype._getCollections = function () {
	var that = this
	try {
		var collections = fs.readdirSync(this.baseDirectory).filter(function (collection) {
			var path = that.baseDirectory + '/' + collection
			var stats = fs.statSync(path)

			return stats.isDirectory()
		})
		return collections
	} catch (e) {
		console.error('[Paperpress] ERROR - Can\'t read directory:', this.baseDirectory)
		return null
	}
}

Paperpress.prototype._titleToSlug = function (title) {
	return sluglify(title)
}

Paperpress.prototype._directoryToItem = function (directory) {
	var item = JSON.parse(fs.readFileSync(directory.path + '/info.json').toString())

	if (!item.title) {
		console.warn('[Paperpress] item ' + directory.path + ' without title')
		return
	}

	if (!item.date) {
		console.warn('[Paperpress] item ' + directory.path + ' without date')
		return
	}

	item.slug = this._titleToSlug((item.slug === undefined) ? item.title : item.slug)

	item.path = item.path || this.pathBuilder(item, directory.collectionName)
	item.date = new Date(item.date)
	this.paths.push(item.path)

	if (item.contentType === 'html') {
		item.content = fs.readFileSync(directory.path + '/content.html').toString()
	} else {
		var content = fs.readFileSync(directory.path + '/content.md').toString()
		item.content = this._marked.render(content)
	}

	return item
}

Paperpress.prototype._fileToItem = function (file) {
	var fileContent = fs.readFileSync(file.path).toString()
	var fileType = path.extname(file.path)
	var name = file.name.replace(fileType, '')
	var slug = this._titleToSlug(name)

	var item
	if (fileType === '.json') {
		item = JSON.parse(fileContent)
		item.title = item.title || name
		item.slug = item.slug || slug

		if (item.date) {
			item.date = new Date(item.date)
		}
	} else {
		item = {
			title: name,
			slug: slug,
			content: fileContent,
			path: null
		}
	}

	if (frontMatter.test(fileContent)) {
		var contentData = frontMatter(fileContent)
		var dataAttributes = contentData.attributes

		Object.keys(dataAttributes)
			.filter(function (k) { // prevents attribute leaking
				return dataAttributes.hasOwnProperty(k)
			})
			.forEach(function (k) { // merges into item object
				item[k] = dataAttributes[k]
			})

		// Assign parsed content
		item.content = contentData.body

		// If date exists then parse it
		if (dataAttributes.date) {
			item.date = new Date(dataAttributes.date)
		}
	}

	if (!item.date) {
		var stat = fs.statSync(file.path)
		item.date = new Date(stat.mtime)
	}

	// If path was not assigned, then use helper method
	item.path = item.path ? item.path : this.pathBuilder(item, file.collectionName)
	this.paths.push(item.path)

	// Do not render as markdown if file is .html
	if (fileType === '.md') {
		item.content = this._marked.render(item.content)
	}

	return item
}

Paperpress.prototype._getDuplicatePaths = function () {
	var paths = this.paths.slice()
	var duplicatePaths = []

	paths.sort().forEach(function (item, i) {
		if (paths[i + 1] === item) {
			duplicatePaths.push(item)
		}
	})

	return duplicatePaths
}

Paperpress.prototype._loadCollection = function (collectionName) {
	var self = this

	self.items = self.items.filter(function (item) {
		return item.type !== collectionName
	})

	fs.readdirSync(this.baseDirectory + '/' + collectionName).forEach(function (itemName) {
		var path = self.baseDirectory + '/' + collectionName + '/' + itemName
		var stats = fs.statSync(path)

		if (itemName.indexOf('.') === 0) { return }

		var item
		if (stats.isDirectory()) {
			item = self._directoryToItem({
				path: path,
				stats: stats,
				collectionName: collectionName
			})
		} else {
			item = self._fileToItem({
				name: itemName,
				path: path,
				collectionName: collectionName
			})
		}

		if (item) {
			item.type = collectionName
			self._hooks.forEach(function (fn) {
				fn(item)
			})

			self.items.push(item)
		}
	})
}

Paperpress.prototype._sortByDate = function (items) {
	return items.sort(function (a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime() <= 0 ? 1 : -1
	})
}

/**
**************************************
********** Public Functions **********
**************************************
**/
Paperpress.prototype.getCollection = function (collectionName) {
	var collection = this.items.filter(function (item) {
		return item.type === collectionName
	})

	return this._sortByDate(collection)
}

Paperpress.prototype.getCollections = function (collectionsName) {
	var collection = this.items.filter(function (item) {
		return collectionsName.indexOf(item.type) >= 0
	})

	return this._sortByDate(collection)
}

Paperpress.prototype.load = function () {
	var that = this
	var collections = this._getCollections()
	try {
		collections.forEach(function (collection) {
			that._loadCollection(collection)
		})
	} catch (e) {
		console.error('[Paperpress] ERROR on load', e.message)
		return null
	}

	var duplicatePaths = this._getDuplicatePaths()
	if (duplicatePaths.length > 0) {
		console.warn('[Paperpress] Duplicated paths:', duplicatePaths)
	}

	return true
}

Paperpress.prototype.addHook = function (hook) {
	this._hooks.push(hook)
}

/**
**************************************
********** Helpers Functions *********
**************************************
**/
Paperpress.helpers = {}
Paperpress.helpers.createFeed = function (description, items) {
	// Create the Feed instance

	// Eventually it should deprecate link in favor of hostname
	if (description && !description.link) {
		description.link = description.hostname
	}

	try {
		var feed = new Feed(description)
	} catch (e) {
		console.error('[Paperpress] ERROR - Feed. Can\'t create the feed check the description object')
		return null
	}

	// Load the items on the feed
	try {
		items.forEach(function (item) {
			item.link = (description.hostname || description.link) + item.path
			item.date = new Date(item.date)

			feed.addItem(item)
		})
	} catch (e) {
		console.error('[Paperpress] ERROR - Feed. Undefined array for items')
		return null
	}

	// Test if there is no error with the feed render function
	try {
		feed.render()
	} catch (e) {
		console.error('[Paperpress] ERROR - Feed', e)
		return null
	}

	return feed
}

Paperpress.helpers.createSiteMap = function (description, items) {
	// Eventually it should deprecate link in favor of hostname
	if(!description.hostname){
		description.hostname = description.link
	}

	var sitemap = sm.createSitemap({
		hostname: description.hostname,
		cacheTime: 600000
	})

	items.forEach(function (item) {
		sitemap.add({url: item.path, changefreq: 'weekly'})
	})

	return sitemap.toString()
}

module.exports = Paperpress
