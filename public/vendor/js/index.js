jQuery(document).ready(function($) {

    var cols = {},

        messageIsOpen = false;

    cols.showOverlay = function() {
        $('body').addClass('show-main-overlay');
    };
    cols.hideOverlay = function() {
        $('body').removeClass('show-main-overlay');
    };


    cols.showMessage = function() {
        $('body').addClass('show-message');
        messageIsOpen = true;
    };
    cols.hideMessage = function() {
        $('body').removeClass('show-message');
        $('#main .message-list li').removeClass('active');
        messageIsOpen = false;
    };


    cols.showSidebar = function() {
        $('body').addClass('show-sidebar');
    };
    cols.hideSidebar = function() {
        $('body').removeClass('show-sidebar');
    };


    // Show sidebar when trigger is clicked

    $('.trigger-toggle-sidebar').on('click', function() {
        cols.showSidebar();
        cols.showOverlay();
    });



    // This will prevent click from triggering twice when clicking checkbox/label




    // When you click the overlay, close everything

    $('#main > .overlay').on('click', function() {
        cols.hideOverlay();
        cols.hideSidebar();
    });
    var s_ht = $(window).height();
    $('.search_slide').css('height', s_ht);

    $('.advance_search').on('click', 'a.slide_down', function() {
        var s_ht = $('#main-nano-wrapper').height();
        console.log(s_ht)
        $('.search_slide').slideDown();

        $(this).removeClass('slide_down').addClass('slide_up');
        $('#main-nano-wrapper').animate({
            'margin-left': '260'
        }, 350);
        $('.task-header').animate({
            'margin-left': '260'
        }, 350);
        $('.edit_click').animate({
            right: '406'
        }, 350);
        $('.button_wrap').animate({
            right: '280'
        }, 350);
        cols.showSidebar();
    });

    $('.advance_search').on('click', 'a.slide_up', function() {

        $('.search_slide').slideUp();
        $(this).removeClass('slide_up').addClass('slide_down');
        $('#main-nano-wrapper').animate({
            'margin-left': '0'
        }, 350);
        $('.task-header').animate({
            'margin-left': '0'
        }, 350);
        $('.edit_click').animate({
            right: '148'
        }, 350);
        $('.button_wrap').animate({
            right: '20'
        }, 350);
        cols.hideSidebar();
    });

});

var winHt = $(window).height();
var ac_ht = winHt - 270;
$('.nano-align').css('height', ac_ht);


function fixedMainClass() {
    $("#main").css("position", "absolute");
}