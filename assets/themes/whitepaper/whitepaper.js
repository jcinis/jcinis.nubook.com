// KEY BINDINGS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

$(document).bind('keydown','left', function(evt){ if($('#pagination-previous').is(':visible')){ window.location =  $('#pagination-previous').attr('href'); } return false; });
$(document).bind('keydown','right', function(evt){ if($('#pagination-next').is(':visible')){ window.location =  $('#pagination-next').attr('href'); } return false; });
$(document).bind('keydown','i', function(evt){ window.location = '#/'; return false; });
$(document).bind('keydown','esc', function(evt){ window.location = ''; return false; });


// RESIZE METHOD :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

_.extend(Nubook, {
    onResize: function(complete){
        $("#stage").css('margin-top',$('#header').outerHeight() + parseInt($('#header').css('top'))+'px');
        if(complete) complete();
    },
    onScroll: function(){
        //console.log($('html').scrollTop());
        
        var diff = $('#header').outerHeight() - ($("#menu-wrap").css('display') == 'block' ? 50 : 0);
        var scroll = $(window).scrollTop();
        
        if(scroll > diff) {
            $('#header').css('top', (diff * -1)+'px');
        } else {
            $('#header').css('top', (scroll * -1)+'px');
        }
        
        //console.log($('#header').css('top'));
        if(Nubook.onResize) Nubook.onResize();        
    }
});
$(window).resize(function(){ Nubook.onResize(); });
$(window).scroll(function(){ Nubook.onScroll(); });


// THEME FONTS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

fontload.init();
fontload.loadFonts(function(){});
fontload.loadFont('etica',function(css) { fontload.writeStyle(css); Nubook.onScroll(); Nubook.onResize(function(){ $('#wrap').animate({opacity:1},'slow'); }); });
fontload.loadFont('etica-light',function(css) { fontload.writeStyle(css); Nubook.onScroll(); Nubook.onResize(function(){ $('#wrap').animate({opacity:1},'slow'); }); });


// THEME VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function isoformatToLocal(isostring){
    var dt = Date.parse(isostring);
    var offset = dt.getTimezoneOffset();
    dt.addMinutes(offset*-1);
    return dt;
}

var Whitepaper = Nubook.Views.Theme.extend({

    el: $('body'),
    
    events: {
        'click .sitemap-button':'sitemap',
        'click .facebook-button':'facebook_share',
        'click .twitter-button':'twitter_share'
    },
    
    initialize: function(){
        this.model = this.options.model;
        this.menu = new WhitepaperMenu({collection:Nubook.data.categories});
        this.pagination = new WhitepaperPagination();
        this.sitemap_view = new WhitepaperSiteMap();
        this.render();
    },
    
    setLinks: function(){
        var el = this.$('#links ul');
        el.html('');
        _.forEach(this.model.get('links'),function(link){
            if(link['active']) {
                el.append($('<li />').append($('<a />').attr('href',link['url']).text(link['title'])));
            }
        });
    },
    
    render: function(){

        // logo
        $('#logo #title').text(this.model.get('title'));
        $('#logo').css({ 'top':this.model.get('logo_y')+'px', 'left':this.model.get('logo_x')+'px' });
        if(!this.model.get('logo') && !this.model.get('title')) { $('#logo,#logo-wrap').hide(); } else { $('#logo,#logo-wrap').show(); }
        
        // logo image
        if(!this.model.get('logo')) {
            var logoEl = $('#logo');
            logoEl.find('#graphic').remove();
            logoEl.removeClass('graphical');
            logoEl.addClass('textual');
        } else {
            var logoEl = $('#logo');
            var logoImg = logoEl.find('#graphic');
            if(logoImg.length) {
                if(logoImg.attr('src') != this.model.get('logo')) {
                    logoEl.find('#graphic').remove();
                    logoEl.find('a').append($('<img />').attr('id','graphic').attr('src',this.model.get('logo')).attr('border',0));
                }
            } else {
                logoEl.find('a').append($('<img />').attr('id','graphic').attr('src',this.model.get('logo')).attr('border',0));
            }
            
            logoEl.removeClass('textual');
            logoEl.addClass('graphical');
        }
        
        // slogan
        $('#slogan').text(this.model.get('slogan'));
        $('#slogan').css({ 'top':this.model.get('slogan_y')+'px', 'left':this.model.get('slogan_x')+'px' });
        if(!this.model.get('slogan')) { $('#slogan').hide(); } else { $('#slogan').show(); }
        
        // nubook logo
        if(this.model.get('options')['nubook_logo']) {
            this.$('#nubook-logo').show();
        } else {
            this.$('#nubook-logo').hide();
        }
        
        // category links
        if(this.model.get('options')['category_links']) {
            this.$('#menu-wrap').show();
        } else {
            this.$('#menu-wrap').hide();
        }

        // date
        if(this.model.get('options')['posted_date']) {
            this.$('#stage').removeClass('no-date');
        } else {
            this.$('#stage').addClass('no-date');
        }
                
        // facebook
        if(this.model.get('options')['facebook_like']) {
            this.$('#stage').removeClass('no-facebook');
        } else {
            this.$('#stage').addClass('no-facebook');
        }
        
        // twitter
        if(this.model.get('options')['tweet_page']) {
            this.$('#stage').removeClass('no-twitter');
        } else {
            this.$('#stage').addClass('no-twitter');
        }
        
        // sitemap
        if(this.model.get('options')['site_map']) {
            this.$('.sitemap-button').show();
        } else {
            this.$('.sitemap-button').hide();
        }
        
        // links
        this.setLinks();
        
        // remove bar
        if(!$('#links li').length && !this.model.get('options')['site_map'] && !this.model.get('options')['nubook_logo']){
            $('#footer').hide();
        } else {
            $('#footer').show();
        }
        
        if(Nubook.onResize) Nubook.onResize();
        
        return this;
    },
    
    // move to theme.js    
    facebook_share:function(event){
        var u = location.href;
        var t = $('title').text();
        window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');
        if(event) event.preventDefault();
    },
    
    twitter_share:function(event){
        var u = location.href;
        var t = $('title').text();
        window.open('http://twitter.com/share?url='+encodeURIComponent(u)+'&text='+encodeURIComponent('"'+t+'": '),'sharer','toolbar=0,status=0,width=626,height=436');
        if(event) event.preventDefault();
    },
    
    sitemap: function(event){
        this.sitemap_view.open();
    },
    
    index: function(page){
        //this.category();
        
        if(Nubook.data.blogmode) {
            this.category();            
        } else {
            this.category(page.getCategory());
        }
    },
    
    category: function(category, complete, blogindex){
        
        var rent = this;
        
        $.scrollTo($('html'), 300, {'axis':'y', 'margin':false });
        
        //if(Nubook.controller.currentCategory != category) {
            // CLEAR STAGE
            rent.el.find('#stage').html('');
            
            
            if(Nubook.data.blogmode && !category) {
                var slug = '';
                var page_ids = Nubook.data.published_ids;
            } else {
                var slug = category.get('slug');
                var page_ids = category.get('published_ids');
            }
            
            // SET MENU
            rent.menu.select(slug);
            
            // DISPLAY PAGES            
            _.each(page_ids,function(page_id){
                
                var page = Nubook.data.pages.get(page_id);
                page.view = new Nubook.Views.Page({
                    'model':page,
                    'ready':function(view){
                        
                        // ACTIVATE LIGHTBOX
                        view.$('.page a.lightbox').attr('rel','group');
                        view.$('.page a.lightbox').fancybox({
                            transitionIn:'elastic',
                            transitionOut:'elastic'
                        });
                        
                        // CHECK FOR UNLOADED FONTS
                        if(fontload) fontload.loadFonts(function(){});
                        
                        // RESIZE STAGE
                        if(Nubook.onResize) Nubook.onResize();
                    },
                    'load':function(view){
                        //rent.el.find('#stage').append(view.el);
                        //view.$('.page').show();
                        //view.$('.page').animate({'left':'0px'},'fast');
                    }
                });
                
                
                var vars = page.toJSON()
                vars.created = isoformatToLocal(vars.created).format('F jS, Y');
                vars.url = page.getUrl();
                
                var pageWrap = $('<div class="page-wrap" />').attr('id','page-view-'+page.id).html(_.template($("#tmpl-page").html(), vars));
                pageWrap.find('.frame').append(page.view.el);
                rent.$('#stage').append(pageWrap);
                
                page.view.render();
            });
        //}
        
        if(complete) {
            if(Nubook.onScroll()) Nubook.onScroll();
            complete();
        }
    },
    
    page: function(page){
        var rent = this;
        
        this.category(page.getCategory(),function(){
            $.scrollTo($('#page-view-'+page.id), 300, {'axis':'y', 'margin':false, 'offset': { 'left':0, 'top': parseInt($('#stage').css('margin-top')) * -1 } });
        });
        
        /*
        this.pagination.render(page);
        this.sitemap_view.close();
        
        page.view = new Nubook.Views.Page({
            'model':page,
            'ready':function(view){
                
                //view.el.css('position','relative');
                //view.$('.page').css('position','relative');
                //view.$('.page').css('left','990px');
                //view.$('.page').hide();
                
                //$.fancybox.close();
    
                // PUT INTO THEME
                document.title = page.get('title');
                
                // ACTIVATE LIGHTBOX
                $('.page a.lightbox').attr('rel','group');
                $('.page a.lightbox').fancybox({
                    transitionIn:'elastic',
                    transitionOut:'elastic'
                });
                
                // SET DATE
                //$('.date').text(isoformatToLocal(page.get('created')).format('F jS, Y'));
                
                // CHECK FOR UNLOADED FONTS
                //if(fontload) fontload.loadFonts(function(){});
                
                // RESIZE STAGE
                //if(Nubook.onResize) Nubook.onResize();
                
                // SET MENU
                if(Nubook.data.blogmode){
                    rent.menu.select(Nubook.controller.currentCategory ? Nubook.controller.currentCategory.get('slug') : '');
                } else {
                    rent.menu.select(page.getCategory().get('slug'));
                }
                
            },
            'load':function(view){
                rent.el.find('#stage').append(view.el);
                //view.$('.page').show();
                //view.$('.page').animate({'left':'0px'},'fast');
            }
        });
        
        
        // RENDER PAGE
        page.view.render();
        
        */
    }
    
});

var WhitepaperMenuItem = Backbone.View.extend({
    
    tagName: 'li',
    
    initialize: function(){
        this.model = this.options.model;
        this.id = 'menu-item-'+this.model.get('slug');
    },
    
    render: function(){
        $(this.el).attr('id',this.id);
        $(this.el).append($('<a />').attr('href','#/'+this.model.get('slug')).text(this.model.get('title')));
        //$(this.el).html(_.template($("#tmpl-menu-item").html(), this.model.toJSON()));
        return this;
    }
});

var WhitepaperMenu = Backbone.View.extend({
    
    el: $('#menu'),
    
    initialize: function(){
        this.collection = this.options.collection;
        this.render();
    },
    
    select: function(slug) {
        this.$('li').removeClass('current');
        this.$('#menu-item-'+slug).addClass('current');
    },
                    
    render: function(){
        var track = this.$('ul');
        track.html('');
        this.collection.each(function(item){
            if(!item.get('is_default') && item.get('published_ids').length > 0) {
                item.menuView = new WhitepaperMenuItem({model:item});
                track.append(item.menuView.render().el);
            }
        });
        return this;
    }
});

var WhitepaperPage = Backbone.View.extend({
    
    className: "whitepaper-page",
    
    model: undefined,
    page: undefined,
    
    initialize: function(){
        this.model = this.options.model;
    },
    
    render: function(){
        var rent = this;
        rent.page.view = new Nubook.Views.Page({
            'model':rent.model,
            'ready':function(view){
                
                //view.el.css('position','relative');
                //view.$('.page').css('position','relative');
                //view.$('.page').css('left','990px');
                //view.$('.page').hide();
                
                //$.fancybox.close();
    
                // PUT INTO THEME
                document.title = page.get('title');
                
                // ACTIVATE LIGHTBOX
                $('.page a.lightbox').attr('rel','group');
                $('.page a.lightbox').fancybox({
                    transitionIn:'elastic',
                    transitionOut:'elastic'
                });
                
                // SET DATE
                $('.date').text(isoformatToLocal(page.get('created')).format('F jS, Y'));
                
                // CHECK FOR UNLOADED FONTS
                if(fontload) fontload.loadFonts(function(){});
                
                // RESIZE STAGE
                if(Nubook.onResize) Nubook.onResize();
                
                // SET MENU
                if(Nubook.data.blogmode){
                    rent.menu.select(Nubook.controller.currentCategory ? Nubook.controller.currentCategory.get('slug') : '');
                } else {
                    rent.menu.select(page.getCategory().get('slug'));
                }
                
            },
            
            'load':function(view){
                
                $('#stage').append(view.el);
                //view.$('.page').show();
                //view.$('.page').animate({'left':'0px'},'fast');
            }
        });
        
        // RENDER PAGE
        rent.view.render();
    }
    
});

var WhitepaperPagination = Backbone.View.extend({
    
    maxDots: 20,
    el: $('#stage'),
    initialize: function(){},
    render: function(page){
        var rent = this;
        var data = page.getPagination();
        
        if(Nubook.data.blogmode) {
            var category = Nubook.controller.currentCategory;
            category_id = category ? category.id : 'blog';
            if(!category){
                data.ids = Nubook.data.published_ids;
            } else {
                data.ids = category.get('published_ids');
            }
        } else {
            var category = page.getCategory();
            var category_id = category.id;
            data.ids = category.get('published_ids');
        }
        
        // RENDER PAGES WITHIN PAGINATION GROUP
        if($('body').attr('id') == 'section-'+category_id) {
            
            this.$('li').removeClass('current');
            this.$('li#pagination-page-'+page.id).addClass('current');
            
        } else {
            
            $('body').attr('id','section-'+category_id);
            
            this.el.html('');
            if(data == false) return this;
            if(data.count > 1) {
                for(var i=0; i < data.count; i++){
                    
                    var pg = Nubook.data.pages.get(data.ids[i]);
                    pg.view = new WhitepaperPage(pg);
                    rent.el.append(pg.view.el);
                    pg.view.render();
                    
                    //var dot = $('<li id="pagination-page-'+data.ids[i]+'" />').append($('<a />').attr('href','#/'+pg.getUrl()).attr('title',pg.get('title')));
                    //if(data.ids[i] == page.id) dot.addClass('current');
                    //this.$('ul').append(dot);
                }
            }
        }
                            
        // NEXT
        if(data.next) {
            var next = Nubook.data.pages.get(data.next);
            $('#pagination-next').attr('href','#/'+next.getUrl());
            $('#pagination-next').show();
        } else {
            $('#pagination-next').hide();
        }
        
        // PREVIOUS
        if(data.previous) {
            var prev = Nubook.data.pages.get(data.previous);
            $('#pagination-previous').attr('href','#/'+prev.getUrl());
            $('#pagination-previous').show();
        } else {
            $('#pagination-previous').hide();
        }
        
        return this;
    }
});

var WhitepaperSiteMap = Backbone.View.extend({
    
    el: $('#sitemap'),
    
    events: { "click .close-button":"closeButton" },
    
    initialize: function(){},
    is_rendered: false,
    render: function(complete){
        
        // if already rendered
        if(this.is_rendered) {
            if(complete) complete(this);
            return this;
        }
        
        // else render the sitemap
        var track = this.el.find('.sitemap-categories');
        Nubook.data.categories.each(function(item,i){
            if(item.get('published_ids').length > 0) {
                item.sitemapView = new WhitepaperSiteMapCategory({model:item});
                track.append(item.sitemapView.render().el);
            }
        });
        
        this.is_rendered = true;
        if(complete) complete(this);
        return this;
    },
    
    open: function(event){
        var rent = this;
        this.render(function(){
            $(rent.el).show();
            if(Nubook.onResize) Nubook.onResize();
        });
        if(event) event.preventDefault();
    },
    
    closeButton: function(event){
        this.close();
        window.history.back();
        if(event) event.preventDefault();
    },
    
    close: function(event){
        $(this.el).hide();
        if(Nubook.onResize) Nubook.onResize();
        if(event) event.preventDefault();
    }
});

var WhitepaperSiteMapCategory = Backbone.View.extend({
    className: 'sitemap-category',
    initialize: function(){
        this.model = this.options.model;
        this.id = 'sitemap-category-'+this.model.get('slug');
    },
    render: function(){
        $(this.el).html(_.template($("#tmpl-sitemap-category").html(), this.model.toJSON()));
        
        var track = this.$('ul');
        _.each(this.model.get('published_ids'),function(id,i){
            var page = Nubook.data.pages.get(id);
            if(page) {
                page.sitemapView = new WhitepaperSiteMapPage({model:page});
                track.append(page.sitemapView.render().el);
            }
        });
        this.$("li:last").addClass('last');
        
        return this;
    }
});

var WhitepaperSiteMapPage = Backbone.View.extend({
    tagName: 'li',
    className: 'sitemap-page',
    initialize: function(){
        this.model = this.options.model;
        this.id = 'sitemap-page-'+this.model.id;
    },
    render: function(){
        var vars = this.model.toJSON();
        vars['url'] = this.model.getUrl();
        $(this.el).html(_.template($("#tmpl-sitemap-page").html(), vars));
        return this;
    }
});
