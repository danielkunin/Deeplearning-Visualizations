var lossObject = new loss('himmelblaus', 0, 0, d3.select("#contour"));
lossObject.plot();

$("input[name='loss']").on("change", function () {
	lossObject.func = this.value;
    lossObject.plot(0);
});

$("input[name='reg']").on("change", function () {
	lossObject.alpha = this.value;
    lossObject.plot(0);
});

$("#lambda").on("input", function () {
	$("#lambda_val").html(d3.format(".2")(this.value));
	lossObject.lambda = this.value;
    lossObject.plot(0);
});