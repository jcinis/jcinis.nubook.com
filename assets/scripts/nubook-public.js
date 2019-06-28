// helper function
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}

// setup fancy checkboxes
function setupFormLabels() {
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


// check if the browser supports HTML5 video
function supports_video() {
    return !!document.createElement('video').canPlayType && !oldIE;
}


// update active thumbnail arrow,
// update video source
// thumbnail onclick autoplay

function updateVideoStage(videoIndex) {

    if (typeof(cdnDomain) == undefined) {
        cdnDomain = 'http://' + document.domain;
    }

    // move arrow to the active thumbnail
    $('.video-thumbnails li').removeClass('current');
    $('.video-thumbnails li').eq(videoIndex).addClass('current');


    // if supports HTML5 video
    if (supports_video()) {

        // $('#movie').attr('poster', cdnDomain + '/video/video-poster-' + videoIndex + '.png');
        $('#movie').removeAttr('poster');

        if (v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
            v.src = cdnDomain + '/video/' + videoSrc[videoIndex] + '.mp4';

        } else {

            if (v.canPlayType('video/webm; codecs="vp8, vorbis"')) {
                v.src = cdnDomain + '/video/' + videoSrc[videoIndex] + '.webm';

            } else {

                if (v.canPlayType('video/ogg; codecs="theora, vorbis"')) {
                    v.src = cdnDomain + '/video/' + videoSrc[videoIndex] + '.ogv';
                }
            }
        }

        v.load();
        v.play();
        $('.master-play').fadeOut('slow');


    // if doesn’t support HTML5 video
    } else {

        // updates Flash movie hyperlink (<a id="flash-movie" href="#">...</a>)
        $('#flash-movie').attr('href', cdnDomain + '/video/' + videoSrc[videoIndex] + '.mp4');
        $('#flash-movie img').attr('src', cdnDomain + '/video/video-poster-' + videoIndex + '.png');

        // Flowplayer specific method
        $f('flash-movie').play(cdnDomain + '/video/' + videoSrc[videoIndex] + '.mp4');

    }

    // global variable
    currentVideoIndex = videoIndex;

}


// Knock footer to the bottom
function positionFooter() {
    var minHeight = $('header').outerHeight() + $('#content').outerHeight() + $('.footer').outerHeight();
    if($(window).height() > minHeight) {
        $('.footer').css({ position:'fixed','bottom':'0px'});
    } else {
        $('.footer').css({ position:'static' });
    }
}


// homepage showcase slideshow
function updateSiteCaption(x) {
    $('#showcase .site-caption').html(x).fadeIn('fast');
}

function homepageShowcase() {
    var o = $('#showcase .sites li');
    if (o.length) {

        $('#pseudobrowser').prepend('<div class="site-caption"></div>').before('<div class="slideshow-controls"><a class="prev" href="#">Previous</a><a class="next" href="#">Next</a></div>');

        // var initIndex   = Math.floor(Math.random() * o.length);
        var initIndex   = 0;
        var initSite    = o.eq(initIndex);

        $('#showcase .sites').jCarouselLite({
            btnNext: '#showcase .next',
            btnPrev: '#showcase .prev',
            visible: 1,
            start: initIndex,
            beforeStart: function() { $('#showcase .site-caption').hide(); },
            afterEnd: function(currentSite) {
                var currentIndex = currentSite.index();
                var currentSiteDesc = $('.site-desc', $('#showcase .sites li').eq(currentIndex));
                updateSiteCaption(currentSiteDesc.html());
            }
        });
        var initSiteDesc = $('.site-desc', initSite);
        updateSiteCaption(initSiteDesc.html());
    }
};




// REACTIVATION FORM
var ReactivateView = Backbone.View.extend({

    el: $('#reactivate-form'),

    events: {
        'keyup input[name=cc]':'validateCreditCard',
        'keyup input[name=cvv]':'validateCVV',
        'keyup input.input-text':'handleLabel',
        //'click input[type=submit]':'submit',
        'submit':'submit'
    },

    initialize: function(){
        this.render();
    },

    render: function(){
        this.validate();
        return this;
    },

    submit: function(event){
        $('.saver-popup').show();
    },

    validate: function(){
        this.validateCreditCard();
        this.validateCVV();
        this.$('.input-text').keyup();
    },

    handleLabel: function(event){
        if(event.currentTarget && $(event.currentTarget).val()) {
            $(event.currentTarget).parent().find('label').fadeOut('fast');
        } else {
            $(event.currentTarget).parent().find('label').fadeIn('fast');
        }
    },

    isValidCreditCard:function(type, ccnum) {
        if (type == "Visa") {
            // Visa: length 16, prefix 4, dashes optional.
            var re = /^4\d{3}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "MC") {
            // Mastercard: length 16, prefix 51-55, dashes optional.
            var re = /^5[1-5]\d{2}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "Disc") {
            // Discover: length 16, prefix 6011, dashes optional.
            var re = /^6011-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "AmEx") {
            // American Express: length 15, prefix 34 or 37.
            var re = /^3[4,7]\d{13}$/;
        }

        if (!re.test(ccnum)) return false;

        // Remove all dashes for the checksum checks to eliminate negative numbers
        ccnum = ccnum.split("-").join("");

        // Checksum ("Mod 10")
        // Add even digits in even length strings or odd digits in odd length strings.
        var checksum = 0;
        for (var i=(2-(ccnum.length % 2)); i<=ccnum.length; i+=2) {
            checksum += parseInt(ccnum.charAt(i-1));
        }

        // Analyze odd digits in even length strings or even digits in odd length strings.
        for (var i=(ccnum.length % 2) + 1; i<ccnum.length; i+=2) {
            var digit = parseInt(ccnum.charAt(i-1)) * 2;
            if (digit < 10) { checksum += digit; } else { checksum += (digit-9); }
        }
        if ((checksum % 10) == 0) return true; else return false;
    },

    validateCreditCard: function(){
        var input = this.$('input[name=cc]');
        input.val(input.val().replace(' ','').substr(0,16));

        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(input.val().length < 15) {
                input.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                if(this.isValidCreditCard('Visa',input.val()) || this.isValidCreditCard('MC',input.val()) || this.isValidCreditCard('AmEx',input.val()) || this.isValidCreditCard('Disc',input.val()) ){
                    input.parent('.field').removeClass('unavailable').addClass('available');
                } else {
                    input.parent('.field').removeClass('available').addClass('unavailable');
                }
            }

        }
    },

    validateCVV: function(){
        var input = this.$('input[name=cvv]');
        if(input.val() == '') {

            input.parent('.field').removeClass('available').removeClass('unavailable');

        } else {
            if(input.val().length >= 3) {
                input.parent('.field').removeClass('unavailable').addClass('available');
            } else {
                input.parent('.field').removeClass('available').addClass('unavailable');
            }
        }
    }

});


// SIGNUP
/*
var NubookSignup = Backbone.View.extend({

    el: $('#signup-form'),

    events: {
        'keyup input[name=username]':'validateUsername',
        'keyup input[name=password]':'validatePassword',
        'keyup input[name=password_match]':'validatePassword',
        'keyup input[name=email]':'validateEmail',
        'keyup input[name=first_name]':'validateFirstName',
        'keyup input[name=last_name]':'validateLastName',
        'keyup input[name=cc]':'validateCreditCard',
        'keyup input[name=cvv]':'validateCVV',
        //'click input[type=submit]':'submit',
        'submit':'submit'
    },

    initialize: function(){
        this.render();
    },

    render: function(){
        this.validate();
        return this;
    },

    submit: function(event){
        $('.saver-popup').show();
    },

    validate: function(){
        this.validateUsername();
        this.validatePassword();
        this.validateEmail();
        this.validateFirstName();
        this.validateLastName();
        this.validateCreditCard();
        this.validateCVV();
    },

    validateUsername: function(){

        var input = this.$('input[name=username]');
        var rent = this;
        var isValid = true;
        input.val(input.val().toLowerCase().replace(' ','').substr(0,30));

        if(input.val() == '') {

            this.$('.small-note strong span').text('');
            this.$('.small-note').hide();
            input.parent('.field').removeClass("available").removeClass("unavailable");

        } else {

            this.$('.small-note strong span').text(input.val());
            this.$('.small-note').show();

            $.ajax({
                url: '/ajax/signup/check_username',
                type:'GET',
                data:{ username:input.val() },
                success: function(data){

                    input.parent('.field').removeClass("available").removeClass("unavailable");
                    input.parent('.field').addClass(data == true ? "unavailable" : "available");
                }
            });
        }
    },

    validatePassword: function(){

        var password = this.$('input[name=password]');
        var passwordAgain = this.$('input[name=password_match]');

        if(password.val() == '') {
            password.parent('.field').removeClass('available').removeClass('unavailable');
            passwordAgain.parent('.field').removeClass('available').removeClass('unavailable');
        } else {

            if(password.val().length < 6) {
                password.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                password.parent('.field').removeClass('unavailable').addClass('available');
            }

            if(passwordAgain.val() != password.val() || password.val().length < 6) {
                passwordAgain.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                passwordAgain.parent('.field').removeClass('unavailable').addClass('available');
            }
        }
    },

    validateEmail: function(){

        var input = this.$('input[name=email]');
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(re.test(input.val())) {
                input.parent('.field').removeClass('unavailable').addClass('available');
            } else {
                input.parent('.field').removeClass('available').addClass('unavailable');
            }
        }

    },

    validateFirstName: function(){
        var input = this.$('input[name=first_name]');
        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            input.parent('.field').removeClass('unavailable').addClass('available');
        }
    },

    validateLastName: function(){
        var input = this.$('input[name=last_name]');
        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            input.parent('.field').removeClass('unavailable').addClass('available');
        }
    },

    isValidCreditCard:function(type, ccnum) {
        if (type == "Visa") {
            // Visa: length 16, prefix 4, dashes optional.
            var re = /^4\d{3}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "MC") {
            // Mastercard: length 16, prefix 51-55, dashes optional.
            var re = /^5[1-5]\d{2}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "Disc") {
            // Discover: length 16, prefix 6011, dashes optional.
            var re = /^6011-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "AmEx") {
            // American Express: length 15, prefix 34 or 37.
            var re = /^3[4,7]\d{13}$/;
        }

        if (!re.test(ccnum)) return false;

        // Remove all dashes for the checksum checks to eliminate negative numbers
        ccnum = ccnum.split("-").join("");

        // Checksum ("Mod 10")
        // Add even digits in even length strings or odd digits in odd length strings.
        var checksum = 0;
        for (var i=(2-(ccnum.length % 2)); i<=ccnum.length; i+=2) {
            checksum += parseInt(ccnum.charAt(i-1));
        }

        // Analyze odd digits in even length strings or even digits in odd length strings.
        for (var i=(ccnum.length % 2) + 1; i<ccnum.length; i+=2) {
            var digit = parseInt(ccnum.charAt(i-1)) * 2;
            if (digit < 10) { checksum += digit; } else { checksum += (digit-9); }
        }
        if ((checksum % 10) == 0) return true; else return false;
    },

    validateCreditCard: function(){
        var input = this.$('input[name=cc]');
        input.val(input.val().replace(' ','').substr(0,16));

        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(input.val().length < 15) {
                input.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                if(this.isValidCreditCard('Visa',input.val()) || this.isValidCreditCard('MC',input.val()) || this.isValidCreditCard('AmEx',input.val()) || this.isValidCreditCard('Disc',input.val()) ){
                    input.parent('.field').removeClass('unavailable').addClass('available');
                } else {
                    input.parent('.field').removeClass('available').addClass('unavailable');
                }
            }

        }
    },

    validateCVV: function(){
        var input = this.$('input[name=cvv]');
        if(input.val() == '') {

            input.parent('.field').removeClass('available').removeClass('unavailable');

        } else {
            if(input.val().length >= 3) {
                input.parent('.field').removeClass('unavailable').addClass('available');
            } else {
                input.parent('.field').removeClass('available').addClass('unavailable');
            }
        }
    }

});


NubookSignupBeta = NubookSignup.extend({

    events: {
        'keyup input[name=username]':'validateUsername',
        'keyup input[name=password]':'validatePassword',
        'keyup input[name=email]':'validateEmail',
        'keyup input[name=first_name]':'validateFirstName',
        'keyup input[name=last_name]':'validateLastName',
        'keyup input[name=invite_code]':'validateInviteCode',
        'submit':'submit'
    },

    validate: function(){
        this.validateUsername();
        this.validatePassword();
        this.validateEmail();
        this.validateFirstName();
        this.validateLastName();
        this.validateInviteCode();
    },

    validateInviteCode: function() {
        var invite_code = this.$('input[name=invite_code]');
        if(invite_code.val() == '') {
            invite_code.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(invite_code.val().length != 16) {
                invite_code.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                invite_code.parent('.field').removeClass('unavailable').addClass('available');
            }
        }
    },

    validatePassword: function() {
        var password = this.$('input[name=password]');
        if(password.val() == '') {
            password.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(password.val().length < 6) {
                password.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                password.parent('.field').removeClass('unavailable').addClass('available');
            }
        }
    }
});
*/



var NubookSignup = Backbone.View.extend({

    el: $('#signup-form'),

    events: {
        'keyup input[name=username]':'validateUsername',
        'change input[name=username]':'validateUsername',
        'keyup input[name=password]':'validatePassword',
        'keyup input[name=password_match]':'validatePassword',
        'keyup input[name=email]':'validateEmail',
        'keyup input[name=first_name]':'validateFirstName',
        'keyup input[name=last_name]':'validateLastName',
        'keyup input[name=cc]':'validateCreditCard',
        'keyup input[name=cvv]':'validateCVV',
        'keyup input[name=invite_code]':'validateInviteCode',
        'keyup input.input-text':'handleLabel',
        //'click input[type=submit]':'submit',
        'submit':'submit'
    },

    initialize: function(){
        this.render();
    },

    render: function(){
        this.validate();
        return this;
    },

    submit: function(event){
        $('.saver-popup').show();
    },

    validate: function(){
        this.validateUsername();
        this.validatePassword();
        this.validateInviteCode();
        this.$('.input-text').keyup();
        //this.validateEmail();
        //this.validateFirstName();
        //this.validateLastName();
        //this.validateCreditCard();
        //this.validateCVV();
    },

    handleLabel: function(event){
        if(event.currentTarget && $(event.currentTarget).val()) {
            $(event.currentTarget).parent().find('label').fadeOut('fast');
        } else {
            $(event.currentTarget).parent().find('label').fadeIn('fast');
        }
    },

    validateUsername: function(){

        var input = this.$('input[name=username]');
        var rent = this;
        var isValid = true;
        input.val(input.val().toLowerCase().replace(' ','').substr(0,30));

        if(input.val() == '') {

            this.$('#signup-url span').text('username');
            input.parent('.field').removeClass("available").removeClass("unavailable");

        } else {

            this.$('#signup-url span').text(input.val());

            $.ajax({
                url: '/ajax/signup/check_username',
                type:'GET',
                data:{ username:input.val() },
                success: function(data){

                    input.parent('.field').removeClass("available").removeClass("unavailable");
                    input.parent('.field').addClass(data == true ? "unavailable" : "available");
                }
            });
        }
    },

    validatePassword: function(){

        var password = this.$('input[name=password]');
        var passwordAgain = this.$('input[name=password_match]');

        if(password.val() == '') {
            password.parent('.field').removeClass('available').removeClass('unavailable');
            passwordAgain.parent('.field').removeClass('available').removeClass('unavailable');
        } else {

            if(password.val().length < 6) {
                password.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                password.parent('.field').removeClass('unavailable').addClass('available');
            }

            if(passwordAgain.val() != password.val() || password.val().length < 6) {
                passwordAgain.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                passwordAgain.parent('.field').removeClass('unavailable').addClass('available');
            }
        }
    },

    validateEmail: function(){

        var input = this.$('input[name=email]');
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(re.test(input.val())) {
                input.parent('.field').removeClass('unavailable').addClass('available');
            } else {
                input.parent('.field').removeClass('available').addClass('unavailable');
            }
        }

    },

    validateFirstName: function(){
        var input = this.$('input[name=first_name]');
        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            input.parent('.field').removeClass('unavailable').addClass('available');
        }
    },

    validateLastName: function(){
        var input = this.$('input[name=last_name]');
        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            input.parent('.field').removeClass('unavailable').addClass('available');
        }
    },

    isValidCreditCard:function(type, ccnum) {
        if (type == "Visa") {
            // Visa: length 16, prefix 4, dashes optional.
            var re = /^4\d{3}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "MC") {
            // Mastercard: length 16, prefix 51-55, dashes optional.
            var re = /^5[1-5]\d{2}-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "Disc") {
            // Discover: length 16, prefix 6011, dashes optional.
            var re = /^6011-?\d{4}-?\d{4}-?\d{4}$/;
        } else if (type == "AmEx") {
            // American Express: length 15, prefix 34 or 37.
            var re = /^3[4,7]\d{13}$/;
        }

        if (!re.test(ccnum)) return false;

        // Remove all dashes for the checksum checks to eliminate negative numbers
        ccnum = ccnum.split("-").join("");

        // Checksum ("Mod 10")
        // Add even digits in even length strings or odd digits in odd length strings.
        var checksum = 0;
        for (var i=(2-(ccnum.length % 2)); i<=ccnum.length; i+=2) {
            checksum += parseInt(ccnum.charAt(i-1));
        }

        // Analyze odd digits in even length strings or even digits in odd length strings.
        for (var i=(ccnum.length % 2) + 1; i<ccnum.length; i+=2) {
            var digit = parseInt(ccnum.charAt(i-1)) * 2;
            if (digit < 10) { checksum += digit; } else { checksum += (digit-9); }
        }
        if ((checksum % 10) == 0) return true; else return false;
    },

    validateCreditCard: function(){
        var input = this.$('input[name=cc]');
        input.val(input.val().replace(' ','').substr(0,16));

        if(input.val() == '') {
            input.parent('.field').removeClass('available').removeClass('unavailable');
        } else {
            if(input.val().length < 15) {
                input.parent('.field').removeClass('available').addClass('unavailable');
            } else {
                if(this.isValidCreditCard('Visa',input.val()) || this.isValidCreditCard('MC',input.val()) || this.isValidCreditCard('AmEx',input.val()) || this.isValidCreditCard('Disc',input.val()) ){
                    input.parent('.field').removeClass('unavailable').addClass('available');
                } else {
                    input.parent('.field').removeClass('available').addClass('unavailable');
                }
            }

        }
    },

    validateCVV: function(){
        var input = this.$('input[name=cvv]');
        if(input.val() == '') {

            input.parent('.field').removeClass('available').removeClass('unavailable');

        } else {
            if(input.val().length >= 3) {
                input.parent('.field').removeClass('unavailable').addClass('available');
            } else {
                input.parent('.field').removeClass('available').addClass('unavailable');
            }
        }
    },

    validateInviteCode: function() {
        var invite_code = this.$('input[name=invite_code]');

        if(this.el.hasClass('beta')) {
            if(invite_code.val().length < 16) {
                this.$('.vitalfields').addClass('disabled');
                $('#request-form').slideDown('fast');
            } else {
                this.$('.vitalfields').removeClass('disabled');
                $('#request-form').slideUp('fast');
            }
        }

        if(invite_code.val().length != 32) {
            this.$('#payment-information').slideDown('fast',function(event) { $(window).resize(); });
            this.$('h1 .free').hide();
            this.$('.smallprint.beta').slideDown('fast', function(event) { $(window).resize(); });
        } else {
            this.$('#payment-information').slideUp('fast', function(event) { $(window).resize(); });
            this.$('h1 .free').show();
            this.$('.smallprint.beta').slideUp('fast', function(event) { $(window).resize(); });
        }

    }

});


var RequestForm = Backbone.View.extend({

    el: $('#request-form'),

    events: {
        'keyup input.input-text':'handleLabel',
        'submit':'submit'
    },

    initialize: function(){
        this.render();
    },

    render: function(){
        this.reset();
        this.validate();
        return this;
    },

    validate: function(){
        this.$('.input-text').keyup();
    },

    handleLabel: function(event){
        if(event.currentTarget && $(event.currentTarget).val()) {
            $(event.currentTarget).parent().find('label').fadeOut('fast');
        } else {
            $(event.currentTarget).parent().find('label').fadeIn('fast');
        }
    },

    error: function(str) {
        this.$('#request-email-field').addClass('error');
        this.$('.inline-error').text(str);
        this.$('.inline-error').show();
    },

    reset: function(){
        this.$('.input-text').val('');
        this.$('.inline-error').hide();
        this.$('#request-email-field').removeClass('error');
        this.$('.the-form').show();
        this.$('.success').hide();
        this.validate();
    },

    submit: function(event){
        var rent = this;
        var email = this.$('#request-email').val();
        if(email) {
            $.ajax({
                type: 'POST',
                url: '/ajax/beta/request_invite/',
                data: {
                    'email': email,
                    'csrfmiddlewaretoken':this.$('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data){
                    rent.success();
                },
                error: function(response,error,text) {
                    rent.error(response.responseText);
                }
            });
        } else {
            this.error('Enter a valid email.');
        }

        event.preventDefault();
    },

    success: function(){
        this.$('.the-form').hide();
        this.$('.success').show();
    }

});
