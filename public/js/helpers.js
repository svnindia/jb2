App.Helpers = {
    disqus_config: function() {
      var config = this.disqus_config.params;

      this.page.identifier = config.identifier;
      this.page.url        = config.url;
      this.page.title      = config.title;
    },

    forceRedraw: function(obj) {
      obj.hide();
      obj.each(function() {
          this.offsetHeight;
      });
      obj.show();
    },

    initDisqus: function (config) {
      this.disqus_config.params = config;

      if (enableDisqus.loaded) {
        DISQUS.reset({
          reload: true
        });
      } else {
        (function() {
          var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
          dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();

        enableDisqus.loaded = true;
      }
    }
};

// TODO: Add this stuff to proper above namespace.

var disqus_config = function disqus_config() {
  var config = disqus_config.params;

  this.page.identifier = config.identifier;
  this.page.url        = config.url;
  this.page.title      = config.title;
};

function enableDisqus(config) {
  disqus_config.params = config;
  if (enableDisqus.loaded) {
    DISQUS.reset({
      reload: true
    });
  } else {
    (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();

    enableDisqus.loaded = true;
  }
}


// JS Native Enhancements
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
