// KEY BINDINGS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

$(document).bind('keydown','left', function(evt){ if($('#pagination-previous').is(':visible')){ window.location =  $('#pagination-previous').attr('href'); } return false; });
$(document).bind('keydown','right', function(evt){ if($('#pagination-next').is(':visible')){ window.location =  $('#pagination-next').attr('href'); } return false; });
$(document).bind('keydown','i', function(evt){ window.location = '#/'; return false; });
$(document).bind('keydown','esc', function(evt){ window.location = ''; return false; });


// RESIZE METHOD :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

_.extend(Nubook, {
    onResize: function(complete){
        
        // HEADER HEIGHT
        //if($('#header .stretcher').height() < $(window).height()) $('#header').css('height',$(window).height()+'px');
        
        
        
        var minHeight = $('#stage').outerHeight() + $('#page-title').outerHeight() + $('#footer').outerHeight();
        if($(window).height() < minHeight) {
            $('#content').css({ 'height':minHeight+'px' });
        } else {
            $('#content').css({ 'height':$(window).height()+'px' });
        }
        $('#header').css('height',$('#content').height()+'px');
        
        $('#stage').css('margin-top',(($(window).height() > minHeight) ? Math.round( ($(window).height() - minHeight) / 2) : 0) +'px');
        
        
        //$('#content #footer').css({ 'width':$('#content').width()+'px' });
        
        
        //var newHeight = $('#header').outerHeight() + $('#footer').outerHeight() + 681 > $(window).height() ? 681 : $(window).height() - $('#header').outerHeight() - $('#footer').outerHeight();
        //if(newHeight <= 681) {
        //    $('#footer').css('position','relative');
        //} else {
        //    if(!$('#sitemap:visible').length) {
        //        $('#footer').css('position','fixed');
        //    }
        //}
        //$('#stage').css('height',newHeight+'px');
        //$('#frame-wrap').css({'top':($("#stage").height() - $('#frame-wrap').outerHeight()) / 2});
        //$('.pagination-arrow').css({
        //    //'top':($("#stage").height() / 2 - 30)+'px',
        //    'top':$('#frame-wrap').css('top'),
        //    'width':(($("#stage").width() - 990) / 2)+'px'
        //});
        if(complete) complete();
    }
});
$(window).resize(function(){ Nubook.onResize(); });


// THEME FONTS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

fontload.init();
fontload.loadFonts(function(){});
fontload.loadFont('etica',function(css) { fontload.writeStyle(css); Nubook.onResize(function(){ $('#wrap').animate({opacity:1},'slow'); }); });


// THEME VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function isoformatToLocal(isostring){
    var dt = Date.parse(isostring);
    var offset = dt.getTimezoneOffset();
    dt.addMinutes(offset*-1);
    return dt;
}

var Neo = Nubook.Views.Theme.extend({

    el: $('body'),
    
    events: {
        'click .sitemap-button':'sitemap',
        'click .facebook-button':'facebook_share',
        'click .twitter-button':'twitter_share'
    },
    
    initialize: function(){
        this.model = this.options.model;
        this.menu = new NeoMenu({collection:Nubook.data.categories});
        this.pagination = new NeoPagination();
        this.sitemap_view = new NeoSiteMap();
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
    
    render: function(){ // from neo

        // logo
        $('#logo #title').text(this.model.get('title'));
        $('#logo').css({ 'top':this.model.get('logo_y')+'px', 'left':this.model.get('logo_x')+'px' });
        if(!this.model.get('logo') && !this.model.get('title')) { $('#logo').hide(); } else { $('#logo').show(); }
        
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
        
        // posted date
        if(this.model.get('options')['posted_date']) {
            this.$('.date').show();
        } else {
            this.$('.date').hide();
        }
        
        // pagination
        if(!this.model.get('navigation')) {
            this.$('.pagination').hide()
        }
        
        // nubook logo
        if(this.model.get('options')['nubook_logo']) {
            this.$('#nubook-logo').show();
        } else {
            this.$('#nubook-logo').hide();
        }
                
        // category links
        if(this.model.get('options')['category_links']) {
            this.$('#menu').show();
        } else {
            this.$('#menu').hide();
        }        
        
        // facebook
        if(this.model.get('options')['facebook_like']) {
            this.$('.facebook-button').show();
        } else {
            this.$('.facebook-button').hide();
        }
        
        // twitter
        if(this.model.get('options')['tweet_page']) {
            this.$('.twitter-button').show();
        } else {
            this.$('.twitter-button').hide();
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
            $('#links').hide();
        } else {
            $('#links').show();
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
    
    category: function(category){
        var page_id = category.get('published_ids')[0];
        this.page(Nubook.data.pages.get(page_id));
    },
    
    page: function(page){
        var rent = this;
        
        this.sitemap_view.close();
        this.pagination.render(page);
        
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
                //$('.page-title').text(page.get('title'));
                $('#frame .page-view').remove();
                $('#frame').append(view.el);
                
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
                    $('#page-title').text(Nubook.controller.currentCategory ? Nubook.controller.currentCategory.get('title') : '');
                } else {
                    rent.menu.select(page.getCategory().get('slug'));
                    $('#page-title').text(page.getCategory().get('title'));
                }
                
            },
            'load':function(view){
                //view.$('.page').show();
                //view.$('.page').animate({'left':'0px'},'fast');
            }
        });
        
        // RENDER PAGE
        page.view.render();
    }
    
});

var NeoMenuItem = Backbone.View.extend({
    
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

var NeoMenu = Backbone.View.extend({
    
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
                item.menuView = new NeoMenuItem({model:item});
                track.append(item.menuView.render().el);
            }
        });
        return this;
    }
});

var NeoPagination = Backbone.View.extend({
    
    maxDots: 20,
    el: $('.pagination'),
    initialize: function(){},
    render: function(page){
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
                
        if(data.count <= this.maxDots) {
            
            // DOTS
            if(this.el.attr('id') == 'pagination-'+category_id) {
                // select page
                this.$('li').removeClass('current');
                this.$('li#pagination-page-'+page.id).addClass('current');
            } else {
                this.el.attr('id','pagination-'+category_id);
                this.$('ul').html('');
                if(data == false) return this;
                if(data.count > 1) {
                    for(var i=0; i < data.count; i++){
                        var pg = Nubook.data.pages.get(data.ids[i]);
                        var dot = $('<li id="pagination-page-'+data.ids[i]+'" />').append($('<a />').attr('href','#/'+pg.getUrl()).attr('title',pg.get('title')));
                        if(data.ids[i] == page.id) dot.addClass('current');
                        this.$('ul').append(dot);
                    }
                }
            }
            
            this.$('.text').hide();
            this.$('.dots').show();
            
        } else {
            
            var text = data.index+1 + " of " + data.count;
            this.$('.dots').hide();
            this.$('.text').text(text).show();
            
        }
                
        // NEXT
        if(data.next) {
            var next = Nubook.data.pages.get(data.next);
            next.getRender();
            $('#pagination-next').attr('href','#/'+next.getUrl());
            $('#pagination-next').show();
        } else {
            $('#pagination-next').hide();
        }
        
        // PREVIOUS
        if(data.previous) {
            var prev = Nubook.data.pages.get(data.previous);
            prev.getRender();
            $('#pagination-previous').attr('href','#/'+prev.getUrl());
            $('#pagination-previous').show();
        } else {
            $('#pagination-previous').hide();
        }
        
        return this;
    }
});

var NeoSiteMap = Backbone.View.extend({
    
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
                item.sitemapView = new NeoSiteMapCategory({model:item});
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

var NeoSiteMapCategory = Backbone.View.extend({
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
                page.sitemapView = new NeoSiteMapPage({model:page});
                track.append(page.sitemapView.render().el);
            }
        });
        this.$("li:last").addClass('last');
        
        return this;
    }
});

var NeoSiteMapPage = Backbone.View.extend({
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
