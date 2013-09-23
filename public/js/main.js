var App = {
    Models      : {},
    Views       : {},
    Collections : {},
    Router      : {},
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
            var that = this;
            this.collection.on('reset', this.render, this);
            this.collection.on('add', this.addOne, this);
            
            // Listen for scroll events on body
            $(window).on('scroll', function(){
                that.onScroll();
            });
        },

        onScroll: function(){
            var that = this;
            var body = $('body');
            var height = $('body').outerHeight() + 20;
            if( 
                !this.collection.end && /* Not at end of list */
                !this.collection.getting && /* Not waiting for response */
                $(window).scrollTop() + $(window).height() == $(document).height() /* is at bottom */
              ){
                this.collection.getting = true;                
                this.collection.page += 1;
                this.collection.fetch({
                    remove: false,
                    data: {page: this.collection.page},
                    success: function(collection, response){
                        if( _.isEmpty(response) ){ that.onEnd(); }
                        that.collection.getting = false;
                    }
                });
            }
        },

        onEnd : function(){
            this.collection.end = true;
            // TODO: Add visual indicator of end list
        },

        addOne : function(model){
            if(!model) return;
            if( !this.collection.contains(model) ){
                this.collection.add(model);
            }
            this.formatDate(model);
            var postView = new App.Views.Post({ model: model });
            this.$el.append(postView.render().el);
        },

        formatDate : function(model){
            model.set( 'created', App.Helpers.timeAgoFormat( model.get('created') ) );
        },

        render : function(){
            console.log('Collection: rendering');
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
            'click a.button': 'open'
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
        Initializations
      ========================================================================== 
    */
    App.init = function(initData){
    
        // Init Collection
        App.Collections.posts = new App.Collections.Posts();
        // Init Collection View
        App.Views.posts = new App.Views.Posts({ collection: App.Collections.posts });
        App.Collections.posts.on('all', function(e){console.log(e);})
        // Bootstrap
        App.Collections.posts.reset( initData );
        
        // Init Modal Overlay
        App.Views.modalOverlay = new App.Views.Overlay();


        /*  
          ==========================================================================
            Global Event Listeners
          ========================================================================== 
        */
        eve.on('post:home', function(){
            // posts.fetch();
            eve.trigger('modal:close');
        });

        eve.on('post:open', function(alias){
            
            // Check if item already in collection
            var found = _.find(  App.Collections.posts.models, function(model){
                return model.get('alias') == alias;
            });

            if(!found){
                var post = new (App.Models.Post.extend({
                    url: '/posts/' + alias
                }));

                post.fetch({
                    success: function(){
                        // Add new post to collection & open
                        App.Views.posts.addOne(post);
                        openPost(post);
                    },
                    error: function(){
                        console.log('failed');
                    }
                });
            }else{
                openPost(found);
            }

            function openPost(post){
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
        });

        // Init Router
        App.Router.Main = new App.Router;
        BB.history.start();
    };


// })(this, jQuery, Backbone, _);