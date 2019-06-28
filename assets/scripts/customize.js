// ERROR HANDLING ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

var Error = function(options){
    if(options.message) {
        if(console && console.log) console.log(options.message);
    }
}


// CUSTOMIZE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

var Customize = {
    Models: {},
    Views: {},
    Collections: {},
    data: {},
    view: undefined,
    init: function(options,themes) {
        var rent = this;
        
        this.data.options = options;
        this.data.options.bind('change',function(model){
            Customize.pushOptions(model);
        });
        this.data.themes = themes;
        this.view = new this.Views.Framework({model:options,themes:themes});
        
        this.data.shift = false;
        $(document).bind('keydown','shift', function(evt){ rent.data.shift = true; });
        $(document).bind('keyup','shift', function(evt){ rent.data.shift = false; });

    }
};


// MODELS + COLLECTIONS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Customize.Models.Link = Backbone.Model.extend({});
Customize.Collections.Links = Backbone.Collection.extend({
    model: Customize.Models.Link
});

Customize.Models.Options = Backbone.Model.extend({
    url:"/ajax/customize/"
});

Customize.Models.Theme = Backbone.Model.extend({});
Customize.Collections.Themes = Backbone.Collection.extend({
    model: Customize.Models.Theme
});


// BRIDGE METHODS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Customize.previewFrame = $('#preview');
Customize.previewWindow = Customize.previewFrame.get(0).contentWindow;
Customize.pushOptions = function(options){
    if(Customize.previewWindow && Customize.previewWindow.Nubook != undefined) Customize.previewWindow.Nubook.acceptOptions(options);
}

Customize.childLoaded = function(childOptions){
    if(childOptions){
        
        Customize.data.options.set({
            'logo_x':childOptions.get('logo_x'),
            'logo_y':childOptions.get('logo_y'),
            'slogan_x':childOptions.get('slogan_x'),
            'slogan_y':childOptions.get('slogan_y'),
            'logo':childOptions.get('logo'),
            'theme':childOptions.get('theme'),
            'theme_slug':childOptions.get('theme_slug')
        });
        
        Customize.view.logo.render();
    }
    
    Customize.pushOptions(Customize.data.options);    
}


// VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Customize.Views.Framework = Backbone.View.extend({
    
    el: $('#sizer'),
    
    events: {
        'click #toolbar .theme-button':'toggleThemes',
        'click #toolbar .logo-button':'toggleLogo',
        'click #toolbar .settings-button':'toggleSettings',
        'click #toolbar .save-controls .cancel-button a':'cancel',
        'click #toolbar .save-controls .save-button a':'save'
    },
    
    logo: undefined,
    settings:undefined,
    
    initialize: function(){
        this.model = this.options.model;
        var rent = this;
        setupLabel();
        this.logo = new Customize.Views.Logo({model:this.model});
        this.settings = new Customize.Views.Settings({model:this.model});
        this.themes = new Customize.Views.Themes({collection:this.options.themes, parent:this });
        
        $(window).resize(function(){ rent.resize(); });
        $(window).resize();
    },
    
    setThemeName: function(name){
        this.$('.theme-button a span.value').text('Theme: '+name);
        return false;
    },
    
    toggleLogo: function(e){
        this.logo.toggle();
        e.preventDefault();
    },

    toggleThemes: function(e){
        this.themes.toggle();
        e.preventDefault();
    },
    
    toggleSettings: function(e){
        this.settings.toggle();
        e.preventDefault();
    },
    
    cancel: function(e){
        if(confirm("Are you sure you want to cancel customizing your layout?")){
            window.location = '/dashboard';
        }
        e.preventDefault();
    },
        
    resize:function(complete){
        $('#workspace').css({ 'height':($(window).height()-$('#toolbar').outerHeight())+'px' });
        $('#preview').css({ 'height':$('#workspace').height()+'px' });
        if(complete) complete();
    },
    
    is_saving:false,
    save:function(e){
        var rent = this;
        if(this.is_saving == true) return false;
        this.is_saving = true;
                
        this.model.save({},{
            'success': function(model, response) {
                rent.is_saving = false;
                window.location = '/dashboard';
            },
            'error': function(model, response){
                rent.is_saving = false;
                Error({'message':'Model did not save'});
            }
        });
        e.preventDefault();
    }
});


// HEADER + LOGO POPUP :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Customize.Views.Logo = Backbone.View.extend({
    
    el: $("#logo-popup"),
    
    events: {
        "click a.done-button":"done",
        "change #logo-text-value":"changeLogoText",
        "keyup #logo-text-value":"changeLogoText",
        "change #slogan-text-value":"changeSloganText",
        "keyup #slogan-text-value":"changeSloganText",
        "click #logo-pane .arrowkey.up":"logoUp",
        "click #logo-pane .arrowkey.right":"logoRight",
        "click #logo-pane .arrowkey.down":"logoDown",
        "click #logo-pane .arrowkey.left":"logoLeft",
        "click #slogan-pane .arrowkey.up":"sloganUp",
        "click #slogan-pane .arrowkey.right":"sloganRight",
        "click #slogan-pane .arrowkey.down":"sloganDown",
        "click #slogan-pane .arrowkey.left":"sloganLeft",
        "click a.remove-logo":"removeLogo"
    },
    
    initialize: function() {
        this.model = this.options.model;
        this.render();
        this.pluploadInit();            
    },
    
    render: function(){
        this.$('#logo-text-value').val(this.model.get('title'));
        this.$('#slogan-text-value').val(this.model.get('slogan'));
        
        if(!this.model.get('logo')) {
            this.el.find('.graphic').remove();
            this.el.removeClass('graphical');
            this.el.addClass('textual');
        } else {
            this.el.removeClass('textual');
            this.el.addClass('graphical');
            
            var previewEl = this.el.find('.pane-preview.image-logo');
            var previewImg = $('<img />')
            .attr('class','graphic')
            .one('load',function(){
                var pim = $(this);
                previewEl.append(pim);
                if(pim.width() > previewEl.width()) pim.attr('width',previewEl.width());
                pim.css({
                    'margin-left': Math.floor((previewEl.width() - pim.width()) / 2),
                    'margin-top': Math.floor((previewEl.height() - pim.height()) / 2)
                });                
            })
            .attr('src',this.model.get('logo'))
            .each(function(){
                if(this.complete) $(this).trigger('load');
            });
        }
        
        return this;
    },
    
    parse: function(){
        var rtn = {};
        var slogan_position = this.getSloganPosition();
        var logo_position = this.getLogoPosition();
        
        return {
            'slogan': this.getSloganText(),
            'slogan_x': parseInt(slogan_position['left']),
            'slogan_y': parseInt(slogan_position['top']),
            'title': this.getLogoText(),
            'logo': this.getLogoUrl(),
            'logo_x': parseInt(logo_position['left']),
            'logo_y': parseInt(logo_position['top'])
        };
        
        return rtn;
    },
    
    done: function(event){
        this.close();
        event.preventDefault();
    },
    
    toggle: function(){
        if(this.el.is(":hidden")) {
            this.open();
        } else {
            this.close();
        }
    },
    
    open: function(){
        $('.popup').hide();
        $(this.el).show();

        var logoPosition = this.getLogoPosition();
        this.updateLogoXY(parseInt(logoPosition.left),parseInt(logoPosition.top));

        var sloganPosition = this.getSloganPosition();
        this.updateSloganXY(parseInt(sloganPosition.left),parseInt(sloganPosition.top));
        
        var logoUrl = this.getLogoUrl();
        if(logoUrl) this.loadLogo(logoUrl);
    },
    close: function(){ $(this.el).hide(); },
    
    iframe: $("#preview"),
    
    // logo methods
    getLogoText: function() { this.model.get('title'); },
    setLogoText: function(text){ this.model.set({'title':text}); },
    changeLogoText: function(event){ this.setLogoText(this.$('#logo-text-value').val()); },
    getLogoPosition: function() {
        return {
            'left': this.model.get('logo_x'),
            'top': this.model.get('logo_y')
        }
    },
    updateLogoXY: function(left,top){ this.$('#logo-pane .xy').text('X:'+left+'px Y:'+top+'px'); },
    setLogoPosition: function(left,top) {
        this.model.set({
            'logo_x':left,
            'logo_y':top
        });
        this.updateLogoXY(left,top);
    },
    moveLogoBy:function(left,top) {
        var cur = this.getLogoPosition();
        var nu = {}
        nu.top = cur.top + top;
        nu.left = cur.left + left;
        this.setLogoPosition(nu.left,nu.top);
    },
    logoUp: function(event) { this.moveLogoBy(0,Customize.data.shift ? -10 : -1); event.preventDefault(); },
    logoRight: function(event) { this.moveLogoBy(Customize.data.shift ? 10 : 1,0); event.preventDefault(); },
    logoDown: function(event) { this.moveLogoBy(0,Customize.data.shift ? 10 : 1); event.preventDefault(); },
    logoLeft: function(event) { this.moveLogoBy(Customize.data.shift ? -10 : -1,0); event.preventDefault(); },
    
    plupload: undefined,
    pluploadInit: function(){
        var rent = this;
        
        //var runtimes = 'gears, html5, flash, silverlight, browserplus';
        // setup plupload
        var uploader = new plupload.Uploader({
            runtimes : 'html5,flash,silverlight',
            container: 'upload-logo-button-wrap',
            browse_button: 'upload-logo-button',
            max_file_size: '2mb',
            url : '/ajax/uploads/images',
            flash_swf_url : '/assets/scripts/plupload/plupload.flash.swf',
            silverlight_xap_url : '/assets/scripts/plupload/plupload.silverlight.xap',
            filters : [{title : "Image files", extensions : "jpg,jpeg,gif,png"}],
            file_data_name: 'image',
            multi_selection: false,
            multipart: true,
            multipart_params: {
                'fclass':'customize-asset-original',
                'my_images':false,
                'sessionid':sessionid, // set in the .html
                'csrfmiddlewaretoken':csrftoken // set in the .html
            }
        });
                    
        uploader.bind('Init', function(up, params) {
            //console.log('Init',up,params);
        });

        uploader.bind('PostInit', function(up) {
            // HTML5 runtime will not allow for images selection unless the container is appended at the end of <body>
            //console.log('PostInit',up);
            $('body').append($('.plupload.html5',$('#'+up.settings.container)));
            up.refresh();
        });
        
        uploader.init();
        uploader.bind('FilesAdded', function(up, files) {
            up.refresh(); // Reposition Flash/Silverlight
            up.start(); // Reposition Flash/Silverlight
            //console.log('FilesAdded', up, files);
        });
        
        uploader.bind('BeforeUpload', function(up, files) {
            //console.log('BeforeUpload',files);
        });
        
        uploader.bind('UploadProgress',function(up,file) {
            //rent.setProgress(file.loaded,file.size);
            //console.log('UploadProgress', up, file);
        });
        
        uploader.bind('Error', function(up, err) {
            alert("Error: " + err.message);
            up.refresh(); // Reposition Flash/Silverlight
        });
        
        uploader.bind('FileUploaded', function(up, file, response) {
            var data = eval('('+response.response+')');
            //console.log(data,response);
            rent.loadLogo(data.cdn); 
        });
        
        // set to object
        this.plupload = uploader;
        
    },
    
    loadLogo: function(imgUrl){
        this.removeLogo();
        this.model.set({'logo':imgUrl});
        this.render();
    },
    
    removeLogo:function(event){
        this.model.set({'logo':''});
        this.render();        
        if(event) event.preventDefault();
    },
        
    getLogoUrl: function(){ return this.model.get('logo'); },    
    getLogoKey: function(){
        var url = this.getLogoUrl();
        return url ? url.split('/').pop() : '';
    },
    getLogoId: function(){
        var key = this.getLogoKey();
        return key ? key.split('.')[0] : '';
    },
    
    // slogan methods
    getSloganText: function() { this.model.get('slogan'); },
    setSloganText: function(text){ this.model.set({'slogan':text}); },
    changeSloganText: function(event){ this.setSloganText(this.$('#slogan-text-value').val()); },
    getSloganPosition: function() {
        return {
            'left': this.model.get('slogan_x'),
            'top': this.model.get('slogan_y')
        }
    },
    updateSloganXY: function(left,top){ this.$('#slogan-pane .xy').text('X:'+left+'px Y:'+top+'px'); },
    setSloganPosition: function(left,top) {
        this.model.set({
            'slogan_x':left,
            'slogan_y':top
        });
        this.updateSloganXY(left,top);
    },
    moveSloganBy:function(left,top) {
        var cur = this.getSloganPosition();
        var nu = {}
        nu.top = parseInt(cur.top) + top;
        nu.left = parseInt(cur.left) + left;
        this.setSloganPosition(nu.left,nu.top);
    },
    sloganUp: function(event) { this.moveSloganBy(0,Customize.data.shift ? -10 : -1); event.preventDefault(); },
    sloganRight: function(event) { this.moveSloganBy(Customize.data.shift ? 10 : 1,0); event.preventDefault(); },
    sloganDown: function(event) { this.moveSloganBy(0,Customize.data.shift ? 10 : 1); event.preventDefault(); },
    sloganLeft: function(event) { this.moveSloganBy(Customize.data.shift ? -10 : -1,0); event.preventDefault(); }    
});


// SETTINGS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
Customize.Views.Settings = Backbone.View.extend({
    
    el: $("#settings-popup"),
    events: {
        "click a.done-button":"done",
        "click .label-check":"labelCheck",
        'change .options input':'toggleActive'
    },
    
    done: function(event){
        this.close();
        event.preventDefault();
    },
    
    toggle: function(){
        if(this.el.is(":hidden")) {
            this.open();
        } else {
            this.close();
        }
    },
    
    open: function(){
        $('.popup').hide();
        $(this.el).show();
    },
    
    close: function(){ $(this.el).hide(); },
    
    labelCheck: function(e){
        setupLabel();
    },
    
    toggleActive: function(e){
        var el = $(e.currentTarget);
        var key = el.attr('name');
        var options = this.model.get('options');
        if(el.is(":checked")) {
            options[key] = true;
        } else {
            options[key] = false;
        }
        this.model.set({'options':options});
        this.model.trigger('change',this.model);
    },
        
    mylinks: undefined,
    initialize: function(){
        this.model = this.options.model;
        this.mylinks = new Customize.Views.MyLinks({model:this.model});
        this.render();
    },
    
    render: function(){
        var rent = this;
        _.each(this.model.get('options'),function(val,key){
            if(val) {
                rent.$('input[name='+key+']').attr('checked','checked');
            } else {
                rent.$('input[name='+key+']').removeAttr('checked');            
            }
        });
        this.labelCheck();
        
		return this;
    }
    
});

Customize.Views.MyLink = Backbone.View.extend({
    
    tagName: 'li',
    
    events: {
        'click a.delete':'remove',
        'change input':'toggleActive'
    },
    
    initialize: function(){
        this.model = this.options.model;
    },
    
    render: function(){
        $(this.el).html(_.template($("#tmpl-mylink").html(), this.model.toJSON()));
        return this;
    },
    
    remove: function(e){
        this.model.collection.remove(this.model);
        $(this.el).remove();
        e.preventDefault();
    },
    
    toggleActive: function(e){
        if(e && e.currentTarget && $(e.currentTarget).is(':checked')) {
            this.model.set({'active':true});
        } else {
            this.model.set({'active':false});
        }
    }
    
});

Customize.Views.MyLinks = Backbone.View.extend({
    
    el: $("#mylinks"),
    events: {
        "click .header a":"toggleAddLink",
        "click .add-link-form a":"addLink",
        "sortstop .items":"setOrder"
    },
    model: undefined,
    initialize: function(){
        var rent = this;
        this.model = this.options.model;
        this.collection = new Customize.Collections.Links();
        this.collection.comparator = function(link) { return link.get('order'); };
        this.collection.add(this.model.get('links'));
        this.collection.bind("add",function(link) { rent.updateParentModel(); rent.render(); });
        this.collection.bind("remove",function(link) { $(link.view.el).remove(); rent.setOrder(); rent.render(); });
        this.collection.bind("change",function(link) { rent.updateParentModel(); });
        this.render();
    },
    
    updateParentModel: function(){
        var links = this.collection.toJSON();
        _.forEach(links,function(link,i){ delete links[i].cid });
        this.model.set({'links':links});
    },
    
    isSubscribe: function(model){
        if(model.get('syslink') == 'subscribe') {
            return true;
        }
        return false;
    },
    
    render: function(){
        var rent = this;
        var foundSubscribe = false;
        this.collection.forEach(function(item){
            item.set({'cid':item.cid});
            if(!item.view) item.view = new Customize.Views.MyLink({model:item});
            $(rent.el).find('ul.items').append(item.view.render().el);
            if(rent.isSubscribe(item)) foundSubscribe = true;
        });
        
        if(!foundSubscribe) {
            var subscribeModel = new Customize.Models.Link({'title':'Subscribe','url':'#/subscribe','active':false,'syslink':'subscribe','order':this.collection.length});
            this.collection.add([subscribeModel],{silent:true});
            subscribeModel.set({'cid':subscribeModel.cid},{'silent':true});
            subscribeModel.view = new Customize.Views.MyLink({model:subscribeModel});
            $(rent.el).find('ul.items').append(subscribeModel.view.render().el);
        }
        
        setupLabel();
        
        this.$(".items").sortable({
            items:'li',
            axis:'y'
		});
		this.$(".items").disableSelection();
		
		this.resetAddLink();
		
        return this;
    },
    
    checkAddLink:function(){
        var rtn = true;
        if(this.$('input[name=title]').val() == '') rtn = false;
        if(this.$('input[name=url]').val() == '') rtn = false;
        if(this.$('input[name=url]').val() == 'http://') rtn = false;
        return rtn;
    },
    
    setOrder: function(e){
        this.remapOrder(this.parseOrder());
    },
    
    parseOrder: function(){
        var cids = [];
        $.each(this.$('.items li label'),function(i,label){
            label = $(label);
            cids.push(label.attr('for').split('-').pop());
        });
        return cids;
    },
    
    remapOrder: function(cids){
        var rent = this;
        var i = 0;
        _.forEach(cids,function(cid){
            rent.collection.getByCid(cid).set({'order':i});
            i++;
        });
        this.collection.sort();
        this.updateParentModel();
    },
    
    resetAddLink: function(){
        this.$('input[name=title]').val('');
        this.$('input[name=url]').val('http://');
    },
    
    toggleAddLink: function(e){
        this.$('.add-link-form').toggle();
        e.preventDefault();
    },
    
    addLink: function(e){
        if(this.checkAddLink()){
            this.collection.add([{'title':this.$('input[name=title]').val(),'url':this.$('input[name=url]').val(),'active':true,'order':this.collection.length, 'syslink':'' }]);
        }
        e.preventDefault();
    }
    
});



// SETTINGS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
Customize.Views.Themes = Backbone.View.extend({
    
    el: $("#themes-popup"),
    
    events: {},
    
    initialize: function(){
        this.collection = this.options.collection;
        this.parent = this.options.parent;
        this.render();
        this.setThemeName();
    },
    
    open: function(){
        if($(this.el).is(":hidden")){
            $('.popup').hide();
            $(this.el).show();
        }
    },
    close: function(){ $(this.el).hide(); },
    toggle: function() {
        if($(this.el).is(":hidden")){
            this.open();
        } else {
            this.close();        
        }
    },
    
    setThemeName: function(){
        var theme = this.collection.get(this.parent.model.get('theme'));
        this.parent.setThemeName(theme.get('name'));
    },
    
    select: function(theme){
        var url = '/'+this.parent.model.get('username')+'?theme='+theme.get('slug');
        $("#preview").attr('src',url);
        this.parent.model.set({'theme':theme.id});
        this.close();
        this.render();
        this.setThemeName();
    },
    
    render: function(){
        var rent = this;
        var track = this.$('ul');
        this.collection.each(function(model){
            if(!model.icon_view) model.icon_view = new Customize.Views.Theme({ model:model, parent:rent });
            track.append(model.icon_view.render().el);
        });
        
        return this;
    }
});

Customize.Views.Theme = Backbone.View.extend({
    
    tagName: 'li',
    className: 'theme',
    events: {
        'mouseover a':'over',
        'mouseout a':'out',
        'click a':'click'
    },
    
    initialize: function(){
        this.model = this.options.model;
        this.parent = this.options.parent;
        this.id = 'theme-option-'+this.model.id;
        this.render();
    },
    
    click: function(e){
        this.parent.select(this.model);
        e.preventDefault();
        e.stopPropagation();
    },
    
    over: function(e){
        $(this.el).addClass('hover');
        e.preventDefault();
    },
    
    out: function(e){
        $(this.el).removeClass('hover');
        e.preventDefault();
    },
    
    isSelected:function(){
        if(this.model.id == this.parent.parent.model.get('theme')) return true;
        return false;
    },
    
    render: function(){
        $(this.el).html('');
        if(this.model.get('thumbnail')) {
            $(this.el).append($('<a href="#" />').append( $('<img />').attr('src',this.model.get('thumbnail'))).append( $('<div class="overlay"/>')));
            if(this.model.get('type')) $(this.el).addClass('type-'+this.model.get('type'));
        } else {
            $(this.el).append($('<a href="#" />').text(this.model.get('slug')));
        }
        $(this.el).append($('<div class="name" />').text(this.model.get('name')));
        
        
        if(this.isSelected()) {
            $(this.el).addClass('selected');
        } else {
            $(this.el).removeClass('selected');
        }
        
        return this;
    }
});


