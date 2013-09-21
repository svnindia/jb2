var App = {
    Models      : {},
    Views       : {},
    Collections : {},
    Router      : {}
};
var eve = _.extend({}, Backbone.Events);
var BB = Backbone;
// (function(exports, $, BB, _){
    "use strict";

    App.template = function(template){
        return _.template( $('#' + template).html() );
    };

    /**
     * --------------- Declarations:
     */

    // Router
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

    // Post Model 
    App.Models.Post = BB.Model.extend({
        idAttribute : '_id', // So that mongodb ids match

        defaults: {
            title: 'No title',
            alias: null,
            created: null,
            views: 0,
            content: 'empty',
            contentIntro: 'empty'
        },

        initialize : function(){
            // Format Date
            this.set( 'created', App.Helpers.timeAgoFormat( this.get('created') ) );
        }
    });
    
    // Collection
    App.Collections.Posts = BB.Collection.extend({
        url: '/posts',
        model: App.Models.Post
    });

    // Collection View
    App.Views.Posts = BB.View.extend({
        el: '.posts',

        initialize: function(){
            eve.on('post:open', this.openPost, this);
            this.collection.on('sync', this.render, this);
        },

        addOne : function(model){
            console.log('Add one');
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

    // View
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
        },

        render: function(){
            this.$el.html( this.template(this.model.toJSON()) );
            return this;
        }
    });

    App.Views.Modal = BB.View.extend({
        tagName: 'article',

        el: '.md-content',

        template : App.template('postModalTemplate'),

        render: function(){
            this.$el.html( $('<' + this.tagName + '>').append(this.template( this.model.toJSON() ) ) );
            eve.trigger('modal:show');
        }
    });

    App.Views.Overlay = BB.View.extend({
        el: '.md-overlay',
        events : {
            'click': 'close'
        },

        close : function(){
            eve.trigger('modal:close');
            App.Router.Main.navigate('', true);
        }
    });
    /**
     * --------------- Initializations:
     */
    
    // Init Collection
    var posts = new App.Collections.Posts();
    // Init Collection View
    var postsView = new App.Views.Posts({ collection: posts });
    // Init Modal Overlay
    var modalOverlay = new App.Views.Overlay();

    // posts.on('all', function(event){
    //     console.log('Collection Event Fired: ' + event);
    // });
    // postsView.on('all', function(event){
    //     console.log('CollectionView Event Fired: ' + event);
    // });
    var modalView = null;

    eve.on('post:home', function(){
        posts.fetch();
        eve.trigger('modal:close');
    });

    eve.on('post:open', function(alias){
        console.log('EVE: post:open triggered');

        var post = new (BB.Model.extend({
            url: '/posts/' + alias
        }) );
        
        // Check if item already in collection
        var found = _.find( posts.models, function(model){
            return model.get('alias') == alias;
        });

        if(!found){
            post.fetch({
                success: function(){
                    // Add new post to collection & open
                    posts.add(post);
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
            modalView = new App.Views.Modal({model: post});
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


// })(this, jQuery, Backbone, _);