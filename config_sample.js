var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

    // Un-comment line below to simulate production mode
    // env = "production";

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
      redirects: redirects,
      disqus_shortname: ''
  },

  production: {
      env: env,
      root: rootPath,
      db: {
        url : 'mongodb://<username>:<port>/<password>',
        qty: 4
      },
      redirects: redirects,
      disqus_shortname: ''
  }
};

module.exports = config[env];