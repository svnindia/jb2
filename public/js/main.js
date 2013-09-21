var App = {
    Models      : {},
    Views       : {},
    Collections : {},
    Router      : {},
    init        : {
        launch : function(data){
            App.init.code(data);
        }
    }
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
        idAttribute : 'alias', // So that mongodb ids match

        defaults: {
            title: 'No title',
            alias: null,
            created: null,
            views: 0,
            content: 'empty',
            contentIntro: 'empty'
        },

        initialize : function(){
            this.bind('change:created', this.formatDate);
            // if( this.get('created') ) this.formatDate();
        },

        formatDate : function(){
            this.set( 'created', App.Helpers.timeAgoFormat( this.get('created') ) );
        }
    });
    
    /*  
      ==========================================================================
        Collection: Posts
      ========================================================================== 
    */
    App.Collections.Posts = BB.Collection.extend({
        url: '/posts',
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
            this.collection.on('reset', this.render, this);
        },

        addOne : function(model){
            var postView = new App.Views.Post({ model: model });
            this.$el.append(postView.render().el);
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
                type: 'PUT'
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
    App.init.code = function(initData){
    
        // Init Collection
        App.Collections.posts = new App.Collections.Posts();
        App.Collections.posts.on('all', function(e){
            console.log(e);
        });

        // Init Collection View
        App.Views.posts = new App.Views.Posts({ collection: App.Collections.posts });
        
        // Init Modal Overlay
        App.Views.modalOverlay = new App.Views.Overlay();

        // Bootstrap
        App.Collections.posts.reset( initData );

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
            var post = new (App.Models.Post.extend({
                url: '/posts/' + alias
            }));
            post.on('all', function(e){
                console.log(e);
            })
            
            // Check if item already in collection
            var found = _.find(  App.Collections.posts.models, function(model){
                return model.get('alias') == alias;
            });

            if(!found){
                post.fetch({
                    success: function(){
                        // Add new post to collection & open
                         App.Collections.posts.add(post);
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