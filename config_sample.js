var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

// List of Perminant redirects from my old site.
var redirects = [
  {
    old: '/some-old-url.html',
    new: '/open/some-new-url'
  }
];

var config = {
  development: {
      env: env,
      root: rootPath,
      port: 3000,
      db: {
        url : 'mongodb://<username>:<port>/<password>',
        qty: 4
      },
      redirects: redirects
  },

  production: {
      env: env,
      root: rootPath,
      db: {
        url : 'mongodb://<username>:<port>/<password>',
        qty: 4
      },
      redirects: redirects
  }
};

module.exports = config[env];