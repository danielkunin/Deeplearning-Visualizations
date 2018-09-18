var lossLandscape = new loss('himmelblaus', 0, 0, d3.select("#contour"));
var optLandscape = new optimizer(lossLandscape, d3.select("#loss"));
lossLandscape.plot();
optLandscape.plot(0);

$("input[name='loss']").on("change", function () {
	$("#reset").click();
	lossLandscape.func = this.value;
    lossLandscape.plot(0);
});

$("input[name='opt']").on("change", function () {
	$("#reset").click();
	var index = optLandscape.rule.indexOf(this.value);
	if (index == -1) {
		optLandscape.rule.push(this.value);
	} else {
		optLandscape.rule.splice(index, 1);
	}
	optLandscape.update();
});

// $("#lrate").on("input", function () {
// 	optLandscape.reset();
// 	$("#lrate_val").html(d3.format(".2")(10**this.value));
// 	optLandscape.lrate = 10**this.value;
// });

// $("#ldecay").on("input", function () {
// 	optLandscape.reset();
// 	$("#ldecay_val").html(d3.format(".2")(this.value));
// 	optLandscape.ldecay = this.value;
// });

$("#train").on("click", function () {
	optLandscape.reset();
	optLandscape.train();
	d3.select("#stop").classed("hidden", false);
    d3.select("#train").classed("hidden", true);
});

$("#stop").on("click", function () {
	optLandscape.stop();
	d3.select("#stop").classed("hidden", true);
    d3.select("#train").classed("hidden", false);
});

$("#reset").on("click", function () {
	optLandscape.reset();
	d3.select("#stop").classed("hidden", true);
    d3.select("#train").classed("hidden", false);
});