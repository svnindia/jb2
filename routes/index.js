/*
 * GET home page & include bootstrap data for backbone!
 */
var config = require('../config');
var mongo = require('mongoskin');
var moment = require('moment');
var helpers = require('../helpers');
var db = mongo.db( config.db.url, {safe: false} ).collection('posts');

exports.index = function(req, res){
    var options = {
      'sort'  : { created: -1 },
      'limit' : config.db.qty,

    };

    // Only Show Unpublished articles in development
    var fields = {};
    if(config.env !== "development"){
        fields = {
            'published': { $ne: false }
        };
    }

    db.find(fields, options).toArray(function(err, initData){
        for (var i = 0; i < initData.length; i++) {
            // Format Date
            initData[i].created = moment(initData[i].created).fromNow();
            initData[i].views   = helpers.addCommas(initData[i].views);
        }
        req.app.locals.initData = initData;
        req.app.locals.app = req.app;
        res.render('index', { config: config });
    });
};
