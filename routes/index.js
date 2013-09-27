/*
 * GET home page & include bootstrap data for backbone!
 */
var config = require('../config');
var mongo = require('mongoskin');
var moment = require('moment');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

exports.index = function(req, res){
    var options = {
      'sort'  : { created: -1 },
      'limit' : config.qty,

    };
    db.find({}, options).toArray(function(err, initData){
        for (var i = 0; i < initData.length; i++) {
            // Format Date
            initData[i].created = moment(initData[i].created).fromNow();
        }
        req.app.locals.initData = initData;
        res.render('layout', { title: 'Express' });

    });

};
