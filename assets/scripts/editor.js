if(!Nubook) var Nubook = {};
Nubook.Editor = {
    Models:{},
    Collections:{},
    Views:{}
};

// REUSABLE VIEWS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


Nubook.Editor.Views.PseudoRadio = Backbone.View.extend({
    
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


Nubook.Editor.Views.PseudoSelect = Backbone.View.extend({
    
    events: {
        'click .pseudo-select-value':'toggleOptions',
        'click ul li a':'selectOption'
    },
    
    initialize: function(){
        this.el = $(this.options.el);
        this.callback = this.options.callback;
        this.render();
    },
    
    render: function(){
        this.$('ul').hide();
        this.$('ul li:first-child').addClass('first-child');
        
        // set the current option
        if(this.getValue()) {
            this.setValue(this.$('ul li a[href="'+this.getValue()+'"]').text(),this.getValue());
        } else {
            this.setValue(this.$('li:first-child a').text(),this.$('li:first-child a').attr('href'));
        }
        
        return this;
    },
    
    getValue: function(){
        return this.$('input.pseudo-select-input').val();
    },
    
    setValue: function(text,value){
        this.$('.pseudo-select-value').text(text);
        this.$('.pseudo-select-input').val(value !== '' ? value : text);
    },
    
    selectOption: function(event){
        
        this.setValue($(event.currentTarget).text(),$(event.currentTarget).attr('href'))
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


Nubook.Editor.Views.PseudoCheck = Backbone.View.extend({
    
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





// EDITOR VIEWS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

(function(){
    namespace("editor", load, init, resize, is_complete, set_complete, beforeunload);
    
    var wrapper = $('#sizer');
    var toolbar = $('#sizer');
    var workspace = $('#workspace');
    var is_editing_complete = false;
    
    function init() {
        editor.tools.init();
        editor.saver.init();
    }
    
    function load(){
        
        this.init();
        this.resize(function(){
            $('#workspace-frame').animate({ opacity: 1 },'fast');
            editor.tools.embed.align();
        });
        
        // handle rotation
        $.each($('.twrap'),function(i,el){
            el = $(el);
            if(el.attr('rotation') != undefined) {
                el.css({ rotate: el.attr('rotation')+'deg' });
            }
        });
        
        // load fonts
        fontload.init();
        fontload.loadFonts(function(){
            $(".twrap").animate({ opacity: 1 },'slow');
        });
        
        //close popups on click
        $('#workspace').click(function(){
            $('.popup').hide();
            return false;
        });
    }
    
    function resize(complete){
        
        if($(window).height() < ($('#toolbar').outerHeight() + $('#workspace-frame').outerHeight() + (editor.tools.image.uploads.isOpen() ? ($('#bottom-bar').height()-34) : 0))) {
            $('#workspace').css('height',($('#workspace-frame').outerHeight()+(editor.tools.image.uploads.isOpen() ? ($('#bottom-bar').height()-34) : 0))+'px');
            $('#workspace-frame').css({'left':($("#workspace").width() - $('#workspace-frame').outerWidth()) / 2, 'top':'0px' });
        } else {
            $('#workspace').css('height',($(window).height()-$('#toolbar').outerHeight())+'px');
            $('#workspace-frame').css({'left':($("#workspace").width() - $('#workspace-frame').outerWidth()) / 2, 'top':($("#workspace").height() - $('#workspace-frame').outerHeight()-(editor.tools.image.uploads.isOpen() ? ($('#bottom-bar').height()-34) : 0)) / 2});
        }
        
        // is uploads bar open
        //"editor.tools.image.uploads.isOpen()"
        
        
        editor.tools.picker.resize();
        if(complete) complete();
    }
    
    
    function is_complete(){
        return is_editing_complete;
    }
    
    function set_complete(complete){
        is_editing_complete = complete;
        return complete;
    }
    
    function beforeunload(){
        if(!is_editing_complete) {
            return "Your edits have not been saved.";
        }
    }
    
})();

(function(){
    namespace("editor.tools", init, register, setActive, getActive, destroy, setIndicator);
    
    var tools = [];
    var active;
    var indicator = $('.indicator');
    
    function init() {
        editor.tools.image.init();
        editor.tools.text.init();
        editor.tools.picker.init();
        editor.tools.embed.init();
        editor.tools.indicator.init();
    }
    
    function register(name, tool) {}
    
    function setIndicator(element){
        //editor.tools.indicator.activate(element);
        //indicator.css({ 'left':(parseInt(element.css('left'))-parseInt(indicator.outerWidth()))+'px', 'top':(parseInt(element.css('top'))-parseInt(indicator.outerHeight()))+'px' });
        //indicator.show();
    }
    
    function hideIndicator(){
        editor.tools.indicator.setActive();
    }
    
    function getActive(){
        return active;
    }
    
    function setActive(tool){
        destroy(tool);
        active = tool;
    }
    
    function destroy(next){
        hideIndicator();
        if(active) active.destroy(next);
        active = undefined;
    }
    
})();


(function(){
    namespace("editor.tools.indicator", init, setActive);
    
    // VIEW ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    Nubook.Editor.Views.Indicator = Backbone.View.extend({
        
        className:"indicator",
        border:3,
        width:100,
        height:100,
        delete_button:undefined,
        events: {
            'mouseover a.overfill':'mouseover',
            'mouseout a.overfill':'mouseout',
            'click a.overfill':'click',
            'click a.del':'del'
            
        },
        
        initialize: function(){
            this.element = $(this.options.element);
            this.element.data('indicator',this);            
            this.id = 'indicator-'+this.element.attr('id');
            this.type = this.parseType();
            this.el = $(this.el);
            $(this.el).data('view',this);
        },
        
        parseType: function(){
            if(this.element.hasClass('twrap')) {
                return 'text';
            } else if(this.element.hasClass('mwrap')) {
                return 'image';
            } else if(this.element.hasClass('ewrap')) {
                return 'embed';
            } else {
                return false;
            }
        },
        
        click: function(event){
            
            if(this.type == 'text') {
                editor.tools.text.bind(this.element);
            } else if(this.type == 'image') {
                editor.tools.image.bind(this.element);
            } else if(this.type == 'embed') {
                editor.tools.embed.bind(this.element);
            } else {
                // pass
            }
            
            event.preventDefault();
            event.stopPropagation();            
        },
        
        remove_delete_button: function(){
            if(this.delete_button) {
                this.delete_button.remove();
                this.delete_button = undefined;
            }
        },
        
        create_delete_button: function(event){
            var rent = this;
            if(!rent.delete_button) {
                rent.delete_button = $('<a class="indicator-del" href="#/action/clear-element">X</a>');
                $('#builder-boundary').append(rent.delete_button);
                rent.delete_button.attr('id', rent.id+'-del');
                rent.delete_button.css({
                    'top':rent.element.css('top'),
                    'left':parseInt(rent.element.css('left')) + rent.element.width() - rent.delete_button.width()
                });
                rent.delete_button.click(function(event){ rent.del(); event.preventDefault(); });
            }
            
            return rent.delete_button;
            if(event) event.preventDefault();
        },
        
        show_delete_button: function(event){
            if(this.delete_button) this.delete_button.css('display','block');
            if(event) event.preventDefault();
        },
        
        hide_delete_button: function(event){
            if(this.delete_button) this.delete_button.css('display','none');
            if(event) event.preventDefault();
        },
        
        del: function(event){
            this.element.data('view').removeImage();
            if(event) event.preventDefault();
            if(event) event.stopPropagation();            
        },
        
        mouseover: function(event){
            $(this.el).addClass('hover');
            event.preventDefault();
            event.stopPropagation();
        },

        mouseout: function(event){
            $(this.el).removeClass('hover');
            event.preventDefault();
            event.stopPropagation();
        },
        
        focus: function(){
            $(this.el).addClass('active');
            
            // z-index
            if(this.type == 'image') {
                $(this.el).css('z-index', 3);
            } else {
                $(this.el).css('z-index', parseInt(this.element.css('z-index'))-1);
            }
            
            // label
            if(this.type == 'image' || this.type == 'embed') {
                if(this.isEmpty()) this.$('.label').show();
            }
            
            // del
            if(this.type == 'image'){
                if(!this.isEmpty()) this.show_delete_button();
            }
        },
        
        unfocus: function(){
            $(this.el).removeClass('active');
            
            // z-index
            if(this.type == 'image') {
                $(this.el).css('z-index', 104);
            } else {
                $(this.el).css('z-index', parseInt(this.element.css('z-index'))+100);
            }
            
            // label
            this.$('.label').hide();
            
            // del
             this.hide_delete_button();
        },
        
        isActive: function(){
            return $(this.el).hasClass('active');
        },
        
        isEmpty: function(){
            return this.element.data('view').isEmpty();
        },
        
        render: function(){
            
            $(this.el).html(_.template($("#tmpl-indicator").html(),{}));
            
            $(this.el).attr('id',this.id);
            
            this.$('.label').text(this.element.width()+'X'+this.element.height());
            
            if(this.type == 'image') this.create_delete_button();
            
            // wrap
            $(this.el).css({
                'width': this.element.width()+'px',
                'height': this.element.height()+'px',
                'top': this.element.css('top'),
                'left': this.element.css('left')
            });

            if(this.type == 'image') {
                $(this.el).css('z-index', 104);
            } else {
                $(this.el).css('z-index', parseInt(this.element.css('z-index'))+100);
            }
            
            // anchor
            this.$('a.overfill').css({
                'width': this.element.width()+'px',
                'height': this.element.height()+'px',
                'top': this.element.css('top'),
                'left': this.element.css('left')
            });
            
            // top
            this.$('.indt').css({
                'width': this.element.width()+((this.border-1)*2)+'px',
                'height': (this.border-1)+'px',
                'top': (this.border*-1)+'px',
                'left': (this.border*-1)+'px'
            });

            // right
            this.$('.indr').css({
                'width': (this.border-1)+'px',
                'height': this.element.height()+'px',
                'top': '0px',
                'left': this.element.width()+'px'
            });

            // bottom
            this.$('.indb').css({
                'width': this.element.width()+((this.border-1)*2)+'px',
                'height': (this.border-1)+'px',
                'top': this.element.height()+'px',
                'left': (this.border*-1)+'px'
            });

            // left
            this.$('.indl').css({
                'width': (this.border-1)+'px',
                'height': this.element.height()+'px',
                'top': '0px',
                'left': (this.border*-1)+'px'
            });
            
            return this;
        }
    });
    
    
    // PUBLIC METHODS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    
    function init() {
        
        $('.twrap,.mwrap,.ewrap').each(function(i,element){
            var indi = new Nubook.Editor.Views.Indicator({element:element});
            $('#builder-boundary').append(indi.render().el);
        });
        
    }
    
    function setActive(element){
        if($('.indicator.active').length) $('.indicator.active').data('view').unfocus();
        if(element && $(element).data('indicator')) $(element).data('indicator').focus();
    }
    
})();


(function(){
    namespace("editor.tools.image", init, reset, bind, destroy, focus, unfocus, loadImage, openWidget, closeWidget, getElement);        
    
    // VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    Nubook.Editor.Views.ImageElement = Backbone.View.extend({
        
        widget: undefined, // view
        image: undefined, // img element
        handle: undefined, // div
        lwrap: undefined, // div
        contain: undefined, // div
        
        initialize: function(){
            var rent = this;
            
            this.el = $(this.options.el);
            this.lwrap = $(this.options.lwrap);
            this.el.data('view',this);
            this.lwrap.data('view',this);
            
            // create containment div
            this.contain = $('<div class="contain"/>');
            this.lwrap.append(this.contain);
            
            // create handle
            this.handle = $('<div class="handle"/>');
            this.lwrap.append(this.handle);
            
            var img = this.hasImage();
            if(img) {

                // set size variable in the img's data hash
                img.data('size',[parseInt(img.attr("data-width")),parseInt(img.attr("data-height"))]);
                this.image = img;
                
                rent.el.css('background','transparent');

                
                // size handle et al
                this.linkHandle();
            }

            // setup drag and disable
            this.handle.draggable({
                'drag':function(event,ui){
                    rent.handleDrag();
                },
                'containment': this.contain
            });
            this.handle.draggable('option','disabled',true);
            
            this.widget = new Nubook.Editor.Views.ImageWidget({element:this.el});
            
            this.render();
        },
        
        isFocused: function(){
            if(this.el.attr('id') == editor.tools.image.getElement().attr('id') && editor.tools.getActive() == editor.tools.image) {
                return true;
            }
            return false;
        },
        
        focus: function(){
            
            if(this.hasImage()){
                this.linkHandle();
                this.handle.draggable('option','disabled',false);
            } else {
                this.widget.open();
            }
        },
        
        unfocus: function(){
            if(this.hasImage()){ this.handle.draggable('option','disabled',true); }
            this.widget.close();
        },
        
        isEmpty: function(){
            if(this.hasImage()) return false;
            return true;
        },
        
        hasImage: function(){
            var img = this.$('img').get(0);
            if(img) { return $(img); }
            return false;
        },
        
        linkHandle: function(){
            var image = this.hasImage();
            if(image) {
                
                var img_w = image.width();
                var img_h = image.height();
                var el_w = this.el.width();
                var el_h = this.el.height();
                
                this.handle.css({
                    'width':img_w+'px',
                    'height':img_h+'px',
                    'left':image.css('left'),
                    'top':image.css('top'),
                });
                
                /*
                this.contain.css({
                    'width': ((img_w - el_w)*2 + el_w) +'px',
                    'height': ((img_h - el_h)*2 + el_h) +'px',
                    'left': '-'+(img_w - el_w)+'px',
                    'top': '-'+(img_h - el_h)+'px'
                });
                */
                
                var contain_w = ((img_w - el_w)*2 + el_w);
                var contain_h = ((img_h - el_h)*2 + el_h);
                var contain_l = (img_w - el_w);
                var contain_t = (img_h - el_h);
                
                this.contain.css({
                    'width': (contain_w < el_w ? el_w : contain_w) +'px',
                    'height': (contain_h < el_h ? el_h : contain_h) +'px',
                    'left': (contain_w < el_w ? 0 : '-'+contain_l)+'px',
                    'top': (contain_h < el_h ? 0 : '-'+contain_t)+'px'
                });
                
            }
        },

        linkContainOnly: function(){
            var image = this.hasImage();
            if(image) {
                
                var img_w = image.width();
                var img_h = image.height();
                var el_w = this.el.width();
                var el_h = this.el.height();
                
                var contain_w = ((img_w - el_w)*2 + el_w);
                var contain_h = ((img_h - el_h)*2 + el_h);
                var contain_l = (img_w - el_w);
                var contain_t = (img_h - el_h);
                
                this.contain.css({
                    'width': (contain_w < el_w ? el_w : contain_w) +'px',
                    'height': (contain_h < el_h ? el_h : contain_h) +'px',
                    'left': (contain_w < el_w ? 0 : '-'+contain_l)+'px',
                    'top': (contain_h < el_h ? 0 : '-'+contain_t)+'px'
                });
                
            }
        },

        
        handleDrag: function(event,ui){
            if(this.hasImage()) {
                this.image.css({
                    'left':this.handle.css('left'),
                    'top':this.handle.css('top')
                });
            }
        },
        
        removeImage: function(){
            if(this.image) {
                this.image.remove();
                this.image = undefined;
                this.el.css('background','');
                if(this.isFocused()) editor.tools.image.bind(this.el);
            }
        },
        
        loadImage: function(url){
            var rent = this;
            
            // remove old img
            if(this.image) this.image.remove();
            
            this.image = $('<img />');
            $(this.image).load(function(){
                
                $(this).hide();
                rent.el.append(this);
                
                // change background to transparent
                rent.el.css('background','transparent');
                
                // set size variable in the img's data hash
                $(this).data('size',[$(this).width(),$(this).height()]);
                
                // crop to smallest size (filling the whole space)
                cropTo(this,element.width(),element.height());
                
                $(this).fadeIn(function(){
                    
                    rent.linkHandle();
                    
                    // if this element is focused -> rebind
                    if(rent.isFocused()) {
                        editor.tools.image.bind(rent.el);
                    }
                });
                
            }).error(function() {
                if(console) console.log('Image could not be loaded:'+url);
            }).attr('src', url);
            
        },
        
        render: function(){
            return this;
        }
    });
    
    Nubook.Editor.Views.ImageWidget = Backbone.View.extend({
        
        className: 'image-widget',
        plupload: undefined,
        file: undefined,
        isUploading: false,
        
        events: {
            'click a.my-images-button':'toggleMyImages',
            'click a.cancel-button':'cancelButton'
        },
        
        initialize: function(){
            this.el = $(this.el);
            this.el.addClass('plupload-widget');
            this.element = $(this.options.element);
            this.num = this.element.attr('id').split('-')[1];
            this.id = 'iw-' + this.num;
            this.element.data('widget',this);
            this.render();
        },
        
        align: function(){
            $(this.el).css({
                'left': Math.floor(parseInt(this.element.css('left')) + (this.element.width() - $(this.el).width()) / 2) + 'px',
                'top': Math.floor(parseInt(this.element.css('top')) + (this.element.height() - $(this.el).height()) / 2) + 'px'
            });
        },
        
        open: function(){
            this.align();
            $(this.el).show();
        },

        close: function(){
            if(this.isUploading == false) {
                $(this.el).hide();
            }
        },
        
        toggle: function(){
            if($(this.el).is(':visible')) {
                this.close();
            } else {
                this.open();
            }
        },
        
        toggleMyImages: function(event){
            editor.tools.image.uploads.toggle();
            event.stopPropagation();
            event.preventDefault();
        },
        
        editButton: function(event){
            //editor.tools.embed.bind(this.element);
            //editor.tools.embed.open();
            event.preventDefault();
            event.stopPropagation();
        },
        
        cancelButton: function(event){
            //console.log('cancelButton',this.plupload,this.file);
            //console.log(this.file);
            //if(this.file) {
                this.plupload.stop();
                console.log('plupload.stop()');
                this.plupload.removeFile(this.file);
                this.setStatus('normal');
            //}
            event.preventDefault();
            event.stopPropagation();
        },
        
        setProgress: function(complete,total){
            var progressBar = this.$('.progress-bar');
            $('span',progressBar).css('width', Math.round(progressBar.width() * complete / total)+'px');
            if(complete == total) this.setStatus('processing');
        },
        
        setStatus: function(status) {
            var rent = this;
            var options = ['normal','uploading','processing'];
            if(_.indexOf(options,status) !== -1) {
                _.each(options,function(option){
                    $(rent.el).removeClass(option);
                });
                $(rent.el).addClass(status);
            }
            if(status == 'uploading') this.$('.status').text('Uploading');
            if(status == 'processing') this.$('.status').text('Processing');
        },
        
        render: function(){
            var rent = this;
            
            $(this.el).attr('id', this.id);
            $(this.el).html(_.template($("#tmpl-image-widget").html(),{num:this.num}));
            $('#builder-boundary').append(this.el)
            this.align();
            
            //var runtimes = 'gears, html5, flash, silverlight, browserplus';
            // setup plupload
            var uploader = new plupload.Uploader({
                runtimes : 'html5,flash,silverlight',
                container: this.id,
                browse_button: 'image-widget-swfu-'+this.num,
                max_file_size: '10mb',
                url : '/ajax/uploads/images',
                flash_swf_url : '/assets/scripts/plupload/plupload.flash.swf',
                silverlight_xap_url : '/assets/scripts/plupload/plupload.silverlight.xap',
                filters : [{title : "Image files", extensions : "jpg,jpeg,gif,png"}],
                file_data_name: 'image',
                multi_selection: false,
                multipart: true,
                multipart_params: {
                    'fclass':'page-asset-original',
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
                rent.file = files;
                rent.setStatus('uploading');
                rent.isUploading = true;
            });
            
            uploader.bind('UploadProgress',function(up,file) {
                rent.setProgress(file.loaded,file.size);
                //console.log('UploadProgress', up, file);
            });
            
            uploader.bind('Error', function(up, err) {
                alert("Error: " + err.message);
                up.refresh(); // Reposition Flash/Silverlight
            });
            
            uploader.bind('FileUploaded', function(up, file, response) {
                //console.log('FileUploaded',file, response);
                rent.file = undefined;
                rent.isUploading = false;
                rent.setStatus('normal');
                    
                var data = eval('('+response.response+')');
                    
                var model = editor.tools.image.uploads.addImageFromData(data);
                rent.element.data('view').loadImage(model.get('original').cdn);
                    
                if(rent.element.data('view').isFocused() == false) {
                    rent.close();
                }
            });
            
            // set to object
            this.plupload = uploader;
                        
            return this;
        }
    });
    
    
    // TOOL CODE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var toolbar = $('#image-options');
    var images = [];
    var element;
    
    function init(){
        
        // activate image areas
        $.each($('.template .lwrap'),function(i,lwrap){
            
            lwrap = $(lwrap);
            
            // on click bind to tools
            //lwrap.click(function(){
            //    editor.tools.image.bind($(this).data('view').el);
            //});
            
            var id = lwrap.attr('id').split('-',2)[1]
            var el = $('#m-'+id);
            
            // Build element views
            var view = new Nubook.Editor.Views.ImageElement({ 'el':el, 'lwrap':lwrap });
        });
        
        
        // setup buttons
        toolbar.find(".scaling-handle").draggable({ axis:'x', containment:'parent', drag:onScaleDrag, disabled:true });
        toolbar.find(".scaling-handle").draggable('option','disabled',false);
        toolbar.find(".change-image-button a").click(function(){ element.data('view').widget.toggle(); });
        
        editor.tools.image.linkbuilder.init();
        editor.tools.image.uploads.init();
    }
    
    function getElement(){
        return element;
    }
    
    function enable(){
        toolbar.find(".scale-button").removeClass('disabled');
        toolbar.find(".scaling-handle").draggable('option','disabled',false);
        toolbar.find(".add-link-button").removeClass('disabled');
        toolbar.find(".change-image-button").removeClass('disabled');
    }
    
    function disable(){
        toolbar.find(".scale-button").addClass('disabled');
        toolbar.find(".scaling-handle").draggable('option','disabled',true);
        toolbar.find(".add-link-button").addClass('disabled');
        toolbar.find(".change-image-button").addClass('disabled');
    }
    
    function reset(){
        toolbar.find(".scaling-handle").css('left','0px');
    }
    
    function hasImage(){
        if(element) return element.data('view').hasImage();
        return false;
    }
    
    var wasUploadBarOpen = true;
    
    function bind(el){
        editor.tools.setActive(this);
        element = el;
        
        // set visual indicator
        editor.tools.indicator.setActive(element);
        
        // set image to current in the bottom bar.
        var image = hasImage();
        var imageKey = image ? image.attr('src').split('/').pop() : '';
        editor.tools.image.uploads.setCurrentByKey(imageKey);
        
        if(wasUploadBarOpen) editor.tools.image.uploads.open();
        
        // bring tool to focus
        focus();
    }
    
    function destroy(next){
        wasUploadBarOpen = editor.tools.image.uploads.isOpen();
        if(next && next != this) editor.tools.image.uploads.close();
        unfocus();
    }
    
    function focus(){
        
        var img = hasImage();
        if(img == false){
            disable();
            reset();
        } else {
            setScaleFromElement();
            enable();
        }
        
        element.data('view').focus();
        
        // setup the linkbuilder
        editor.tools.image.linkbuilder.set(element);
        
        toolbar.show();
        
        // Chrome display HACK!!
        $('.toolbar li a').css('background-image','url(/assets/styles/editor/e/font-options-matrix.png)');
        
    }
    
    function unfocus(){
        element.data('view').unfocus();
        toolbar.hide();
    }
    
    function openWidget(){ element.data('view').widget.open(); }
    function closeWidget(){ element.data('view').widget.close(); }
    
    
    // Load Image //////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function loadImage(url){
        return element.data('view').loadImage(url);
    }

    function onScaleDrag(event,ui){
        var image = hasImage();
        if(image){
            var scroll_max = $(ui.helper.context).parent().width() - $(ui.helper.context).outerWidth();
            var dead_w = Math.round(scroll_max * 0.1);
            var scroll_min = Math.round(scroll_max * 0.3);
            
            scroll_max = scroll_max - dead_w - scroll_min;
            
            var position = ui.position.left;
            position = position - scroll_min;
            
            if(position < dead_w && position > 0) position = 0;
            if(position >= dead_w) position = position - dead_w;
            
            var size = $(image).data('size');
            
            // these need to match setScaleFromElement
            var max_width = element.width()*2.5;
            var max_height = element.height()*2.5;
            var add_width = max_width - element.width();
            var add_height = max_height - element.height();
            
            var min_width = element.width()*.8;
            var min_height = element.height()*.8;
            var sub_width = element.width() - min_width;
            var sub_height = element.height() - min_height;
            
            
            // bigger
            if(position >= 0) {
                if((Math.round(element.width() * size[1] / size[0])) <= element.height()) {
                    var new_height = (position * add_height / scroll_max) + element.height();
                    var new_width = new_height * size[0] / size[1];
                } else {
                    var new_width = (position * add_width / scroll_max) + element.width();
                    var new_height = new_width * size[1] / size[0];
                }
            
            // smaller
            } else {

                var subpos = scroll_min - (position*-1);                
                
                if(Math.round(min_height * size[0] / size[1]) > min_width) {
                    // use min_width                    
                    var new_width = (subpos * ((element.height() * size[0] / size[1]) - min_width) / scroll_min) + min_width;
                    var new_height = new_width * size[1] / size[0];
                } else {
                    // use min_height
                    var new_height = (subpos * ((element.width() * size[1] / size[0]) - min_height) / scroll_min) + min_height;
                    var new_width = new_height * size[0] / size[1];
                }
            }
            
                        
            // bigger
            if(position > 0) {
    
                // everything is still the same so figure out where the center point is
                image.css({
                    'left': '-'+(Math.round((new_width * (parseInt(image.css('left'))*-1 + (element.width()/2)) / image.width())) - (element.width()/2))+'px',
                    'top': '-'+(Math.round((new_height * (parseInt(image.css('top'))*-1 + (element.height()/2)) / image.height())) - (element.height()/2))+'px',
                }).attr({'width':new_width, 'height':new_height});
                
                // Keep image within bounding box
                if((parseInt(image.css('left')) + image.attr('width')) < element.width()) {
                    image.css('left', (element.width() - image.attr('width')) + 'px');
                }
                
                if((parseInt(image.css('top')) + image.attr('height')) < element.height()){
                    image.css('top', (element.height() - image.attr('height')) + 'px');
                }
                
            // smaller
            } else {
                
                /*
                image.css({
                    'left': '-'+(Math.round((new_width * (parseInt(image.css('left'))*-1 + (element.width()/2)) / image.width())) - (element.width()/2))+'px',
                    'top': '-'+(Math.round((new_height * (parseInt(image.css('top'))*-1 + (element.height()/2)) / image.height())) - (element.height()/2))+'px',
                })

                image.css({
                    'left': Math.round(((element.width() - image.width()) / 2) + ((element.width()/2 - image.width()/2 + parseInt(image.css('left'))) * new_width / image.width()))+'px',
                    'top': Math.round(((element.height() - image.height()) / 2) + ((element.height()/2 - image.height()/2 + parseInt(image.css('top'))) * new_height / image.height()))+'px'
                });
                
                //var olc = parseInt(image.css('left')) + image.width()/2 - element.width()/2;
                //var nlc = olc * new_width / image.width();
                //var nl = Math.round(((element.width() - new_width)/2) + nlc)
                //var otc = parseInt(image.css('top')) + image.height()/2 - element.height()/2;
                //var ntc = otc * new_height / image.height();
                //var nt = Math.round(((element.height() - new_height)/2) + ntc)
                */

                
                //console.log(olc,nlc,nl);
                image.css({
                    'left':Math.round(parseInt(image.css('left')) + (image.width()-new_width)/2)+'px',
                    'top':Math.round(parseInt(image.css('top')) + (image.height()-new_height)/2)+'px'
                }).attr({'width':new_width, 'height':new_height});
                
                // Keep image within containment
                element.data('view').linkContainOnly();
                contain = element.data('view').contain;
                
                // check left, right, top, bottom
                if(parseInt(image.css('left')) < parseInt(contain.css('left'))) image.css('left',contain.css('left'));

                if(parseInt(image.css('left')) + image.width() > parseInt(contain.css('left')) + contain.width()) {
                    image.css('left', parseInt(contain.css('left')) + (contain.width()-image.width()) +'px');
                }

                if(parseInt(image.css('top')) < parseInt(contain.css('top'))) image.css('top',contain.css('top'));

                if(parseInt(image.css('top')) + image.height() > parseInt(contain.css('top')) + contain.height()) {
                    image.css('top', parseInt(contain.css('top')) + (contain.height()-image.height()) +'px');
                }
            }
            
            // correct handle and containment boxes
            element.data('view').linkHandle();

        }
    }

    function setScaleFromElement(){
        
        var image = hasImage();
        var dragHandle = toolbar.find("span.scaling-handle");
                
        if(image){
            
            var size = $(image).data('size');
            var scroll_width = dragHandle.parent().width() - dragHandle.outerWidth();
            var scroll_max = scroll_width;

            var cur_width = $(image).width();
            var cur_height = $(image).height();

            var max_width = element.width()*2.5;
            var max_height = element.height()*2.5;
            
            var min_width = element.width()*.8;
            var min_height = element.height()*.8;
            
            var dead_w = Math.round(scroll_width * 0.1);
            var scroll_min_w = Math.round(scroll_width * 0.3);
            var scroll_max_w = scroll_width - scroll_min_w - dead_w;
            
            var position = 0;
            if(cur_width < element.width() || cur_height < element.height()) {
                if(Math.round(min_height * size[0] / size[1]) > min_width) {
                    // use min_width
                    fill_width = Math.round(element.height() * size[0] / size[1]);
                    position = scroll_min_w - Math.round(scroll_min_w * (fill_width - cur_width) / (fill_width - min_width));
                } else {
                    // use min_height
                    fill_height = Math.round(element.width() * size[1] / size[0]);
                    position = scroll_min_w - Math.round(scroll_min_w * (fill_height - cur_height) / (fill_height - min_height));
                }
                
            } else {
                if((Math.round(element.width() * size[1] / size[0])) <= element.height()) {
                    position = Math.round( ((cur_height - element.height()) * scroll_max_w) / (max_height - element.height()) );
                } else {
                    position = Math.round( ((cur_width - element.width()) * scroll_max_w) / (max_width - element.width()) );
                }
                position = position + dead_w + scroll_min_w;
                
            }

            //fail-safe
            if(position < 0) position = 0;
            if(position > scroll_width) position = scroll_width;
            
            dragHandle.css('left',position+'px');
            
            /*
            // hack because of weird jquery position issue
            //console.log($(dragHandle.get(0)).css('left'), dragHandle.get(0).style.left, dragHandle.position());
            YUI().use('node', function(Y) {
                //var position Y.one('.scaling-handle').getStyle('left');
            });
            */
            
        } else {
            dragHandle.css('left','0px');
        }
    }
    
    // utility function --- keep for ImageElement view
    function cropTo(img,width,height) {
        
        resizewidth = width;
        resizeheight = height;
        imagewidth = $(img).width();
        imageheight = $(img).height();
        
        if((Math.round(resizewidth * imageheight / imagewidth)) <= resizeheight) {
            // use height
            returnheight = height;
            returnwidth = (Math.round(resizeheight * imagewidth / imageheight));
            $(img).css('left', '-'+((Math.floor(returnwidth - resizewidth)/2))+'px');
        } else {
            // use width
            returnwidth = resizewidth
            returnheight = (Math.round(resizewidth * imageheight / imagewidth))
            $(img).css('top', '-'+((Math.floor(returnheight - resizeheight)/2))+'px');
        }
        
        $(img).attr('width',returnwidth);            
        $(img).attr('height',returnheight);            
    }
    
    
})();


(function(){
    namespace("editor.tools.image.uploads", init, open, close, toggle, refresh, setCurrentByKey, isOpen, add, addImageFromData, resize);
    
    // MODELS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var ImageUpload = Backbone.Model.extend({
        url: function() { return '/ajax/uploads/images/'+ (this.isNew() ? '' : this.id); }
    });
    
    var ImageUploads = Backbone.Collection.extend({
        model: ImageUpload,
        url: '/ajax/uploads/images'
    });
    
    
    // VIEWS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var ImageUploadView = Backbone.View.extend({
        
        tagName: 'li',
        id:"",
        
        events: {
            "click a.load-image": "click",
            "click a.remove-image": "remove",            
            "mouseenter": "over",
            "mouseleave": "out"
        },
        
        initialize: function(){
            this.model = this.options.model;
            this.file = this.options.file;
            this.el = $(this.el);
            this.el.data('view',this);
        },
        
        setStatus: function(status) {
            var rent = this;
            var options = ['thumbnail','queued','progress','processing'];
            if(_.indexOf(options,status) !== -1) {
                _.each(options,function(option){
                    $(rent.el).removeClass('upload-'+option);
                });
                $(rent.el).addClass('upload-'+status);
            }
        },
        
        setId: function(){
            if(this.model) {
                this.id = "upload-"+this.model.id;
            } else if(this.file) {
                this.id = "upload-"+this.file.id;
            } else {
                // pass
            }
            
            $(this.el).attr('id',this.id);
        },
        
        select: function() {
            $(this.el).addClass('current');
        },
        
        deselect: function() {
            $(this.el).removeClass('current');
        },
        
        over: function(){
            this.el.addClass('hover');
        },
        
        out: function(){
            this.el.removeClass('hover');
        },        
        
        remove: function(event){
            
            // remove from list, resize, re-render or remove
            //this.parent.collection.remove(this.model);
            //this.parent.render();
            var collection = this.model.collection;
            //collection.remove(this.model);
            this.model.destroy();
            this.el.remove();
            collection.view.resize();
            
            if(event) event.preventDefault();
        },
        
        click: function(){
            editor.tools.image.loadImage(this.model.get('original').cdn);
            editor.tools.image.closeWidget();
            this.model.collection.view.setCurrent(this.model);
            return false;
        },
        
        setProgress: function(complete,total){
            var progressBar = this.$('.progress-bar');
            $('span',progressBar).css('width', Math.round(progressBar.width() * complete / total)+'px');
            if(complete == total) this.setStatus('processing');
        },
        
        render: function(){
            this.setId();
            this.setStatus(this.model ? 'thumbnail' : 'queued');
            $(this.el).html(_.template($("#tmpl-image-upload").html(),{
                'image': this.model ? this.model.toJSON() : {},
                'file': this.file ? this.file : {}
            }));
            return this;
        }
    });
    
    var ImageUploadsView = Backbone.View.extend({
        
        el: $('#bottom-bar'),
        track: $('#uploaded-images',this.el),
        events: {
            //"scroll":"scroll",
            "click a.close-button" : "close",
            "click #upload-load-more a" : "fetchMore"
        },
        
        initialize: function() {
            this.collection = new ImageUploads();
            this.collection.view = this;
            this.uploader = new ImageUploaderView({ parent:this });
            $(this.el).scrollLeft(0);
            this.fetchMore();
        },
        
        add: function(data, complete){
            this.uploader.add(data, complete);
        },
        
        refresh: function(complete) {
            var rent = this;
            this.collection.fetch({
                success: function(collection, response){
                    rent.render();
                    rent.$('#uploaded-images').append(rent.$('#upload-load-more').show());
                    if(complete) complete();
                },
                error: function(collection, response){
                    new Error({message:'There was an error fetching images'});
                }
            });            
        },
        
        setCurrentByKey: function(key){
            var found = false;
            if(key) {
                found = this.collection.find(function(img){
                    return img.get('original').key == key ? true : false;
                });
            }
            
            this.setCurrent(found);
        },
        
        setCurrent: function(model){
            this.collection.each(function(imageUpload){
                if(imageUpload.view) imageUpload.view.deselect();
            });
            
            if(model) model.view.select();
        },
        
        isOpen: function(){
            return (parseInt($(this.el).css('height')) > 1) ? true : false;
        },
        
        toggle: function(){
            if(this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
            return false;
        },
        
        open: function(){
            var rent = this;
            $(rent.el).animate({ height: '164px', opacity: '1' }, {
                duration: 300,
                step: function() { editor.resize(); },
                complete: function(){
                    $(rent.el).css('overflow','visible');
                    $(rent.el).css('overflow-x','scroll');                    
                    rent.$('.close-button').animate({ opacity: '1', left: '13px' }, 300);
                    editor.resize();
                }
            });
            return false;
        },
        
        close: function(){
            var rent = this;
            rent.$('.close-button').animate({opacity: '0', left: '-100px'}, 100, function(){
                $(rent.el).animate({ height: '0', opacity: '0' }, {
                    duration: 300,
                    step: function() { editor.resize(); },
                    complete: function(){
                        $(rent.el).css('overflow','hidden');
                        editor.resize();
                    }
                });
            });
            
            return false;
        },
        
        resize: function(){
            var width = 0;
            $('li','#uploaded-images').each(function(i,li){
                li = $(li);
                if(li.is(':visible')) width = width + li.width() + parseInt(li.css('margin-left')) + parseInt(li.css('margin-right')) + parseInt(li.css('padding-left')) + parseInt(li.css('padding-right'));
            });
            $('#uploaded-images').width(width+10);
        },
        
        loading: false,
        fetches: 0,
        fetchMore: function(){
            var rent = this;
            var limit = 50;
            if(this.collection && rent.loading == false) {
                rent.loading = true;
                rent.$('#upload-load-more').hide();
                rent.$('#uploaded-images').append(rent.$('#upload-loading-more').show());
                lastThumb = rent.$('.upload-thumbnail:last');
                this.collection.fetch({
                    add:true,
                    data: {
                        cursor: this.collection.length,
                        limit: limit
                    },
                    success: function(collection, response){
                        rent.$('#upload-loading-more').hide();
                        rent.render();
                        if(response.length == limit) rent.$('#uploaded-images').append(rent.$('#upload-load-more').show());
                        rent.resize();
                        rent.loading = false;
                        if(rent.fetches != 0) $(rent.el).scrollTo(lastThumb, 1000, {axis:'x'} );
                        rent.fetches++;
                    }
                });
            }
        },
        
        scroll: function(){
            var rent = this;
            if($(this.el).scrollLeft() >= this.$('#uploaded-images').width() - $(this.el).outerWidth() - 500) {
                //console.log('trigger '+ rent.collection.length);
                this.fetchMore();
            }
        },
        
        render: function() {
            var rent = this;
            if(this.collection.models.length > 0) {
                var track = this.track;
                //track.html('');
                this.collection.each(function(imageUpload){
                    if(!imageUpload.view) {
                        imageUpload.view = new ImageUploadView({'model':imageUpload});
                        track.append(imageUpload.view.render().el);
                    }
                });
                rent.resize();
            } else {
                new Error({ message:'No images were found' });
            }
            return this;
        },
        
        addImageFromData: function(data){
            var rent = this;
            var model = new ImageUpload(data);
            var view = new ImageUploadView({model:model}).render();
            model.view = view;
            this.collection.add(model, {at:0});
            $('#upload-multi').after(view.el);
            rent.resize();
            return model;
        }
    });
    
    var ImageUploaderView = Backbone.View.extend({
        
        el: $('#upload-multi'),
        track: undefined,
        plupload: undefined,
        initialize: function(){
            this.parent = this.options.parent;
            this.track = this.parent.track;
            this.render();
        },
        
        getView: function(file){
            return $('#upload-'+file.id).data('view');
        },
        
        add: function(data,complete){
            
            var model = new ImageUpload(data);
            model.view = new ImageUploadView({model:model}).render();
            $(model.view.el).data('view',model.view);
            $(this.el).after(model.view.el);
            this.parent.collection.add(model, {at:0}); 
            if(complete) complete();
        },
        
        render: function(){
            var rent = this;
            
            
            // setup plupload
            var uploader = new plupload.Uploader({
                runtimes : 'html5,flash,silverlight',
                container: 'upload-multi',
                browse_button: 'upload-multi-button',
                max_file_size: '10mb',
                url : '/ajax/uploads/images',
                flash_swf_url : '/assets/scripts/plupload/plupload.flash.swf',
                silverlight_xap_url : '/assets/scripts/plupload/plupload.silverlight.xap',
                filters : [{title : "Image files", extensions : "jpg,jpeg,gif,png"}],
                file_data_name: 'image',
                multi_selection: true,
                multipart: true,
                multipart_params: {
                    'fclass':'page-asset-original',
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
                //console.log('FilesAdded', up, files);
                _.each(files,function(file){
                    var view = new ImageUploadView({file:file}).render();
                    $(rent.el).after(view.el);
                });
                
                up.start(); // Reposition Flash/Silverlight
                up.refresh(); // Reposition Flash/Silverlight
                
                rent.parent.resize();
            });
            
            uploader.bind('BeforeUpload', function(up, files) {
                //console.log('BeforeUpload',files);
                //rent.file = files;
                //rent.setStatus('uploading');
                //rent.isUploading = true;
                
                _.each(files,function(file){
                    var view = rent.getView(file);
                    if(view) view.setStatus('progress');
                });
                
            });
            
            uploader.bind('UploadProgress',function(up,file) {
                //console.log('UploadProgress', up, file);
                var view = rent.getView(file);
                if(view) view.setProgress(file.loaded,file.size);
            });
            
            uploader.bind('Error', function(up, err) {
                alert("Error: " + err.message);
                up.refresh(); // Reposition Flash/Silverlight
            });
            
            uploader.bind('FileUploaded', function(up, file, response) {
                //console.log('FileUploaded',file, response);
                    
                var data = eval('('+response.response+')');
                var view = rent.getView(file);
                if(view) {
                    var model = new ImageUpload(data);
                    view.model = model;
                    model.view = view;
                    view.render();
                    rent.parent.resize();
                    rent.parent.collection.add(model, {at:0});
                }
            });
            
            // set to object
            this.plupload = uploader;

        }
    });
    
    // begin public methods
    var view = false;
    function init() { view = new ImageUploadsView(); }
    function refresh(complete) { if(view)  view.refresh(complete); return false; }        
    function toggle() { if(view) view.toggle(); return false; }
    function open() { if(view) view.open(); return false; }
    function close() { if(view) view.close(); return false; }
    function resize() { if(view) view.resize(); return false; }
    function setCurrentByKey(key) { if(view) view.setCurrentByKey(key); return false; }
    function isOpen() { if(view) return view.isOpen(); }
    function add(data,complete) { if(view) return view.add(data,complete); }
    function addImageFromData(data) { if(view) return view.addImageFromData(data); }

    
})();



(function(){
    namespace("editor.tools.image.linkbuilder", init, enable, disable, set);
    var el = $("#image-link-popup"); 
    var widget = el;
    var element = undefined;
    var buttons = {
        'add': $('#image-options .add-link-button a'),
        'display': $('#image-options .display-link-button a#display-image-link-button'),
        'remove': $('#image-options .display-link-button a.remove')
    };
    
    function init(){
        bindButtons();
    }
    
    function bindButtons(){
        
        buttons.add.click(function() {
            if (!isOpen()){ open(); } else { close(); }
        });
        
        buttons.display.click(function() {
            if (!isOpen()){ open(); } else { close(); }
        });
        
        buttons.remove.click(function() {
            removeLink();
            close();
        });
        
        set('');
        
        $('.remove-link a',el).click(function(){
            removeLink();
            close();
        });
        
        $('.save-controls .save-button a',el).click(function(){
            action(getValue());
            close();
        });
        
        $('.save-controls .cancel-button a',el).click(function(){
            close();
        });
        
        // disable all image links
        //$('.mdata a').live('click',function(){
        //    return false;
        //});
        
        // marko radio button code
        $('.label-check, .label-radio',el).click(setupLabel);
        $('.option-item .input-radio',el).click(function(){
            var obj = $(this);
            $('.additional-info', obj.closest('.radio-group')).hide();
            $('.additional-info', obj.closest('.option-item')).show();
        });
        
        // select checked item
        var obj = $('.option-item .input-radio:checked',el).first();
        var theParent = obj.closest('.option-item');
        $('.additional-info', theParent).hide();
        $('.additional-info', theParent).show();
        
        $('.category-pseudo-select',el).hide();
        $('.pseudo-select-value',el).click(function() {
            var obj = $(this);
            var theParent = obj.closest('.option-item');
            if ($('.category-pseudo-select:hidden', theParent).length){
                $('.category-pseudo-select', theParent).fadeIn('fast');
            } else {
                $('.category-pseudo-select', theParent).fadeOut('fast');
            }
        });
        
        $('.category-pseudo-select a',el).click(function(){
            var obj = $(this);
            var theParent = obj.closest('.option-item');
            $('input[type=hidden]', theParent).val($(this).attr('href'));
            $('.pseudo-select-value', theParent).html($(this).text());
            $('.category-pseudo-select:visible', theParent).fadeOut('fast');
            return false;
        });
        
        // set first child class
        $('.category-pseudo-select li:first-child',el).addClass('first-child');
        
        // select the first pseudo option
        $('.category-pseudo-select li:first-child a',el).click();
        
        // launch the picker?
        $('label[for="image-to-page"]',el).click(function(){
            launchPicker();
        });
        
        // link screenshot to picker
        $('.link-field-page .additional-info .image-wrapper a',el).click(function(){
            openPicker();
            return false;
        });
    }
    
    function selectPageReturn(page) {
        editor.tools.picker.close();
        setPage(page);
        return false;
    }
    
    function launchPicker(){
        if(isOpen() && $('#selected-image-link-page',el).val() == '') {
            editor.tools.picker.setAction(selectPageReturn);
            editor.tools.picker.open($('#selected-image-link-page',el).val());
        }
        return false;
    }
    
    function openPicker(){
        editor.tools.picker.open($('#selected-image-link-page',el).val());
    }
    
    function setPage(page){
        if(page && page.id) {
            $('#selected-image-link-page',el).val(page.id);
            var img = $('.link-field-page .additional-info .image-wrapper a img',el);
            if(!img.length){
                img = $('<img />');
            }
            img.attr('width',232).attr('height',145).attr('src',page.get('thumbnail'));
            $('.link-field-page .additional-info .image-wrapper a',el).prepend(img);
            $('.link-field-page .additional-info .image-wrapper',el).show();
        } else {
            $('#selected-image-link-page',el).val('');
            $('.link-field-page .additional-info .image-wrapper',el).hide();            
        }
    }
    
    function setPageById(id){
        if(id){
            editor.tools.picker.fetchPage(id,function(page){
                setPage(page);
            });
        } else {
            setPage();
        }
    }
    
    function setPageFromUri(uri){
        if(uri.indexOf('#page-') === 0){
            var id = uri.split('#page-')[1];
            return setPageById(id);
        } else {
            return setPageById('');
        }
    }
    
    function isOpen(){
        return $('#image-link-popup:hidden').length ? false : true;
    }
    
    function open(anchor){
        $('.popup').hide();
        $(el).fadeIn('fast');
    }
    
    function close(){
        $('.link-popup').fadeOut('fast');        
    }
        
    function setRadioOptionFromUri(uri){
        
        if(uri == '#next-page') {
            $('.link-field-next input:radio',el).click();
        } else if(uri == '#previous-page') {
            $('.link-field-prev input:radio',el).click();
        } else if(uri.indexOf('#page-') === 0) {
            $('.link-field-page input:radio',el).click();
        } else if(uri.indexOf('#category-') === 0) {
            $('.link-field-category input:radio',el).click();
        } else if(uri.indexOf('http') === 0) {
            $('.link-field-url input:radio',el).click();
        } else if(uri == '#full-size') {
            $('.link-field-full-size input:radio',el).click();
        } else {
            $('input:radio',el).attr('checked', false);
        }
        
        setupLabel();
    }
    
    function setCategoryFromUri(uri){
        var selectEl = $('.link-field-category .pseudo-select',el);
        if(uri.indexOf('#category-') === 0){
            var id = uri.split('#category-')[1];
            $('li a[href='+id+']',selectEl).click();
        } else {
            $('li:first-child a',selectEl).click();
        }
    }
    
    function getTextLabelFromUri(uri){
        var rtn = ''
        if(uri == '#next-page') {
            rtn = 'Next Page';
        } else if(uri == '#previous-page') {
            rtn = 'Previous Page';
        } else if(uri.indexOf('#page-') === 0) {
            rtn = 'Linked to a Page';
        } else if(uri.indexOf('#category-') === 0) {
            rtn = 'Linked to a Category';
        } else if(uri == '#full-size') {
            rtn = 'Linked to Full-Size Image';
        } else {
            rtn = (uri.length > 30 ? uri.substring(0,27)+'...' : uri);
        }
        
        return rtn;
    }
    
    function setThumbnail(){
        
        var max_w = 210;
        var max_h = 150;
        
        var img = element ? element.find('img') : false;
        var thumb = $('img.the-thumbnail-to-link',el);
        if(img.length) {
            var size = $(img).data('size');
            thumb.attr('src',img.attr('src'));
            
            //size[0] max_w 467 210
            //size[1] max_h 700 150
            
            if((Math.round(max_w * size[1] / size[0])) <= max_h) { // horizontal picture
                // use max_w
                thumb.attr('width', max_w);
                thumb.attr('height', Math.round(max_w * size[1] / size[0]));
                thumb.css({ 'margin-left':'0px', 'margin-top': Math.floor((max_h - thumb.height()) / 2)+'px' });
            } else {
                // use max_h
                thumb.attr('height', max_h);
                thumb.attr('width', Math.round(max_h * size[0] / size[1]));
                thumb.css({ 'margin-top':'0px', 'margin-left': Math.floor((max_w - thumb.width()) / 2)+'px' });
            }
            
            thumb.show();
        } else {
            thumb.hide();
        }
    }
    
    function set(anchor){
        
        element = anchor;
        
        var href = '';
        if(element) href = $(element).attr('href') ? $(element).attr('href') : '';
        if(href != ''){
            
            buttons.display.find('.value').text(getTextLabelFromUri(href));
            buttons.display.parent().show();
            buttons.add.parent().hide();
            
            // handle remove button
            $('.remove-link',el).show();
            
            // set url value
            $('#image-which-url',el).val((href.indexOf('#') === 0) ? 'http://' : href );
            
            // set radio option
            setRadioOptionFromUri(href);
            
            // set category
            setCategoryFromUri(href);

            // set picker value
            setPageFromUri(href);
            
        } else {
            
            buttons.display.find('.value').text('');
            buttons.display.parent().hide();
            buttons.add.parent().show();

            // handle remove button
            $('.remove-link',el).hide();
            
            // set url value
            $('#image-which-url',el).val('http://');
            
            // set radio option
            setRadioOptionFromUri('');
            
            // set category
            setCategoryFromUri('');
            
            // set picker value
            setPageFromUri('');
        }

        // set the image thumbnail
        setThumbnail();
    }
    
    function getValue(){
        var val = '';
        var type = $('input:radio[name="link-to-where"]:checked',el).val();
        switch(type) {
            case 'page':
                val = '#page-'+$('#selected-image-link-page',el).val();
                break;
            case 'category':
                val = '#category-'+$('#selected-image-link-category',el).val();
                break;
            case 'next-page':
                val = '#next-page';
                break;
            case 'previous-page':
                val = '#previous-page';
                break;
            case 'full-size':
                val = '#full-size';
                break;
            default:
                val = $('#image-which-url').val();
        }
        return val;
    }
    
    function enable(){
        return false;    
    }
    
    function disable(){
        return false;
    }
    
    function action(uri){
        element.attr('href',getValue());
        set(element);        
        return false;
    }
    
    function removeLink(){
        element.removeAttr('href');
        set(element);
        return false;
    }
    
})();

(function(){
    /**
     * Utilizes YUI 3's rich text editor (beta)
     * Good example of implementation can be found at the following url:
     * http://yuiblog.com/sandbox/yui/3.2.0pr1/examples/editor/alloy-editor_source.html
     */
    namespace("editor.tools.text", init, reset, focus, unfocus, bind, destroy, getTextEditor, isActive, forecolor, link, bold, italic, getSelection, updateButtons);
    
    
    Nubook.Editor.Views.TextElement = Backbone.View.extend({
        
        initialize: function(){
            this.el = $(this.options.element);
            this.el.data('view',this);
        },
        
        isEmpty: function(){
            if(this.$('div.tdata').text() == '') return true;
            return false;
        },
        
        render: function(){
            return this;
        }
    });
    
    
    // BEGIN TOOL ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var texteditor;
    var toolbar = $('#font-options');
    var buttons = [];
    
    function getTextEditor(){ return texteditor; }
    function isActive(){ return texteditor ? true : false; }
    function registerTextEditor(te){
        texteditor = te;
    }
    
    function init(){
        
        editor.tools.text.colorpicker.init();
        editor.tools.text.linkbuilder.init();
                
        // add init functionality
        // - draggability
        // - button activation
        $.each($('.template .twrap'),function(i,twrap){
            twrap = $(twrap);
            var view = new Nubook.Editor.Views.TextElement({ element:twrap });
            //log.add(twrap.find('.tdata').attr('style'));
            //twrap.click(function(){
            //    editor.tools.text.bind($(this));
            //});
        });
        
        buttons['italic'] = toolbar.find(".italic-button a");
        buttons['bold'] = toolbar.find(".bold-button a");
        buttons['color'] = toolbar.find(".color-picker-button a");
        buttons['textup'] = toolbar.find(".text-up-button a");
        buttons['textdown'] = toolbar.find(".text-down-button a");
        
        bindButtons();
    }
        
    function bindButtons(){
        buttons.italic.click(italic);
        buttons.bold.click(bold);
        buttons.textup.click(textup);
        buttons.textdown.click(textdown);
    }
        
    function destroy(next){
        if(texteditor) {
            html = texteditor.getContent();
            unfocus();
            tdata.html(html);
            texteditor.destroy();
            texteditor = undefined;
            tdata.css('display','block');
            tdata.parent('.twrap').css({ 'z-index':'' });

        }
    }
    
    function bind(twrap){
        
        //console.log('start block');
        $('#prevent-interaction').show();
        
        editor.tools.setActive(this);
        editor.tools.indicator.setActive(twrap);
        
        tdata = twrap.find('.tdata');
        //tdata.css('display','none');
        twrap.css({ 'z-index':200 });
        
        
        // alter tdata to replace block-level elements
        $.each(tdata.find('b'),function(i,block){ $(block).replaceWith($("<span />").css('font-weight','bold').append($(block).html())); });
        $.each(tdata.find('i'),function(i,block){ $(block).replaceWith($("<span />").css('font-style','italic').append($(block).html())); });
        
        var fontname = fontload.whichFont(tdata);
        YUI().use('editor-base', function(Y) {
            
            // modify iframe defaults            
            var HTML = '<iframe border="0" frameBorder="0" marginWidth="0" marginHeight="0" leftMargin="0" topMargin="0" allowTransparency="true" width="100%" height="100%" style="overflow:hidden" scrolling="no"></iframe>';
            // var PAGE_HTML = '<html dir="{DIR}" lang="{LANG}"><head><title>{TITLE}</title>{META}<base href="{BASE_HREF}"/>{LINKED_CSS}<style id="editor_css">{DEFAULT_CSS}</style>{EXTRA_CSS}</head><body>{CONTENT}</body></html>';
            // <script src="http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js"></script><script type="text/javascript">'+"\n"+'WebFont.load({typekit:{id:"tcb3zyj"}});'+"\n"+'</script>
            var PAGE_HTML = '<html dir="{DIR}" lang="{LANG}"><head><title>{TITLE}</title>{META}<base href="{BASE_HREF}"/><style id="editor_css">{DEFAULT_CSS}</style>{EXTRA_CSS}</head><body><div>{CONTENT}</div></body></html>';
            // var PAGE_HTML = '<html dir="{DIR}" lang="{LANG}"><head><title>{TITLE}</title>{META}<base href="{BASE_HREF}"/><style id="editor_css">{DEFAULT_CSS}</style>{EXTRA_CSS}</head><body><div>{CONTENT}</div></body></html>';
            Y.Frame.HTML = HTML;
            Y.Frame.PAGE_HTML = PAGE_HTML;
            
            var te = new Y.EditorBase({
                content: tdata.html(),
                extracss: fontload.getFont(fontname)+'body { background:transparent; margin:0px; padding:0px; overflow:hidden; overflow-y:none; overflow-x:none; width:'+twrap.width()+'px;height:'+twrap.height()+'px;'+twrap.find('.tdata').attr('style')+'} a, a:visited, a:hover { color:inherit !important; } big { font-size:1.05em; } small { font-size:.95em; }'
            });
            
            //Add the BiDi plugin
            te.plug(Y.Plugin.EditorBidi);
            
            // Run button updates on mousedown
            te.after('nodeChange', function(e) {
                switch (e.changedType) {
                    case 'keyup':
                    case 'mousedown':
                        updateButtons(e);
                        break;
                    case 'mouseup':
                        updateButtons(e);
                        break;
                }
            });
                        
            //Focusing the Editor when the frame is ready..
            te.on('frame:ready', function() {
                
                tdata.css('display','none');
            
                this.focus(); // this == texteditor
                focus(); // turn on the edit bar
                
                te.execCommand('insertbronreturn',true);
                inst = te.getInstance(); // iframe yui object
                inst.one('body').addClass(tdata.attr('class')); // add classes to handel fonts
                
                // inject content manually for testing.
                //inst.one('body').setContent(tdata.html());
                
                //var typeKitUrl = 'http://use.typekit.com/tcb3zyj.js';
                //var testReturn = function(){ alert('yay'); };
                
                //inst.Get.script('/static/tmp/iframe.js', {
                //    onSuccess: testReturn
                //});
                
                //console.log('end block');
                $('#prevent-interaction').hide();
                
                te.execCommand('selectAll');

            });
                        
            //Rendering the Editor.
            te.render('#'+twrap.attr('id'));
            registerTextEditor(te);
        });
    }
        
    function reset(){}
        
    function focus(){
        //if($(element).data('indicator')) $(element).data('indicator').focus();
        toolbar.show();

        // Chrome display HACK!!
        $('.toolbar li a').css('background-image','url(/assets/styles/editor/e/font-options-matrix.png)');

        
        //twrap.css('z-index',200);
    }
    function unfocus(){
        //if($(element).data('indicator')) $(element).data('indicator').unfocus();
        toolbar.hide();
        //twrap.css('z-index','');
    }
        
    function updateButtons(e) {
        var tar = e.changedNode;
        if (tar) {
            var cmds = e.commands;
            var node = tar._node;
            var inst = texteditor.frame.getInstance();
            var sel = new inst.Selection();
                        
            // italic
            if(cmds['italic']) {
                buttons.italic.addClass('active');
            } else {
                buttons.italic.removeClass('active');
            }
            
            // bold
            if(cmds['bold']){
                buttons.bold.addClass('active');
            } else {
                buttons.bold.removeClass('active');                
            }
            
            if(sel.text == ''){
                buttons.bold.parent().addClass('disabled');
                buttons.color.parent().addClass('disabled');
                buttons.italic.parent().addClass('disabled');
                buttons.textdown.parent().addClass('disabled');
                buttons.textup.parent().addClass('disabled');
            } else {
                buttons.bold.parent().removeClass('disabled');
                buttons.color.parent().removeClass('disabled');
                buttons.italic.parent().removeClass('disabled');
                buttons.textdown.parent().removeClass('disabled');
                buttons.textup.parent().removeClass('disabled');
            }
            
            // colorpicker
            editor.tools.text.colorpicker.set(e.fontColor);
            
            // linkbuilder
            if(node.tagName.toLowerCase() == 'a' || sel.text != '') {
                editor.tools.text.linkbuilder.enable(node);
            } else {
                editor.tools.text.linkbuilder.disable();                
            }
            
            //var fname = e.fontFamily,
            //var fsize = e.fontSize;
        }
    }
    
    function getSelection(){
        
        if(texteditor) {
            var inst = texteditor.frame.getInstance();
            var sel = new inst.Selection();
            return sel;
        }
        
        return false;
    }
    
    function bold(color){
        
        if(texteditor) texteditor.execCommand('bold');
        return false;
        
        /*if(texteditor) {

            var selection = getSelection();
            var selected = selection.getSelected();
            var el = selected._nodes[0];
            
            console.log(selection);
            console.log(el);
                        
            if($(el).children('b').length){
                $.each($(el).children('b'),function(i,bel){
                    $(bel).replaceWith($(bel).html());
                }); 
            }            

            selection = getSelection();
            selected = selection.getSelected();
            el = selected._nodes[0];
            
            if($(el).parents('b').length){
                $.each($(el).parents('b'),function(i,bel){
                    console.log(bel);
                    $(bel).replaceWith($(bel).html());
                }); 
            } else {
                selection.wrapContent('b');
            }
            
            //console.log($(selected._nodes[0]).html());
            //console.log($(selected._nodes[0]).text());
            
            //console.log($(el).parents('b').length);
            //console.log($(el).css('font-weight'));
            //console.log(selection);
            //console.log($(selected._nodes[0]).css('font-weight'));
            //console.log($(selected._nodes[0]).parent());
            //$(el).css('color','red');
            //texteditor.execCommand('bold');
            
        }*/

    }

    function textup(){
        if(texteditor) {
            if ($.browser.mozilla) {
                texteditor.execCommand('increasefontsize');                
            } else {
                texteditor.execCommand('wrap','big');            
            }
        }
        
        /*
        //if(texteditor) texteditor.execCommand('increasefontsize');
        
        var selection = getSelection();
        var selected = selection.getSelected();
        console.log($(selected._nodes[0]).css('font-size'));
        
        var fsize = parseInt($(selected._nodes[0]).css('font-size'));
        fsize = fsize + 1;
        console.log(fsize);
        console.log(fsize+'px');
        //if(texteditor) texteditor.execCommand('fontsize2', fsize+'px');
        if(texteditor) texteditor.execCommand('fontsize', '1.5em');

        var selection = getSelection();
        var selected = selection.getSelected();
        console.log($(selected._nodes[0]).css('font-size'));
        */
        return false;
    }

    function textdown(){
        if(texteditor) {
            if ($.browser.mozilla) {
                texteditor.execCommand('decreasefontsize');                
            } else {
                if(texteditor) texteditor.execCommand('wrap','small');
            }
        }
                
        return false;
    }
    
    function italic(){
        if(texteditor) texteditor.execCommand('italic');
        return false;
    }
    
    function forecolor(color){
        if(texteditor) {
            var inst = texteditor.frame.getInstance();
            var sel = new inst.Selection();
            if(sel.text != ''){
                texteditor.execCommand('forecolor',color);
            }
        }
        return false;
    }
    
    function link(uri){
        if(texteditor) {
            var inst = texteditor.frame.getInstance();
            var sel = new inst.Selection();
            if(sel.text != ''){
                //var tmp = texteditor.execCommand('createlink',uri);
                var nodes = sel.getSelected().get(0)[0]._node.childNodes;
                $.each(nodes,function(i,node){
                    if('tagName' in node) {
                        if($(node).get(0).tagName.toLowerCase() == 'a') {
                            $(node).replaceWith($(node).text());
                        }
                    }
                });
                var a = sel.wrapContent('a');
                a.setAttribute('href',uri);
                //editor.tools.text.linkbuilder.set($(a));
            } else {
                var a = sel.wrapContent('a');
                a.setAttribute('href',uri);
            }
            
            return a;
        }
        return false;
    }
        
})();


(function(){
    namespace("editor.tools.text.colorpicker", init, set, get);
    
    var farb;
    
    function init(){
        
        // show color popup
        $('.enabled .color-picker-button a').click(function() {
            if ($('#color-popup:hidden').length){
                $('.popup').hide();
                $('#color-popup').fadeIn('fast');
            } else {
                $('#color-popup').fadeOut('fast');
            }
                        
            return false;
        });
        
        
        // add farbtastic
        if ($('#color-popup .advanced').length) {
            farb = $.farbtastic('#color-popup .advanced',action);
        };
        
        // simple picker
        $('#color-popup .simple a').click(function(){
            action($(this).attr('rel'));
        });
        
        // color popup change mode
        checkAdvancedState();
        $('#color-popup-mode-swither').click(checkAdvancedState);
        
        // activate field.
        $("#color-popup form").submit(function(){
            set($("#selected-color",$("#color-popup form")).val(),true);
            return false;
        });
    }
    
    function reset(){
        
    }
    
    function checkAdvancedState(){
        if ($('#color-popup-mode-swither:checked').length) {
            $('#color-popup .simple').show();
            $('#color-popup .advanced').hide();
        } else {
            $('#color-popup .simple').hide();
            $('#color-popup .advanced').show();
        }
    }
    
    function action(color){
        editor.tools.text.forecolor(color);
        return false;
    }

    function inaction(color){
        return false;
    }
    
    function set(color,change){
        if(color) {
            $('#selected-color').val(color);
            if(!change) { farb.linkTo(inaction); }
            farb.setColor(color);
            if(!change) { farb.linkTo(action); }
        }
        return false;
    }
    
    function get(){
        return $('#selected-color').val(color);
    }
    
})();


(function(){
    namespace("editor.tools.text.linkbuilder", init, enable, disable, set, setPageById, isOpen);
    
    var el = $("#text-link-popup");    
    var selected = undefined;
    var buttons = {
        'add': $('#font-options .add-link-button a'),
        'display': $('#font-options .display-link-button a#display-link-button'),
        'remove': $('#font-options .display-link-button a.remove')
    };
    
    function init(){
        bindButtons();
    }
    
    function bindButtons(){
        //$('.enabled a#hypertext-link').click(function() {
        
        buttons.add.click(function() {
            if (!isOpen()){ open(); } else { close(); }
        });

        buttons.display.click(function() {
            if (!isOpen()){ open(); } else { close(); }
        });

        buttons.remove.click(function() {
            removeLink();
            close();
        });
        
        set('');
        
        $('.remove-link a',el).click(function(){
            removeLink();
            close();
        });
        
        $('.save-controls .save-button a',el).click(function(){
            action(getValue(),$('#link-text',el).val());
            close();
        });
        
        $('.save-controls .cancel-button a',el).click(function(){
            close();
        });
        
        // disable all body links
        $('.tdata a').live('click',function(){
            return false;
        });
        
        
        // marko radio button code
        $('.label-check, .label-radio',el).click(setupLabel);
        $('.option-item .input-radio',el).click(function(){
            var obj = $(this);
            $('.additional-info', obj.closest('.radio-group')).hide();
            $('.additional-info', obj.closest('.option-item')).show();
        });
        
        // select checked item
        var obj = $('.option-item .input-radio:checked',el).first();
        var theParent = obj.closest('.option-item');
        $('.additional-info', theParent).hide();
        $('.additional-info', theParent).show();

        $('.category-pseudo-select',el).hide();
        $('.pseudo-select-value',el).click(function() {
            var obj = $(this);
            var theParent = obj.closest('.option-item');
            if ($('.category-pseudo-select:hidden', theParent).length){
                $('.category-pseudo-select', theParent).fadeIn('fast');
            } else {
                $('.category-pseudo-select', theParent).fadeOut('fast');
            }
        });
        
        $('.category-pseudo-select a',el).click(function(){
            var obj = $(this);
            var theParent = obj.closest('.option-item');
            $('input[type=hidden]', theParent).val($(this).attr('href'));
            $('.pseudo-select-value', theParent).html($(this).text());
            $('.category-pseudo-select:visible', theParent).fadeOut('fast');
            return false;
        });
        
        // set first child class
        $('.category-pseudo-select li:first-child',el).addClass('first-child');
        
        // select the first pseudo option
        $('.category-pseudo-select li:first-child a',el).click();
        
        // launch the picker?
        $('label[for="link-to-page"]').click(function(){
            launchPicker();
        });
        
        // link screenshot to picker
        $('.link-field-page .additional-info .image-wrapper a',el).click(function(){
            openPicker();
            return false;
        });
        
        
    }
    
    function selectPageReturn(page) {
        editor.tools.picker.close();
        setPage(page);
        return false;
    }
    
    function launchPicker(){
        if(isOpen() && $('#selected-link-page',el).val() == '') {
            editor.tools.picker.setAction(selectPageReturn);
            editor.tools.picker.open($('#selected-link-page',el).val());
        }
        return false;
    }
    
    function openPicker(){
        editor.tools.picker.open($('#selected-link-page',el).val());        
    }
    
    function setPage(page){
        if(page && page.id) {
            $('#selected-link-page',el).val(page.id);
            var img = $('.link-field-page .additional-info .image-wrapper a img',el);
            if(!img.length){
                img = $('<img />');
            }
            img.attr('width',232).attr('height',145).attr('src',page.get('thumbnail'));
            $('.link-field-page .additional-info .image-wrapper a',el).prepend(img);
            $('.link-field-page .additional-info .image-wrapper',el).show();
        } else {
            $('#selected-link-page',el).val('');
            $('.link-field-page .additional-info .image-wrapper',el).hide();            
        }
    }
    
    function setPageById(id){
        if(id){
            editor.tools.picker.fetchPage(id,function(page){
                setPage(page);
            });
        } else {
            setPage();
        }
    }
    
    function setPageFromUri(uri){
        if(uri.indexOf('#page-') === 0){
            var id = uri.split('#page-')[1];
            return setPageById(id);
        } else {
            return setPageById('');
        }
    }
    
    function isOpen(){
        return $('#text-link-popup:hidden').length ? false : true;
    }
    
    function open(anchor){
        $('.popup').hide();
        $(el).fadeIn('fast');
    }
    
    function close(){
        $('.link-popup').fadeOut('fast');        
    }
    
    function setRadioOptionFromUri(uri){
        
        if(uri == '#next-page') {
            $('.link-field-next input:radio',el).click();
        } else if(uri == '#previous-page') {
            $('.link-field-prev input:radio',el).click();
        } else if(uri.indexOf('#page-') === 0) {
            $('.link-field-page input:radio',el).click();
        } else if(uri.indexOf('#category-') === 0) {
            $('.link-field-category input:radio',el).click();
        } else {
            $('.link-field-url input:radio',el).click();
        }
        setupLabel();
    }
    
    function setCategoryFromUri(uri){
        var selectEl = $('.link-field-category .pseudo-select',el);
        if(uri.indexOf('#category-') === 0){
            var id = uri.split('#category-')[1];
            $('li a[href='+id+']',selectEl).click();
        } else {
            $('li:first-child a',selectEl).click();
        }
    }
    
    function getTextLabelFromUri(uri){
        var rtn = ''
        if(uri == '#next-page') {
            rtn = 'Next Page';
        } else if(uri == '#previous-page') {
            rtn = 'Previous Page';
        } else if(uri.indexOf('#page-') === 0) {
            rtn = 'Linked to a Page';
        } else if(uri.indexOf('#category-') === 0) {
            rtn = 'Linked to a Category';
        } else {
            rtn = (uri.length > 30 ? uri.substring(0,27)+'...' : uri);
        }
        
        return rtn;
    }
    
    function set(anchor){
        
        if(anchor != ''){
            
            selected = anchor;
            var href = $(anchor).attr('href');
            buttons.display.find('.value').text(getTextLabelFromUri(href));
            buttons.display.parent().show();
            buttons.add.parent().hide();
            
            // handle remove button
            $('.remove-link',el).show();

            // handle text
            $('#link-text',el).val(selected.text());
            
            // set url value
            $('#which-url',el).val( href.indexOf('#') === 0 ? 'http://' : href );
            
            // set radio option
            setRadioOptionFromUri(href);
            
            // set category
            setCategoryFromUri(href);

            // set picker value
            setPageFromUri(href);
            
        } else {
            
            selected = undefined;
            buttons.display.find('.value').text('');
            buttons.display.parent().hide();
            buttons.add.parent().show();

            // handle remove button
            $('.remove-link',el).hide();
            
            // handle text
            selection = editor.tools.text.getSelection();
            if(selection) {
                $('#link-text',el).val(selection.text);
            }
            
            // set url value
            $('#which-url',el).val('http://');
            
            // set radio option
            setRadioOptionFromUri('');
            
            // set category
            setCategoryFromUri('');
            
            // set picker value
            setPageFromUri('');
        }
    }
    
    function getValue(){
        var val = '';
        var type = $('input:radio[name="link-to-where"]:checked',el).val();
        switch(type) {
            case 'page':
                val = '#page-'+$('#selected-link-page',el).val();
                break;
            case 'category':
                val = '#category-'+$('#selected-link-category',el).val();
                break;
            case 'next-page':
                val = '#next-page';
                break;
            case 'previous-page':
                val = '#previous-page';
                break;
            default:
                val = $('#which-url').val();
        }
        return val;
    }
    
    function enable(node) {
        
        buttons.add.parent().removeClass('disabled');
        
        if(node){
            var tagName = node.tagName;
            node = $(node);
            if(tagName.toLowerCase() == 'a') {
                set(node);
            } else {
                parents = node.parents('a');
                if(parents.length > 0) {
                    set(parents[1]);
                } else {
                    set('');
                }
            }
        }
    }
    
    function disable() {
        buttons.add.parent().addClass('disabled');
        set('');
    }
    
    function action(uri, text){
        sel = editor.tools.text.getSelection();

        // if anchor selected
        if(selected) {
            $(selected).attr('href',uri);
            if(text !== undefined) {
                if(selected.text() != text){
                    $(selected).text(text);
                }
            }
            
        // if no anchor but cursor selection
        } else if(sel.text != '') {
            var a = editor.tools.text.link(uri); // a is a yui node
            a = $(a._nodes[0]) // convert to jquery
            if(text !== undefined) {
                if(a.text() != text){
                    a.text(text);
                }
            }
        
        // if no anchor and no cursor highlight
        } else {
            sel.insertAtCursor('<a href="'+uri+'">'+text+'</a>', sel.anchorTextNode, sel.anchorOffset);
        }
        
        return false;
    }
    
    function removeLink(){
        if(selected){
            $(selected).replaceWith($(selected).text());
            selected = undefined;
            set('');
        }
        return false;
    }
    
})();

(function(){
    namespace('editor.tools.embed', init, bind, open, close, destroy, focus, unfocus, align, parseService, openPreview);
        
    Nubook.Editor.Views.EmbedElement = Backbone.View.extend({
        
        initialize: function(){
            this.el = $(this.options.element);
            this.id = this.el.attr('id');
            this.el.data('view',this);
        },
        
        isEmpty: function(){
            if(this.el.data('code') != '') return false;
            return true;
        },
        
        render: function(){
            return this;
        }
    });
    
    
    Nubook.Editor.Views.EmbedWidget = Backbone.View.extend({
        
        className: 'ewrap-widget',
        element: undefined, // nubook embed element
        events: {
            'click a.embed-button':'activate',
            'click a.ewrap-preview-button':'previewButton',
            'click a.ewrap-edit-button':'editButton',
            'click a.ewrap-delete-button':'deleteButton',
            'mouseover .buttons a': 'buttonOver',
            'mouseout .buttons a': 'buttonOut'
        },
        
        initialize: function(){
            
            this.element = $(this.options.element);
            this.num = this.element.attr('id').split('-')[1];
            this.id = 'ew-' + this.num;
            this.element.data('widget',this);
            
            this.render();
        },
        
        align: function(){
            $(this.el).css({
                'left': Math.floor(parseInt(this.element.css('left')) + (this.element.width() - $(this.el).width()) / 2) + 'px',
                'top': Math.floor(parseInt(this.element.css('top')) + (this.element.height() - $(this.el).height()) / 2) + 'px'
            });
        },
        
        activate: function(event){
            editor.tools.embed.bind(this.element);
            event.preventDefault();
            event.stopPropagation();
        },
        
        buttonOver: function(event){
            $(this.el).addClass('hover');
            this.$('.preview .overlay span').text($(event.currentTarget).text());
        },
        
        buttonOut: function(event){
            $(this.el).removeClass('hover');            
        },
        
        previewButton: function(event){
            editor.tools.embed.bind(this.element);
            editor.tools.embed.openPreview(this.element);
            event.preventDefault();
            event.stopPropagation();            
        },

        editButton: function(event){
            editor.tools.embed.bind(this.element);
            editor.tools.embed.open();            
            event.preventDefault();
            event.stopPropagation();
        },

        deleteButton: function(event){

            editor.tools.embed.bind(this.element);
            
            this.element.data('code','');
            this.render();
            
            editor.tools.indicator.setActive(this.element);

            event.preventDefault();
            event.stopPropagation();
        },
        
        processImage: function(service){
            var rent = this;
            
            if(service) {
                switch(service.service){
                
                case 'youtube':
                    var img = 'http://img.youtube.com/vi/'+service.uid+'/1.jpg';
                    this.renderImage(img);
                    break;
                    
                case 'vimeo':
                    $.ajax({
                        url: 'http://vimeo.com/api/v2/video/' + service.uid + '.json',
                        dataType: 'jsonp',
                        success: function(data) {
                            rent.renderImage(data[0].thumbnail_medium);
                        }
                    });
                    break;
                default:
                    this.renderImage();
                }
            } else {
                this.renderImage();
            }
        },
        
        renderImage:function(src){
            var rent = this;
            this.$('.preview-thumb').html('');
            if(src){
                $(this.el).removeClass('custom');
                var img = $('<img />').load(function(){
                    img.attr('width',120);
                    rent.$('.preview-thumb').append(img);
                }).attr('src',src);
                
            } else {
                $(this.el).addClass('custom');
            }
            rent.align();
        },
        
        render: function(){
            
            $(this.el).attr('id', this.id);
            $(this.el).html(_.template($("#tmpl-embed-widget").html(),{num:this.num}));
            var code = this.element.data('code');
            var service = editor.tools.embed.parseService(code);
            
            if(code) {
                $(this.el).addClass('filled');
            } else {
                $(this.el).removeClass('filled');
            }
            
            this.processImage(service);
            
            this.align();
            return this;
        }
    });
    
    Nubook.Editor.Views.EmbedPopup = Backbone.View.extend({
        
        el: $('#embed-popup'),
        
        element: undefined, // nubook embed element
        
        events: {
            'click .save-controls .cancel-button a':'close',
            'click .save-controls .save-button a':'save',
            'click .remove-link a': 'remove',
            'click .embed-action a': 'scaleToFit'
        },
        
        initialize: function(){
            this.render();
        },
        
        render: function(){
            this.$('#embed-code').val('');
            this.$('.remove-link').hide();
            if(this.element) {
                var code = this.element.data('code');
                this.$('#embed-code').val(code);
                this.$('.embed-action .embed-width').text(this.element.width());
                this.$('.embed-action .embed-height').text(this.element.height());
                if(code) this.$('.remove-link').show();
            }
                       
            return this;
        },
        
        set: function(element){
            if(element && $(element).hasClass('ewrap')){
                this.element = element;
            } else {
                this.element = undefined;
            }
            this.render();
        },
        
        save: function(event){
            
            if(this.element){
                $(this.element).data('code',this.$('#embed-code').val());
                $(this.element).data('widget').render();
                editor.tools.indicator.setActive(this.element);
            }
            
            this.close();
            if(event) event.preventDefault();
        },

        remove: function(event){
            
            if(this.element){
                $(this.element).data('code','');
                $(this.element).data('widget').render();
                editor.tools.indicator.setActive(this.element);
            }
            
            this.close();
            if(event) event.preventDefault();
        },
        
        scaleToFit: function(event){
            
            var sEmbed = this.$('#embed-code').val();
            
			var re = /(width=\"([0-9]+)(px)?\")/g;
			sEmbed = sEmbed.replace(re,'width="'+this.element.width()+'"');

			var re = /(height=\"([0-9]+)(px)?\")/g;
			sEmbed = sEmbed.replace(re,'height="'+this.element.height()+'"');
            
            this.$('#embed-code').val(sEmbed);
            
            if(event) event.preventDefault();
        },
        
        open: function(event){
            //$('.popup').hide();
            this.render();
            $(this.el).show();
            this.$('#embed-code').focus();
            if(event) event.preventDefault();
        },
        
        close: function(event){
            $(this.el).fadeOut('fast');
            if(event) event.preventDefault();        
        }
    });
    
    Nubook.Editor.Views.EmbedPreviewPopup = Backbone.View.extend({
        
        el: $('.embed-preview-popup'),
        element: undefined, // nubook embed element
        
        events: {
            'click .hider-inner': 'close'
        },
        
        initialize: function(){
            this.render();
        },
        
        renderPreview: function(){
            if(this.element){
                this.removePreview() // make sure that this is the only one.
                var preview = $('<div class="ewrap-preview"/>').css({
                    'top': this.element.css('top'),
                    'left': this.element.css('left'),
                    'width': this.element.css('width'),
                    'height': this.element.css('height')
                }).html(this.element.data('code'));
                preview.appendTo($('#builder-boundary'));
                preview.click(function(event){ event.stopPropagation(); });
                preview.show();
            }
        },
        
        removePreview: function(){
            $('.ewrap-preview').remove();
        },
        
        set: function(element){
            this.element = element;
        },
        
        open: function(element){
            this.set(element);
            this.render();
            $(this.el).show();
        },
        
        close: function(){
            this.removePreview();
            $(this.el).hide();
        },
        
        render: function() {
            if(this.element){
                this.renderPreview();
            } else {
                this.removePreview();
            }
        }
    });
    
    
    // TOOL CODE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var ewrap = undefined;
    var popup = undefined;
    var preview = undefined;
    
    function init(){
        popup = new Nubook.Editor.Views.EmbedPopup();
        preview = new Nubook.Editor.Views.EmbedPreviewPopup();
        
        // activate embed click
        $.each($('.template .ewrap'),function(i,ewrap){
            
            // move code from ewrap body to data field
            $(ewrap).data('code',$(ewrap).html());
            $(ewrap).html('');
            $(ewrap).show();
            
            var view = new Nubook.Editor.Views.EmbedElement({ element:ewrap });
            var ewrapWidget = new Nubook.Editor.Views.EmbedWidget({ element:ewrap });
            $(ewrapWidget.el).appendTo($('#builder-boundary'));
            
            //$(ewrap).click(function(e){
            //    editor.tools.embed.bind($(this));
            //    e.preventDefault();
            //    e.stopPropagation(); // breaks if this is not in.
            //});

        });
    }
    
    function bind(el){
        ewrap = el;
        
         // set embed tool to active
        editor.tools.setActive(this);
        
        // set visual indicator
        editor.tools.indicator.setActive(ewrap);
        
        if(popup && el) {
            popup.set(ewrap);
        }
        
        focus();
    }
    
    function parseService(code){
        var rtn = null;
        var services = {
            
            'youtube': {
                're': /http\:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_]+)/g,
                'key': 1
            },
            
            'vimeo': {
                're':/http\:\/\/player\.vimeo\.com\/video\/([0-9]+)/g,
                'key': 1
            }
        }
        
        var match = null;
        $.each(services,function(service,obj){
            if(match = obj.re.exec(code)){
                rtn = {
                    'service':service,
                    'uid':match[obj.key]
                }
            }
        });
        
        return rtn;
    }
    
    function set(element){ return popup ? popup.set(element) : false; }
    function open(){ return popup ? popup.open() : false; }
    function close(){ return popup ? popup.close() : false; }
    
    function align(){
        $.each($('.template .ewrap'),function(i,ewrap){
            $(ewrap).data('widget').align();
        });
    }
    
    function openPreview(element){
        preview.open(element);
    }
    
    function destroy(next){
        unfocus();
    }
    
    function focus(){
        if(ewrap && !$(ewrap).data('code')) {
            popup.open();
        }
    }
    
    function unfocus(){
        preview.close();
        popup.close();
    }
    
})();


(function(){
    namespace("editor.tools.picker",init, set, setAction, open, close, resize, fetchPage);
    
    var Page = Backbone.Model.extend({
        url: function() {
            return '/ajax/pages/'+ (this.isNew() ? '' : this.id);
        }
    });
    
    var Pages = Backbone.Collection.extend({
        model: Page,
        url: '/ajax/pages/'
    });
    
    var Category = Backbone.Model.extend({
        url: function() {
            return '/ajax/categories/'+ (this.isNew() ? '' : this.id);
        }
    });
    
    var Categories = Backbone.Collection.extend({
        model: Category,
        url: '/ajax/categories/'
    });
    
    var PageView = Backbone.View.extend({
        
        tagName: 'li',
        className: 'picker-thumb',
        
        events: {
            "mouseover a":"over",
            "mouseout a":"out",
            "click a":"click"
        },
        
        initialize: function(){
            this.page = this.options.page;
        },
        
        render: function(){
            $(this.el).html('');
            $(this.el).append($('<a />').attr('href','#'+this.page.get('id')).attr('title',this.page.get('title')).append($('<img />').attr('src',this.page.get('thumbnail')).attr('width',232).attr('height',145)));
            return this;
        },
        
        over: function(){ $(this.el).addClass('hover'); },
        out: function(){ $(this.el).removeClass('hover'); },
        
        select: function(){
            $(this.el).closest('.picker-pages').find('.'+this.className).removeClass('selected');
            $(this.el).addClass('selected');
        },
        
        click: function() {
            this.select();
            triggerAction(this.page);
            return false;
        }
    });
    
    var CategoryView = Backbone.View.extend({

        tagName: 'ul',
        className: 'picker-category',
        
        initialize: function(){
            this.category = this.options.category;
            this.pages = this.options.pages;
        },
        
        render: function(){
            var rent = this;
            $(this.el).html('');
            $(this.el).append($('<div class="picker-category-title" />').text(this.category.get('title')));
            var track = $('<div class="picker-category-track" />');            
            _.each(this.pages, function(page){
                if(!page.view) page.view = new PageView({'page':page});
                track.append(page.view.render().el);
            });
            $(this.el).append(track);
            
            return this;
        }
    });
    
    var PickerView = Backbone.View.extend({
        
        el: $('#picker-popup'),

        events: {
            'click .cancel-button a':'cancel'
        },
        
        isDataLoading:false,
        isDataLoaded:false,
        
        initialize: function() {
            this.pages = new Pages();
            this.categories = new Categories();
            this.categories.view = this;
        },
        
        fetch: function(complete) {
            var rent = this;
            rent.isDataLoading = true;
            rent.categories.fetch({
                success: function(collection, response){
                    rent.pages.fetch({
                        success: function(collection, response){
                            rent.isDataLoaded = true;
                            rent.isDataLoading = false;
                            rent.render(complete);
                        },
                        error: function(collection, response){
                            new Error({ message:'There was an error fetching pages' });
                        }
                    });
                },
                error: function(collection, response){
                    new Error({ message:'There was an error fetching categories' });
                }
            });
        },
                
        render: function(complete) {
            var rent = this;
            if(this.categories.models.length > 0) {
                var track = this.$('.picker-pages');
                track.html('');
                this.categories.each(function(category){
                    
                    // parse pages
                    var pages = rent.pages.filter(function(page){
                        if(page.get('category') == category.id){
                            return true;
                        }
                        return false;
                    });
                    
                    if(!category.view) category.view = new CategoryView({'category':category,'pages':pages});
                    track.append(category.view.render().el);
                });
                
                if(complete) complete();
            } else {
                new Error({ message:'No categories were found' });
            }
        },
        
        open: function(id) {
            var rent = this;
            this.resize();
            
            if(!this.isDataLoaded && !this.isDataLoading) {
                this.fetch(function(){
                    rent.set(id);
                });
            } else {
                this.set(id);
            }
            $(this.el).fadeIn('fast');
            return this;
        },

        close: function() {
            $(this.el).fadeOut('fast');        
            return this;
        },
        
        cancel: function(){
            this.close();
            return false;
        },
        
        set: function(id){
            if(id){
                if(this.pages.length > 0) {
                    var page = this.pages.get(id);
                    if(page){ page.view.select(); }
                }
            } else {
                this.$('.picker-thumb').removeClass('selected');
            }
            return false;
        },
        
        fetchPage: function(id,complete){
            var rent = this;
            if(!this.isDataLoaded && !this.isDataLoading) {
                this.fetch(function(){
                    if(complete) complete(rent.pages.get(id));
                });
            } else {
                if(complete) complete(rent.pages.get(id));
            }
        },
        
        resize: function(){
            $(this.el).css({
                'width':($(window).width()-60)+'px',
                'height':($(window).height()-60)+'px'
            });
            
            this.$('.picker-pages').css({
                'width':($(this.el).width()-40)+'px',
                'height':($(this.el).height()-this.$('.header').height()-40)+'px'
            });
            
        }
    });
    
    var view = undefined;
    var action = undefined;
    function defaultAction(page){
        alert(page.id);
        return page;
    }
    
    function triggerAction(page){
        return action == undefined ? defaultAction(page) : action(page);
    }
    
    function setAction(newAction){
        action = newAction ? newAction : undefined;
        return action;
    }

    function init(){
        view = new PickerView();
    }
    
    function set(id){ return view ? view.set(id) : false; }
    function open(id){ return view ? view.open(id) : false; }
    function close(){ return view ? view.close() : false; }
    function resize(){ return view ? view.resize() : false; }
    function fetchPage(id,complete) { return view ? view.fetchPage(id,complete) : false; }
})();



(function(){
    namespace("editor.saver", init, open, close, setTitle);
    
    Nubook.Editor.Models.Page = Backbone.Model.extend({
        url: function() {
            return '/ajax/pages/'+ (this.isNew() ? '' : this.id);
        }
    });
    
    Nubook.Editor.Views.SharePopup = Backbone.View.extend({
        
        open: function(){ this.el.show(); },

        close: function(event){
            this.el.hide();
            if(this.parent) this.parent.resize();
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
        
        message: function(message, error){
            this.$('.messaging').text('');
            this.$('.messaging').hide();
            
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
    
    Nubook.Editor.Views.ShareEmail = Nubook.Editor.Views.SharePopup.extend({
        
        el: $('#share-email-popup'),
        
        events: {
            'click a.close-x':'close',
            'click .send-button a':'submit'
        },
        
        initialize: function(){
            this.parent = this.options.parent;
            this.page = this.options.page;
            this.subscribers_checkbox = new Nubook.Editor.Views.PseudoCheck({ el: this.$('#email-to-subscribers-field .checkbox-group') });
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
                    rent.message('Page Sending')
                    rent.disable();
                },
                'error': function(model, response){
                    rent.message(response.responseText, true)
                }
            });
                        
            if(event) event.preventDefault();
        },
        
        render: function(){
            if(this.page) this.$('#email-subject').val(this.page.get('title'));
            return this;
        }
    });
    
    Nubook.Editor.Views.ShareFacebook = Nubook.Editor.Views.SharePopup.extend({
        
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
            return this;
        }
    });
    
    Nubook.Editor.Views.ShareTwitter = Nubook.Editor.Views.SharePopup.extend({
        
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
            if(this.page) this.$('#twitter-message').val(this.page.get('title')+": "+this.page.get('url'));
            return this;
        }
    });
    
    Nubook.Editor.Views.Sharing = Backbone.View.extend({
        el: $('#sharing-popups'),
        active: [],
        modules: {},
        initialize: function(){
            this.active = this.options.active;
            this.page = this.options.page;
            
            this.modules.email = new Nubook.Editor.Views.ShareEmail({ parent: this, page: this.page });
            this.modules.facebook = new Nubook.Editor.Views.ShareFacebook({ parent: this, page: this.page });
            this.modules.twitter = new Nubook.Editor.Views.ShareTwitter({ parent: this, page: this.page });
            
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
        
        close: function() {
            this.el.hide();
        },
        
        resize: function(){
            this.$('.sharing-popups-wrap').css('top', (($(window).height() - this.$('.sharing-popups-wrap').height()) /2 )+"px");
        },
        
        render: function(){
            return this;
        }
    });
    
    Nubook.Editor.Views.Saver = Backbone.View.extend({
        
        el: $('#saver-popups'),
        
        events: {
            "click .save-button a":"save",
            "click .cancel-button a":"close"
        },

        open: function(){
            $(this.el).fadeIn('fast');
        },
        
        close: function(){
            $(this.el).fadeOut('fast');
        },
                
        getTitle: function(){
            return this.$('input#item-title').val();
        },
        
        setTitle: function(title){
            this.$('input#item-title').val(title);
        },
                
        save: function(event){
            var rent = this;
            
            var title = this.$('input#item-title').val();
            var category = this.$('input#selected-save-category').val();
            var published = this.$('input:radio[name="how-to-save"]:checked').val() == "publish" ? true : false;
            var id = $("#item-id",el).val();
            rent.$('#saver-popup').fadeOut('fast',function(){ rent.$('#saver-waiting').fadeIn('fast', function(){
                save(title, category, published, id);
            }); });
            
            return false;
        },
        
        initialize: function(){
            this.render();
        },
        
        render: function(){
            var rent = this;
            this.category_select = new Nubook.Editor.Views.PseudoSelect({ el: this.$('.pseudo-select') });
            this.share_check = new Nubook.Editor.Views.PseudoCheck({ el: this.$('.saver-popup-options .checkbox-group') });
            this.publish_radio = new Nubook.Editor.Views.PseudoRadio({
                el:this.$('.radio-group'),
                callback:function(group,label){
                    if(group.getValue() == 'publish') {
                        rent.$('label[for=show-sharing-check]').removeClass('disabled');
                    } else {
                        rent.$('label[for=show-sharing-check]').addClass('disabled');
                    }
                }
            });
            
            $('.saver-popup-options .checkbox-group .input-check').removeAttr('checked');
        }
        
    });
    
    
    
    
    var button = $('#toolbar .save-button a');
    var widget = $('#saver-popup');
    var el = widget;
    var saver = undefined;
    var sharing = undefined;
    
    function init(){
        saver = new Nubook.Editor.Views.Saver();
        //sharing = new Nubook.Editor.Views.Sharing({ active:['email','facebook','twitter']});
        bindButtons();
    }
    
    function bindButtons(){
        
        button.click(function() {
            if ($('.saver-popup:hidden').length){
                $('.popup').hide();
                editor.tools.destroy();
                if(saver.getTitle() == '') saver.setTitle($('#t-1').text());
                saver.open();
            } else {
                saver.close();
            }
        });
    }

    function open(anchor){
        saver.open();
    }
    
    function close(){
        saver.close();
    }
    
    function setTitle(title){
        saver.setTitle(title);
    }
    
    function getTitle(){
        return saver.getTitle();
    }
    
    function parseElement(el){
        
        var rtn = {}
        
        rtn['type'] = '';
        rtn['element'] = el.attr('id');
        
        if(el.hasClass('twrap')) rtn['type'] = 'text';
        if(el.hasClass('mwrap')) rtn['type'] = 'image';
        if(el.hasClass('ewrap')) rtn['type'] = 'embed';
        
        if(rtn['type'] == 'image') {
            
            var img = el.find('img');
            if(img.length){
                rtn['id'] = img.attr('src').split('/').pop().split('.')[0];
                rtn['width'] = img.attr('width');
                rtn['height'] = img.attr('height');
                rtn['top'] = parseInt(img.css('top'));
                rtn['left'] = parseInt(img.css('left'));
                rtn['href'] = el.attr('href') ? el.attr('href') : '';
                rtn['target'] = el.attr('target') ? el.attr('target') : '';
            }
        }
        
        if(rtn['type'] == 'text') {
            var td = el.find('.tdata');
            rtn['text'] = td.text();
            rtn['html'] = td.html();
        }
        
        if(rtn['type'] == 'embed') {
            rtn['code'] = el.data('code');
        }
        
        return rtn;
    }
    
    function parseElements(){
        
        var template = $('.template');
        var rtn = [];
        
        var images = template.find('.mwrap');
        var texts = template.find('.twrap');
        var embeds = template.find('.ewrap');
        
        $.each(images,function(i,image){
            rtn.push(parseElement($(image)));
        });
        
        $.each(texts,function(i,text){
            rtn.push(parseElement($(text)));
        });

        $.each(embeds,function(i,embed){
            rtn.push(parseElement($(embed)));
        });
        
        return rtn;
    }
    
    var is_saving = false;
    function save(title,category,published, id){
        
        if(is_saving == true) return false;
        
        is_saving = true;
        var payload = {}
        if(id) payload.id = id;
        payload.title = title;
        payload.template = $('.template').attr('id');
        payload.assets = parseElements();
        payload.published = published ? true : false;
        payload.category = category ? category : '';
        
        // check for elements
        if(payload.assets.length == 0){
            is_saving = false;
            alert('No elements found');
            return false;
        }
        
        payload = JSON.stringify(payload);
        
        resturl = '/ajax/pages/'
        restdata = {
            'payload': payload
        }
        $.ajax({
            type: "POST",
            url: resturl,
            async: false,
            data: restdata,
            dataType: 'json',
            success: function(pid, textStatus, request){
                is_saving = false;
                editor.set_complete(true);
                
                if(published && $('#show-sharing-check').is(':checked')) {
                    
                    active_shares =  $('#show-sharing-check').attr('data-shares').split(',');
                    pg = new Nubook.Editor.Models.Page({ id:pid });
                    pg.fetch({
                        'success': function(model){
                            sharing = new Nubook.Editor.Views.Sharing({ active: active_shares, page:model });
                            sharing.open();
                        }
                    });
                                        
                } else {
                    window.location = '/dashboard';
                }
            },
            error: function(request, textStatus, errorThrown){
                is_saving = false;
                alert(errorThrown);
            }
        });
    }
    
    
    function saveRender(render,title){
        
        resturl = '/api/renders/';
        
        restdata = {
            title:title,
            render:render
        };
        
        $.ajax({
            type: "POST",
            url: resturl,
            data: restdata,
            dataType: 'json',
            success: function(data, textStatus, request){
                //alert('saved:'+data.id);
                window.location = '/renders/'+data.id;
            },
            error: function(request, textStatus, errorThrown){
                alert('error: '+textStatus);
            }
        });
    }
    
})();


$(function() {
    $('body').addClass('has-js');
    $('#color-popup .advanced').hide();
    setupLabel();
    
    editor.load();
    $(window).resize(function(){
        editor.resize();
    });
    
    // bind key commands
    $(document).bind('keydown','esc', function(evt){ editor.tools.destroy(); return false; });
    
    $(window).bind('beforeunload', function(){ 
	   return editor.beforeunload();
    });

});

$(document).ready(function(){
    $('#toolbar .save-controls .cancel-button a').click(function(){
        editor.tools.destroy();
        editor.set_complete(true);
        if(confirm("Are you sure you want to cancel editing this template?")){
            window.location = '/dashboard';
        } else {
            editor.set_complete(false);
        }
        return false;
    });
    
    $(function() {
        $('.hider-inner').click(function(event) {
            if ($(event.target).hasClass('hider-inner')) {
                 $('.save-popup').hide();
            }
        });
    });        
});
