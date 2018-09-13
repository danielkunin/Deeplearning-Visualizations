var lineObject = new line(d3.select("#regression_plot"));
var lossObject = new regression_loss(d3.select("#regression_landscape"));
var optObject = new regression_optimizer(lineObject, lossObject, d3.select("#regression_loss"));

var sample_size = 300,
	regression_data = lineObject.sample(sample_size);

lineObject.plot(0);
lossObject.plot(regression_data, 0);
optObject.plot(0);


// $("#regression_sample").on("click", function () {
// 	optObject.reset();
// 	regression_data = lineObject.sample($("input[name='regression_tsize']").val());
// 	lineObject.plot(0);
// 	lossObject.plot(regression_data, 0);
// });

// $("input[name='regression_b']").on("change", function () {
// 	optObject.reset();
// 	lineObject.objective(parseFloat($("#obj_b0").val()), parseFloat($("#obj_b1").val()))
// 	lineObject.network(parseFloat($("#net_b0").val()), parseFloat($("#net_b1").val()))
//     lineObject.plot(0);
//     regression_data = lineObject.sample(0);
//     lossObject.plot(regression_data, 0);
// });

$("input[name='intercept']").on("click", function () {
	$("#regression_reset").click();
	lineObject.objective(parseFloat(this.value), lineObject.obj_coef.b1);
	regression_data = lineObject.sample(sample_size);
	lineObject.plot(0);
	lossObject.plot(regression_data, 0);
	optObject.plot(0);
});
$("input[name='slope']").on("click", function () {
	$("#regression_reset").click();
	lineObject.objective(lineObject.obj_coef.b0, parseFloat(this.value));
	regression_data = lineObject.sample(sample_size);
	lineObject.plot(0);
	lossObject.plot(regression_data, 0);
	optObject.plot(0);
});


$("input[name='regression_lrate']").on("input", function () {
	$("#regression_reset").click();
	optObject.lrate = parseFloat(this.value);
});

$("input[name='regression_bsize']").on("input", function () {
	$("#regression_reset").click();
	optObject.bsize = parseInt(this.value);
});

$("#regression_bsize").on("input", function () {
	$("#regression_reset").click();
	$("#regression_bsize_val").html(d3.format(".2")(this.value));
	optObject.bsize = parseInt(this.value);
});


$("#regression_train").on("click", function () {
	optObject.start(regression_data);
	d3.select("#regression_stop").classed("hidden", false);
    d3.select("#regression_train").classed("hidden", true);
});

$("#regression_stop").on("click", function () {
	optObject.stop();
	d3.select("#regression_stop").classed("hidden", true);
    d3.select("#regression_train").classed("hidden", false);
});

$("#regression_reset").on("click", function () {
	optObject.reset();
	d3.select("#regression_stop").classed("hidden", true);
    d3.select("#regression_train").classed("hidden", false);
});