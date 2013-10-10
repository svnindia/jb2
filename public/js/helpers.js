App.Helpers = {
    Template: function(template){
      return _.template( $('#' + template).html() );
    },

    removeClassesStartingWith: function(selector, prefix){
      $el = $(selector);
      var classes = $el.attr("class").split(" ").filter(function(item) {
          return item.indexOf(prefix) === -1 ? item : "";
      });
      $el.attr("class", classes.join(" "));
    },

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
      if( typeof(DISQUSWIDGETS) !== 'undefined' ){
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
    },

    initAddThis: function(){
      window.addthis_share = {
        url_transforms : {
          shorten: {
            twitter: 'bitly'
          }
        },
        shorteners : {
          bitly : {}
        }
      };
      var script = 'http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4df7aa5120a0fd91&domready=1';
      if (window.addthis) {
        addthis.toolbox('.addthis_toolbox');
      }
      $.getScript(script);
    },

    updateMetaInfo: function(model){
      // Defaults
      var title = 'Blog - My online Playground'
        , description = 'Web Dev, Seminole living in Silicon Valley. Checkout my blog!';

      if(model){
        title       = model.get('title');
        description = model.get('contentIntro');
      }

      $(document).attr('title', title);
      $('meta[name=description]').attr('content', description);
      // $('meta[name=og:title]').attr('content', title);
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
$.fn.isOnScreen = function(offsetBottom){
    var win = $(window);

    if(!offsetBottom) offsetBottom = 0;
    var viewport = {
        top : win.scrollTop() + offsetBottom,
        left : win.scrollLeft()
    };

    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

