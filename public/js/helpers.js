App.Helpers = {
    timeAgoFormat: function( _date ){
        _date = new Date(_date);

        var seconds = Math.floor( ( new Date().getTime() ) - _date ) / 1000;

        function checkPlurality(interval){
            return interval > 1 ? 's': '';
        }

        var interval = Math.floor( seconds / 31536000 );
        if(interval >= 1){
            return interval + " year" + checkPlurality(interval);
        }
        interval = Math.floor( seconds / 2592000 );
        if(interval >= 1){
            return interval + " month" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 86400 );
        if(interval >= 1){
            return interval + " day" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 3600);
        if(interval >= 1){
            return interval + " hour" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 60);
        if(interval >= 1){
            return interval + " minute" + checkPlurality(interval);
        }
        return Math.floor(seconds) + " second" + checkPlurality(interval);

    },

    disqus_config: function() {
      var config = this.disqus_config.params;

      this.page.identifier = config.identifier;
      this.page.url        = config.url;
      this.page.title      = config.title;
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
    },

    XinitDisqus: function( _id, _url, _title ){

        var disqus_config = function disqus_config() {
            var config = disqus_config.params;

            this.page.identifier = _id;
            this.page.url        = _url;
            this.page.title      = _title;
        };

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

var disqus_config = function disqus_config() {
  var config = disqus_config.params;

  this.page.identifier = config.identifier;
  this.page.url        = config.url;
  this.page.title      = config.title;
};

function enableDisqus(config) {
  disqus_config.params = config;
  console.log(config);
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
