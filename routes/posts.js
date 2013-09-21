/*
 * GET users listing.
 */
var config = require('../config');
var mongo = require('mongoskin');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

exports.list = function(req, res){
    // Get all options
    var options = {
        'sort'  : { created: -1 },
        'limit' : 10
    };

    db.findItems({}, options, function(err, posts){
        if(err) throw err;
        res.json(200, posts);
    });
};

exports.item = function(req, res){
    // Get item
    db.findOne({
        alias: req.params.alias
    }, function(err, post) {
        if(err) throw err;
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
}