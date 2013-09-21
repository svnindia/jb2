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


// db.on('error', console.error.bind(console, 'connection error:') );
// db.once('open', function callback (){
//   // console.log( util.inspect(this, {colors: true}) );
//   console.log('Connected to : ' + this.host);
// });

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


// Routes
app.get('/', routes.index);
app.get('/posts', posts.list);
app.get('/posts/:alias', posts.item);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
