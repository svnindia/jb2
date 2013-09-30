/*
 * GET users listing.
 */
var config = require('../config');
var mongo = require('mongoskin');
var moment = require('moment');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

exports.list = function(req, res){
    // Get all options
    var options = {};
    options.sort = { created: -1 };

    // Pagination
    if(req.query.page){
        var skip = config.qty * (req.query.page -1);
        options.limit = config.qty;
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

    db.findItems(fields, options, function(err, posts){
        if(err) throw err;
        for (var i = 0; i < posts.length; i++) {
            // Format Date
            posts[i].created = moment(posts[i].created).fromNow();
        }
        res.json(200, posts);
    });
};

exports.item = function(req, res){
    // Get item
    db.findOne({
        alias: req.params.alias
    }, function(err, post) {
        if(err) throw err;

        // Format Date
        post.created = moment(post.created).fromNow();

        res.json(200, post);
    });
};

exports.itemInc = function(req, res){
    // Increment View count
    db.update(
        { alias: req.params.alias },
        {
            $inc : { views: 1 }
        }
    );
    res.send("Incremented", 200);
};