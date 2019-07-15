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

	$(".reference > li").click(function(){
		var target = $(this).attr('class');
			target = target.split("-");
			
			target = "."+target[0]+"-"+target[1];
			console.log(target);
		toSection($(target));
	})

	marginSetup();
	backToTop();
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


function marginSetup(){

	// vertically align margin body with anchor

	$(".marginbody").each(function(){
		var number = $(this).data("number"),
			anchor = $("#margin-" + number + "-anchor"),
			height = $(this).outerHeight(),
			style = {'top': 0, 'middle': height / 2, 'bottom': height},
			align = anchor.data("align"),
			parent = anchor.parents('div').eq(0),
			offset = anchor.position().top - parent.position().top - style[align];
		$(this).css('top', offset + 'px');
	});

	// add highlight on mouseenter
	$(".marginanchor").mouseenter(function(){
		var number = $(this).data("number"),
			body = $("#margin-" + number + "-body");
		body.addClass("margin-border");
	})

	// remove highlight on mouseleave
	$(".marginanchor").mouseleave(function(){
		var number = $(this).data("number"),
			body = $("#margin-" + number + "-body");
		body.removeClass("margin-border");

	})
}


function backToTop() {

	// add click functionality
	$(".backToTop").click(function() {
		$('html,body').animate( { 'scrollTop': 0 }, 'slow');
	});

	// toggle visability
	$(window).scroll(function(){
		var eTop = $(".backToTop").offset().top,
			eBottom = eTop + $(".backToTop").outerHeight();
		var count = $(".intro").inView();
		$(".hide-backToTop").each(function(i) {
			count += (eBottom > $(this).offset().top && eTop < $(this).offset().top + $(this).outerHeight());
		})
		$(".backToTop").css({"visibility":(count ? "hidden" : "visible")});
	});
}



function addSVG(div, width, height, margin) {

	var svg = d3.select(div).append("svg")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
	    .attr("preserveAspectRatio", "xMidYMid meet")
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	return svg;
} 


