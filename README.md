# Paperpress [![Travis Build](https://api.travis-ci.org/Siedrix/paperpress.svg)](https://travis-ci.org/Siedrix/paperpress) [![Coverage Status](https://coveralls.io/repos/github/rogr/paperpress/badge.svg?branch=v1.0-coveralls)](https://coveralls.io/github/rogr/paperpress?branch=v1.0-coveralls)

This library will allow you to have a blog or static pages in markdown on top of any application with express, koa or any other Node.js http server. For feature request, contact @[Siedrix](https://twitter.com/Siedrix) on twitter or github.

## Install
```
npm install paperpress
```

## Usage
Create a Paperpress instance
```js
var Paperpress = require('paperpress')
var paperpress = new Paperpress({
  baseDirectory: 'test/static'
})
paperpress.load()
```

Use `baseDirectory` to specify where are your Paperpress files and `uriPrefix` to specify the path on your application where you want you Paperpress to be deliver.

- **Deprecated `paperpress.attach` in favor of decouple from express**
- **Deprecated paperpress themes in favor of decouple from `swig`**

For more information check the [examples](/examples).

## Directory structure
Then create a directory for you Paperpress files, each directory will be treated as a independent collection. Suggested directories:

- **/articles** this folder will contain all the blog posts of the application.
- **/pages** this folder will contain all the pages of the application.
- **/snippers** this folder will contain all the snippets of the application, usually single files.

## Collection item as directory
- **info.json** This file needs to have title, description and date. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

## Collection item as file
- **[ITEM_NAME].md** This file will be converted to a collection item with title, slug, sugestedUri and content.

## Bugs
- Render links correctly
