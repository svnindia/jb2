var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    port = process.env.PORT || 3000;

    // Un-comment line below to simulate production mode
    // env = "production";


// List of Perminant redirects from my old site.
var redirects = [
  {
    old: '/from-windows-to-mac-dev.html',
    new: '/open/from-windows-to-mac-dev'
  },
  {
    old: '/blog',
    new: '/'
  },
  {
    old: '/resume.html',
    new: '/'
  },
  {
    old: '/contact.html',
    new: '/'
  },
  {
    old: '/moving-to-california.html',
    new: '/open/moving-to-california'
  },
  {
    old: '/responsified-my-website.html',
    new: '/open/responsified-my-website'
  },
  {
    old: '/freeby-juicey-buttons-v1.html',
    new: '/open/freeby-juicey-buttons-v1'
  },
  {
    old: '/from-windows-to-mac-dev.html',
    new: '/open/from-windows-to-mac-dev'
  },
  {
    old: '/tutorial-how-to-add-disqus-to-modx.html',
    new: '/open/tutorial-how-to-add-disqus-to-modx'
  },
  {
    old: '/tutorial-easy-css-animations-with-animate.css.html',
    new: '/open/tutorial-easy-css-animations-with-animate-css'
  },
  {
    old: '/adobes-html5-animation-tool-(teaser).html',
    new: '/open/adobes-html5-animation-tool-(teaser)'
  },
  {
    old: '/launched.html',
    new: '/open/launched'
  },
  {
    old: '/personal',
    new: '/tag/personal'
  }

];

var config = {
  development: {
      env: env,
      root: rootPath,
      port: port,
      db: {
        url : 'mongodb://jose:Kevin007@paulo.mongohq.com:10075/jb2?auto_reconnect=true',
        qty: 4
      },
      redirects: redirects,
      disqus_shortname: 'jb2development'

  },

  production: {
      env: env,
      random: "random",
      port: port,
      root: rootPath,
      db: {
        url : 'mongodb://jose:Kevin007@paulo.mongohq.com:10075/jb2?auto_reconnect=true',
        qty: 4
      },
      redirects: redirects,
      disqus_shortname: 'josebrowne'
  }
};

module.exports = config[env];