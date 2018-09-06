var lossLandscape = new loss('himmelblaus', 0, 0, d3.select("#contour"));
var optLandscape = new optimizer(lossLandscape, d3.select("#loss"));
lossLandscape.plot();

$("input[name='loss']").on("change", function () {
	optLandscape.reset();
	lossLandscape.func = this.value;
    lossLandscape.plot(0);
});

$("input[name='reg']").on("change", function () {
	optLandscape.reset();
	lossLandscape.alpha = this.value;
    lossLandscape.plot(0);
});

$("#lambda").on("input", function () {
	optLandscape.reset();
	$("#lambda_val").html(d3.format(".2")(this.value));
	lossLandscape.lambda = this.value;
    lossLandscape.plot(0);
});

$("input[name='opt']").on("change", function () {
	optLandscape.reset();
	var index = optLandscape.rule.indexOf(this.value);
	if (index == -1) {
		optLandscape.rule.push(this.value);
	} else {
		optLandscape.rule.splice(index, 1);
	}
	optLandscape.update();
});

$("#lrate").on("input", function () {
	optLandscape.reset();
	$("#lrate_val").html(d3.format(".2")(10**this.value));
	optLandscape.lrate = 10**this.value;
});

$("#ldecay").on("input", function () {
	optLandscape.reset();
	$("#ldecay_val").html(d3.format(".2")(this.value));
	optLandscape.ldecay = this.value;
});

$("#init").on("click", function () {
	optLandscape.reset();
	optLandscape.init();
});

$("#train").on("click", function () {
	optLandscape.reset();
	optLandscape.train();
});

$("#reset").on("click", function () {
	optLandscape.reset();
});