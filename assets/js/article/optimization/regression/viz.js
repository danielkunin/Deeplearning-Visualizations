var lineObject = new line("#regression_plot");
var lossObject = new regression_loss("#regression_landscape");
var optObject = new regression_optimizer(lineObject, lossObject, "#regression_loss");

var sample_size = 300;
var regression_data = lineObject.sample(sample_size);

lineObject.plot(0);
lossObject.plot(regression_data, 0);
optObject.plot(0);


$("#generate").on("click", function () {
	$("#regression_reset").click();
	lineObject.objective(uniform(-4, 4), uniform(-4, 4));
	regression_data = lineObject.sample(sample_size);
	lineObject.plot(0);
	lossObject.plot(regression_data, 0);
	optObject.plot(0);
});

$("input[name='regression_tsize']").on("click", function () {
	$("#regression_reset").click();
	sample_size = parseFloat(this.value);
	regression_data = lineObject.sample(sample_size);
	lineObject.plot(0);
	lossObject.plot(regression_data, 0);
	optObject.plot(0);
});

$("input[name='regression_lrate']").on("click", function () {
	$("#regression_reset").click();
	optObject.lrate = parseFloat(this.value);
});

$("input[name='regression_bsize']").on("click", function () {
	$("#regression_reset").click();
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

$(window).on('resize scroll', function() {
  if(!$("#regression").inView()) {
    $("#regression_stop").click();
  }
});