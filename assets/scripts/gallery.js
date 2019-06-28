// CHECK LAYOUT GALLERY OBJECTS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

if(!Nubook) var Nubook = {};
Nubook.Gallery = {
    Models: {},
    Collections: {},
    Views: {}
};


// REUSABLE VIEWS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Gallery.Views.PseudoCheck = Backbone.View.extend({
    
    events: {
        'click .label-check':'selectOption'
    },
    
    initialize: function(){
        this.el = $(this.options.el);
        this.callback = this.options.callback;
        this.render();
        setupLabel();
    },
    
    uncheckAll: function(){
        this.$('.input-check').removeAttr('checked');
        setupLabel();
    },
    
    trigger: function(label) {
        if(label && !$(label).hasClass('disabled')) {
            var input = $('.input-check',label);
            if(input.is(':checked')) {
                input.removeAttr('checked');
            } else {
                input.attr('checked','checked');
            }
        }
        setupLabel();
        if(this.callback) this.callback(this, label);
    },
    
    selectOption: function(event){
        
        this.trigger(event.currentTarget);
        
        //event.preventDefault();
        //event.stopPropagation();
    },
    
    render: function(){
        return this;
    }
});


Nubook.Gallery.Views.PseudoSelect = Backbone.View.extend({
    
    events: {
        'click .pseudo-select-value':'toggleOptions',
        'click .pseudo-select ul li a':'selectOption'
    },
    
    initialize: function(){
        this.el = $(this.options.el);
        this.callback = this.options.callback;
        this.render();
    },
    
    render: function(){
        this.$('ul').hide();
        this.$('ul li:first-child').addClass('first-child');
        
        this.selectCurrentValue();
        
        return this;
    },
    
    selectCurrentValue:function(){
        // set the current option
        this.$('ul > li.selected').removeClass('selected');
        if(this.getValue()) {
            this.setValue(this.$('li a[data-value="'+this.getValue()+'"]').text(),this.getValue());
            this.$('ul li a[data-value="'+this.getValue()+'"]').parent('li').addClass('selected');
        } else {
            this.setValue(this.$('li:first-child a').text(),this.$('li:first-child a').attr('data-value'));
            this.$('li:first-child a').parent('li').addClass('selected');
        }
    },
    
    getValue: function(){
        return this.$('input.pseudo-select-input').val();
    },
    
    setValue: function(text,value){
        this.$('.pseudo-select-value').text(text);
        this.$('.pseudo-select-input').val(value);
        //this.$('.pseudo-select-input').val(value !== '' ? value : text);
    },
    
    selectOption: function(event){
        this.setValue($(event.currentTarget).text(),$(event.currentTarget).attr('data-value'));
        this.$('li').removeClass('selected');
        $(event.currentTarget).parent('li').addClass('selected');
        
        this.toggleOptions();
        
        if(this.callback) this.callback(this, event.currentTarget);
        
        event.preventDefault();
        event.stopPropagation();
    },
    
    toggleOptions: function(){
        if(this.$('ul').is(":visible")){
            this.$('ul').fadeOut('fast');
        } else {
            this.$('ul').fadeIn('fast');
        }
    }

});


// CONTROLLER ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Gallery.Controller = Backbone.Router.extend({
    
    routes : {
        "":"index",
        "/":"index"
    },
    
    views: {},
    data: {},
    
    initialize: function(options){
        Nubook.Gallery.controller = this;
        this.data.families = options.families;
        this.views.gallery = new Nubook.Gallery.Views.Gallery( { filter:{published:true} });
    },
    
    index: function(){
        // pass
    }
});



// MODELS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Gallery.Models.Template = Backbone.Model.extend({
    url: function() { return '/ajax/templates/'+ (this.isNew() ? '' : this.id); }
});

Nubook.Gallery.Models.Family = Backbone.Model.extend({
    url: function() { return '/ajax/families/'+ (this.isNew() ? '' : this.id); }
});


// COLLECTIONS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Gallery.Collections.Templates = Backbone.Collection.extend({
    model: Nubook.Gallery.Models.Template,
    url: '/ajax/templates'
});

Nubook.Gallery.Collections.Families = Backbone.Collection.extend({
    url: function() { return '/ajax/families/'; },
    model: Nubook.Gallery.Models.Family,
    comparator: function(model) {
        return model.get("order");
    }
});



// VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Nubook.Gallery.Views.TemplateThumbnail = Backbone.View.extend({
    
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




Nubook.Gallery.Views.GalleryMatrix = Backbone.View.extend({
    
    el: $('.main-content .thumbs'),
    
    initialize: function(){
        this.collection = this.options.collection;
    },
        
    default_rows: 10,
    getColRowsCnt: function(){
        
        rtn = {}
        rtn['item_w'] = 242 + 20;
        rtn['item_h'] = 155 + 20;
        track = this.el;
        rtn['track_w'] = track.width();
        rtn['track_h'] = track.height();
        rtn['max_cols'] = Math.floor(rtn['track_w'] / rtn['item_w']);
        rtn['max_rows'] = Math.floor(rtn['track_h'] / rtn['item_h']);
        rtn['max_items'] = rtn['max_rows'] * rtn['max_cols'];
        rtn['items_cnt'] = track.find(".thumb").length;
        rtn['fill_items'] = rtn['max_items'] - rtn['items_cnt'];
        
        //console.log(rtn);
        return rtn;
    },
    
    getDefaultLimit:function(){
        return this.getColRowsCnt().max_cols * this.default_rows; 
    },
        
    render: function(){
        var rent = this;
        this.el.html('');
        this.collection.each(function(item){
            if(item.view) {
                item.view.el.remove();
                delete item.view;
            }
            
            item.view = new Nubook.Gallery.Views.TemplateThumbnail({ 'model':item });
            rent.el.append(item.view.render().el);
        });
        
        return this;
    }
});

Nubook.Gallery.Views.Gallery = Backbone.View.extend({
    
    el: $('body.gallery'),
    initialize: function(){
        var rent = this;
        this.collection = new Nubook.Gallery.Collections.Templates();
        this.filter = new Nubook.Gallery.Views.Filter({ parent:this });
        this.matrix = new Nubook.Gallery.Views.GalleryMatrix({ 'collection': this.collection });
        
        if(this.options.filter) this.filter.filter = this.options.filter;
        
        this.fetch(this.filter.filter);
        
        Nubook.Gallery.Views.Gallery._instance = this;
        $(window).resize(function(){ rent.onresize(); });
        $(window).scroll(function(){ rent.onscroll(); });
    },
    
    endOfCollection: false,
    _isLoading: false,
    isLoading:function(isLoading){
        this._isLoading = isLoading;
        if(isLoading) {
            this.$('.category-section').addClass('loading');
        } else {
            this.$('.category-section').removeClass('loading');            
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
        
        if(!limit) limit = this.matrix.getDefaultLimit();
        
        var data = {
            cursor: add ? this.collection.length : 0,
            limit: limit
        };
        
        if(filter) $.each(filter, function(key,value) { data[key] = value; });
        
        this.collection.fetch({
            'add':add,
            'data': data,            
            'success': function(collection, response){
                rent.matrix.render();
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
    
    onscroll_id: false,
    onscroll: function(){
        var rent = this;
        if(this.onscroll_id) clearTimeout(this.onscroll_id);
        this.onscroll_id = setTimeout("Nubook.Gallery.Views.Gallery._instance.scroll()",300);
    },
    scroll: function(){
        //console.log($(window).height(),$('html').outerHeight(),$(window).scrollTop(), $(window).scrollTop() + $(window).height());
        if($('html').outerHeight() - ($(window).scrollTop() + $(window).height()) < 200) {
            this.fetch(this.filter.get(),true);
        }
    },
    
    onresize_id: false,
    onresize: function(){
        var rent = this;
        if(this.onresize_id) clearTimeout(this.onresize_id);
        this.onresize_id = setTimeout("Nubook.Gallery.Views.Gallery._instance.resize()",1000);
    },
    resize: function(){
        var info = this.matrix.getColRowsCnt();
        if(info.fill_items > 0) {
            this.fetch(this.filter.get(),true,info.fill_items);
        }
    },
    
    render: function(){
        return this;
    },
    
    setTitle: function(str,family){
        var h1 = this.$('h1.title');
        h1.text(str);
        if(family) {
            this.setFamilyBar(family);
        } else {
            this.removeFamilyBar();
        }
    },
    
    setFamilyBar: function(family){
        var view = new Nubook.Gallery.Views.FamilyBar({ model:family });
        this.removeFamilyBar();
        this.$('.family-header').append(view.el);        
        this.$('.family-header').show();
    },
    
    removeFamilyBar: function(){
        this.$('.family-header').html('');        
        this.$('.family-header').hide();
    }
});


Nubook.Gallery.Views.FamilyBar = Backbone.View.extend({
    
    className: 'family-bar',
    
    initialize: function(){
        this.el = $(this.el);
        this.model = this.options.model;
        this.render();
    },
    
    render: function(){
        this.el.html(_.template($("#tmpl-family-bar").html(), this.model.toJSON()));
        return this;
    }
});


Nubook.Gallery.Views.FilterBucket = Backbone.View.extend({
    
    el: $('#filter-bucket'),
    value: '',
    
    events: {
        'click li#filter-all a':'selectAll',
        'click li#filter-favorites a':'selectFavorites'
    },
    
    initialize: function(){
        var rent = this;
        this.parent = this.options.parent;
        this.families = new Nubook.Gallery.Views.PseudoSelect({ el:this.$('#filter-families'), 'callback':function(view, anchor){
            rent.familyCallback(view,anchor);
        }})
        this.render();
    },
    
    render: function(){
        return this;
    },
    
    report: function(){
        this.parent.accept(['images',this.value]);
    },
    
    familyCallback:function(view, anchor){
        var rent = this;
        value = $(anchor).attr('data-value');
        if(value) {
            this.select('families');
        } else {
            this.select('all');
        }
    },
    
    selectAll:function(event){
        this.select('all');
        if(event) event.preventDefault();
    },
    
    selectFavorites: function(event){
        this.select('favorites');
        if(event) event.preventDefault();
    },
    
    select:function(slug){
        
        var toFilter = {}
        
        $('#filter-bucket > li').removeClass('selected');
        $('#filter-bucket > li#filter-'+slug).addClass('selected');
        
        
        var title = "Showing All Pages"
        
        if(slug == 'favorites') {
            toFilter['favorites'] = true;
            title = "Showing My Favorites"
        } else {
            toFilter['favorites'] = '';
        }
        
        if(slug == 'families'){
            var id = this.$('input#selected-family').val();
            var family = Nubook.Gallery.controller.data.families.get(id);
            toFilter['family'] = id;
            //title = 'Showing '+ this.$('li a[data-value="'+this.$('input#selected-family').val()+'"]').text();
            title = 'Showing Family:';
            
        } else {
            var family = false;
            toFilter['family'] = '';
            
            // reset filter families
            this.families.$('.pseudo-select-input').val('');
            this.families.selectCurrentValue();
        }

        this.parent.parent.setTitle(title,family);
        this.parent.accept(toFilter);
    }
});


Nubook.Gallery.Views.FilterImages = Backbone.View.extend({
    
    el: $('#filter-images'),
    value: '',
    
    events: {
        'click li a':'select'
    },
    
    initialize: function(){
        this.parent = this.options.parent;
        this.render();
    },
    
    render: function(){
        return this;
    },
    
    report: function(){
        this.parent.accept(['images',this.value]);
    },
    
    select:function(event){
        var curr = $(event.currentTarget);
        this.$('li').removeClass('selected');
        var item = curr.parent('li');
        item.addClass('selected');
        this.value = item.attr('data-filter');
        
        this.report();
        
        event.preventDefault();
    }
});

Nubook.Gallery.Views.FilterWords = Backbone.View.extend({
    el: $('#filter-words'),
    value: '',
    events: {
        'click li a':'select'
    },
    
    initialize: function(){
        this.parent = this.options.parent;
        this.render();
    },
    
    render: function(){
        return this;
    },
    
    report: function(){
        this.parent.accept(['words',this.value]);
    },
    
    select:function(event){
        var curr = $(event.currentTarget);
        this.$('li').removeClass('selected');
        var item = curr.parent('li');
        item.addClass('selected');
        this.value = item.attr('data-filter');
        
        this.report();
        
        event.preventDefault();
    }
});

Nubook.Gallery.Views.FilterTags = Backbone.View.extend({
    el: $('#filter-tags'),
    value: '',
    events: {
        'click li a':'select'
    },
    
    initialize: function(){
        this.parent = this.options.parent;
        this.render();
    },
    
    render: function(){
        return this;
    },
    
    report: function(){
        this.parent.accept(['tags',this.value]);
    },
    
    select:function(event){
        var curr = $(event.currentTarget);
        this.$('li').removeClass('selected');
        var item = curr.parent('li');
        item.addClass('selected');
        this.value = item.attr('data-filter');
        
        this.report();
        
        event.preventDefault();
    }
});

Nubook.Gallery.Views.Filter = Backbone.View.extend({
    
    el: $('.filter'),
    filter: {},
    events: {},
    
    initialize:function(){
        var rent = this;
        this.parent = this.options.parent;
        this.filterBucket = new Nubook.Gallery.Views.FilterBucket({ parent: this });
        this.filterImages = new Nubook.Gallery.Views.FilterImages({ parent: this });
        this.filterWords = new Nubook.Gallery.Views.FilterWords({ parent: this });
        this.filterTags = new Nubook.Gallery.Views.FilterTags({ parent: this });
        
        //this.filterSpecialTags = new Nubook.Gallery.Views.PseudoCheck({ el: $('#filter-special-tags'), parent: this, callback: function(view,label){
        //    rent.clickTag(view,label);
        //}});
        //this.filterSpecialTags.uncheckAll();
    },
    
    render: function(){
        return this;
    },
    
    get: function(){
        return this.filter;
    },
    
    clickTag: function(view,label){
        
        var input = $(label).find('input');
        var val = input.val()
        
        var tags = this.filter['tags'] ? this.filter.tags.split(',') : [];
        
        if(input.is(':checked')) {
            if( _.indexOf(tags, val) == -1 ){
                tags.push(val)
            }
        } else {
            if( _.indexOf(tags, val) != -1 ){
                var arr = [];
                _.each(tags,function(item){
                    if(item != val) { arr.push(item); }
                })
                tags = arr;
            }
        }
        this.filter.tags = tags.join(',');
        if(this.filter.tags == '') delete this.filter['tags'];
        this.parent.fetch(this.filter);        
    },
    
    accept: function(arr){
        var rent = this;

        if (arr instanceof Array) {

            rent.filter[arr[0]] = arr[1];
            if(rent.filter[arr[0]] === '') delete rent.filter[arr[0]];

        } else {
            
            $.each(arr,function(key,val){
                rent.filter[key] = val;
                if(rent.filter[key] === '') delete rent.filter[key];
            });
        }
        
        this.parent.fetch(this.filter);
    }
    
});

