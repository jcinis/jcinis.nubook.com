// Date Formatting
Date.prototype.format=function(format){var returnStr='';var replace=Date.replaceChars;for(var i=0;i<format.length;i++){var curChar=format.charAt(i);if(i-1>=0&&format.charAt(i-1)=="\\"){returnStr+=curChar;}else if(replace[curChar]){returnStr+=replace[curChar].call(this);}else if(curChar!="\\"){returnStr+=curChar;}}return returnStr;};Date.replaceChars={shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],longMonths:['January','February','March','April','May','June','July','August','September','October','November','December'],shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],longDays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],d:function(){return(this.getDate()<10?'0':'')+this.getDate();},D:function(){return Date.replaceChars.shortDays[this.getDay()];},j:function(){return this.getDate();},l:function(){return Date.replaceChars.longDays[this.getDay()];},N:function(){return this.getDay()+1;},S:function(){return(this.getDate()%10==1&&this.getDate()!=11?'st':(this.getDate()%10==2&&this.getDate()!=12?'nd':(this.getDate()%10==3&&this.getDate()!=13?'rd':'th')));},w:function(){return this.getDay();},z:function(){var d=new Date(this.getFullYear(),0,1);return Math.ceil((this-d)/86400000);},W:function(){var d=new Date(this.getFullYear(),0,1);return Math.ceil((((this-d)/86400000)+d.getDay()+1)/7);},F:function(){return Date.replaceChars.longMonths[this.getMonth()];},m:function(){return(this.getMonth()<9?'0':'')+(this.getMonth()+1);},M:function(){return Date.replaceChars.shortMonths[this.getMonth()];},n:function(){return this.getMonth()+1;},t:function(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),0).getDate()},L:function(){var year=this.getFullYear();return(year%400==0||(year%100!=0&&year%4==0));},o:function(){var d=new Date(this.valueOf());d.setDate(d.getDate()-((this.getDay()+6)%7)+3);return d.getFullYear();},Y:function(){return this.getFullYear();},y:function(){return(''+this.getFullYear()).substr(2);},a:function(){return this.getHours()<12?'am':'pm';},A:function(){return this.getHours()<12?'AM':'PM';},B:function(){return Math.floor((((this.getUTCHours()+1)%24)+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1000/24);},g:function(){return this.getHours()%12||12;},G:function(){return this.getHours();},h:function(){return((this.getHours()%12||12)<10?'0':'')+(this.getHours()%12||12);},H:function(){return(this.getHours()<10?'0':'')+this.getHours();},i:function(){return(this.getMinutes()<10?'0':'')+this.getMinutes();},s:function(){return(this.getSeconds()<10?'0':'')+this.getSeconds();},u:function(){var m=this.getMilliseconds();return(m<10?'00':(m<100?'0':''))+m;},e:function(){return"Not Yet Supported";},I:function(){return"Not Yet Supported";},O:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+'00';},P:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+':00';},T:function(){var m=this.getMonth();this.setMonth(0);var result=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,'$1');this.setMonth(m);return result;},Z:function(){return-this.getTimezoneOffset()*60;},c:function(){return this.format("Y-m-d\\TH:i:sP");},r:function(){return this.toString();},U:function(){return this.getTime()/1000;}};

// PageLogging
(function(){
    namespace("log", console, add, get);
    
    var div;
    var _items = [];
    
    function console(parent, id){

        parent = parent ? parent : $("body");
        id = id ? id : "log";
        
        div = $('<div id="'+ id +'" />').css({'position':'fixed', 'bottom':'0px', 'margin':'0px 0px 0px 0px', 'width':'100%'});
        parent.append(div);
        div = $('#'+id);
    }
    
    function add(text){
        if(!div) this.console();
        div.append($('<div class="item"/>').css({ 'background':'#f3f3f3', 'padding':'5px 10px', 'font':'12px/18px monospace', 'color':'#333333', 'margin':'0px 50px 1px 50px' }).append(text));
        _items.push(text);
    }
    
    function get() { return _items; }
    
})();

// Page Timer
(function(){
    selfname = "timer";
    namespace(""+selfname, start, stop, get, reset, loop);
    
    var id = false;
    var count = 0.0;
    var _callback = false;
        
    function loop() {
        count = count + .1;
        if(_callback) { _callback(get()); }
    }
    
    function start(callback){
        id = setInterval(selfname+".loop()",100);
        if(callback) { _callback = callback; }
    }
    
    function stop() { clearInterval(id); }
    function get() { return _round(count,2); }
    function reset() { count = 0.0; _callback = false; }
    function _round(num, dec) { return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec); }    
})();

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