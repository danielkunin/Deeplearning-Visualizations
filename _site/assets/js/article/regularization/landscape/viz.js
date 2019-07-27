var lossObject = new loss('himmelblaus', 0, 0, "#contour");

$("input[name='loss']").on("change", function () {
	lossObject.func = this.value;
    lossObject.update();
});

$("input[name='reg']").on("change", function () {
	lossObject.alpha = this.value;
    lossObject.update();
});

$("#lambda").on("input", function () {
	$("#lambda_val").html(d3.format(".2")(this.value));
	lossObject.lambda = this.value;
    lossObject.update();
});