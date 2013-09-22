/**
 * Module dependencies.
 */

var express  = require('express')
  , config   = require('./config')
  , routes   = require('./routes')
  , posts    = require('./routes/posts')
  , http     = require('http')
  , path     = require('path')
  , pretty   = require('prettyjson')
  , util     = require('util');

var mongo = require('mongoskin');
var db = mongo.db( config.db.url, {safe: true} ).collection('posts');

var options = {
  'sort'  : { created: -1 },
  'limit' : 5
};
db.find({}, options).toArray(function(err, initData){
  
  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
    app.locals.initData = initData;
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

  // Routes
  app.get('/', routes.index);
  app.get('/posts', posts.list);
  app.get('/posts/:alias', posts.item);
  app.put('/posts/inc/:alias', posts.itemInc);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });

});




