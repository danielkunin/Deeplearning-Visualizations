// var data = d3.range(1000).map(d3.randomBates(10));

// setup dimensions
var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom
  padding = 10;

// add svg
var svg = d3.select("#mnist").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .domain([-1,1])
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);


svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));


function histogram(data) {

    var activations = [];
    for (var i = 0; i < data.length; i++) {
        var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(200))
            (data[i]);
        y.domain([0, d3.max(bins, function(d) { return Math.max(y.domain()[1],d.length); })]);
        activations.push(bins);
    }

    var valueline = d3.line()
      .x(function(d) { return x(d.x0); })
      .y(function(d) { return y(d.length); });

    var lines = svg.selectAll("path.layer")
      .data(activations);

    lines.enter().append("path")
      .attr("class", function(d,i) { return "layer layer-" + i; })
      .attr("d", valueline);

    lines.attr("d", valueline);

}