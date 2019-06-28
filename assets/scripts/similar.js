Nubook = {}
Nubook.Views = {}
Nubook.Models = {}
Nubook.Collections = {}

Nubook.Similar = {
    data: {},
    init: function(options){
        if(options && options.template) {
            this.data.template = options.template;
        }
        
        $('.hbar').each(function(i,el){
            var view = new Nubook.Views.Hbar({ 'el':el });
        })
    }
}


// MODELS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Models.Template = Backbone.Model.extend({
    url: function() { return '/ajax/templates/'+ (this.isNew() ? '' : this.id); }
});


// COLLECTIONS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Collections.Templates = Backbone.Collection.extend({
    model: Nubook.Models.Template,
    url: '/ajax/templates'
});


// VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Views.HbarInstances = {};
Nubook.Views.Hbar = Backbone.View.extend({
    
    //events: {
    //    'scroll .track':'scroll'
    //},
    
    filter:{},
    limit:10,
    collection: undefined,
    
    initialize: function(){
        var rent = this;
        this.el = $(this.options.el);
        if(this.options.filter) {
            this.filter = this.options.filter;
        } else {
            this.filter = this.parseFilterFromEl();
        }
        this.el.data('view',this);
        
        this.collection = new Nubook.Collections.Templates();
        this.fetch(this.filter,true, 20);
        
        this.$('.track').scroll(function(){ rent.scroll(); });
    },
    
    parseFilterFromEl: function(){
        var filter = {}
        var str = this.el.attr('data-filter').split(':');
        if(str.length == 2) {
            filter[str[0]] = str[1];
        }
        filter['published'] = true;
        
        // check for global template to exclude
        if(Nubook.Similar.data.template && Nubook.Similar.data.template.id) {
            filter['exclude']=Nubook.Similar.data.template.id;
        } else {
            console.log('test'+Nubook.Similar.data.template);
        }
        
        return filter;
        
        ///if(_.indexOf(_.keys(this.filter),'images') != -1) data['images'] = this.filter.images;
        ///if(_.indexOf(_.keys(this.filter),'words') != -1) data['words'] = this.filter.words;
        ///if(_.indexOf(_.keys(this.filter),'tags') != -1) data['tags'] = this.filter.tags;
        ///if(data['tags'] && _.isArray(data['tags'])) data['tags'] = data['tags'].join(',');
        ///if(_.indexOf(_.keys(this.filter),'family') != -1) data['family'] = this.filter.family;        
    },
    
    count_displayed:function(){
        return this.el.$('.track li').length;
    },
    
    fetch2: function(){
        
        var uri = "/ajax/templates";
        
        var data = {}
        data['cursor'] = this.count_displayed();
        data['limit'] = this.limit;
        data['published'] = true;
        
    },
    
    onscroll_id: false,
    onscroll: function(){
        //var rent = this;
        //if(this.onscroll_id) clearTimeout(this.onscroll_id);
        //this.onscroll_id = setTimeout("Nubook.Gallery.Views.Gallery._instance.scroll()",300);
    },
    scroll: function(){
        if(this.$('.track').scrollLeft() == this.$('.track ul').width() - this.$('.track').width()) {
            this.fetch(this.filter, true, 20);
        }
    },
    
    _isLoading: false,
    isLoading:function(isLoading){
        this._isLoading = isLoading;
        if(isLoading) {
            this.el.addClass('loading');
        } else {
            this.el.removeClass('loading');
        }
    },
    
    fetch: function(filter, add, limit){
        var rent = this;
        if(rent._isLoading) return false;
        rent.isLoading(true);
        if(!add) {
            add = false;
            rent.endOfCollection = false;
        } else {
            if(rent.endOfCollection){
                rent.isLoading(false);
                return false;
            }
        }
        
        if(!limit) limit = this.limit;
        
        var data = {
            cursor: add ? this.collection.length : 0,
            limit: limit
        };
        
        if(filter) $.each(filter, function(key,value) { data[key] = value; });
        
        this.collection.fetch({
            'add':add,
            'data': data,            
            'success': function(collection, response){
                rent.render();
                if(response.length < limit) {
                    rent.endOfCollection = true;
                }
                rent.isLoading(false);
            },
            'error': function(collection,response) {
                rent.isLoading(false);
                console.log('Error',response);
            }
        });
        
        return true;
    },
    
    render: function(){
        var track = this.$('.track ul');
        track.html('');
        this.collection.each(function(template){
            var view = new Nubook.Views.TemplateThumbnail({ model:template });
            track.append(view.render().el);
        });
        track.find('li:last').addClass('last-child');
        track.css('width', this.collection.length * 262 - 20 + 'px');
    }
    
});


Nubook.Views.TemplateThumbnail = Backbone.View.extend({
    
    tagName: 'li',
    className: 'thumb',
    
    events: {
        "mouseenter":"over",
        "mouseleave":"out",
        "mouseover a.thumb-fav":"favoriteOver",
        "mouseout a.thumb-fav":"favoriteOut",
        'click a.thumb-fav':'favorite',
        "mouseover a.thumb-similar":"similarOver",
        "mouseout a.thumb-similar":"similarOut"
    },
    
    initialize: function(){
        this.model = this.options.model;
        this.model.view = this;
        this.id = 'template-'+this.model.id;
        this.el = $(this.el);
        this.el.data('view',this);
    },
    
    favorite: function(event){
        var rent = this;
        
        if(this.model.get('is_favorite')) {
            
            fav = new Backbone.Model({'id':this.model.id, 'template':this.model.id});
            fav.url = '/ajax/templates/favorites/'+this.model.id;
            fav.destroy({
                'success': function(model){
                    rent.model.set({is_favorite:false});
                    rent.$('a.thumb-fav').removeClass('selected');
                    //rent.render();
                },
                'error': function(){
                    console.log('error');
                }
            });
            
        } else {
            
            fav = new Backbone.Model({'template':this.model.id});
            fav.url = '/ajax/templates/favorites/';
            fav.save({},{
                'success': function(model){
                    if(model.get('template')) {
                        rent.model.set({is_favorite:true});
                        rent.$('a.thumb-fav').addClass('selected');
                        //rent.render();
                    }
                },
                'error': function(){
                    console.log('error');
                }
            });
            
        }
        
        
        if(event) event.preventDefault();
    },
    
    over: function(){
        this.$('.thumb-actions').css({'bottom':(this.$('.thumb-actions').height()*-1)+'px' });
        this.$('.thumb-actions').show().animate({ 'bottom':'0px'},'fast');
        this.el.addClass('hover');
    },
    
    out: function(){
        var rent = this;
        rent.$('.thumb-actions').animate({'bottom':(rent.$('.thumb-actions').height()*-1)+'px' },'fast',function(){
            rent.$('.thumb-actions').hide();
        });
        this.el.removeClass('hover');
    },
    
    favoriteOver:function(event){ this.$('.thumb-actions-desc').text('Add to Favorites'); },
    favoriteOut:function(event){ this.$('.thumb-actions-desc').text(''); },
    
    similarOver:function(event){ this.$('.thumb-actions-desc').text('Show Similar'); },
    similarOut:function(event){ this.$('.thumb-actions-desc').text(''); },
    
    render: function(){
        this.el.html(_.template($("#tmpl-template-thumbnail").html(), this.model.toJSON()));
        return this;
    }
});
