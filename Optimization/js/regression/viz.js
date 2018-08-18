var lineObject = new line(d3.select("#regression_plot"));
var lossObject = new regression_loss(d3.select("#regression_landscape"));
var optObject = new regression_optimizer(lossObject, d3.select("#regression_loss"));
lineObject.plot(0);



$("#regression_sample").on("click", function () {
	var train = lineObject.sample($("input[name='regression_tsize']").val());
	lineObject.plot(0);
	lossObject.plot(train, 0);
});

$("input[name='regression_b']").on("change", function () {
	lineObject.true(parseFloat($("#regression_b0").val()), parseFloat($("#regression_b1").val()))
    lineObject.plot(0);
});

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

$("#regression_lrate").on("input", function () {
	optObject.reset();
	$("#regression_lrate_val").html(d3.format(".2")(10**this.value));
	optObject.lrate = 10**this.value;
});

$("#regression_ldecay").on("input", function () {
	optObject.reset();
	$("#regression_ldecay_val").html(d3.format(".2")(this.value));
	optObject.ldecay = this.value;
});

$("#regression_bsize").on("input", function () {
	optObject.reset();
	$("#regression_bsize_val").html(d3.format(".2")(this.value));
	optObject.bsize = this.value;
});

$("#regression_init").on("click", function () {
	optObject.reset();
	optObject.init();
});

$("#regression_train").on("click", function () {
	optObject.reset();
	optObject.train();
});

$("#regression_reset").on("click", function () {
	optObject.reset();
});