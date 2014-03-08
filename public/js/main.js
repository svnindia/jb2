var eve = _.extend({}, Backbone.Events);
var BB = Backbone;
(function(exports, $, BB, _){
    "use strict";

    /*
      ==========================================================================
        Router
      ==========================================================================
    */
    App.Router = BB.Router.extend({
        routes : {
            '': 'index',
            'open/:alias': 'open',
            'tag/:tag':'tagSearch',
            '*default': 'default'
        },

        index : function(){
            eve.trigger('post:home');
        },

        open : function(alias) {
            eve.trigger('post:open', alias);
        },

        tagSearch : function(tag){
            eve.trigger('tag:search', tag);
        },

        default : function(){
            NProgress.done();
            console.log('Route: Default! 404?');
        },

        track: function(){
            var url = Backbone.history.getFragment();

            // Add a slash if neccesary
            if (!/^\//.test(url)) url = '/' + url;
            ga('send', {
                'hitType': 'pageview',
                'page': url
            });
        }
    });

    /*
      ==========================================================================
        Model: Post
      ==========================================================================
    */
    App.Models.Post = BB.Model.extend({
        idAttribute : 'alias',

        url: function(){
            return "/posts/" + this.id;
        },

        defaults: {
            title: 'No title',
            alias: null,
            created: null,
            views: 0,
            content: 'empty',
            contentIntro: 'empty'
        }
    });

    /*
      ==========================================================================
        Collection: Posts
      ==========================================================================
    */
    App.Collections.Posts = BB.Collection.extend({
        getting: false,
        page : 1,
        end: false,
        url: function(){
            return '/posts';
        },
        model: App.Models.Post
    });

    /*
      ==========================================================================
        View: Posts Collection
      ==========================================================================
    */
    App.Views.Posts = BB.View.extend({
        el: '.posts',

        initialize: function(){
            _.bindAll( this, 'onScroll' );
            var that = this;
            this.collection.on('reset', this.onBootstrapLoaded, this);
            this.collection.on('add', this.addOne, this);
            this.collection.on('search:success', this.onSearchSuccess, this);
            this.collection.on('reset sync', App.Helpers.initDisqusCount);
            this.collection.on('sync', this.slideIn, this);

            this.bindEvents(); // Listen for scroll events on body

            // Listen for search submit
            $('.searchForm').on('submit', function(e){ that.onSearch(e, this); });

        },

        onSearchSuccess: function(){
            this.render();
            this.slideIn();
        },

        onScroll: function(){
            if( !App.Behavior.allItemsReceived ) this.infiniteScroll();
            this.slideIn();
        },

        bindEvents : function(){
            if(this.collection.end) return;
            $(window).on('scroll.collection touchmove.collection', this.onScroll );
        },

        unbindEvents : function(){ $(window).off('.collection'); },

        slideIn: function(mode, response, options){
            var isTagSearch = options && options.data.tag; /* Hacky? maybe */
            var offScreen = this.$el.find('article:not(.in, .already-in)');

            if(offScreen.length === 0 ) this.onEnd(); /* Try triggering end state */
            offScreen.each( function(i, el){
                var $el = $(el);
                if( $el.isOnScreen() || isTagSearch ) $el.addClass('in');
            });
        },

        infiniteScroll: function(){
            // Infinite Sroll
            var that = this;
            var body = $('body');
            var height = $('body').outerHeight();
            if(
                !this.collection.end && /* Not at end of list */
                !this.collection.getting && /* Not waiting for response */
                $(window).scrollTop() + $(window).height() >= $(document).height() - 400 /* is at bottom */
              )
            {
                NProgress.start();
                this.collection.getting = true;
                this.collection.page += 1;
                this.collection.fetch({
                    remove: false,
                    data: {page: this.collection.page},
                    success: function(collection, response){
                        if( _.isEmpty(response) ){ App.Behavior.allItemsReceived = true; }
                        that.collection.getting = false;
                        NProgress.done();
                    }
                });
            }
        },

        onBootstrapLoaded: function(){
            this.render();

            // Dont slide in already visible bootstrap articles
            this.$el.find('article').each( function(i, el){
                var $el = $(el);
                if( $el.isOnScreen() ) $el.addClass('already-in');
            });
        },

        onEnd : function(){
            if(this.collection.getting) return; /* Never trigger end while fetching */
            this.collection.end = true;
            this.unbindEvents();

            this.$el.append( App.Helpers.Template('collectionEnd') );
            ga('send', 'event', 'scrollEvents', 'Scrolled to end');
        },

        onSearch: function(e, form){
            e && e.preventDefault();
            var query = $(form).find('input').val().trim();
            if(!query) return;
            this.collection.end = true;
            NProgress.start();
            this.collection.fetch({
                data: {search: query},
                success: function(collection, response){
                    collection.trigger('search:success');
                    NProgress.done();
                }
            });
        },

        addOne : function(model){
            if(!model) return;

            var postView = new App.Views.Post({ model: model });
            this.$el.append(postView.render().el);
        },


        render : function(){
            this.$el.empty();
            this.collection.each(function(post){
                this.addOne(post);
            }, this);

            $(window).scrollTop(0); /* sometimes browser "forgets" smh */
            return this;
        }

    });

    /*
      ==========================================================================
        View: Post
      ==========================================================================
    */
    App.Views.Post = BB.View.extend({
        tagName: 'article',

        events: {
            // 'click a.btn': 'open',
            'click .title'  : 'open'
        },

        className: 'clear',

        template: App.Helpers.Template('articleTemplate'),

        open: function(e){
            e && e.preventDefault();
            var alias = $(e.currentTarget).attr('data-alias');
            App.Router.main.navigate('open/' + alias);
            eve.trigger("post:open", alias);

        },

        render: function(){
            this.$el.html( this.template(this.model.toJSON()) );
            return this;
        }
    });

    /*
      ==========================================================================
        View: Modal Reader
      ==========================================================================
    */
    App.Views.Modal = BB.View.extend({
        tagName: 'article',

        el: '.md-content',

        template : App.Helpers.Template('postModalTemplate'),

        initialize: function(){
            _.bindAll(this, 'onScroll');
            this.bindEvents();
        },

        bindEvents: function(){
            $(document).on('scroll.modalReader', this.onScroll);
            $(document).on('keyup.modalReader', this.onKeyPress);
        },

        unbindEvents: function(){ $(document).off('.modalReader'); },

        onScroll: function(){
            if( $('hr.endRuler').isOnScreen(500) ){
                this.unbindEvents();
                this.fadeInResources();
            }
        },

        onKeyPress: function(e){
            var tagType = e.target.tagName.toLowerCase();
            if(tagType == 'input' || tagType == 'textarea') return; /* Respect form inputs */
            var keyEscape = 27;

            // Close modal if Esc Key
            if (e.keyCode === keyEscape) eve.trigger('modal:close');
        },

        fadeInResources: function(){

        },

        render: function(){
            this.$el.html( $('<' + this.tagName + '>').append(this.template( this.model.toJSON() ) ) );
            eve.trigger('modal:show');
        },

        renderDisqus: function(){
            if(App.Behavior.disqusRequestSend ) return; // Prevent multiple requests while Disqus is fetching
            var config = {
                identifier: this.model.get('disqusId') || this.model.get('alias'),
                title: this.model.get('title'),
                url: location.href
            };

            App.Behavior.disqusRequestSend = true;
            App.Helpers.initDisqus(config);
        },

        renderShare: function(){
            App.Helpers.initShare();
        }
    });

    /*
      ==========================================================================
        View Reference: Overlay
      ==========================================================================
    */
    App.Views.Overlay = BB.View.extend({
        el: '.md-overlay',
        events : {
            'click': 'close',
        },

        initialize: function(){
            $('.md-overlay-x').on('click', this.close);
        },

        close : function(){
            eve.trigger('modal:close');
        }
    });

    /*
      ==========================================================================
        View Reference: Sidebar
      ==========================================================================
    */
    App.Views.Sidebar = BB.View.extend({
        el: '#sidebar',

        initialize: function(){
            this.showActiveState();
            this.on('nav:active', this.showActiveState);
        },

        show: function(){
            $('.container').addClass("showSidebar");
        },

        hide: function(){
            $('.container').removeClass("showSidebar");
        },

        showActiveState: function(tag){
            if(!tag) tag = 'all';

            // Show active nav item
            this.$el.find('.active').removeClass('active');
            this.$el.find('.' + tag).addClass('active');
        }
    });

    /*
      ==========================================================================
        View Reference: Header
      ==========================================================================
    */
    App.Views.Header = BB.View.extend({
        el: 'header',
        events: {
            'click .sidebar-btn': 'toggleSidebar'
        },

        updateTitleText: function(val){
            this.$el.find('.text').text(' :: ' + val );
            App.Helpers.forceRedraw(this.$el.find('.text')); // ow well! :-/
        },

        toggleSidebar: function(e){
            e && e.preventDefault();
            if( $('.container').hasClass("showSidebar") ){
                App.Views.sidebar.hide();
            }else{
                App.Views.sidebar.show();
            }
        }
    });

    /*
      ==========================================================================
        Initializations
      ==========================================================================
    */
    App.init = function(initData){

        // Init Collection
        App.Collections.posts = new App.Collections.Posts();

        // Init Collection View
        App.Views.posts = new App.Views.Posts({ collection: App.Collections.posts });

        // Bootstrap
        App.Collections.posts.reset( initData );

        // Init Modal Overlay
        App.Views.modalOverlay = new App.Views.Overlay();

        // Init Sidebar
        App.Views.sidebar = new App.Views.Sidebar();

        // Init Header
        App.Views.header = new App.Views.Header();

        /*
          ==========================================================================
            Global Event Listeners (eve)
          ==========================================================================
        */
        eve.on('post:home', function(){
            eve.trigger('modal:close');
            App.Router.main.track();
        });

        eve.on('post:open', function(alias){
            NProgress.start();
            // Check if item already in collection
            var found = _.find(  App.Collections.posts.models, function(model){
                return model.get('alias') == alias;
            });

            if(!found){
                var single = new App.Models.Post().set('alias', alias);

                single.fetch({
                    success: function(post, response, options){
                        if( typeof response !== "undefined"){
                            openPost(post);
                            NProgress.done();
                        }else{
                            App.Router.main.default();
                        }
                    },
                    error: function(){
                        console.log('failed');
                    }
                });
            }else{
                openPost(found);
                NProgress.done();
            }

            function openPost(post){
                // Unbind Collection Events
                App.Views.posts.unbindEvents();

                // Update Meta
                App.Helpers.updateMetaInfo(post);

                //Cache scroll location
                App.Behavior.scrollCache = $(window).scrollTop();
                $(window).scrollTop(0);

                // Container for Modal Element
                App.Views.modal = new App.Views.Modal({model: post});
                App.Views.modal.render();

                App.Views.modal.renderShare();
                App.Views.modal.renderDisqus();

                // Increment View Count
                BB.ajax({
                    url: '/posts/inc/' + alias,
                    type: 'PUT',
                    success: function(){
                        var post = App.Collections.posts.get(alias);
                        post.set( 'views', post.get('views') + 1);
                    }
                });

                App.Router.main.track();
            }

        });

        eve.on('modal:show', function(){
            $('body').addClass('md-mode');
            App.Helpers.initDisqusCount();
            $(window).trigger('scroll'); // Check if Comments already visible
        });

        eve.on('modal:close', function(){
            if(! $('body').hasClass('md-mode') ) return;

            App.Router.main.navigate('');

            App.Views.modal.unbindEvents();

            $('body').removeClass('md-mode');

            App.Behavior.disqusRequestSend = false; // Prevents loading disqus multiple times
            App.Behavior.shareInitSend = false; // same as above but for shareThis

            $(window).scrollTop(App.Behavior.scrollCache); // Take em back to where they were on the page!

            App.Helpers.updateMetaInfo();

            App.Views.posts.bindEvents();

            App.Router.main.track();
        });

        eve.on('tag:search', function(tag){
            App.Helpers.removeClassesStartingWith('body', 'tag-');
            App.Views.sidebar.hide();

            //Add tag
            $('body').addClass('tag-' + tag);

            NProgress.start();
            App.Collections.posts.fetch({
                data: {tag: tag},
                success: function(collection, response){
                    App.Collections.posts.trigger('search:success');

                    // Show active state:
                    App.Views.sidebar.trigger('nav:active', tag);
                    App.Views.header.updateTitleText(tag);
                    NProgress.done();

                    App.Router.main.track();
                }
            });
        });

        // Init Router
        App.Router.main = new App.Router;
        BB.history.start({ pushState: true, root: App.Config.Root });

        // Rescue 300ms tap delay on mobile
        $(function() {
            FastClick.attach(document.body);
        });
    };

})(this, jQuery, Backbone, _);