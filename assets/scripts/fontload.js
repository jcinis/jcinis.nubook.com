(function(){
    namespace("fontload", init, isLoaded, loadFont, getFont, loadFonts, writeStyle, whichFont);

    var fonts = [];
    var stdfonts = ['verdana','arial','georgia','times'];
    var format = '';
    var classPrefix = 'webfont-';
    var styleClass = 'dynamic_css';
    var debug = false;

    function getFormat() {
        var format = 'ttf';

        if($.browser.safari) {
            format = 'ttf';
        } else if($.browser.webkit) {
            format = 'otf';
        } else if($.browser.mozilla) {
            format = 'woff';
            if($.browser.version.indexOf('1.9.1') === 0){
                format = 'ttf';
            }
        } else if($.browser.msie) {
            format = 'eot';
        }

        return format;
    }

    function init(){
        format = getFormat();
    }

    function isLoaded(fontname){
        if(fonts[fontname]) return true;
        return false;
    }

    function getUrl(fontname){
        if(format == '') init();
        return './assets/fonts/'+fontname+($.inArray(fontname,stdfonts) == -1 ? '-'+format : '')+'.css';
    }

    function loadFont(font,callback){

        url = getUrl(font);

        if(debug) timer.start();
        if(debug) log.add('Loading fonts');

        if(!fonts[font]) {
            $.ajax({
                url: url,
                dataType:'html',
                success: function(css){
                    fonts[font] = css;
                    if(debug) timer.stop();
                    if(debug) log.add('Fonts active in '+timer.get()+' seconds');
                    callback(css);
                }
            });
        } else {
            callback(fonts[font]);
        }
    }

    function writeStyle(css,callback){
        var fontStyle = $('<style />',{
            'type': 'text/css',
            'class': styleClass,
            'media': 'screen'
        });
        fontStyle.appendTo('head');

        if($.browser.msie) {
            fontStyle.get(0).styleSheet.cssText = css;
            $('.dynamic_css').clone().appendTo('head');
        } else {
            fontStyle.text(css).appendTo('head');
        }
        if(callback) callback();
    }

    function getFont(font){

        url = getUrl(font);

        if(!fonts[font]) {
            $.ajax({
                url: url,
                dataType:'html',
                async: false,
                success: function(css){
                    fonts[font] = css;
                }
            });
        }

        return fonts[font];
    }

    function whichFont(div){
        var found = false;
        var classes = $(div).attr('class');
        classes = classes.split(/\s+/);
        $.each(classes,function(i,classname){
            var font = classname.split(classPrefix)[1];
            found = font;
        });

        return found;
    }

    function findInDom(){
        var found = [];
        var divs = $('[class*="'+classPrefix+'"]');

        $.each(divs,function(i,div){
            var classes = $(div).attr('class').split("\\s+");
            $.each(classes,function(i,classname){
                var font = classname.split(classPrefix)[1]
                if(font){
                    font = font.toString();
                    if($.inArray(font,found) == -1) found.push(font);
                }
            });
        });

        return found
    }

    function loadFonts(callback, error){
        var found = findInDom();
        if(found.length > 0) {
            $.each(found,function(i,fontname){
                if(!isLoaded(fontname)){
                    loadFont(fontname,function(css){
                        writeStyle(css,callback);
                    });
                }
            });
        } else {
            callback();
        }
    }

})();
