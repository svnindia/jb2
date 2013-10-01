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

    initDisqusCount: function(){
      if(this.loaded){
        DISQUSWIDGETS.getCount();
      }else{
        (function () {
          var s = document.createElement('script'); s.async = true;
          s.type = 'text/javascript';
          s.src = 'http://' + disqus_shortname + '.disqus.com/count.js';
          (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
        }());
      }
    },

    initDisqus: function (config){
      disqus_config.params = config;
      if (this.loaded) {
        DISQUS.reset({
          reload: true
        });
      } else {
        (function() {
          var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
          dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();

        this.loaded = true;
      }
    }
};

// Needs to be global :-/
var disqus_config = function disqus_config() {
  var config = disqus_config.params;

  this.page.identifier = config.identifier | null;
  this.page.url        = config.url | null ;
  this.page.title      = config.title | null;
};


/*
  ==========================================================================
    JS Native Enhancements
  ==========================================================================
*/
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

/*
  ==========================================================================
    jQuery Native Enhancements
  ==========================================================================
*/
$.fn.isOnScreen = function(){

    var win = $(window);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

