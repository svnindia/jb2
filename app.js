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
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.locals.pretty = true;
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
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


// Routes
app.get('/', routes.index);
app.get('/posts', posts.list);
app.get('/posts/:alias', posts.item);
app.put('/posts/inc/:alias', posts.itemInc);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});




