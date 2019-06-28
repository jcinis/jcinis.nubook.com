// ERROR HANDLER :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

var Error = function(options){
    if(options.message) {
        console.log(options.message);
    }
}


// NUBOOK OBJECT :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

var Nubook = {
    Views: {},
    Models: {},
    Collections: {},
    Controllers: {},
    Helpers: {},
    data: {
        published_ids: [],
        options:{ username:'' },
        blogmode: false
    },
    controller: false,
    theme: false,
    init: function(options) {
        var rent = this;
        
        // bootstrapped data coming in
        this.data.categories = options.categories;
        this.data.pages = options.pages;
        this.data.options = options.options;
        this.theme = options.theme;
        
        // replace published ids in blog mode
        if(Nubook.data.options.get('navigation') == 'blog') {
            this.data.blogmode = true;
            this.data.published_ids = [];
            this.data.pages.each(function(page){
                rent.data.published_ids.push(page.id);
            });
            
            this.data.categories.each(function(category){
                var published_ids = [];
                rent.data.pages.each(function(page){
                    if(page.get('category') == category.id){
                        published_ids.push(page.id);
                    };
                });
                category.set({'published_ids': published_ids });
            });
        }
        
        // start the controller
        this.controller = new Nubook.Controllers.Site({'theme':this.theme});
        Backbone.history.start();
    },
    
    acceptOptions: function(options){
        if(this.controller) {
            if(this.controller.framework){
                this.controller.framework.model = options;
                this.controller.framework.render();
            }
        }
    }
};


// NUBOOK CONTROLLERS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Controllers.Site = Backbone.Router.extend({
    
    routes : {
        ""               : "index",
        "/"              : "index",
        "/subscribe"     : "subscribe",
        "/sitemap"       : "sitemap",
        "/:category"     : "category",
        "/:category/"    : "category",
        "/:category/:id" : "page",
        "page-:id"       : "page_id_only",
        "category-:id"   : "category_id_only"
    },
    
    initialize: function(options){
        this.framework = new options.theme({model:Nubook.data.options});
        
        try {
            
            // trigger parent that child is loaded for customization
            if(parent && parent.document && parent.Customize && parent.Customize.childLoaded) {
                parent.Customize.childLoaded(Nubook.data.options);
            }
            
        } catch(err) {
            // do nothing with error.
        }
    },
    
    index: function(){
        this.setCategory('');
        var page = Nubook.data.pages.get(Nubook.data.published_ids[0]);
        this.framework.page(page);
    },
    
    current: false,
    page: function(category,id) {
        this.setCategory(category);
        var page = Nubook.data.pages.get(id);
        if(!page) window.location = "#/";
        this.current = page.id;
        this.framework.page(page);
    },
    
    currentCategory: false,
    setCategory: function(slug){
        var category = false;
        if(slug) category = Nubook.data.categories.getBySlug(slug);
        this.currentCategory = category;
        return this.currentCategory;
    },
    
    category: function(slug) {
        if(!this.setCategory(slug)) window.location = "#/";
        this.framework.category(this.currentCategory);
    },
        
    sitemap: function() {
        if(this.current == false) {
            this.index();
        }
        this.framework.sitemap();
    },
    
    subscribe_view: undefined,
    subscribe: function(){
        if(!this.current) this.index();
        if(this.subscribe_view){
            this.subscribe_view.el.remove();
            delete this.subscribe_view;
        }
        
        this.subscribe_view = new Nubook.Views.Subscribe();
        this.subscribe_view.show();
    }
});


// NUBOOK MODELS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Models.Options = Backbone.Model.extend({});

Nubook.Models.Category = Backbone.Model.extend({
    initialize: function(){
        // cache all published ids
        Nubook.data.published_ids = Nubook.data.published_ids.concat(this.get('published_ids'));
    }
});

Nubook.Models.Page = Backbone.Model.extend({
    
    getCategory: function() {
        if(!this.category) {
            this.category = Nubook.data.categories.get(this.get('category'));
        }
        return this.category;
    },
    
    getUrl: function(){
        if(Nubook.data.blogmode) {
            var categorySlug = Nubook.controller.currentCategory ? this.getCategory().get('slug') : false;
            return '' + (categorySlug ? categorySlug : '-') + '/' + this.id;            
        } else {
            var categorySlug = this.getCategory().get('slug');
            return '' + (categorySlug ? categorySlug : '-') + '/' + this.id;
        }
    },
    
    getRender: function(callback){
        if(this.get('render')){
            if(callback) callback(this.get('render'));      
        } else {
            var rent = this;
            $.ajax({
                'url':'/ajax/renders/' + rent.get('id'),
                'success': function(render){
                    rent.set({render:render});
                    if(callback) callback(render);
                },
                'error': function(){
                    new Error({ message:'There was an error loading render "'+rent.id+'"'});
                }
            });
        }
    },
    
    getPagination: function(){
        return this.collection.getPagination(this);
    },
    
    getNext: function(){
        return this.collection.getNext(this);
    },
    
    getPrevious: function(){
        return this.collection.getPrevious(this);
    }    
});


// NUBOOK COLLECTIONS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Collections.Categories = Backbone.Collection.extend({
    model: Nubook.Models.Category,
    getBySlug: function(slug){
        var found = false;
        this.each(function(item){
            if(item.get('slug') == slug) found = item;
        });
        return found;
    }
});


Nubook.Collections.Pages = Backbone.Collection.extend({
    model: Nubook.Models.Page,
    getIndex: function(page){
        return _.indexOf(Nubook.data.published_ids, page.id);
    },
    
    getPagination: function(page){
        
        // cache pagination
        if(Nubook.data.blogmode) {
            if(Nubook.controller.currentCategory) {
                if(page.get('pagination')) return page.get('pagination');
            } else {
                if(page.get('blog_pagination')) return page.get('blog_pagination');
            }
        } else {
            if(page.get('pagination')) return page.get('pagination');
        }
        
        if(!Nubook.data.options) return false;
        var rtn = false;
        switch(Nubook.data.options.get('navigation')){
            
            case 'book':
                rtn = {};
                var category = page.getCategory();
                
                rtn['index'] = _.indexOf(category.get('published_ids'), page.id);
                rtn['count'] = category.get('published_ids').length;
                
                var rootIndex = _.indexOf(Nubook.data.published_ids, page.id);
                rtn['next'] = (rootIndex === -1 || rootIndex+1 == Nubook.data.published_ids.length) ? false : Nubook.data.published_ids[rootIndex+1];
                rtn['previous'] = (rootIndex === -1 || rootIndex === 0 ) ? false : Nubook.data.published_ids[rootIndex-1];
                
                break;
            case 'website':
                rtn = {};
                var category = page.getCategory();
                
                rtn['index'] = _.indexOf(category.get('published_ids'), page.id);
                rtn['count'] = category.get('published_ids').length;
                rtn['next'] = rtn.index == rtn.count-1 ? false : category.get('published_ids')[rtn.index+1];
                rtn['previous'] = rtn.index == 0 ? false : category.get('published_ids')[rtn.index-1];
                
                break;
            case 'blog':
                
                rtn = {};
                var category = Nubook.controller.currentCategory;
                if(category) {
                    rtn['index'] = _.indexOf(category.get('published_ids'), page.id);
                    rtn['count'] = category.get('published_ids').length;
                    rtn['next'] = rtn.index == rtn.count-1 ? false : category.get('published_ids')[rtn.index+1];
                    rtn['previous'] = rtn.index == 0 ? false : category.get('published_ids')[rtn.index-1];
                } else {
                    var rootIndex = _.indexOf(Nubook.data.published_ids, page.id);
                    rtn['index'] = rootIndex;
                    rtn['count'] = Nubook.data.published_ids.length;
                    rtn['next'] = (rootIndex === -1 || rootIndex+1 == Nubook.data.published_ids.length) ? false : Nubook.data.published_ids[rootIndex+1];
                    rtn['previous'] = (rootIndex === -1 || rootIndex === 0 ) ? false : Nubook.data.published_ids[rootIndex-1];
                }
                
                break;
            default:
                rtn = {};                
        }
        
        // save pagination
        if(Nubook.data.blogmode) {
            if(Nubook.controller.currentCategory) {
                page.set({'pagination':rtn});
            } else {
                page.set({'blog_pagination':rtn});
            }
        } else {
            page.set({'pagination':rtn});        
        }
        
        return rtn;
    },
    
    getNext: function(page){
        return this.getPagination(page)['next'];
    },
    
    getPrevious: function(page){
        return this.getPagination(page)['previous'];
    }
});


// NUBOOK VIEWS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Views.Theme = Backbone.View.extend({
    
    el:$('body'),
    
    model: {}, // Nubook.Models.Options
    
    initialize: function(){
        this.model = this.options.model;
        this.render();
    },
    
    /**
     * Called by controller to render a page.
     * This should utilize the Nubook.Views.Page view
     * 
     * @param page Nubook.Models.Page
     * @returns this
     **/
    page: function(page) {
        return this;
    },
    
    category: function(category) {
        return this;
    },
    
    sitemap: function(){
        return this;
    },
    
    render: function(){
        return this;
    }
});

Nubook.Views.SiteMap = Backbone.View.extend({
    
    tagName:"div",
    className:"sitemap",
    id:"sitemap",
    
    initialize: function() {
        this.render();
    },
    
    makeItem: function(page) {
        var div = $('<div class="item" />');
        div.append($('<a />').attr('href','#/'+page.getUrl()).append($("<img />").attr('border','0').attr('src',page.get('thumbnail'))));
        return div;
    },
    
    render: function() {
        var rent = this;
        if(Nubook.Data.published_ids.length > 0) {
            var track = $('<div class="track" />');
            $.each(Nubook.data.published_ids,function(i,id){
                track.append(rent.makeItem(Nubook.data.pages.get(id)));
            });
            track.append($('<div class="clear"/>'));
        } else {
            new Error({message:'No pages were found'});
        }
        
        $(this.el).append(track);
        $('#sitemap').remove();
        $('#stage').after(this.el);
        $('#stage').hide();
        
        return this;
    }
});

Nubook.Views.Page = Backbone.View.extend({
    
    tagName:"div",
    className:"page-view",
    
    ready: undefined,
    load: undefined,
    
    initialize: function() {
        this.model = this.options.model;
        this.ready = this.options.ready;
        this.load = this.options.load;

        this.el = $(this.el);
    },
    
    queue: {
        images:[],
        fonts:[]
    },
    
    queueImages: function(elImages){
        var rent = this;
        $(elImages).each(function(i,img){
            rent.queue.images.push(img);
        });
        return this.queue.images.length;
    },
        
    runQueue: function(){
        var rent = this;
        
        // LOAD IMAGES
        if(rent.queue.images.length > 0) {
            
            $.each(rent.queue.images,function(i,img){
                $(img).one('load',function() {
                    rent.queue.images = $.grep(rent.queue.images, function(item) {
                        return item != img;
                    });
                    rent.checkQueueComplete();
                }).each(function() {
                    if(this.complete) $(this).load();
                });
            })
            
        } else {
            rent.checkQueueComplete();
        }
    },
    
    checkQueueComplete: function(){
        if(this.queue.images.length == 0) this.onLoad();
    },
    
    onReady: function(){
        this.el.addClass('loading');
        if(this.ready) this.ready(this);
    },
    
    onLoad: function(){
        this.el.removeClass('loading');
        if(this.load) this.load(this);
    },
    
    render: function(complete){
        var rent = this;
        this.model.getRender(function(render){
            rent.el.html(render);
            
            // Render Page Links
            $.each($('a[href^="#page-"]',rent.el),function(i,item){
                var pg = Nubook.data.pages.get($(item).attr('href').split('-').pop());
                if(pg) $(item).attr('href','#/'+pg.getUrl());
            });
            
            // Render Category Links
            $.each($('a[href^="#category-"]',rent.el),function(i,item){
                var cat = Nubook.data.categories.get($(item).attr('href').split('-').pop());
                if(cat) $(item).attr('href','#/'+cat.get('slug'));
            });
            
            // Render Next-Page Links
            var nextAnchors = $('a[href="#next-page"]',rent.el);
            if(nextAnchors.length) {
                var nextPage = Nubook.data.pages.get(rent.model.getNext());
                if(nextPage) {
                    $.each(nextAnchors,function(i,item){
                        $(item).attr('href','#/'+nextPage.getUrl());
                    });
                }
            }

            // Render Previous-Page Links
            var previousAnchors = $('a[href="#previous-page"]',rent.el);
            if(previousAnchors.length) {
                var previousPage = Nubook.data.pages.get(rent.model.getPrevious());
                if(previousPage) {
                    $.each(previousAnchors,function(i,item){
                        $(item).attr('href','#/'+previousPage.getUrl());
                    });
                }
            }
            
            rent.onReady();
            // handle image loading
            rent.queueImages($(".mwrap img, .graphic img", rent.el));
            rent.runQueue();
            
            if(complete) complete(rent);
        });
        return this;
    }
});


Nubook.Views.Subscribe = Backbone.View.extend({
    
    className: 'subscribe-popup',
    
    events: {
        'click .hider':'hide',
        'click a.subscribe-button':'submit',
        'focus input[name=email]':'focusEmail',
        'blur input[name=email]':'blurEmail',
        'submit form':'submit'
    },
    
    initialize: function(){
        this.el = $(this.el);
        this.el.data('view',this);
        this.render();
    },
    
    render: function(){
        var html = '<a class="hider"></a><div class="inner"><div class="subscribe-top"></div><div class="subscribe-middle"><div class="subscribe-content"><form method="post" name="subscribe" action="?subscribe=true"><div class="subscribe-form"><a href="#" class="subscribe-button">Subscribe</a><input type="text" class="input-text" name="email" value="" /><div class="clear"></div></div><div class="error">This is a test error.</div><div class="thank-you">Thank You!</div></form></div></div><div class="subscribe-bottom"></div></div>';
        this.el.html(html);
        this.blurEmail();
        return this;
    },
    
    error: function(msg){
        var rent = this;
        this.$('.error').text(msg);
        this.$('.subscribe-middle').animate({'height':'73px'},'fast');
        rent.$('.error').fadeIn('slow');
    },
    
    hideError: function(){
        var rent = this;
        this.$('.subscribe-middle').animate({'height':'53px'},'fast');
        rent.$('.error').fadeOut('slow', function(){
            rent.$('.error').text('');
        });
    },
    
    thankYou: function(event){
        var rent = this;
        this.hideError();
        this.$('.error').hide();
        this.$('.subscribe-form').hide();
        this.$('.thank-you').fadeIn('fast').delay(2000).fadeIn(10,function(){
            rent.hide();
        });
        if(event) event.preventDefault();
    },
    
    emailPlaceholder: 'Enter your email',
    blurEmail: function(){
        if(this.$('input[name=email]').val() == '') this.$('input[name=email]').val(this.emailPlaceholder);
        this.$('input[name=email]').removeClass('focus');
    },    
    
    focusEmail:function(e){
        if(this.$('input[name=email]').val() == this.emailPlaceholder) this.$('input[name=email]').val('');
        this.$('input[name=email]').addClass('focus');
    },
    
    submit: function(event){
        /*
        if($('.error').is(':visible')){
            this.thankYou();
            console.log('hide-error');
        } else {
            this.error('This is not a valid email address.');        
            console.log('show-error');
        }
        */
        this.subscribe();
        
        if(event) event.preventDefault();
    },
    
    show: function(event){
        $('body').append(this.el);
        this.el.fadeIn('fast');
        
        if(event) event.preventDefault();
    },
    
    hide: function(event){
        var rent = this;
        this.el.fadeOut('slow', function(){
            window.history.back()
            rent.el.remove();
            delete rent;
        });
        
        if(event) event.preventDefault();
    },
    
    validate: function(){
        var rtn = true;
        if(this.$('input[name=email]').val() == this.emailPlaceholder) rtn = false;
        if(this.$('input[name=email]').val() == '') rtn = false;
        return rtn;
    },
    
    subscribe: function(event){
        var rent = this;
        if(this.validate()) {
            $.ajax({
                type: 'POST',
                url: '/ajax/subscribe_to/'+Nubook.data.options.get('username'),
                data: { 'email':this.$('input[name=email]').val() },
                success: function(data){
                    rent.thankYou();
                },
                error: function(response,error,text) {
                    if(response.status == 400) {
                        rent.error(response.responseText == 'Invalid email' ? 'This is not a valid email address.' : response.responseText);
                    } else if(response.status == 409) {
                        rent.error('You are already subscribed.');
                    }
                }
            });
        }
        
        if(event) event.preventDefault();
    }
});