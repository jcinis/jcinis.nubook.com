$(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        var csrf_token = getCookie('csrftoken');
        if(!csrf_token) csrf_token = csrfmiddlewaretoken;
        xhr.setRequestHeader("X-CSRFToken", csrf_token);
    }
});

$(document).ready(function(){

    if ($.browser.mozilla) {
        $('head').append('<link rel="stylesheet" type="text/css" href="/assets/styles/dashboard/nubook-ff.css" />');
    }

/*** My Nubook ***/

    /*
    $('.thumb').click(function(e){
        $('.gear-on').removeClass('gear-on');
        $(this).toggleClass('gear-on');
        e.stopPropagation();
    });

    $('html').click(function() {
        $('.gear-on').removeClass('gear-on');
    });
    */

    setupLabel();

    resizePanel();

    $(window).scroll(resizePanel);
    $(window).resize(resizePanel);

    $('*').click(function(){
        resizePanel();
    });

});

function removeItem(x,y) {
    $(x).parents(y).fadeOut('fast', function(){
        $(x).parents(y).remove();
    });
    return false;
}

function resizePanel(){
    var availableSpace = $(window).height() - 182;
    if (availableSpace < 350) availableSpace = 350; // height of the sidebar
	$('#overview-panel').css('min-height', availableSpace + 'px');

	if (isIE) {
	    $('#overview-panel .rb-08').css('min-height', availableSpace + 'px');
	    var targetWidth = '806';
	    var ieWidth = document.body.clientWidth;
        if (ieWidth < 9999) { targetWidth = '2118'; }
        if (ieWidth < 2380) { targetWidth = '1856'; }
        if (ieWidth < 2108) { targetWidth = '1594'; }
        if (ieWidth < 1860) { targetWidth = '1332'; }
        if (ieWidth < 1590) { targetWidth = '1068'; }
        if (ieWidth < 1330) { targetWidth = '806'; }
        $('.flexible-grid').css('width', targetWidth + 'px');
	}
}


// TEST COMMENT.  GIT RULEZ MO FO!

// BUILD APP :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

var Error = function(options){
    if(options.message) {
        if("console" in window) console.log(options.message);
    }
}

var Page = Backbone.Model.extend({

    getUrl: function(){
        var rtn = '';
        if(this.get('id') && App.Data.user.get('username')){
            rtn = 'http://'+App.Data.user.get('username')+'.nubook.com/#/-/'+this.get('id');
        }

        return rtn;
    }

});

var Category = Backbone.Model.extend({
    url: function() {
        return '/ajax/categories/'+ (this.isNew() ? '' : this.id);
    }
});

var Options = Backbone.Model.extend({
    url: '/ajax/customize/'
});

var App = {
    Data: {},
    Models: {},
    Views: {},
    Collections: {},
    Controllers: {},
    Controller: {},
    init: function(user,pages,categories,subscribers,options,account) {
        this.Data.user = user;
        this.Data.categories = categories;
        this.Data.pages = pages;
        this.Data.subscribers = subscribers;
        this.Data.options = options;
        this.Data.account = account;
        this.controller = new App.Controllers.Main();
        Backbone.history.start();
    }
};


// MODELS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

App.Models.User = Backbone.Model.extend({});
App.Models.Subscriber = Backbone.Model.extend({
    url: function() {
        return '/ajax/subscribers/'+ (this.isNew() ? '' : this.id);
    }
});


// COLLECTIONS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

App.Collections.Pages = Backbone.Collection.extend({
    model: Page,
    url: '/ajax/pages/',

    getIndex: function(page){
        var i = 0;
        var found = -1;
        this.each(function(item){
            if(item.get('id') == page.get('id')) {
                found = i;
            } else {
            }
            i++;
        });
        return found;
    },

    getNext: function(page){
        var index = this.getIndex(page);
        if(index === -1) { return false; }
        return this.at(index+1);
    },

    getPrevious: function(page){
        var index = this.getIndex(page);
        if(index === -1) { return false; }
        return this.at(index-1);
    }
});

App.Collections.Categories = Backbone.Collection.extend({
    model: Category,
    url: '/ajax/categories/',
    comparator: function(model) {
        return model.get("order");
    }
});

App.Collections.Subscribers = Backbone.Collection.extend({
    model: App.Models.Subscriber,
    url: '/ajax/subscribers/'
});


// REUSABLE VIEWS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

App.Views.PseudoRadio = Backbone.View.extend({

    events: {
        'click .option-item label':'selectOption'
    },

    initialize: function(){
        this.el = $(this.options.el);
        this.callback = this.options.callback;
        this.render();
    },

    render: function(){
        this.$('ul li:first-child').addClass('first-child');
        setupLabel();

        // set current
        if(this.$('.input-radio:checked').length) {
            this.trigger(this.$('.input-radio:checked').closest('label'));
        } else {
            this.trigger(this.$('.input-radio:first-child').closest('label'));
        }

        return this;
    },

    getValue: function(){
        return this.$('input:checked').val();
    },

    trigger: function(label) {
        if(label) {
            this.$('.input-radio').removeAttr('checked');
            $('.input-radio',label).attr('checked','checked');
        }
        setupLabel();
        if(this.callback) this.callback(this, label);
    },

    selectOption: function(event){

        this.trigger(event.currentTarget);

        //event.preventDefault();
        //event.stopPropagation();
    }
});


App.Views.PseudoCheck = Backbone.View.extend({

    events: {
        'click .label-check':'selectOption'
    },

    initialize: function(){
        this.el = $(this.options.el);
        this.callback = this.options.callback;
        this.render();
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




// VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

App.Views.CategoryList = Backbone.View.extend({
    el: $("#categories-link"),

    events: {
        "click #add-category-link a" : "showAdd",
        "click #new-category-field .cancel-button" : "hideAdd",
        "click #new-category-field .done-button" : "submitCategory",
        "focus input#new-category" : "focusNewCategory",
        "blur input#new-category" : "blurNewCategory",
        "click #done-edit-button .done-button" : "submitEdits",
        "click #edit-categories-link a" : "showEditFields",
        "sortstop #categories" : "submitSort"
    },

    initialize: function() {
        this.collection = this.options.collection;
        this.render();
    },

    selected: '',
    selectCategory: function(id){
        if(this.selected) this.$('#categories li#category-list-'+this.selected).removeClass('current');
        this.selected = id;
        this.$('#categories li#category-list-'+this.selected).addClass('current');
    },

    showAdd: function(){
        this.$('#new-category-field').fadeIn('fast');
        return false;
    },

    hideAdd: function(){
        this.$('#new-category-field').fadeOut('fast');
        return false;
    },

    focusNewCategory: function(){ this.$("input#new-category").val( this.$("input#new-category").val() == 'Name me!' ? '' : this.$("input#new-category").val()); },
    blurNewCategory: function(){ this.$("input#new-category").val(this.$("input#new-category").val() ? this.$("input#new-category").val() : 'Name me!'); },

    submitCategory: function(){
        var rent = this;
        var catName = this.$('#new-category-field .input-text').val();

        if(catName == '' || catName == 'Name me!') return false;

        this.$("input#new-category").val('').focus();

        if(catName.length > 1){
            var cat = new Category({ title:catName });
            cat.save({},{
                success: function(model,response){
                    rent.collection.add(model);
                    rent.render();

                    rent.hideAdd();

                    // re-render the main categories pane
                    App.controller.views.overview.render();
                },
                error: function(model,response){
                    new Error('Was unable to save category');
                }
            });
        }

        //$('#categories').append('<li class="editable"><a href="index.html#">' + catName + '</a><div class="hidden"><input type="text" class="input-text" name="edit-category-' + catName.toLowerCase().replace(' ','-') + '-' + random + '" value="' + catName + '" id="edit-category-' + catName.toLowerCase().replace(' ','-') + '-' + random + '" /><span class="del" onclick="removeItem($(this),\'.editable\');">x</span></div></li>');
        return false;
    },

    showEditFields: function(){
        //$('#edit-categories-link a').click(function(){
        $('#new-category-field, .editable a, #add-category-link, #edit-categories-link').hide();
        $('.editable .hidden, #done-edit-button').fadeIn('fast');
        $('#category-list-all, .non-editable').addClass('disabled');
        return false;
    },

    submitEdits: function(){
        var rent = this;
        var isChanged = false;
        $.each(this.$('li.editable input.input-text'),function(i,item){
            var id = ($(item).attr('id').split('-').pop());
            var val = $(item).val();
            var model = rent.collection.get(id);
            if(model && val && model.get('title') != val) {
                isChanged = true;
                model.set({'title':val});
                model.save();
            }
        });

        this.$('.editable a, #add-category-link, #edit-categories-link').show();
        this.$('.editable .hidden, #done-edit-button').hide();
        this.$('#category-list-all, .non-editable').removeClass('disabled');

        // re-render the categories list
        this.render();

        if(isChanged == true) {
            // re-render the main categories pane
            App.controller.views.overview.render();
        }

        return false;
    },

    submitSort: function(){
        var rent = this;
        $.each(this.$('li.editable'),function(i,item){
            var id = ($(item).attr('id').split('-').pop());
            var val = i+1;
            var model = rent.collection.get(id);
            if(model && val && model.get('order') != val) {
                model.set({'order':val});
                model.save();
            }
        });
        this.collection.sort();

        // reorder the main view
        App.controller.views.overview.reorder();
    },

    render: function() {

        var rent = this;

        if(this.collection.models.length > 0) {

            var track = this.$('#categories');
            this.collection.each(function(category){
                if(!category.menuView) category.menuView = new App.Views.CategoryListItem({'model':category});
                track.append(category.menuView.render().el);
            });

        } else {
            new Error({ message:'No categories were found' });
        }

        this.$("#categories").sortable({
            items: "li.editable"
        });

        return this;
    }
});

App.Views.CategoryListItem = Backbone.View.extend({

    tagName: "li",

    events: {
        "click .del":"deleteItem",
        "drop a": "onDrop",
        "dropover a": "onDropOver",
        "dropout a": "onDropOut"
    },

    initialize: function() {
        this.model = this.options.model;
        this.id = 'category-list-'+this.model.id;
    },

    deleteItem: function() {

        // get default category
        var toCategory = App.Data.categories.at(0);
        if(toCategory.id == this.model.id) new Error({ message:'Can not delete the default category.' });

        $('#category-'+this.model.id+' .thumbs .thumb').appendTo($('#category-'+toCategory.id+' .thumbs'));
        toCategory.view.reorderPages();

        $(this.model.view.el).remove();
        this.model.destroy();
        $(this.el).remove();

        window.location = '#/';

        // re-render the main categories pane
        //App.controller.views.categories.render();
    },

    onDrop: function(event,ui){

        event.stopPropagation();

        var rent = this;
        var id = $(ui.draggable).attr('id').split('-').pop();
        var page = App.Data.pages.get(id);
        var oldCatId = page.get('category');
        var oldCat = App.Data.categories.get(oldCatId);
        var newCatId = this.model.id;

        //page.set({'category':newCatId,'order':0});
        //page.save();

        App.Data.POST_DROP = function() {

            $('.thumbs',oldCat.view.el).sortable('cancel');
            $('.thumbs',rent.model.view.el).sortable('cancel');

            $(page.view.el).appendTo($('.thumbs',rent.model.view.el));
            //console.log(rent.model.view.el,page.view.el);
            //$('.thumbs',rent.model.view.el).append(page.view.el);
            //$('.thumbs',oldCat.view.el).sortable("cancel")
            //rent.model.view.render();
        }

        //App.Data.categories.get(oldCatId).view.reorderPages();
        //this.model.view.reorderPages();
        //console.log($('#category-'+catId).get(0),ui.draggable,$('.thumbs',this.model.view.el).get(0));
    },

    onDropOver: function(event,ui){
        App.Data.IS_DROPPING = true;
        ui.draggable.triggerHandler("mouseover");
    },

    onDropOut: function(event,ui){
        App.Data.IS_DROPPING = false;
        ui.draggable.triggerHandler("mouseout");
    },

    render: function() {
        $(this.el).attr('id',this.id);
        $(this.el).html(
            _.template($("#tmpl-category-list-item").html(),
            this.model.toJSON())
        );

        // if is_default category
        if(!this.model.get('is_default')) {
            $(this.el).removeClass('non-editable');
            $(this.el).addClass('editable');
        } else {
            $(this.el).removeClass('editable');
            $(this.el).addClass('non-editable');
        }

        // make droppable by thumbnails
        this.$('a').droppable({
			accept: ".thumb",
			hoverClass: "hover"
        });

        return this;
    }

});


App.Views.PageThumbnail = Backbone.View.extend({

    tagName: "li",
    className: "thumb",
    //template: _.template($("#tmpl-page-thumb").html()),

    events: {
        "click .delete-page a"  : "showDeleteDialog",
        "click .yes-button"     : "destroy",
        "click .cancel-button"  : "hideDeleteDialog",
        "click .draft-button a" : "draft",
        "mouseover .thumb-gear a:not(.publish-page a)" : "overOption",
        "mouseout .thumb-gear a:not(.publish-page a)"  : "outOption",
        "click .publish-page a" : "publish",
        "click .share-page a"   : "share",
        "click .preview-page a" : "preview"
    },

    preview: function(event){
        App.controller.views.previewPopup.openPage(this.model);
        if(event) event.preventDefault();
    },

    overOption: function() {
        this.$('.thumb-gear').find('.status, .publish-page').hide();
    },

    outOption: function() {
        this.$('.thumb-gear').find('.status, .publish-page').show();
        //this.$('.thumb-gear').find('.status').show();
        //if(!this.model.get('published')) this.$('.thumb-gear').find('.publish-page').show();
    },

    showDeleteDialog: function() {
        this.$('.thumb-gear').addClass('show-delete-popup');
        return false;
    },

    hideDeleteDialog: function() {
        this.$('.thumb-gear').removeClass('show-delete-popup');
        return false;
    },

    draft: function(event){
        this.model.set({ published:false });
        this.model.save();
        if(event) event.preventDefault();
    },

    publish: function() {
        this.model.set({ published:true });
        this.model.save();
        return false;
    },

    destroy:function(){
        this.model.destroy();
        $(this.el).remove();
        return false;
    },

    share: function(event){

        var active = ['email'];
        if(App.Data.account['facebook_id']) active.push('facebook');
        if(App.Data.account['twitter_id']) active.push('twitter');

        var sharing = new App.Views.Sharing({ active:active, page:this.model });
        sharing.open();

        if(event) event.preventDefault();
        return false;
    },

    initialize: function() {
        this.el = $(this.el);
        this.el.data('view',this);
        this.model = this.options.model;
        this.id = 'thumb-'+this.model.id;
        this.poll = false;

        var rent = this;
        this.model.bind('change:published', function(model) { rent.changed(); });
        this.model.bind('change:is_processing', function(model) { rent.thumbnailChanged(); });

        // refresh thumbnail if it is not generated yet
        if(this.model.get('is_processing')) {
            var rent = this;
            var model = this.model;
            this.poll = setInterval(function(){
                model.fetch();
            }, 5000);
        }
    },

    changed: function() {
        this.render();
    },

    thumbnailChanged: function() {
        if(this.poll) clearInterval(this.poll);
        this.render();
    },

    render: function() {

        $(this.el).attr('id',this.id);
        if(!$(this.el).hasClass(this.className)) $(this.el).addClass(this.className);

        var modelDict = this.model.toJSON()
        modelDict['url'] = this.model.getUrl();
        $(this.el).html(
            _.template($("#tmpl-page-thumb").html(),
            modelDict)
        );

        // if generating thumbnail
        if(this.model.get('is_processing')) {
            $(this.el).addClass('generating-preview');
        } else {
            $(this.el).removeClass('generating-preview');
        }

        // if draft
        if(!this.model.get('published')) {
            $(this.el).addClass('draft');
        } else {
            $(this.el).removeClass('draft');
        }

        return this;
    }

});


App.Views.Category = Backbone.View.extend({

    tagName:"div",
    className:"category-section",
    id:"",

    events: {
        "click .expand-collapse,.closed-status":"toggleExpand",
        "sortstart .thumbs":"sortStart",
        "sortreceive .thumbs":"receivePage",
        "sortstop .thumbs":"sortStop"
    },

    initialize: function() {
        var rent = this;
        this.model = this.options.model;
        this.model.bind('change:count', function(model) { rent.setCount(model.get('count')); });
        this.collection = this.model.pages;
        this.id = "category-"+this.model.id;
    },

    toggleExpand: function(){
        catSection = $(this.el);
        if (catSection.hasClass('expanded')) {
            catSection.removeClass('expanded');
            catSection.addClass('collapsed');
        } else {
            catSection.removeClass('collapsed');
            catSection.addClass('expanded');
        }
        resizePanel();
        return false;
    },

    sortStart: function(event,ui){
        App.Data.IS_DROPPING = false;
    },

    sortStop: function(event,ui){

        event.stopPropagation();

        if(App.Data.IS_DROPPING == true){
            if(App.Data.POST_DROP) {
                App.Data.POST_DROP();
                App.Data.POST_DROP = false;
            }
            return false;
        } else {
            this.reorderPages(event,ui);
        }
    },

    reorderPages: function(event,ui){
        var ids = [];
        this.$('.thumbs li.thumb').each(function(i,item){
            ids.push($(item).attr('id').split('-').pop());
        });
        this.model.set({'page_ids':ids});
        this.model.save();
    },

    receivePage: function(event,ui){
        var pageId = $(ui.item).attr('id').split('-').pop();
        var prevCatId = $(ui.sender).parent(".category-section").attr('id').split('-').pop();
        var prevCategory = App.Data.categories.get(prevCatId);

        var order = false;
        this.$('.thumbs .thumb').each(function(i,thumb){
            if($(thumb).attr('id') == 'thumb-'+pageId) order = i;
        });

        var page = App.Data.pages.get(pageId);
        page.set({'category':this.model.id, 'order':order });
        page.save();

        // update page counts
        prevCategory.set({'count':$('#category-'+prevCatId+' .thumbs .thumb').length});
        this.model.set({'count':this.$('.thumbs .thumb').length});

        this.reorderPages();
    },

    setCount: function(cnt){
        this.$('.closed-status a span').text(cnt);
    },

    render: function() {

        $(this.el).attr('id',this.id);

        var rent = this;

        if(!$(this.el).hasClass('expanded') && !$(this.el).hasClass('collapsed')){
            $(this.el).addClass("expanded");
        }

        $(this.el).html(
            _.template($("#tmpl-category").html(),
            this.model.toJSON())
        );

        var pages = App.Data.pages.filter(function(page){
            if(page.get('category') == rent.model.id){
                return true;
            }
            return false;
        });

        // render pages
        if(pages.length > 0) {
            var track = this.$('ul.thumbs');
            _.each(pages,function(page){
                if(page.view) {
                    page.view.el.remove();
                    delete page.view;
                }
                page.view = new App.Views.PageThumbnail({'model':page});
                //if(!page.view) page.view = new App.Views.PageThumbnail({'model':page});

                track.append(page.view.render().el);
            });
        }

        // start sorting / dragging
		this.$(".thumbs" ).sortable({
            items: ".thumb",
			connectWith: ".thumbs",
			dropOnEmpty: true,
			placeholder: "thumb placeholder"
		});
		this.$(".thumbs").disableSelection();

        return this;
    }
});


App.Views.Categories = Backbone.View.extend({

    el: $('#category-track'),

    initialize: function() {
        this.collection = this.options.collection;
    },

    reorder: function(){

        var rent = this;
        var prev = false;
        this.collection.each(function(category,i){
            if(!prev) {
                $(category.view.el).prependTo(rent.el);
            } else {
                $(category.view.el).insertAfter(prev);
            }
            prev = category.view.el;
        });
    },

    render: function() {
        var rent = this;
        if(this.collection.models.length > 0) {
            var track = this.el;
            this.collection.each(function(category){
                if(!category.view) category.view = new App.Views.Category({'model':category});
                track.append(category.view.render().el);
            });

        } else {
            new Error({ message:'No categories were found' });
        }
    },

    selectCategory: function(id){
        if(id == 'all') {
            this.$('.category-section').show();
        } else {
            this.$('.category-section').hide();
            this.$('#category-'+id).show();
            if (this.$('#category-'+id).hasClass('collapsed')) {
                catSection.removeClass('collapsed');
                catSection.addClass('expanded');
            }
        }
    }
});


App.Views.BlogMode = Backbone.View.extend({

    el: $('#blog-mode'),

    events: {
        "sortstart .thumbs":"sortStart",
        "sortstop .thumbs":"sortStop"
    },

    initialize: function(){
        this.collection = this.options.collection;
        this.el.data('view',this);
    },

    category_id: false,
    category_blog_positions: [],

    selectCategory:function(id){

        this.category_id = false;
        this.category_blog_positions = [];

        if(!id || id == 'all'){
            this.render();
        } else {
            this.category_id = id;
            this.render();
        }
    },

    show: function(){},
    sortStart: function(event,ui){},
    sortStop: function(event,ui){
        this.reorderPages(event,ui);
        event.stopPropagation();
    },

    reorderPages: function(event,ui){
        var rent = this;
        var ids = {};

        if(rent.category_id) {

            rent.category_blog_positions;
            rent.$('.thumbs li.thumb').each(function(i,item){
                var model = $(item).data('view').model;
                var oldOrder = model.get('blog_order');
                var newOrder = rent.category_blog_positions[i]
                //console.log(oldOrder,newOrder);
                model.set({ 'blog_order':newOrder });
                if(oldOrder != newOrder) ids[model.get('id')] = newOrder;
            });

        } else {
            rent.$('.thumbs li.thumb').each(function(i,item){
                var model = $(item).data('view').model;
                var old = model.get('blog_order');
                //console.log(old,i);
                model.set({'blog_order':i});
                if(old != i) ids[model.get('id')] = i;
            });
        }


        var reorder_pages = new Backbone.Model(ids);
        reorder_pages.url = '/ajax/pages/blog_order/';
        reorder_pages.save();
        //console.log(ids);
    },

    render: function() {
        var rent = this;

        if(!$(this.el).hasClass('expanded') && !$(this.el).hasClass('collapsed')){
            $(this.el).addClass("expanded");
        }

        var collection = this.collection;
        if(rent.category_id) {
            collection = collection.filter(function(page){
                return page.get('category') == rent.category_id;
            });
        }

        $(rent.el).html(_.template($("#tmpl-blogmode").html(),{}));

        // render pages
        if(collection.length > 0) {
            var track = rent.$('ul.thumbs');

            // order by blog_order
            var pages = collection.sortBy(function(page){
                return page.get('blog_order');
            });

            // order by date
            //pages = pages.sortBy(function(page){
            //    return Date.parse(page.get('created'))*-1;
            //});
            var i = 0;
            pages.each(function(page){
                if(rent.category_id) rent.category_blog_positions.push(page.get('blog_order'));
                if(page.view) {
                    page.view.el.remove();
                    delete page.view;
                }
                page.view = new App.Views.PageThumbnail({'model':page});
                track.append(page.view.render().el);
                //console.log(page.view.el.data('view'),i);
                i++;
            });

            // start sorting / dragging
    		this.$(".thumbs" ).sortable({
                items: ".thumb",
    			//connectWith: ".thumbs",
    			dropOnEmpty: true,
    			placeholder: "thumb placeholder"
    		});
    		this.$(".thumbs").disableSelection();
        }

        return this;
    }
});


App.Views.Overview = Backbone.View.extend({

    el: $('#overview-panel'),

    categories: undefined,
    pages: undefined,

    _blogMode: undefined,
    _categoryMode: undefined,

    initialize: function(){

        this.categories = this.options.categories;
        this.pages = this.options.pages;

        this._categoryMode = new App.Views.Categories({collection:this.categories});
        this._blogMode = new App.Views.BlogMode({collection:this.pages});

        if(App.Data.options.get('navigation') != 'blog'){
            this.render();
        }
    },

    category: function(id) {},
    selectCategory: function(id){
        if(App.Data.options.get('navigation') == 'blog'){
            this._blogMode.selectCategory(id);
        } else {
            this._categoryMode.selectCategory(id);
        }
    },

    reorder: function(){
        if(App.Data.options.get('navigation') != 'blog') {
            this._categoryMode.reorder();
        }
    },

    render: function(){

        if(App.Data.options.get('navigation') == 'blog'){
            this._blogMode.render();
            this.$('#blog-mode').show();
            this.$('#category-track').hide();
        } else {
            this._categoryMode.render();
            this.$('#blog-mode').hide();
            this.$('#category-track').show();
        }
        return this;
    }
});




App.Views.NavigationStylePopup = Backbone.View.extend({

    el: $('.navigation-style-popup'),

    events: {
        'click .done-button':'doneButton',
        'click #navigation-styles li .button':'selectButton'
    },

    initialize: function(){
        this.bindButtons();
        this.select(App.Data.options.get('navigation'));
    },

    bindButtons:function(){
        var rent = this;
        $('#navigation-style-control a.navstyle').click(function(event){
            rent.open();
            event.preventDefault();
        });
    },

    open: function(event){
        $('.popup').hide();
        $('.navigation-style-popup').fadeIn('fast');
        if(event) event.preventDefault();
    },

    close: function(event){
        $('.popup').hide();
        if(event) event.preventDefault();
    },

    selectButton: function(event){
        var button = $(event.currentTarget);
        if (!(button.hasClass('button-current'))) {
            var type = button.parent('li').attr('id').split("-").pop();
            this.select(type);
        }
        return false;
    },

    doneButton: function(event){
        this.save();
        this.close();
        if(event) event.preventDefault();
    },

    save: function(event){
        App.Data.options.save();
        App.controller.views.overview.render();
        if(event) event.preventDefault();
    },

    select: function(type){
        if(type == '') type = 'off';
        this.$('#navigation-styles li .button-current').removeClass('button-current').addClass('button-select');
        this.$('#navigation-styles li#navigation-style-'+type+' .button').removeClass('button-select').addClass('button-current');
        $('#navigation-style-control strong').html($('li#navigation-style-'+type).find('h4').text());

        if(type=='off') type = '';
        App.Data.options.set({ 'navigation':type });
    },

    /*
    $('#navigation-styles .button').click(function(){
        if (!($(this).hasClass('button-current'))) {
            $('#navigation-styles .button-current').removeClass('button-current').addClass('button-select');
            $(this).removeClass('button-select').addClass('button-current');
            $('#navigation-style-control strong').html($(this).parent('li').find('h4').html());
            return false;
        }
    });
    */

    render: function(){

        return this;
    }
});


App.Views.Subscriber = Backbone.View.extend({

    tagName: 'tr',

    events: {
        'click a.del':'remove'
    },

    initialize: function(){
        this.model = this.options.model;
        this.parent = this.options.parent;
        this.id = 'subscriber-'+this.model.id;
    },

    render: function(){
        $(this.el).attr('id',this.id);
        $(this.el).html(
            _.template($("#tmpl-subscriber").html(),
            this.model.toJSON())
        );
        return this;
    },

    remove: function(){
        var rent = this;
        this.model.destroy({'success':function(){
            $(rent.el).fadeOut("fast",function(){
                $(rent.el).remove();
            });
            rent.parent.updateCount();
        }});
    }
});


App.Views.SubscribersPopup = Backbone.View.extend({

    el: $('.subscribers-popup'),

    events: {
        'click .popup-header a.done-button':'close',
        'focus #q':'focusSearch',
        'blur #q':'blurSearch',
        'keyup #q':'search',
        'change #q':'search',
        'click #add-subscriber-link':'openAddDialog',
        'focus #new-subscriber':'focusAddDialogEmail',
        'blur #new-subscriber':'blurAddDialogEmail',
        'click #new-subscriber-buttons .cancel-button':'closeAddDialog',
        'click #new-subscriber-buttons .save-button':'subscribe',
        'submit #new-subscriber-form':'subscribe'
    },

    initialize: function(){
        this.collection = this.options.collection;
        this.collection.comparator = function(model){
            return model.get("created");
        };
        this.collection.sort();
        this.render();
    },

    updateCount: function(){
        this.$('.subscriber-count').text(this.collection.length);
        $('#subscribers-link .no-of').text(this.collection.length);
    },

    render: function(){
        var rent = this;

        if(this.collection.length > 0) {
            var track = this.$('tbody');
            this.collection.each(function(subscriber){
                if(!subscriber.view) subscriber.view = new App.Views.Subscriber({'model':subscriber, 'parent':rent });
                track.prepend(subscriber.view.render().el);
            });
        }

        this.updateCount();

        return this;
    },

    reset: function(){
        this.closeAddDialog();
    },

    bindButtons:function(){
        var rent = this;
        $('#subscribers-link a').click(function(event){
            rent.open();
            event.preventDefault();
        });
    },

    open: function(event){
        $('.popup').hide();
        $(this.el).fadeIn('fast');
        if(event) event.preventDefault();
    },

    close: function(event){
        var rent = this;
        $('.popup').fadeOut('fast',function(){
            rent.reset();
        });
        window.location = '#';
        if(event) event.preventDefault();
    },

    openAddDialog: function(event){
        this.$('.address-book thead').hide();
        this.$('#new-subscriber-field').fadeIn('fast');
        if(event) event.preventDefault();
    },

    closeAddDialog: function(event){
        var rent = this;
        rent.$('#new-subscriber-field').fadeOut('fast', function(){
            rent.$('.address-book thead').fadeIn('fast');
            rent.resetAddDialog();
        });

        if(event) event.preventDefault();
    },

    resetSearch:function(e){
        $('#q').val('');
        this.search();
        $('#q').blur();
        if(e) e.preventDefault();
    },

    blurSearch:function(e){
        if(this.$('#q').val() == '') this.$('#q').val(this.$('#q').attr('data-placeholder'));
        this.$('#q').addClass('focus');
    },

    focusSearch:function(e){
        if(this.$('#q').val() == this.$('#q').attr('data-placeholder')) this.$('#q').val('');
        this.$('#q').removeClass('focus');
    },

    search: function(event){
        var track = this.$('tbody');
        var str = this.$('#q').val();
        if (str == this.$('#q').attr('data-placeholder') || str == '') {
            track.find('tr').show();
        } else {
            var pattern = new RegExp(str,'i');
            track.find('tr').hide();
            this.collection.each(function(model){
                if(pattern.test(model.get('email'))){
                    $(model.view.el).show();
                }
            });
        }
    },

    blurAddDialogEmail:function(e){
        if(this.$('#new-subscriber').val() == '') this.$('#new-subscriber').val(this.$('#new-subscriber').attr('data-placeholder'));
        this.$('#new-subscriber').addClass('focus');
    },

    focusAddDialogEmail:function(e){
        if(this.$('#new-subscriber').val() == this.$('#new-subscriber').attr('data-placeholder')) this.$('#new-subscriber').val('');
        this.$('#new-subscriber').removeClass('focus');
    },

    resetAddDialog: function(e){
        $('#new-subscriber').val('');
        $('#new-subscriber').blur();
        if(e) e.preventDefault();
    },

    focusAddDialog: function(){
        $('#new-subscriber').focus();
    },

    subscribeError: function(){
        var rent = this;

        this.$('#new-subscriber').addClass('error').delay(300,function(){
            if(console && console.log) console.log('Error Out');
        }).removeClass('error');

        if(console && console.log) console.log('Error In');
    },
    subscribeDuplicate: function(){
        if(console && console.log) console.log('Duplicate');
    },
    subscribeValidate: function(){
        var rtn = true;
        if(this.$('#new-subscriber').val() == this.$('#new-subscriber').attr('data-placeholder')) rtn = false;
        if(this.$('#new-subscriber').val() == '') rtn = false;
        return rtn;
    },

    subscribe: function(event){
        var rent = this;
        if(this.subscribeValidate()) {
            var subscriber = new App.Models.Subscriber({ 'email': this.$('#new-subscriber').val() });
            subscriber.save({},{
                'success': function(model){
                    rent.resetSearch();
                    rent.collection.add([model],{at:1});
                    rent.render();
                    rent.resetAddDialog();
                    rent.focusAddDialog();
                }
            });
        }

        event.preventDefault();
    }

});


// ACCOUNT POPUP :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


App.Views.AccountMiniPopup = Backbone.View.extend({
    parent: undefined,
    init: function(){
        this.parent = this.options.parent;
    },

    open: function(e){
        this.parent.$('.minipop').hide();
        this.el.show();
        if(e) e.preventDefault();
    },

    close: function(e){
        this.el.hide();
        this.parent.setActive();
        if(e) e.preventDefault();
    },

    save: function(e){
        this.close();
        if(e) e.preventDefault();
    }

});

App.Views.AccountEmailPopup = App.Views.AccountMiniPopup.extend({

    el: $('.account-email-popup'),

    events: {
        'click .cancel-button':'close',
        'click .save-button':'save'
    },

    initialize: function(){
        this.init();
        this.render();
    },

    render: function(){
        return this;
    },

    setValue: function(data){
        this.$('input[name=full_name]').val(data['full_name']);
        this.parent.$('#account-item-email h4').text(data['full_name']);
        this.$('input[name=email]').val(data['email']);
        this.parent.$('#account-item-email strong').text(data['email']);
    },

    save: function(e){
        var rent = this;
        var input = this.$('input[name=domain]');
        var domain = input.val()

        $.ajax({
            'url':'https://nubook.com/ajax/account/',
            'type':'PUT',
            'data':{
                'full_name':rent.$('input[name=full_name]').val(),
                'email':rent.$('input[name=email]').val(),
                'password':rent.$('input[name=password]').val(),
                'check_password':rent.$('input[name=check_password]').val()
            },
            'success': function(currentDomain){
                rent.setValue(currentDomain);
                rent.close();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseText);
            }
        });

        if(e) e.preventDefault();
    }

});

App.Views.AccountBillingPopup = App.Views.AccountMiniPopup.extend({

    el: $('.account-billing-popup'),
    plans_radio: undefined,

    events: {
        'click .cancel-button':'close',
        'click .save-button':'save'
    },

    initialize: function(){
        this.init();
        this.plans_radio = new App.Views.PseudoRadio({el:this.$('.radio-group')})
        this.render();
    },

    render: function(){
        return this;
    },

    setValue: function(subscription){

        this.$('input[name=first_name]').val(subscription['credit_card']['first_name']);
        this.$('input[name=last_name]').val(subscription['credit_card']['last_name']);
        this.parent.$('#account-item-billing span.cc').text(subscription['credit_card']['masked_card_number']);

        var plan = "";
        if(subscription['product_handle'] == 'nubook-monthly') {
            plan = "$<strong>10</strong>/mo";
        } else if(subscription['product_handle'] == 'nubook-yearly') {
            plan = "$<strong>100</strong>/yr";
        }
        this.parent.$('#account-item-billing h4 span').html(plan);

    },

    save: function(e){
        var rent = this;
        $.ajax({
            'url':'https://nubook.com/ajax/account/billing/',
            'type':'PUT',
            'data':{
                'plan':rent.$('input:radio[name=plan]:checked').val(),
                'first_name':rent.$('input[name=first_name]').val(),
                'last_name':rent.$('input[name=last_name]').val(),
                'cc':rent.$('input[name=cc]').val(),
                'cvv':rent.$('input[name=cvv]').val(),
                'month':rent.$('input[name=month]').val(),
                'year':rent.$('input[name=year]').val()
            },
            'success': function(currentSubscription){
                rent.setValue(currentSubscription);
                rent.close();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseText);
            }
        });

        if(e) e.preventDefault();
    }
});

App.Views.AccountDomainPopup = App.Views.AccountMiniPopup.extend({

    el: $('.account-domain-popup'),

    events: {
        'click .cancel-button':'close',
        'click .save-button':'save'
    },

    initialize: function(){
        this.init();
        this.render();
    },

    render: function(){
        return this;
    },

    sanitizeValue: function(domain){
        if(!domain) return domain;
        if(domain.indexOf('http://') === 0) domain = domain.replace('http://','');
        if(domain.indexOf('https://') === 0) domain = domain.replace('https://','');
        if(domain.indexOf('www.') === 0) domain = domain.replace('www.','');
        return domain;
    },

    setValue: function(domain){
        //domain = this.sanitizeValue(domain);
        this.$('input[name=domain]').val(domain);
        this.parent.$('#account-item-domain strong').text(domain ? domain : 'no custom domain');
    },

    save: function(e){
        var rent = this;
        var input = this.$('input[name=domain]');
        var domain = this.sanitizeValue(input.val());

        $.ajax({
            'url':'https://nubook.com/ajax/account/domain/',
            'type':'PUT',
            'data':{
                'domain':domain,
            },
            'success': function(currentDomain){
                rent.setValue(currentDomain);
                rent.close();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });

        if(e) e.preventDefault();
    }

});


App.Views.AccountSeoPopup = App.Views.AccountMiniPopup.extend({

    el: $('.account-seo-popup'),

    events: {
        'click .cancel-button':'close',
        'click .save-button':'save'
    },

    initialize: function(){
        this.init();
        this.render();
    },

    render: function(){
        return this;
    },

    setValue: function(description,keywords){
        this.$('textarea[name=seo_description]').val(description);
        this.$('textarea[name=seo_keywords]').val(keywords);
        this.parent.$('#account-item-seo strong').text((description || keywords) ? 'configured' : 'not configured');
    },

    save: function(e){
        var rent = this;
        var seo_description = this.$('textarea[name=seo_description]').val();
        var seo_keywords = this.$('textarea[name=seo_keywords]').val();

        $.ajax({
            'url':'https://nubook.com/ajax/account/seo/',
            'type':'PUT',
            'data':{
                'seo_description':seo_description,
                'seo_keywords':seo_keywords
            },
            'success': function(currentDomain){
                rent.setValue(seo_description, seo_keywords);
                rent.close();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });

        if(e) e.preventDefault();
    }

});


App.Views.AccountAnalyticsPopup = App.Views.AccountMiniPopup.extend({

    el: $('.account-analytics-popup'),

    events: {
        'click .cancel-button':'close',
        'click .save-button':'save'
    },

    initialize: function(){
        this.init();
        this.render();
    },

    render: function(){
        return this;
    },

    setValue: function(code){
        this.$('input[name=google_analytics_code]').val(code);
        this.parent.$('#account-item-analytics strong').text(code ? code : 'Not Installed');
    },

    save: function(e){
        var rent = this;
        var input = this.$('input[name=google_analytics_code]');
        var google_analytics_code = input.val()

        $.ajax({
            'url':'https://nubook.com/ajax/account/analytics/',
            'type':'PUT',
            'data':{
                'google_analytics_code':google_analytics_code,
            },
            'success': function(currentCode){
                rent.setValue(currentCode);
                rent.close();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseText);
            }
        });

        if(e) e.preventDefault();
    }

});

App.Views.AccountPopup = Backbone.View.extend({

    el: $('.account-popup'),

    email_view: undefined,
    billing_view: undefined,
    domain_view: undefined,
    analytics_view: undefined,
    seo_view: undefined,

    events: {
        "click .popup-header .done-button":"close",
        "click #account-item-email .edit-button":"openEmail",
        "click #account-item-billing .edit-button":"openBilling",
        "click #account-item-domain .edit-button":"openDomain",
        "click #account-item-analytics .edit-button":"openAnalytics",
        "click #account-item-seo .edit-button":"openSeo",
        "click .account-settings-footer a.cancel-button":"openCancelAccount",
        "click .cancel-account a.confirm-cancelation":"cancelAccount",
        "click .popup-header .go-back-button":"closeCancelAccount"
    },

    initialize: function(){
        this.email_view = new App.Views.AccountEmailPopup({ parent:this });
        this.billing_view = new App.Views.AccountBillingPopup({ parent:this });
        this.domain_view = new App.Views.AccountDomainPopup({ parent:this });
        this.analytics_view = new App.Views.AccountAnalyticsPopup({ parent:this });
        this.seo_view = new App.Views.AccountSeoPopup({ parent:this });
        this.render();
    },

    render: function(){
        return this;
    },

    open: function(e){
        this.closeCancelAccount();
        this.el.show();
        if(e) e.preventDefault();
    },

    close: function(e){
        this.$('.minipop').hide();
        this.setActive();
        this.el.hide();
        window.location = '#/';
        if(e) e.preventDefault();
    },

    setActive: function(section){
        this.$('.account-item').removeClass('active');
        if(section) this.$('#account-item-'+section).addClass('active');
    },

    openEmail: function(e){
        this.email_view.open();
        this.setActive('email');
        if(e) e.preventDefault();
    },

    openBilling: function(e){
        this.billing_view.open();
        this.setActive('billing');
        if(e) e.preventDefault();
    },

    openDomain: function(e){
        this.domain_view.open();
        this.setActive('domain');
        if(e) e.preventDefault();
    },

    openAnalytics: function(e){
        this.analytics_view.open();
        this.setActive('analytics');
        if(e) e.preventDefault();
    },

    openSeo: function(e){
        this.seo_view.open();
        this.setActive('seo');
        if(e) e.preventDefault();
    },

    openCancelAccount: function(e){
        this.$('.minipop').hide();
        this.$('.account-settings').hide();
        this.$('.cancel-account').show();
        this.$('a.done-button').css('display','none');
        this.$('a.go-back-button').css('display','inline');
        if(e) e.preventDefault();
    },

    closeCancelAccount: function(e){

        this.$('a.done-button').css('display','inline');
        this.$('a.go-back-button').css('display','none');
        this.$('.account-settings').show();
        this.$('.cancel-account').hide();

        if(e) e.preventDefault();
    },

    cancelAccount: function(e){
        var rent = this;

        $.ajax({
            'url':'https://nubook.com/ajax/account/cancel/',
            'type':'PUT',
            'data': {
                'confirm':true
            },
            'success': function(data){
                window.location = '/logout';
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseText);
            }
        });

        if(e) e.preventDefault();
    }

});

App.Views.PreviewPopup = Backbone.View.extend({

    el: $('.preview-popup'),

    events: {
        'click a.hider-inner':'close',
        'click .frame-footer .share-page':'share_page'
    },

    view_in_site: function(event){
        if(this.currentPage) {

        }
    },

    save_as_image: function(event){
        if(this.currentPage) {

        }
    },

    share_page: function(event){
        if(this.currentPage) {
            this.close();

            var active = ['email'];
            if(App.Data.account['facebook_id']) active.push('facebook');
            if(App.Data.account['twitter_id']) active.push('twitter');

            var sharing = new App.Views.Sharing({ active:active, page:this.currentPage });
            sharing.open();
        }

        if(event) event.preventDefault();
    },

    initialize: function(){
        this.render();
    },

    render: function(){
        return this;
    },

    close: function(){
        var rent = this;
        this.el.fadeOut('fast',function(){
            rent.$('#preview-frame').attr('src','');
        });
    },

    currentPage: null,
    loadPage: function(page){
        this.currentPage = page;
        this.$('#preview-frame').attr('src', page.id ? '/renders/page/'+page.id : 'about:blank');
        this.$('.frame-footer a.view-in-site').attr('href', page.getUrl());
        if(page.get('published')) {
            this.$('.view-in-site-wrap').show();
        } else {
            this.$('.view-in-site-wrap').hide();
        }

        this.$('.frame-footer a.save-as-image').attr('href', page.get('image'));
        if(page.get('is_processing')) {
            this.$('.save-as-image-wrap').hide();
        } else {
            this.$('.save-as-image-wrap').show();
        }

        this.$('.frame-footer').show();
    },

    load: function(id){
        this.currentPage = null;
        this.$('#preview-frame').attr('src', id ? '/renders/page/'+id : '');
        this.$('.frame-footer').hide();
    },

    openPage: function(page){
        this.loadPage(page);
        this.open();
    },

    open: function(id){
        if(id) this.load(id);
        this.el.fadeIn('fast');
    }
});



App.Views.SharePopup = Backbone.View.extend({

    open: function(){
        this.clearMessage();
        this.el.show();
    },

    close: function(event){
        this.el.hide();
        if(this.parent) this.parent.closing(this);
        if(event) event.preventDefault();
    },

    disable: function(){
        $(this.el).addClass('disabled');
        this.$('textarea, input').attr('disabled','disabled').css('opacity',0.5);
        this.$('label').css('opacity',0.5);
        this.$('.save-controls').hide();
    },

    enable: function(){
        $(this.el).removeClass('disabled');
        this.$('textarea, input').removeAttr('disabled').css('opacity',1);
        this.$('label').css('opacity',1);
        this.$('.save-controls').show();
    },

    clearMessage: function(){
        this.$('.messaging').text('');
        this.$('.messaging').hide();
    },

    message: function(message, error){

        this.clearMessage();

        this.$('.messaging').text(message);
        if(error) {
            this.$('.messaging').addClass('error');
        } else {
            this.$('.messaging').removeClass('error');
        }

        if(message) {
            this.$('.messaging').fadeIn('fast');
        }
    }
});

App.Views.ShareEmail = App.Views.SharePopup.extend({

    el: $('#share-email-popup'),

    events: {
        'click a.close-x':'close',
        'click .send-button a':'submit'
    },

    initialize: function(){
        this.parent = this.options.parent;
        this.page = this.options.page;
        this.subscribers_checkbox = new App.Views.PseudoCheck({ el: this.$('#email-to-subscribers-field .checkbox-group') });
        this.render();
    },

    submit: function(event){

        var rent = this;

        var share = new Backbone.Model({
            'subject': rent.$('#email-subject').val(),
            'message': rent.$('#email-body').val(),
            'page': this.page.id,
            'to': rent.$('#email-recipients').val(),
            'send_to_list': rent.$('#email-to-subscribers').is(':checked')
        });
        share.url = '/ajax/share/email/';

        share.save({},{
            'success': function(model){
                rent.message('Page sent')
                rent.disable();
            },
            'error': function(model, response){
                rent.message(response.responseText, true)
            }
        });

        if(event) event.preventDefault();
    },

    render: function(){
        this.$('#email-recipients').val('');
        if(this.page) this.$('#email-subject').val(this.page.get('title'));
        this.$('#email-body').val('');
        return this;
    }
});

App.Views.ShareFacebook = App.Views.SharePopup.extend({

    el: $('#share-facebook-popup'),

    events: {
        'click a.close-x':'close',
        'click .post-button a':'submit'
    },

    initialize: function(){
        this.parent = this.options.parent;
        this.page = this.options.page;
        this.render();
    },

    submit: function(event){
        this.message('Message posted to Facebook.');
        this.disable();
        if(event) event.preventDefault();
    },

    submit: function(event){

        var rent = this;

        var share = new Backbone.Model({
            page: this.page.id,
            message: this.$('#facebook-message').val()
        });
        share.url = '/ajax/share/facebook/'

        share.save({},{
            'success': function(model){
                rent.message('Page posted')
                rent.disable();
            },
            'error': function(model, response){
                rent.message(response.responseText, true)
            }
        });

        if(event) event.preventDefault();
    },

    render: function(){
        this.$('#facebook-message').val('');
        return this;
    }
});

App.Views.ShareTwitter = App.Views.SharePopup.extend({

    el: $('#share-twitter-popup'),

    events: {
        'click a.close-x':'close',
        'keyup #twitter-message':'update_character_count',
        'click .tweet-button a':'submit'
    },

    initialize: function(){
        this.parent = this.options.parent;
        this.page = this.options.page;
        this.render();
    },

    update_character_count: function() {
        var chars = 140 - this.$('#twitter-message').val().length;
        this.$('.charcnt').text(chars);
        if(chars < 0) {
            this.$('.charcnt').addClass('overlimit');
        } else {
            this.$('.charcnt').removeClass('overlimit');
        }
    },

    submit: function(event){

        var rent = this;

        var share = new Backbone.Model({
            page: this.page.id,
            message: this.$('#twitter-message').val()
        });
        share.url = '/ajax/share/twitter/'

        share.save({},{
            'success': function(model){
                rent.message('Message tweeted')
                rent.disable();
            },
            'error': function(model, response){
                rent.message(response.responseText, true)
            }
        });

        //this.message('Message Tweeted.');
        //this.disable();

        if(event) event.preventDefault();
    },

    render: function(){
        if(this.page) {
            this.$('#twitter-message').val(this.page.get('title')+": "+this.page.get('url'));
            this.update_character_count();
        }
        return this;
    }
});

App.Views.Sharing = Backbone.View.extend({
    el: $('#sharing-popups'),
    events: {
        'click .close-sharing a':'close'
    },
    active: [],
    modules: {},
    initialize: function(){
        this.active = this.options.active;
        this.page = this.options.page;

        this.modules.email = new App.Views.ShareEmail({ parent: this, page: this.page });
        this.modules.facebook = new App.Views.ShareFacebook({ parent: this, page: this.page });
        this.modules.twitter = new App.Views.ShareTwitter({ parent: this, page: this.page });

        // on resize
        $(window).resize(this.resize);
    },

    open: function(){
        var rent = this;
        this.el.show();
        _.each(this.modules,function(module,key){
            if(_.indexOf(rent.active,key) === -1) {
                module.close();
            } else {
                module.open();
                module.enable();
            }
        });
        this.resize();
    },

    closing: function(view){
        if(this.$('.share-popup:visible').length == 0){
            this.close();
        } else {
            this.resize();
        }
    },

    close: function(event) {
        this.el.hide();
        delete this;
        if(event) event.preventDefault();
    },

    resize: function(){
        this.$('.sharing-popups-wrap').css('top', (($(window).height() - this.$('.sharing-popups-wrap').height()) /2 )+"px");
    },

    render: function(){
        return this;
    }
});


App.Views.InvitationsPopup = Backbone.View.extend({

    el: $('.invitations-popup'),

    events: {
        "click .popup-header .done-button":"close",
        "focus input[name=email]":"focusEmail",
        "blur input[name=email]":"blurEmail",
        "click .send-invite-button":"send",
        "submit form":"send"
    },

    bindButtons: function(){
        var rent = this;

        if(App.Data.account.invitations > 0){
            $('a.invite-a-friend-button').unbind('click');
            $('a.invite-a-friend-button').bind('click',function(){
                rent.open();
            });
            $('a.invite-a-friend-button').css('display','block');
        } else {
            $('a.invite-a-friend-button').css('display','none');
        }
    },

    initialize: function(){
        this.bindButtons();
        this.el.data('view',this);
        this.render();
    },

    render: function(){

        this.$('input[name=email]').val('');
        this.blurEmail();
        this.$('form').show();
        this.$('.thanks').hide();
        this.$('.error').hide();

        return this;
    },

    open: function(e){
        this.render();
        this.el.show();
        if(e) e.preventDefault();
    },

    close: function(e){
        this.el.hide();
        window.location = '#/';
        if(e) e.preventDefault();
    },

    error: function(msg){
        this.$('.error').text(msg);
        this.$('.error').fadeIn('fast');
    },

    thanks: function(){
        var rent = this;
        this.$('form').hide();
        this.$('.thanks').fadeIn('fast').delay(1500).fadeOut('slow',function(){
            if(App.Data.account.invitations == 0) {
                rent.close();
            } else {
                rent.render();
            }
        });
    },

    blurEmail:function(e){
        if(this.$('input[name=email]').val() == '') this.$('input[name=email]').val(this.$('input[name=email]').attr('data-placeholder'));
        this.$('input[name=email]').removeClass('focus');
    },

    focusEmail:function(e){
        if(this.$('input[name=email]').val() == this.$('input[name=email]').attr('data-placeholder')) this.$('input[name=email]').val('');
        this.$('input[name=email]').addClass('focus');
    },

    send: function(e){
        var rent = this;

        $.ajax({
            'url':'https://nubook.com/ajax/account/invites/',
            'type':'POST',
            'data': {
                'email': this.$('input[name=email]').val()
            },
            'success': function(data){
                App.Data.account.invitations--;
                rent.$('.number-of-invitations').text(App.Data.account.invitations)
                rent.thanks();
            },
            'error':function(jqXHR, textStatus, errorThrown) {
                rent.error(jqXHR.responseText);
            }
        });

        if(e) e.preventDefault();
    }

});


App.Views.FuePopup = Backbone.View.extend({

    el: $('.fue-popup'),

    count:0,
    slides: [],
    current:0,
    slide_w:1000,

    events: {
        'click a.close':'close',
        'click a.hider-inner':'close',
        'click a.arrow.previous':'previous',
        'click a.arrow.next':'next'
    },

    initialize: function(){
        this.render();
        this.anithumbInitialize();
    },

    anithumb_on: false,
    anithumbSlides:[],
    anithumbCount:0,
    anithumbInitialize: function(){
        var rent = this;
        this.anithumbCount = this.$('.anithumb img').length;
        this.$('.anithumb img').css('opacity',0);
        $(this.$('.anithumb img')[this.anithumbCount-1]).css('opacity',1);
        this.anithumbNext();
    },
    anithumbNext: function(){
        var rent = this;
        var nextThumb = $(this.$('.anithumb img')[0]);

        //console.log(nextThumb);

        nextThumb.css('opacity',0);
        this.$('.anithumb').append(nextThumb);
        nextThumb.delay(1000).animate({'opacity':1},1500,function(){
            if(rent.anithumb_on) rent.anithumbNext();
        });
    },

    render: function(){
        var rent = this;
        this.slides = this.el.find('.slides .slide');
        this.count = this.slides.length;
        this.track = this.el.find('.slides .track');
        this.track.css('width',this.count*this.slide_w);
        this.previous_arrow = this.el.find('a.arrow.previous');
        this.next_arrow = this.el.find('a.arrow.next');

        this.$('.dots .track').html('');
        $.each(this.slides,function(i,slide){
            rent.$('.dots .track').append($('<a class="dot" />'));
        });
        this.dots = this.el.find('.dots .dot');

        this.reset();
        return this;
    },

    reset:function(){
        this.load(0);
    },

    load: function(num) {
        this.current = num;
        if(this.current >= this.count-1) { this.next_arrow.addClass('disabled'); } else { this.next_arrow.removeClass('disabled'); }
        if(this.current == 0) { this.previous_arrow.addClass('disabled'); } else { this.previous_arrow.removeClass('disabled'); }
        var offset = (this.current*this.slide_w*-1);
        this.track.animate({'left':offset+'px'},'fast');

        // set dot
        this.dots.removeClass('current');
        $(this.dots[num]).addClass('current');
    },

    previous: function(event){
        if(this.current == 0) {
            this.load(this.count-1);
        } else {
            this.load(this.current-1);
        }
        if(event) event.preventDefault();
    },

    next: function(event){
        if(this.current+1 >= this.count) {
            this.load(0);
        } else {
            this.load(this.current+1);
        }
        if(event) event.preventDefault();
    },

    open: function(id){
        this.anithumb_on = true;
        this.reset();
        this.el.fadeIn('fast');
    },

    close: function(event){
        var rent = this;
        this.anithumb_on = false;
        this.el.fadeOut('fast');
        if(event) event.preventDefault();
    }

});






// CONTROLLER ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

App.Controllers.Main = Backbone.Controller.extend({

    routes : {
        ""                : "index",
        "/"               : "allCategories",
        "/categories/all" : "allCategories",
        "/categories/:id" : "category",
        "/subscribers"    : "subscribers",
        "/account"        : "account",
        "/fue"            : "fue"
    },

    views: {},

    initialize: function(){
        this.views.categoryList = new App.Views.CategoryList({collection:App.Data.categories});
        this.views.overview = new App.Views.Overview({ categories:App.Data.categories, pages:App.Data.pages })
        this.views.navigationStylePopup = new App.Views.NavigationStylePopup();
        this.views.subscribersPopup = new App.Views.SubscribersPopup({collection:App.Data.subscribers});
        this.views.previewPopup = new App.Views.PreviewPopup();
        this.views.accountPopup = new App.Views.AccountPopup();
        //this.views.invitationsPopup = new App.Views.InvitationsPopup();
        if($('.fue-popup')) {
            this.views.fuePopup = new App.Views.FuePopup();
            this.views.fuePopup.open();
        }
    },

    index: function(){
        this.allCategories();
    },

    category: function(id) {
        this.views.overview.selectCategory(id);
        this.views.categoryList.selectCategory(id);
    },

    allCategories: function(){
        this.views.overview.selectCategory('all');
        this.views.categoryList.selectCategory('all');
    },

    account: function(){
        this.views.accountPopup.open();
    },

    subscribers: function(){
        this.views.subscribersPopup.open();
    },

    fue: function(){
        this.views.fuePopup.open();
    }

});



// LETS GET THIS PARTY STARTED RIGHT? ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/*
var pages = new App.Collections.Pages();
pages.fetch({
    success: function(){
        App.init();
    },
    error: function(){
        new Error({ message: "Error loading pages." });
    }
});
*/
