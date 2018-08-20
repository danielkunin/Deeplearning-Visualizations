var lineObject = new line(d3.select("#regression_plot"));
var lossObject = new regression_loss(d3.select("#regression_landscape"));
var optObject = new regression_optimizer(lineObject, lossObject, d3.select("#regression_loss"));
lineObject.plot(0);
var regression_data;


$("#regression_sample").on("click", function () {
	regression_data = lineObject.sample($("input[name='regression_tsize']").val());
	lineObject.plot(0);
	lossObject.plot(regression_data, 0);
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

// $("#regression_init").on("click", function () {
// 	optObject.reset();
// 	optObject.init();
// });

$("#regression_train").on("click", function () {
	// optObject.reset();
	optObject.train(regression_data);
});

// $("#regression_reset").on("click", function () {
// 	optObject.reset();
// });