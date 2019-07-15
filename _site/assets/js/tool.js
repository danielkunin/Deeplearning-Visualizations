
// Window event listeners
window.onload = function() {
	footnoteSetup();
	sidenoteSetup();
	tocSetup();
	bttSetup();
};

// scroll functionality

function toSection(section) {
    var n = section.offset().top;
    var pos = { 'scrollTop': n }
    $('html,body').animate(pos, 'slow');
}


// table of content, footnote, sidenote, back to top setup

function tocSetup() {

	$('a[href^="#"]').on('click',function (e) {	
      	e.preventDefault();
      	var target = this.hash;
      	toSection($(target));
      	window.location.hash = target;
	});

}

function footnoteSetup() {

	$(".footnote-body").click(function() {	
		var index = $(".footnote-body").index(this),
			target = $(".footnote:eq(" + index + ")");
		toSection(target);
	});

	$(".footnote").click(function() {	
		var index = $(".footnote").index(this),
			target = $(".footnote-body:eq(" + index + ")");
		toSection(target);
	});

};

function sidenoteSetup() {

	// vertically align sidenote body with sidenote
	function align(anchor, body) {
		var height = body.outerHeight(),
			style = {'top': 0, 'middle': height / 2, 'bottom': height},
			align = anchor.data("align") == undefined ? 'middle' : anchor.data("align"),
			parent = anchor.parents('div').eq(0),
			offsetTop = anchor.position().top  - style[align];
			offsetRight = - parent.width()/4 ;

		body.css('top', offsetTop + 'px');
		body.css('right', offsetRight + 'px');
	}

	// bind highlight functionality on mouse events
	$(".sidenote").each(function(index) {
		var anchor = $(this),
			body = $(".sidenote-body:eq(" + index + ")");
		
		anchor.bind("mouseenter", function() {
			align(anchor, body);
			body.addClass("margin-border");
		});

		anchor.bind("mouseleave", function() {
			body.removeClass("margin-border");
		});
	});

}

function bttSetup() {

	// add click functionality
	$(".backToTop").click(function() {
		$('html,body').animate( { 'scrollTop': 0 }, 'slow');
	});

	// toggle visability
	$(window).scroll(function(){
		var eTop = $(".backToTop").offset().top,
			eBottom = eTop + $(".backToTop").outerHeight();
		var count = $(".article-banner").inView();
		$(".hide-backToTop").each(function(i) {
			count += (eBottom > $(this).offset().top && eTop < $(this).offset().top + $(this).outerHeight());
		})
		$(".backToTop").css({"visibility":(count ? "hidden" : "visible")});
	});
}

// visualization functionality

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


