// -------------------------------------------------
// builder

(function(){
    namespace("builder", load, init, resize);
    
    var wrapper = $('#sizer');
    var toolbar = $('#sizer');
    var workspace = $('#workspace');
    var template = $('#template');
    
    function init() {
        //builder.tools.init();
        //builder.saver.init();
    }
    
    function load(){

        builder.toolbar.load();

        init();
        resize(function(){ $('#workspace-frame').fadeIn('fast'); });
        
        fontload.init();
        fontload.loadFont('etica',function(css){
            fontload.writeStyle(css);
            $(".twrap").fadeIn('slow');
        });
        fontload.loadFonts();

    }
    
    function resize(complete){
        var left = parseInt($(window).width())/2;
        $('#workspace-frame').css('left', (left - 365) + 'px');
        if(complete) complete();
    }
    
})();


// -------------------------------------------------
// builder.toolbar
// -------------------------------------------------

(function(){
    namespace("builder.toolbar", load, init, destroy, focus, unfocus, getNextTextId, getNextImageId, hasGraphic, loadGraphic, parseElements);
    var template = $('#template');    
    var toolbar = $('#area-editor');
    var textbar = $('#text-edit');
    var graphic = template.find('.graphic');
    var graphicSize = [990,620];
    var element;
    var linked;
    var tdata;
    
    function load(){
        bindButtons();
        bindActivationElements();
        bindKeystrokes();
        bindGraphicSwfu();
        bindGuideSwfu();
    }
    
    function init(toolobj,options) {
        setTool(toolobj);
        if(options) {
            if(options['width']) setWidth(options['width']);
            if(options['height']) setWidth(options['width']);
            if(options['top']) setWidth(options['top']);
            if(options['left']) setWidth(options['left']);
        }
        focus();
    }

    function isEmbed(){
        if(element.hasClass('ewrap')){ return true; }
        return false;
    }
    
    function isText(){
        if(element.hasClass('twrap')){ return true; }
        return false;
    }
    
    function isImage(){
        if(element.hasClass('mwrap')){ return true; }
        return false;
    }
    
    function parseElement(el){
        
        var rtn = {}
        
        rtn['type'] = '';
        rtn['width'] = parseInt(el.css('width'));
        rtn['height'] = parseInt(el.css('height'));
        rtn['top'] = parseInt(el.css('top'));
        rtn['left'] = parseInt(el.css('left'));
        
        if(el.hasClass('twrap')) rtn['type'] = 'text';
        if(el.hasClass('mwrap')) rtn['type'] = 'image';
        if(el.hasClass('ewrap')) rtn['type'] = 'embed';
        
        if(rtn['type'] == 'text') {
            
            var td = el.find('.tdata');
            rtn['font'] = whichFont(td);
            rtn['font-size'] = parseInt(td.css('font-size'));
            rtn['font-weight'] = td.css('font-weight');
            rtn['line-height'] = parseInt(td.css('line-height'));
            rtn['letter-spacing'] = parseLetterSpacing(td.css('letter-spacing'));
            rtn['rotation'] = parseInt(el.css('rotate'));
            rtn['padding-top'] = parseInt(td.css('padding-top'));
            rtn['text-align'] = td.css('text-align');
            rtn['color'] = isrgb(td.css('color')) ? rgbtohex(td.css('color')) : td.css('color');
            rtn['text'] = td.text();
            rtn['html'] = td.html();
            rtn['charcnt'] = rtn['text'].length;
        }
        
        return rtn;
    }
    
    function parseElements(){
        
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
    
    function save(id){
        
        var payload = {}
        if(id) payload.id = id;
        payload.elements = parseElements();
        payload.graphic = hasGraphic() ? hasGraphic().attr('src').split('/').pop().split('.')[0] : '';
        
        // check for elements
        if(payload.elements.length == 0){
            alert('No elements found');
            return false;
        }
                
        payload = JSON.stringify(payload);
        
        resturl = '/ajax/templates/'
        restdata = payload
        $.ajax({
            type: "POST",
            url: resturl,
            async: false,
            data: restdata,
            dataType: 'json',
            //completed: function(msg){
            //    ptagr.ptag.check_submitted('success','Completed not submitted');
            //},
            success: function(tid, textStatus, request){
                //window.location = '/editor/templates/'+tid+'/';
                window.location = '/admin/templates';
            },
            error: function(request, textStatus, errorThrown){
                alert(errorThrown);
            }
        });
    }
    
    function bind(el){
        unbind();
        element = el;
        element.addClass('active');
        if(isImage()) linked = $('#l-'+element.attr('id').split('-',2)[1]);
        if(isText()) tdata = element.find('.tdata');
        updateFromElement();
        focus();
        if(isImage()){
            linked.draggable({'drag':handleDrag, 'containment': template});
        } else {
            element.draggable({'drag':handleDrag, 'containment': template});
        }
    }
    
    function unbind(){
        if(element) {
            element.removeClass('active');
            if(isImage()) {
                if(linked) linked.draggable('destroy');
            } else {
                if(element) element.draggable('destroy');
            }
        }
        tdata = undefined;
        linked = undefined;
        element = undefined;
    }
    
    function handleDrag(event,ui){
        
        if(isImage()){
            element.css({
                'left':linked.css('left'),
                'top':linked.css('top')                
            });
        }
                
        updateFromElement();
        
    }
        
    function getNextTextId(){
        var id = 1;
        var ids = [];
        var divs = template.find('.twrap');
        if(divs.length > 0) {
            $.each(divs,function(i,div){
                ids.push(parseInt($(div).attr('id').replace(/^t-/,'')));
            });
            
            function sortnum(a,b) { return a - b; }
            id = (ids.sort(sortnum).pop() + 1);
        }
        return id;
    }
    
    function addText(options) {
        var defaults = {
            'display':'block',
            'top':0,
            'left':0,
            'width':200,
            'height':200,
            'font':'etica',
            'font-size':13,
            'line-height':18,
            'letter-spacing':0,
            'font-weight':'normal',
            'color':'black',
            'text-align':'left',
            'html':'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        }
        
        if(options) {
            for (var index in defaults) { if(typeof options[index] == "undefined") options[index] = defaults[index]; }
        } else {
            options = defaults;
        }
        
        var id = getNextTextId();
        
        var twrap = $('<div />').attr('class','twrap').attr('id','t-'+id).css({
            'top':options['top']+'px',
            'left':options['left']+'px',
            'width':options['width']+'px',
            'height':options['height']+'px',
            'display':options['display']
        });
        
        var tdata = $('<div />').attr('class','tdata webfont-'+options['font']).css({
            'font-size':options['font-size']+'px',
            'line-height':options['line-height']+'px',
            'letter-spacing':options['letter-spacing']+'px',
            'font-weight':options['font-weight'],
            'color':options['color'],
            'text-align':options['text-align']
        }).html(options['html']);
        twrap.append(tdata);
        template.append(twrap);
        
        // rotate hack
        twrap.transform({rotate:'0deg'});
        
        bindActivationElements();
        bind(template.find('#t-'+id));
        
        return true;
    }
    
    function getNextImageId(){
        var id = 1;
        var ids = [];
        var divs = template.find('.mwrap');
        if(divs.length > 0) {
            $.each(divs,function(i,div){
                ids.push(parseInt($(div).attr('id').replace(/^m-/,'')));
            });
            
            function sortnum(a,b) { return a - b; }
            id = (ids.sort(sortnum).pop() + 1);
        }
        return id;
    }
    
    function addImage(options) {
        var defaults = {'top':0,'left':0,'width':100,'height':100}
        if(options) {
            for (var index in defaults) { if(typeof options[index] == "undefined") options[index] = defaults[index]; }
        } else {
            options = defaults;
        }
        
        var id = getNextImageId();
        var mwrap = $('<a />').attr('class','mwrap').attr('id','m-'+id).css({'top':options['top']+'px','left':options['left']+'px','width':options['width']+'px','height':options['height']+'px'});
        var lwrap = $('<div />').attr('class','lwrap').attr('id','l-'+id).css({'top':options['top']+'px','left':options['left']+'px','width':options['width']+'px','height':options['height']+'px'});
        
        template.find('.media').append(mwrap);
        template.find('.link').append(lwrap);
        
        bindActivationElements();
        bind(template.find('#m-'+id));
        
        return true;
    }
    
    function getNextEmbedId(){
        var id = 1;
        var ids = [];
        var divs = template.find('.ewrap');
        if(divs.length > 0) {
            $.each(divs,function(i,div){
                ids.push(parseInt($(div).attr('id').replace(/^e-/,'')));
            });
            
            function sortnum(a,b) { return a - b; }
            id = (ids.sort(sortnum).pop() + 1);
        }
        return id;
    }
    
    function addEmbed(options) {
        var defaults = {'top':0,'left':0,'width':100,'height':100}
        if(options) {
            for (var index in defaults) { if(typeof options[index] == "undefined") options[index] = defaults[index]; }
        } else {
            options = defaults;
        }
        
        var id = getNextEmbedId();
        var ewrap = $('<div />').attr('class','ewrap').attr('id','e-'+id).css({'top':options['top']+'px','left':options['left']+'px','width':options['width']+'px','height':options['height']+'px'});
        
        template.append(ewrap);
        
        bindActivationElements();
        bind(template.find('#e-'+id));
        
        return true;
    }
    
    function updateFromElement(){
        
        $('#rectangle-x').val(parseInt(element.css('left')));
        $('#rectangle-y').val(parseInt(element.css('top')));
        $('#rectangle-w').val(parseInt(element.css('width')));
        $('#rectangle-h').val(parseInt(element.css('height')));
        
        if(isText()){
            $('#font-size').val(parseInt(tdata.css('font-size')));
            $('#line-height').val(parseInt(tdata.css('line-height')));
            $('#letter-spacing').val(parseLetterSpacing(tdata.css('letter-spacing')));
            $('#rotation').val(parseInt(element.css('rotate')));
            $('#padding-top').val(parseInt(tdata.css('padding-top')));
            //console.log();
            
            $('#text-color').val(rgbtohex(tdata.css('color')));
            (tdata.css('font-weight') == 'bold' || parseInt(tdata.css('font-weight')) > 500) ? $('#button-bold').addClass('on') : $('#button-bold').removeClass('on');
            tdata.css('font-style') == 'italic' ? $('#button-italic').addClass('on') : $('#button-italic').removeClass('on');

            // positioning
            $('#inbox-alignment li').removeClass('on');
            if(tdata.css('text-align') == 'left') $('#alignment-TL').addClass('on');
            if(tdata.css('text-align') == 'center') $('#alignment-TC').addClass('on');
            if(tdata.css('text-align') == 'right') $('#alignment-TR').addClass('on');
            tdata.css('text-align') == 'justify' ? $('#button-justified').addClass('on') : $('#button-justified').removeClass('on');
            
            $('#dummy-text').val(tdata.html());
            
            $('#area-editor-heading h2').text(ucwords(whichFont().replace('-',' ')));
            
        } else if(isImage()){
            $('#area-editor-heading h2').text('Image');
        } else if(isEmbed()){
            $('#area-editor-heading h2').text('Embed');        
        }
    }
    
    function isrgb(color){
            var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if(rgb.length > 1) return true;
            return false;
    }
    
    function rgbtohex(rgb){

        var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
        
        function hex(x) {
            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
        }
        
        return rgb2hex(rgb);
    }
    
    function destroy(){
        unbind();
        unfocus();
    }
    
    function focus(){
        if(isText()) {
            textbar.show();
        } else {
            textbar.hide();            
        }
        toolbar.show();
    }
    
    function unfocus(){
        textbar.hide();
        toolbar.hide();
    }
    
    function remove(){
        if(element) {
            el = element;
            lk = linked;
            destroy();
            if(lk) lk.remove();
            el.remove();
            
            return true;
        }
        return false;
    }
    
    function setLeft(int) {
        if(int < 0) int = 0;
        if(tool) tool.set('left',int);
    }
    
    function setLeft(int) {
        if(int < 0) int = 0;
        if(tool) tool.set('top',int);
    }
    
    function setWidth(int) {
        if(int < 0) int = 0;
        if(tool) tool.set('width',int);
    }
    
    function setHeight(int) {
        if(int < 0) int = 0;
        if(tool) tool.set('height',int);
    }
    
    function linkHandle(){
        if(isImage()) {
            linked.css({
                'width':element.css('width'),
                'height':element.css('height'),
                'top':element.css('top'),
                'left':element.css('left')
            });
        }
    }
    
    function linkText(){
        if(isText()){}
    }
    
    function whichFont(td){
        
        if(td) {
            var div = td;
        } else {
            var div = tdata;
        }
        
        if(div) {
            var fontstr;
            var ptrn = /^webfont-/;
            $.each(div.attr('class').split(' '),function(i,className){
                if(ptrn.exec(className)) {
                    fontstr = className.replace(/^webfont-/,'');
                }
            });
            if(fontstr) return fontstr;
        }
        
        return '';
    }
    
    function bindActivationElements(){
        unbindActivationElements();
        $.each($('.template .twrap'),function(i,twrap){
            twrap = $(twrap);
            twrap.click(function(){
                bind($(this));
            });
        });
        
        $.each($('.template .lwrap'),function(i,lwrap){
            lwrap = $(lwrap);
            lwrap.click(function(){
                var id = $(this).attr('id').split('-',2)[1]
                var el = $('#m-'+id);
                bind(el);
            });
        });

        $.each($('.template .ewrap'),function(i,ewrap){
            ewrap = $(ewrap);
            ewrap.click(function(){
                bind($(this));
            });
        });
    }
    
    function unbindActivationElements(){
        $('.template .twrap').unbind('click');
        $('.template .lwrap').unbind('click');
        $('.template .ewrap').unbind('click');
    }
    
    function resize(wh,int) {
        
        switch(wh) {
            
            case 'width':
                
                if(parseInt(element.css('left')) + parseInt(element.css('width')) + int > parseInt(template.css('width'))) {
                    element.css('width', (parseInt(template.css('width')) - parseInt(element.css('left')))+'px');
                } else if(parseInt(element.css('left')) + parseInt(element.css('width')) + int < 0) {
                    element.css('width','0px');
                } else {
                    element.css('width', (parseInt(element.css('width')) + int)+'px');
                }
                break;
                
            case 'height':
                if(parseInt(element.css('top')) + parseInt(element.css('height')) + int > parseInt(template.css('height'))) {
                    element.css('height', (parseInt(template.css('height')) - parseInt(element.css('top')))+'px');
                } else if(parseInt(element.css('top')) + parseInt(element.css('height')) + int < 0) {
                    element.css('height','0px');
                } else {
                    element.css('height',(parseInt(element.css('height')) + int)+'px');
                }
                break;
                
            default:
                // do nothing
        }
        
        linkHandle();
        updateFromElement();
    }
    
    function resizeTo(width,height) {
        
        if(width !== null) {                
            if(parseInt(element.css('left')) + width > parseInt(template.css('width'))) {
                element.css('width', (parseInt(template.css('width')) - parseInt(element.css('left')))+'px');
            } else if(width < 0) {
                element.css('width','0px');
            } else {
                element.css('width', width+'px');
            }
        }
        
        if(height !== null) {                
            if(parseInt(element.css('top')) + height > parseInt(template.css('height'))) {
                element.css('height', (parseInt(template.css('height')) - parseInt(element.css('top')))+'px');
            } else if(height < 0) {
                element.css('height','0px');
            } else {
                element.css('height', height+'px');
            }
        }
        
        linkHandle();
        updateFromElement();        
    }
    
    function move(dir,int) {
        
        switch(dir) {
            
            case 'up':
                if(parseInt(element.css('top')) - int < 0) {
                    element.css('top','0px');
                } else {
                    element.css('top', (parseInt(element.css('top'))-int)+'px');
                }
                break;
                
            case 'down':
                if(parseInt(element.css('top')) + parseInt(element.css('height')) + int > parseInt(template.css('height'))) {
                    element.css('top', ( parseInt(template.css('height')) - parseInt(element.css('height')) )+'px');
                } else {
                    element.css('top', (parseInt(element.css('top'))+int)+'px');
                }
                break;

            case 'left':
                if(parseInt(element.css('left')) - int < 0) {
                    element.css('left','0px');
                } else {
                    element.css('left', (parseInt(element.css('left'))-int)+'px');
                }
                break;
                
            case 'right':
                if(parseInt(element.css('left')) + parseInt(element.css('width')) + int > parseInt(template.css('width'))) {
                    element.css('left', ( parseInt(template.css('width')) - parseInt(element.css('width')) )+'px');
                } else {
                    element.css('left', (parseInt(element.css('left'))+int)+'px');
                }
                break;
            
            default:
                // do nothing
        }
        
        linkHandle();
        updateFromElement();
    }
    
    function moveTo(x,y) {
        
        if(x !== null) {
            if(x + parseInt(element.css('width')) > parseInt(template.css('width'))) {
                element.css('left', (parseInt(template.css('width')) - parseInt(element.css('width')))+'px');
            } else if (x < 0) {
                element.css('left','0px');
            } else {
                element.css('left',x+'px');
            }
        }
        
        if(y !== null) {
            if(y + parseInt(element.css('height')) > parseInt(template.css('height'))) {
                element.css('top', (parseInt(template.css('height')) - parseInt(element.css('height')))+'px');
            } else if (y < 0) {
                element.css('top','0px');
            } else {
                element.css('top',y+'px');
            }
        }
                
        linkHandle();
        updateFromElement();
    }
    
    function fontResize(int){
        if(isText()){ tdata.css('font-size',(parseInt(tdata.css('font-size'))+int)+'px'); }
        updateFromElement();
    }
    
    function fontResizeTo(int){
        if(isText()){ tdata.css('font-size',int+'px'); }
        updateFromElement();
    }

    function lineHeightResize(int){
        if(isText()){ tdata.css('line-height',(parseInt(tdata.css('line-height'))+int)+'px'); }
        updateFromElement();
    }
    
    function lineHeightResizeTo(int){
        if(isText()){ tdata.css('line-height',int+'px'); }
        updateFromElement();
    }

    function parseLetterSpacing(lspacing){
        if(element) {
            if(!isText() || tdata.css('letter-spacing') == 'normal'){
                return 0;
            }
        }
        return parseInt(lspacing)
    }
    
    function letterSpacingResize(int){
        if(isText()){ tdata.css('letter-spacing',(parseLetterSpacing(tdata.css('letter-spacing'))+int)+'px'); }
        updateFromElement();
    }
    
    function letterSpacingResizeTo(int){
        if(isText()){ tdata.css('letter-spacing',int+'px'); }
        updateFromElement();
    }
    
    function rotateText(int){
        if(isText()){ element.css('rotate',(parseInt(element.css('rotate'))+int)+'deg'); }
        updateFromElement();
    }

    function rotateTextTo(int){
        if(isText()){ element.css('rotate',int+'deg'); }
        updateFromElement();
    }

    function paddingTop(int){
        if(isText()){ tdata.css('padding-top',(parseInt(tdata.css('padding-top'))+int)+'px'); }
        updateFromElement();
    }
    
    function paddingTopTo(int){
        if(isText()){ tdata.css('padding-top',int+'px'); }
        updateFromElement();
    }
    
    function toggleBold(){
        if(isText()){
            (tdata.css('font-weight') == 'bold' || parseInt(tdata.css('font-weight')) > 500) ? tdata.css('font-weight','normal') : tdata.css('font-weight','bold');
            updateFromElement();
        }
    }
    
    function toggleItalic(){
        if(isText()){
            tdata.css('font-style') == 'italic' ? tdata.css('font-style','normal') : tdata.css('font-style','italic');
            updateFromElement();
        }
    }
    
    function toggleJustify(){
        if(isText()){
            tdata.css('text-align') == 'justify' ? tdata.css('text-align','left') : tdata.css('text-align','justify');
            updateFromElement();
        }
    }    
    
    function textAlign(align){
        if(isText()){
            tdata.css('text-align',align);
            updateFromElement();
        }
    }
    
    function textColor(clr) {
        if(isText()){
            tdata.css('color',clr);
            updateFromElement();
        }
    }
    
    function setText(str) {
        if(isText()){
            tdata.html(str);
            updateFromElement();
        }
    }
    
    function setFont(fontname) {
        if(isText()){
            var currfont = whichFont();
            tdata.removeClass('webfont-'+currfont);
            tdata.addClass('webfont-'+fontname);
            updateFromElement();
        }
    }
    
    function bindButtons(){
        
        // -------------------------
        // +/- up, down, left, right
        
        $('#button-add-text a').click(function(){ addText(); return false; });
        $('#button-add-image a').click(function(){ addImage(); return false; });
        $('#button-add-embed a').click(function(){ addEmbed(); return false; });
        
        $('.button-up a').click(function(){ $('#sidebar').hasClass('x10') ? move('up',10) : move('up',1); return false; });
        $('.button-down a').click(function(){ $('#sidebar').hasClass('x10') ? move('down',10) : move('down',1); return false; });
        $('.button-right a').click(function(){ $('#sidebar').hasClass('x10') ? move('right',10) : move('right',1); return false; });
        $('.button-left a').click(function(){ $('#sidebar').hasClass('x10') ? move('left',10) : move('left',1); return false; });
        
        $('#less-w a').click(function(){ $('#sidebar').hasClass('x10') ? resize('width',-10) : resize('width',-1); return false; });
        $('#more-w a').click(function(){ $('#sidebar').hasClass('x10') ? resize('width',10) : resize('width',1); return false; });
        $('#less-h a').click(function(){ $('#sidebar').hasClass('x10') ? resize('height',-10) : resize('height',-1); return false; });
        $('#more-h a').click(function(){ $('#sidebar').hasClass('x10') ? resize('height',10) : resize('height',1); return false; });
    
        $('#less-font-size a').click(function(){ $('#sidebar').hasClass('x10') ? fontResize(-10) : fontResize(-1); return false; });
        $('#more-font-size a').click(function(){ $('#sidebar').hasClass('x10') ? fontResize(10) : fontResize(1); return false; });
        $('#less-line-height a').click(function(){ $('#sidebar').hasClass('x10') ? lineHeightResize(-10) : lineHeightResize(-1); return false; });
        $('#more-line-height a').click(function(){ $('#sidebar').hasClass('x10') ? lineHeightResize(10) : lineHeightResize(1); return false; });
        $('#less-letter-spacing a').click(function(){ $('#sidebar').hasClass('x10') ? letterSpacingResize(-10) : letterSpacingResize(-1); return false; });
        $('#more-letter-spacing a').click(function(){ $('#sidebar').hasClass('x10') ? letterSpacingResize(10) : letterSpacingResize(1); return false; });

        $('#less-rotation a').click(function(){ $('#sidebar').hasClass('x10') ? rotateText(-10) : rotateText(-1); return false; });
        $('#more-rotation a').click(function(){ $('#sidebar').hasClass('x10') ? rotateText(10) : rotateText(1); return false; });

        $('#less-padding-top a').click(function(){ $('#sidebar').hasClass('x10') ? paddingTop(-10) : paddingTop(-1); return false; });
        $('#more-padding-top a').click(function(){ $('#sidebar').hasClass('x10') ? paddingTop(10) : paddingTop(1); return false; });
            
        $('#rectangle-x').change(function(){ moveTo(parseInt($('#rectangle-x').val()),null); return false; });
        $('#rectangle-y').change(function(){ moveTo(null,parseInt($('#rectangle-y').val())); return false; });

        $('#rectangle-w').change(function(){ resizeTo(parseInt($('#rectangle-w').val()),null); return false; });
        $('#rectangle-h').change(function(){ resizeTo(null,parseInt($('#rectangle-h').val())); return false; });

        $('#font-size').change(function(){ fontResizeTo(parseInt($('#font-size').val())); return false; });
        $('#line-height').change(function(){ lineHeightResizeTo(parseInt($('#line-height').val())); return false; });
        $('#letter-spacing').change(function(){ letterSpacingResizeTo(parseInt($('#letter-spacing').val())); return false; });
        $('#rotation').change(function(){ rotateTextTo(parseInt($('#rotation').val())); return false; });
        $('#padding-top').change(function(){ paddingTopTo(parseInt($('#padding-top').val())); return false; });

        $('#dummy-text').change(function(){ setText($('#dummy-text').val()); return false; });
        
        $("#area-editor-close a").click(function(){ if(confirm("Are you sure you want to delete this element")){ remove(); } return false; });
        
        // toggle font selector
        $('#area-editor-heading h2').click(function(){
            if($('#area-editor-heading h2').text() != 'Image'){
                $('#font-popup').toggle();
            }
            return false;
        });
        
        /*
        $('#area-editor-heading h2').blur(function(){
            $('#font-popup').hide();
            return false;
        });
        */
        
        $('#font-popup a').click(function(){
            setFont($(this).attr('title'));
            $('#font-popup').hide();
            return false;
        });
        
        if($('#button-save').attr('data-tid')) {
            $('#button-save').removeClass('dimmed');
            $('#button-save').click(function(){
                var tid = $(this).attr('data-tid');
                save(tid);
                return false;
            });
        } else {
            $('#button-save').addClass('dimmed');
        }        
        
        $('#button-create').click(function(){
            save();
            return false;
        });
        
        
        // -------------------------
        // toggle buttons
        
        $('#button-bold a').click(function(){ toggleBold(); return false; });
        $('#button-italic a').click(function(){ toggleItalic(); return false; });
        $('#button-justified a').click(function(){ toggleJustify(); return false; });
        
        // -------------------------
        // align buttons
        $('#alignment-TL').click(function(){ textAlign('left'); return false; });
        $('#alignment-TC').click(function(){ textAlign('center'); return false; });
        $('#alignment-TR').click(function(){ textAlign('right'); return false; });

        $('#alignment-ML').click(function(){ textAlign('left'); return false; });
        $('#alignment-MC').click(function(){ textAlign('center'); return false; });
        $('#alignment-MR').click(function(){ textAlign('right'); return false; });

        $('#alignment-BL').click(function(){ textAlign('left'); return false; });
        $('#alignment-BC').click(function(){ textAlign('center'); return false; });
        $('#alignment-BR').click(function(){ textAlign('right'); return false; });
        
        // -------------------------
        // add farbtastic
        var colorwheel;
        if ($('#text-color-wrapper .popup').length) {
            colorwheel = $.farbtastic($('#text-color-wrapper .popup'),textColor);
        };

        $('#text-color').focus(function(){
            $('.popup').hide();
            colorwheel.setColor($('#text-color').val());
            $('#dummy-tex').hide();
            $('#color-popup').fadeIn('fast');
        });
        
        $('#text-color').blur(function(){
            $('#text-color').css({'background':'none', 'color': '#444'});
            $('#color-popup').fadeOut('fast',function(){ $('#dummy-tex').show(); });
        });
        
        $('#text-color').change(function(){
            colorwheel.setColor($('#text-color').val());
            return false;
        });
        
        
        // PNG GRAPHIC UPLOADER
        if(hasGraphic()) {
            $('#png-layer').attr('checked',true); 
            hideGraphicUploader();
        } else {
            showGraphicUploader();
        }
        
        $('#remove-png-layer-link').click(function(){
            if(removeGraphic()){
                showGraphicUploader();
            }
            return false;
        });
        
        template.find('.graphic').css("display",$('#png-layer:checked').length ? "block" : "none");
        $('#png-layer').click(function(){
            if ($('#png-layer:checked').length) {
                template.find('.graphic').css("display","block");
            } else {
                template.find('.graphic').css("display","none");
            }
        });


        // GUIDE UPLOADER
        if(hasGuide()) {
            $('#custom-guide').attr('checked',true); 
            hideGuideUploader();
        } else {
            showGuideUploader();
        }
        
        $('#remove-custom-guide-link').click(function(){
            if(removeGuide()){
                showGuideUploader();
            }
            return false;
        });
        
        $('#custom-guide-layer').css("display",$('#custom-guide:checked').length ? "block" : "none");
        $('#custom-guide').click(function(){
            if ($('#custom-guide:checked').length) {
                $('#custom-guide-layer').css("display","block");
            } else {
                $('#custom-guide-layer').css("display","none");
            }
        });

        if ($('#dim:checked').length) { $('#custom-guide-layer').addClass("dimmed"); }
        $('#dim').click(function(){
            if ($('#dim:checked').length) {
                $('#custom-guide-layer').addClass("dimmed");
            } else {
                $('#custom-guide-layer').removeClass("dimmed");
            }
        });
        
        $('#grid-12-col-layer').css("display",$('#grid-12-col:checked').length ? "block" : "none");
        $('#grid-12-col').click(function(){
            if ($('#grid-12-col:checked').length) {
                $('#grid-12-col-layer').css("display","block");
            } else {
                $('#grid-12-col-layer').css("display","none");
            }
        });

        $('#grid-13-col-layer').css("display",$('#grid-13-col:checked').length ? "block" : "none");
        $('#grid-13-col').click(function(){
            if ($('#grid-13-col:checked').length) {
                $('#grid-13-col-layer').css("display","block");
            } else {
                $('#grid-13-col-layer').css("display","none");
            }
        });

        $('#fold-2-2-layer').css("display",$('#fold-2-2:checked').length ? "block" : "none");
        $('#fold-2-2').click(function(){
            if ($('#fold-2-2:checked').length) {
                $('#fold-2-2-layer').css("display","block");
            } else {
                $('#fold-2-2-layer').css("display","none");
            }
        });

        $('#fold-3-3-layer').css("display",$('#fold-3-3:checked').length ? "block" : "none");
        $('#fold-3-3').click(function(){
            if ($('#fold-3-3:checked').length) {
                $('#fold-3-3-layer').css("display","block");
            } else {
                $('#fold-3-3-layer').css("display","none");
            }
        });        

        
        // GUIDE LAYERS MASTER
        if($('#guide-layers:checked').length){
                $('#guides').css("display","block");
                $('#grid-presets li').removeClass('dimmed');        
                $('#main-guide-setting li').removeClass('dimmed');
        } else {
                $('#guides').css("display","none");
                $('#grid-presets li').addClass('dimmed');        
                $('#main-guide-setting li').addClass('dimmed');
        }
        $('#guide-layers').click(function(){
            if ($('#guide-layers:checked').length) {
                $('#guides').css("display","block");
                $('#grid-presets li').removeClass('dimmed');
                $('#main-guide-setting li').removeClass('dimmed');
            } else {
                $('#guides').css("display","none");
                $('#grid-presets li').addClass('dimmed');
                $('#main-guide-setting li').addClass('dimmed');
            }
        });        



        
        if ($('#boundary:checked').length) { $('#builder-boundary').addClass('highlight'); }
        if ($('#work-space:checked').length) { $('body').addClass('highlight'); }
        if ($('#marching-ants:checked').length) { $('#builder-boundary').addClass('marching-ants'); }
        
        $('#boundary').click(function(){
            if ($('#boundary:checked').length) {
                $('#builder-boundary').addClass('highlight');
            } else {
                $('#builder-boundary').removeClass('highlight');
            }
        });
        
        $('#work-space').click(function(){
            if ($('#work-space:checked').length) {
                $('body').addClass('highlight');
            } else {
                $('body').removeClass('highlight');
            }
        });
        
        $('#marching-ants').click(function(){
            if ($('#marching-ants:checked').length) {
                $('#builder-boundary').addClass('marching-ants');
            } else {
                $('#builder-boundary').removeClass('marching-ants');
            }
        });
    }
    
    var elCopy;
    function copyElement(){
        if(element) elCopy = element.clone();
    }
    
    function pasteElement(){
        if(elCopy) {
            if(elCopy.hasClass('mwrap')) {
                addImage({
                    'width':parseInt(elCopy.css('width')),
                    'height':parseInt(elCopy.css('height')),
                    'left':parseInt(elCopy.css('left')),
                    'top':parseInt(elCopy.css('top')),
                });
            } else if(elCopy.hasClass('ewrap')) {
                addEmbed({
                    'width':parseInt(elCopy.css('width')),
                    'height':parseInt(elCopy.css('height')),
                    'left':parseInt(elCopy.css('left')),
                    'top':parseInt(elCopy.css('top')),
                });
            } else if(elCopy.hasClass('twrap')) {
                var td = elCopy.find('.tdata');
                addText({
                    'width':parseInt(elCopy.css('width')),
                    'height':parseInt(elCopy.css('height')),
                    'left':parseInt(elCopy.css('left')),
                    'top':parseInt(elCopy.css('top')),
                    'font':whichFont(td),
                    'font-size':parseInt(td.css('font-size')),
                    'line-height':parseInt(td.css('line-height')),
                    'letter-spacing':parseInt(td.css('letter-spacing')),
                    'font-weight':td.css('font-weight'),
                    'color':td.css('color'),
                    'text-align':td.css('text-align'),
                    'html':td.html()
                });
            }
        }
    }
    
    function bindKeystrokes(){
        
        // -----------------------
        // 10x upper left in the sidebar on/off
        $(document).bind('keydown','shift', function(evt){ $('#sidebar').addClass('x10'); });
        $(document).bind('keyup','shift', function(evt){ $('#sidebar').removeClass('x10'); });
        
        $(document).bind('keydown','left', function(evt){ move('left',1); return false; });
        $(document).bind('keydown','shift+left', function(evt){ move('left',10); return false; });
        $(document).bind('keydown','right', function(evt){ move('right',1); return false; });
        $(document).bind('keydown','shift+right', function(evt){ move('right',10); return false; });
        $(document).bind('keydown','up', function(evt){ move('up',1); return false; });
        $(document).bind('keydown','shift+up', function(evt){ move('up',10); return false; });
        $(document).bind('keydown','down', function(evt){ move('down',1); return false; });
        $(document).bind('keydown','shift+down', function(evt){ move('down',10); return false; });
        
        $(document).bind('keydown','backspace', function(evt){ if(element) { if(confirm("Are you sure you want to delete this element")){ remove(); } } return false; });
        
        $(document).bind('keydown', 'alt+c', function(evt){ copyElement(); return false; });
        $(document).bind('keydown', 'alt+v', function(evt){ pasteElement(); return false; });
        
    }
    
    // Graphic Methods :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var graphicSwfu;
    function bindGraphicSwfu(){
        
        // setup swfupload
        var settings = {
        	flash_url : "/assets/scripts/swfupload/swfupload.swf",
        	upload_url: "/ajax/uploads/images",
        	post_params: {'fclass':'template-graphic','my_images':false },
        	file_size_limit : "10 MB",
        	file_types : "*.png",
        	file_types_description : "Transparent PNG Images",
        	file_upload_limit : 100,
        	file_queue_limit : 100,
            file_post_name: "image",
        	custom_settings : {
        		//progressTarget : "fsUploadProgress",
        		//cancelButtonId : "btnCancel"
        	},
        	debug: false,
        
        	// Button settings
        	button_image_url: "/assets/styles/builder/b/swfupload-png-layer-btn.png",
        	button_width: "123",
        	button_height: "26",
        	button_placeholder_id: "png-layer-swfu-button",
        	button_text: '',
        	button_text_style: '',
        	button_text_left_padding: 0,
        	button_text_top_padding: 0,
        	button_cursor : SWFUpload.CURSOR.HAND, 
        	
        	// Event handler functions
        	file_queued_handler : function(){ graphicSwfu.startUpload(); },
        	file_queue_error_handler : function(){},
        	file_dialog_complete_handler : function(){},
        	//upload_start_handler : uploadStart,
        	//upload_progress_handler : uploadProgress,
        	//upload_error_handler : uploadError,
        	upload_success_handler : graphicUploadSuccess,
        	//upload_complete_handler : graphicUploadSuccess,
        	queue_complete_handler : function(){}	// Queue plugin event
        	
        };
        
        graphicSwfu = new SWFUpload(settings);
    }
    
    function graphicUploadSuccess(file, data, response) {
        data = eval('('+data+')');
        loadGraphic(data.url);
    }
    
    function removeGraphic(){
        var img = hasGraphic();
        if(img){
            img.remove();
            return true;
        }
        
        return false;
    }
    
    function loadGraphic(url){
        // http://nubook.com/static/content/milk-bg.png
        removeGraphic();
        var img = $("<img />")
            .load(function(){
                if($(this).attr('width') != graphicSize[0] || $(this).attr('height') != graphicSize[1]){
                    alert('Graphic must be '+graphicSize[0]+' by '+graphicSize[1]);
                } else {
                    graphic.append(img);
                    $('#png-layer').attr('checked',true);
                    graphic.show();        
                    hideGraphicUploader();
                }
            })
            .error(function(){
                alert('There was an error loading the image.');
            })
            .attr('src',url);
        
    }
    
    function hasGraphic(){
        var img = template.find('.graphic img');
        if(img.length) return img;
        return false;
    }
    
    function showGraphicUploader(){
        $('#png-layer-label').hide();
        $('#remove-png-layer-link').hide();
        $('#png-layer-upload-button').show();
    }
    
    function hideGraphicUploader(){
        $('#png-layer-upload-button').hide();
        $('#png-layer-label').show();
        $('#remove-png-layer-link').show();
    }
    
    
    // Custom Guide Methods ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    var guideSwfu;
    function bindGuideSwfu(){
        
        // setup swfupload
        var settings = {
        	flash_url : "/assets/scripts/swfupload/swfupload.swf",
        	upload_url: "/ajax/uploads/images",
        	post_params: {'fclass':'template-guide', 'my_images':false },
        	file_size_limit : "10 MB",
        	file_types : "*.png",
        	file_types_description : "PNG Images",
        	file_upload_limit : 100,
        	file_queue_limit : 100,
            file_post_name: "image",
        	custom_settings : {
        		//progressTarget : "fsUploadProgress",
        		//cancelButtonId : "btnCancel"
        	},
        	debug: false,
        
        	// Button settings
        	button_image_url: "/assets/styles/builder/b/swfupload-custom-guide-btn.png",
        	button_width: "123",
        	button_height: "26",
        	button_placeholder_id: "custom-guide-swfu-button",
        	button_text: '',
        	button_text_style: '',
        	button_text_left_padding: 0,
        	button_text_top_padding: 0,
        	button_cursor : SWFUpload.CURSOR.HAND, 
        	
        	// Event handler functions
        	file_queued_handler : function(){ guideSwfu.startUpload(); },
        	file_queue_error_handler : function(){},
        	file_dialog_complete_handler : function(){},
        	//upload_start_handler : uploadStart,
        	//upload_progress_handler : uploadProgress,
        	//upload_error_handler : uploadError,
        	upload_success_handler : guideUploadSuccess,
        	//upload_complete_handler : graphicUploadSuccess,
        	queue_complete_handler : function(){}	// Queue plugin event
        	
        };
        
        guideSwfu = new SWFUpload(settings);
    }

    function guideUploadSuccess(file, data, response) {
        data = eval('('+data+')');
        loadGuide(data.url);
    }

    function loadGuide(url){
        // http://nubook.com/static/content/milk-bg.png
        removeGuide();
        var img = $("<img />")
            .load(function(){
                if($(this).attr('width') != graphicSize[0] || $(this).attr('height') != graphicSize[1]){
                    alert('Guide must be '+graphicSize[0]+' by '+graphicSize[1]);
                } else {
                    $("#custom-guide-layer").append(img);
                    $('#custom-guide').attr('checked',true);
                    $('#custom-guide-layer').show();
                    hideGuideUploader();
                }
            })
            .error(function(){
                alert('There was an error loading the image.');
            })
            .attr('src',url);
    }

    function removeGuide(){
        var img = hasGuide();
        if(img){
            img.remove();
            return true;
        }
        
        return false;
    }
    
    function hasGuide(){
        var img = $('#custom-guide-layer img');
        if(img.length) return img;
        return false;
    }
    
    function showGuideUploader(){
        $('#custom-guide-label').hide();
        $('#remove-custom-guide-link').hide();
        $('#custom-guide-upload-button').show();
    }
    
    function hideGuideUploader(){
        $('#custom-guide-upload-button').hide();
        $('#custom-guide-label').show();
        $('#remove-custom-guide-link').show();
    }
    
})();

// -------------------------------------------------
// builder.tools
// -------------------------------------------------

(function(){
    namespace("builder.tools", init, register, setActive, destroy);
    
    var tools = [];
    var active;
    
    function init() {
        builder.tools.image.init();
        //builder.tools.text.init();
    }
    
    function register(name, tool) {}
    
    function setActive(tool){
        destroy();
        active = tool;
    }
    
    function destroy(){
        if(active) active.destroy();
        active = undefined;        
    }
    
})();


// -------------------------------------------------
// builder.tools.image

(function(){
    namespace("builder.tools.image", init, reset, bind, destroy, set, focus, unfocus);
    var element;
    var linked;
    
    function bindActivationElements(){
        $.each($('.template .lwrap'),function(i,lwrap){
            lwrap = $(lwrap);
            lwrap.click(function(){
                builder.tools.destroy();
                builder.tools.image.bind($(this));
            });
        });
    }
    
    function init(){
        bindActivationElements();
    }    
    
    function reset(){}
    function isEmbed(){ return element.hasClass('ewrap'); }
    function isImage(){ return element.hasClass('lwrap'); }
    function isText(){ return element.hasClass('twrap'); }
    
    function bind(lwrap){
        builder.tools.setActive(this);
        id = lwrap.attr('id').split('-',2)[1]
        element = $('#m-'+id);
        linked = lwrap;
        focus();
    }
    
    function destroy(){
        unfocus();
    }
    
    function set(method,value){
        
        switch(method){
            case 'top':
                console.log(method+' = '+value);
                break;
            case 'top':
                console.log(method+' = '+value);
                break;
            case 'top':
                console.log(method+' = '+value);
            default:
                console.log('error');
        }
        
        return true;
    }
    
    function focus(){
        builder.toolbar.init(this);
    }
    
    function unfocus(){
        builder.toolbar.unfocus();
    }
    
    /*
    function focus(){
        //element.css('background','blue');
        widget.css({'top':(parseInt(element.css('top'))+(parseInt(element.height())/2))+'px','left':(parseInt(element.css('left'))+(parseInt(element.width())/2))+'px'});
        var img = hasImage();
        if(img == false){
            widget.show();
        } else {
            handle.draggable('option','disabled',false);
        }
        
        toolbar.show();
    }
    
    function unfocus(){
        if(hasImage()){ handle.draggable('option','disabled',true); }
        widget.hide();
        toolbar.hide();
    }
    
    // handle functions
    function createHandle() {}
    
    function linkHandle(){
        
        var img = $(image);
        var img_w = $(image).width();
        var img_h = $(image).height();
        
        var el = element;
        var el_w = element.width();
        var el_h = element.height();

        handle.css({
            'width':img_w+'px',
            'height':img_h+'px',
            'left':img.css('left'),
            'top':img.css('top'),
        });
        
        contain.css({
            'width': ((img_w - el_w)*2 + el_w) +'px',
            'height': ((img_h - el_h)*2 + el_h) +'px',
            'left': '-'+(img_w - el_w)+'px',
            'top': '-'+(img_h - el_h)+'px'
        });
    }
    */

})();





// -------------------------------------------------
// On DOM Load

$(function() {
    $('body').addClass('has-js');
    builder.load();
    setupLabel();
    
    // setup window onresize and onscroll
    $(window).resize(function(){
        builder.resize();
    }).scroll(function(){
        builder.resize();    
    })
    
});


// uppercase the first letter
function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}



// -------------------------------------------------
// LEGACY ------------------------------------------
// -------------------------------------------------


// -------------------------------------------------
// Fancy checkboxes and radio buttons

var setupLabel = function() {
    if ($('.label-check input').length) {
        $('.label-check').each(function(){ 
            $(this).removeClass('c-on');
        });
        $('.label-check input:checked').each(function(){ 
            $(this).parent('label').addClass('c-on');
        });                
    };
    if ($('.label-radio input').length) {
        $('.label-radio').each(function(){ 
            $(this).removeClass('r-on');
        });
        $('.label-radio input:checked').each(function(){ 
            $(this).parent('label').addClass('r-on');
        });
    };
};

$(function() {
   $('.label-check, .label-radio').click(setupLabel);
});


// -------------------------------------------------
// Animate loading wheel

function preloadingAnimation(currIteration) {
    
    if (typeof(currIteration) == 'undefined') currIteration = 0;
    var maxLoadingIterations = 30;
    
    if (currIteration > maxLoadingIterations) {
        $('.wheel-wrapper').hide();
        $('.spinning-wheel').css('opacity', '1');
        $('img', $('.wheel-wrapper').closest('.the-image')).fadeIn();
        $('.upload-widget').show();
        
        clearTimeout(animateLoading);
    } else {
        if (currIteration > (maxLoadingIterations - 10)) {
            $('.spinning-wheel').css('opacity', '0.' + parseInt(maxLoadingIterations - currIteration));
        };
        $('.spinning-wheel').css('backgroundPosition', '0 -' + parseInt(currIteration * 54) + 'px');
        currIteration++;
        animateLoading = setTimeout("preloadingAnimation(" + currIteration + ")", 83);
    };

};



// -------------------------------------------------
// Initiate color popup version

var init_color_picker = function() {
    if ($('#color-popup-mode-swither:checked').length) {
        $('#color-popup .simple').show();
        $('#color-popup .advanced').hide();
    } else {
        $('#color-popup .simple').hide();
        $('#color-popup .advanced').show();
    }
}




// -------------------------------------------------
//

var positionWorkspace = function() {
    var left = parseInt($(window).width())/2;
    $('#workspace-frame').css('left', (left - 365) + 'px');
};



// -------------------------------------------------
// Inline JS to be migrated to classes


$(document).ready(function(){
    
    // -----------------------
    // fix checkboxes on windows browsers
    
    if (navigator.appVersion.indexOf('Win') != -1) {
        $('.label-check input').css({'margin-top': '2px', 'float':'left'});
    };



    
    
    // -----------------------
    // misc effects
    
    /*
    $('#font-weight a').click(function(){
        var parent = $(this).closest('li');
        if (parent.hasClass('on')) {
            parent.removeClass('on');
        } else {
            parent.addClass('on');
        }
    });

    $('#inbox-alignment a').click(function(){
        var parent = $(this).closest('li');
        $('#inbox-alignment li').removeClass('on');
        $('.text-block').removeClass().addClass('text-block');
        if (parent.hasClass('on')) {
            parent.removeClass('on');
        } else {
            parent.addClass('on');
            $('.text-block').addClass('set-' + parent.attr('id'));
        }
    });
    */
    
    

    
});


