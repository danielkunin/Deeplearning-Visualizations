$(window).load(function() {
	$(".index").click(function() {	
		var target = $(this).attr('class').split(' ').pop();
			target = $("."+target+"-target");
		toSection($(target));
	});

	$(".footnote-index").click(function() {	
		var target = $(this).attr('class').split(' ').pop();
			target = $("."+target+"-target");
		toSection($(target));
	});
});


function toSection(section) {
    var n = section.offset().top;
    var pos = { 'scrollTop': n }
    $('html,body').animate(pos, 'slow');
}

$.fn.inView = function() {
	// element top/bottom
	var eTop = $(this).offset().top,
		eBottom = eTop + $(this).outerHeight();
	// viewport top/bottom
	var vTop = $(window).scrollTop(),
		vBottom = vTop + $(window).height();
	// check if any section of element in view
	return eBottom > vTop && eTop < vBottom;
};