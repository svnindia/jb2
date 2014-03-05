/*
 * GET users listing.
 */
var config = require('../config');
var mongo = require('mongoskin');
var moment = require('moment');
var helpers = require('../helpers');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

exports.list = function(req, res){
    // Get all options
    var options = {};
    options.sort = { created: -1 };

    // Pagination
    if(req.query.page){
        var skip = config.db.qty * (req.query.page -1);
        options.limit = config.db.qty;
        options.skip = skip;
    }

    // Fields
    var fields = {};


    // Search
    if(req.query.search){
        var q = new RegExp('.*' + req.query.search +'.*', 'i');
        fields.$or = [ { content: q }, { title: q } ];
    }

    // Tag Search
    if(req.query.tag){
        fields = { tags: req.query.tag };
    }

    if(config.env !== "development"){
        fields.published =  { $ne: false };
    }

    db.findItems(fields, options, function(err, posts){
        if(!err){
            for (var i = 0; i < posts.length; i++) {
                // Format Date
                posts[i].created = moment(posts[i].created).fromNow();
                posts[i].views = helpers.addCommas(posts[i].views);

            }
            res.json(200, posts);
        }else{
            console.log('we the best');
            res.json(200, {error: err.message});
        }
    });
};

exports.item = function(req, res){
    // Get item
    db.findOne({
        alias: req.params.alias
    }, function(err, post) {
        if(!err){
            if(post !== null){
                post.created = moment(post.created).fromNow();
                post.views   = helpers.addCommas(post.views);
                res.json(200, post);
            }else{
                res.send('That post could not be found', 204);
            }
        }else{
            res.json(400, {error: err.message});
        }

    });
};

exports.itemInc = function(req, res){
    // Increment View count
    db.update(
        { alias: req.params.alias },
        {
            $inc : { views: 1 }
        },
        { w: 0 }
    );
    res.send("Incremented", 200);
};