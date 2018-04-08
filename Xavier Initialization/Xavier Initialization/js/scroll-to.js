$(".index").click(function() {	
	var target = $(this).attr('class').split(' ').pop();
		target = $("."+target+"-target");
	toSection($(target));
});


function toSection(section) {
    var n = section.offset().top;
    var pos = { 'scrollTop': n }
    $('html,body').animate(pos, 'slow');
}