# [Paperpress](https://github.com/Siedrix/paperpress)

[![Build Status](https://travis-ci.org/Siedrix/paperpress.svg?branch=master)](https://travis-ci.org/Siedrix/paperpress)
[![Coverage Status](https://coveralls.io/repos/github/Siedrix/paperpress/badge.svg?branch=master)](https://coveralls.io/github/Siedrix/paperpress?branch=master)
[![Dependency Status](https://david-dm.org/Siedrix/paperpress.svg)](https://david-dm.org/Siedrix/paperpress)
[![NPM version](https://img.shields.io/npm/v/paperpress.svg)](https://www.npmjs.org/package/paperpress)

> Paperpress is a static pages generator for Nodejs.

[![NPM](https://nodei.co/npm/paperpress.png?downloads=true&stars=true)](https://nodei.co/npm/paperpress/)

This library will allow you to have a blog or static pages in markdown/html on top of any application with express, koa or any other Node.js http server.

For feature request, contact @[Siedrix](http://siedrix.com) on [twitter](https://twitter.com/Siedrix) or [github](https://github.com/Siedrix/paperpress/issues/new).

#### TL;DR

Paperpress will convert a directory structure of markdown files into items that you can use in your application. This items will be sorted in collections.

## Install
```
npm install paperpress
```

## Basic usage
Create a Paperpress instance
```js
var Paperpress = require('paperpress')

var paperpress = new Paperpress({
  baseDirectory: 'static'
})

paperpress.load()
```

Use `baseDirectory` to specify where are your Paperpress files. Default value is `static`

Then you can use the items in a express app like this:
```js
app.get('/blog', function (req, res) {
  var articles = paperpress.getCollection('articles')

  res.render({articles:articles})
})
```

For more information check the [examples](/examples).

**Warning:** Load function is a sync function.

### Markdown parser

Paperpress use [`Remarkable`](https://github.com/jonschlinkert/remarkable) to parse the markdown files. You can use `remarkableOptions` to specify your custom [options](https://github.com/jonschlinkert/remarkable#options).

 ```js
 var Paperpress = require('paperpress')

 var paperpress = new Paperpress({
   remarkableOptions: {/* Your Remarkable options */}
 })
 ```

 The default value is:

 ```js
 {
   html: true,
   linkify: true,
   highlight: function (code) {
     return highlighter.highlightAuto(code).value
   }
 }
 ```

# Paperpress structure

Paperpress has 3 concepts: Collections, Items and Hooks.

## Collections

This are folders located directly under the `baseDirectory` and help organice our items in diferent groups.

Suggested directories:

- **/articles** this folder will contain all the blog posts of the application.
- **/pages** this folder will contain all the pages of the application.
- **/snippers** this folder will contain all the snippets of the application, usually single files.

## Items

Inside each of your collection folders you can have 2 diferent types of items, the once based on a directory structure and the once based on a single markdown file.

### Items as directory
- **info.json** This file needs to have title and date.
- **content.md** This is the main content of the article, it should be written in mark up.

### Items as file
- **[ITEM_NAME].md** This file will be converted into an item with title, slug, path and  content.

The reason to have a the directory style is to allow more configuration, since you can add any atributes that you want to the info.json file and to modify a path or slug in a particular way.

## Hooks

You can declare hooks to modify the items after they are loaded.
```js
var paperpress = new Paperpress({})

paperpress.addHook(function (item) {
  item.loadDate = new Date()
})
```

## Useful snippets for paperpress

##### Find all items in a collection
```js
var articles = paperpress.getCollection('articles')
```

##### Find all items in multiple collections
```js
var pagesAndSnippets = paperpress.getCollections(['pages', 'snippets'])
```

##### Find one item in paperpress
```js
var items = paperpress.items.find(function(item){
  return item.path === '/home'
})
```

## Collaborators

- [Rogr](https://github.com/rogr)
- [Markotom](https://github.com/markotom)


### [License](LICENSE)
Released under the [MIT license](LICENSE).
