const koa = require('koa')
const route = require('koa-route')
const Paperpress = require('../../paperpress').Paperpress
const _ = {
  findWhere: require('lodash.findwhere')
}

const app = koa()
const paperpress = new Paperpress({
  baseDirectory: 'ddd',
  uriPrefix: '/blog'
})

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
function * feed (next) {
  const articles = paperpress.getCollection('articles')
  articles.forEach((item) => {
    item.suggestedUri = '/blog/' + item.slug
  })
  const feed = Paperpress.helpers.createFeed(require('./feed-description.json'), articles)
  if (feed) {
    this.type = 'text/xml; charset=utf-8'
    this.body = feed.render('rss-2.0')
  } else {
    this.status = 500
    this.body = 'Error loading the feed'
  }
  yield next
}

/** Listen **/
app.listen(3000)
console.log('[koa-paperpress] Listening on port 3000')
