const koa = require('koa')
const route = require('koa-route')
const Paperpress = require('../../paperpress').Paperpress
const _ = {
  findWhere: require('lodash.findwhere')
}

const app = koa()
const paperpress = new Paperpress({
  baseDirectory: 'static',
  uriPrefix: '/blog'
})

const feedDescription = require('./feed-description.json')

paperpress.load()
app.use(route.get('/', list))
app.use(route.get('/feed', feed))
app.use(route.get('/post/:slug', show))

/** Route Definitions **/

// Post listing //
function * list (ctx) {
  this.body = yield paperpress.getCollection('articles')
}

// Show post :slug //
function * show (slug) {
  const articles = paperpress.getCollection('articles')
  const article = _.findWhere(articles, {type: 'articles', path: slug})
  if (!article) {
    this.throw(404, 'Post doesn\'t exist')
  }
  this.body = yield article
}

// Blog Feed //
function * feed (ctx) {
  const articles = paperpress.getCollection('articles')
  articles.forEach((item) => {
    item.suggestedUri = '/blog/' + item.slug
  })
  this.type = 'text/xml; charset=utf-8'
  this.body = Paperpress.helpers.createFeed(feedDescription, articles).render('rss-2.0')
}

/** Listen **/
app.listen(3000)
console.log('[koa-paperpress] Listening on port 3000')
