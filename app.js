/**
 * Module dependencies.
 */

var express  = require('express')
  , config   = require('./config')
  , routes   = require('./routes')
  , posts    = require('./routes/posts')
  , http     = require('http')
  , path     = require('path')
  , util     = require('util');

var mongo = require('mongoskin');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

var app = express();
app.locals.moment = require('moment');
app.configure(function(){
  app.set('port', config.port || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(require('prerender-node').set('prerenderToken', 's2HH8vbEZ9xsuygC6efN'));
  app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  console.log('Dev Mode!');
  app.use(require('prerender-node').set('prerenderServiceUrl', 'http://localhost.com:3001'));
  app.locals.pretty = true;
  app.use(express.errorHandler());
});

// Handle redirects
for (var i = 0; i < config.redirects.length; i++) {
  (function(index){
    app.get(config.redirects[index].old, function(req, res){
      res.redirect(301, config.redirects[index].new);
    });
  }(i));
}

// API Routes
app.get('/posts', posts.list);
app.get('/posts/:alias', posts.item);
app.put('/posts/inc/:alias', posts.itemInc);

// Index Route
app.get('/*', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});




