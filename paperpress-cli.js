#!/usr/bin/env node
var fs = require('fs')
var chalk = require('chalk')
var inquirer = require('inquirer')
var Paperpress = require('./paperpress')

console.log('Hi, welcome to Paperpress')

var baseDirectory = 'test/static'

var paperpress = new Paperpress({
	baseDirectory: baseDirectory
})

var createNewItem = function (collection, item) {
	var newItem = { title: item, slug: paperpress._titleToSlug(item) }

	fs.mkdir(baseDirectory + '/' + collection, function (e) {
		if (!e || e.code === 'EEXIST') {
			console.log('Item Created: ', collection, newItem)
		} else {
			console.error(chalk.yellow('Error creating collection:'), collection)
		}
	})
}

var collections = paperpress._getCollections()
collections.push(new inquirer.Separator())
collections.push('+ Create a new collection')

var newitemQuestions = [
	{
		type: 'list',
		name: 'collection',
		message: 'What type of item you desire to create?',
		choices: collections,
		filter: function (val) {
			return collections.indexOf(val)
		}
	}, {
		type: 'input',
		name: 'newCollection',
		message: 'Write the name of the new collection',
		when: function (answers) {
			return answers.collection === (collections.length - 1)
		},
		validate: function (val) {
			if (val === '') {
				return 'Collection name can\'t be blank'
			}
			return (collections.indexOf(val) > -1) ? 'Collection already exists' : true
		},
		filter: function (val) {
			return paperpress._titleToSlug(val)
		}
	}, {
		type: 'input',
		name: 'newItem',
		message: 'Write the name of the new item',
		validate: function (val) {
			if (val === '') {
				return 'Item name can\'t be blank'
			}
			return true
		}
	}
]

inquirer.prompt(newitemQuestions).then(function (answer) {
	var collection = (!answer.newCollection) ? collections[answer.collection] : answer.newCollection
	var item = answer.newItem
	createNewItem(collection, item)
})
