var lossObject = new loss('himmelblaus', 0, 0, d3.select("#contour"));
var optObject = new optimizer(lossObject, d3.select("#loss"));
lossObject.plot();

$("input[name='loss']").on("change", function () {
	optObject.reset();
	lossObject.func = this.value;
    lossObject.plot(0);
});

$("input[name='reg']").on("change", function () {
	optObject.reset();
	lossObject.alpha = this.value;
    lossObject.plot(0);
});

$("#lambda").on("input", function () {
	optObject.reset();
	$("#lambda_val").html(d3.format(".2")(this.value));
	lossObject.lambda = this.value;
    lossObject.plot(0);
});

$("input[name='opt']").on("change", function () {
	optObject.reset();
	var index = optObject.rule.indexOf(this.value);
	if (index == -1) {
		optObject.rule.push(this.value);
	} else {
		optObject.rule.splice(index, 1);
	}
	optObject.update();
});

$("#lrate").on("input", function () {
	optObject.reset();
	$("#lrate_val").html(d3.format(".2")(10**this.value));
	optObject.lrate = 10**this.value;
});

$("#ldecay").on("input", function () {
	optObject.reset();
	$("#ldecay_val").html(d3.format(".2")(this.value));
	optObject.ldecay = this.value;
});

$("#init").on("click", function () {
	optObject.reset();
	optObject.init();
});

$("#train").on("click", function () {
	optObject.reset();
	optObject.train();
});

$("#reset").on("click", function () {
	optObject.reset();
});