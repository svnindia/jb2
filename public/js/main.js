var App = {
    Models      : {},
    Views       : {},
    Collections : {},
    Router      : {},
    Behavior    : {}
};
var eve = _.extend({}, Backbone.Events);
var BB = Backbone;
// (function(exports, $, BB, _){
    "use strict";

    App.template = function(template){
        return _.template( $('#' + template).html() );
    };

    /*
      ==========================================================================
        Router
      ==========================================================================
    */
    App.Router = BB.Router.extend({
        routes : {
            '': 'index',
            'open/:alias': 'open',
            '*default': 'default'
        },

        index : function(){
            eve.trigger('post:home');
        },

        open : function(alias) {
            eve.trigger('post:open', alias);
        },

        default : function(){
            console.log('Route: Default! 404?');
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
            this.collection.on('reset', this.render, this);
            this.collection.on('add', this.addOne, this);
            this.collection.on('search:success', this.render, this);

            // Listen for scroll events on body
            this.bindEvents();

            // Listen for search submit
            $('.searchForm').on('submit', function(e){ that.onSearch(e, this); });
        },

        onScroll: function(){
            var that = this;
            var body = $('body');
            var height = $('body').outerHeight() + 20;
            if(
                !this.collection.end && /* Not at end of list */
                !this.collection.getting && /* Not waiting for response */
                $(window).scrollTop() + $(window).height() >= $(document).height() - 20 /* is at bottom */
              ){
                NProgress.start();
                this.collection.getting = true;
                this.collection.page += 1;
                this.collection.fetch({
                    remove: false,
                    data: {page: this.collection.page},
                    success: function(collection, response){
                        if( _.isEmpty(response) ){ that.onEnd(); }
                        that.collection.getting = false;
                        NProgress.done();
                    }
                });
            }
        },

        bindEvents : function(){ $(window).on('scroll.collection', this.onScroll ); },

        unbindEvents : function(){ $(window).off('scroll.collection'); },

        onEnd : function(){
            this.collection.end = true;
            App.Views.posts.unbindEvents();
            // TODO: Add visual indicator of end list
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
            if( !this.collection.contains(model) ){

                this.collection.add(model);
            }
            var postView = new App.Views.Post({ model: model });
            this.$el.append(postView.render().el);
        },


        render : function(){
            this.$el.empty();
            this.collection.each(function(post){
                this.addOne(post);
            }, this);
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
            'click a.button': 'open',
            'click .title'  : 'open'
        },

        className: 'clear',

        template: App.template('articleTemplate'),

        open: function(e){
            e && e.preventDefault();
            var alias = $(e.currentTarget).attr('data-alias');
            App.Router.Main.navigate('open/' + alias);
            eve.trigger("post:open", alias);

            // Increment View Count
            BB.ajax({
                url: '/posts/inc/' + alias,
                type: 'PUT',
                success: function(){
                    var post = App.Collections.posts.get(alias);
                    post.set( 'views', post.get('views') + 1);
                }
            });
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

        template : App.template('postModalTemplate'),

        render: function(){
            this.$el.html( $('<' + this.tagName + '>').append(this.template( this.model.toJSON() ) ) );
            eve.trigger('modal:show');

            // Add Disqus
            var config = {
                identifier: this.model.get('disqusId') || this.model.get('alias'),
                title: this.model.get('title'),
                url: location.href
            };

           enableDisqus(config);
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
            'click .x-button' : 'close'
        },

        close : function(){
            eve.trigger('modal:close');
            App.Router.Main.navigate('', true);
        }
    });

    /*
      ==========================================================================
        View Reference: Sidebar
      ==========================================================================
    */
    App.Views.Sidebar = BB.View.extend({
        el: '#sidebar',
        events: {

        },

        show: function(){
            $('.container').addClass("showSidebar");
        },

        hide: function(){
            $('.container').removeClass("showSidebar");
        }
    });

    App.Views.Header = BB.View.extend({
        el: 'header',
        events: {
            'click .sidebar-btn': 'toggleSidebar'
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
            // posts.fetch();
            eve.trigger('modal:close');
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
                    success: function(post, response){
                        openPost(post);
                        NProgress.done();
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
                // Unbind Collection Scroll Eventhandler
                App.Views.posts.unbindEvents();

                //Cache scroll location
                App.Behavior.scrollCache = $(window).scrollTop();
                $(window).scrollTop(0);

                // Container for Modal Element
                var modalView = new App.Views.Modal({model: post});
                modalView.render();
            }

        });

        eve.on('modal:show', function(){
            $('body').addClass('md-mode');
        });

        eve.on('modal:close', function(){
            $('body').removeClass('md-mode');
            $(window).scrollTop(App.Behavior.scrollCache);
            App.Views.posts.bindEvents();
        });

        // Init Router
        App.Router.Main = new App.Router;
        BB.history.start();
    };


// })(this, jQuery, Backbone, _);