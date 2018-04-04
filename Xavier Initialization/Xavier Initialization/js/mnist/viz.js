
// setup dimensions
var margin = {top: 20, right: 20, bottom: 20, left: 20},
  width = 500 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom
  pad = 20;

// add svg
var svg = d3.select("#hidden").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// setup scales
var layout = d3.scaleLinear()
  .domain([0,1])
  .rangeRound([0, width]);
var x = d3.scaleLinear()
  .domain([-1.2,1.2]);
var y = d3.scaleLinear()
  .domain([0,1])
  .range([height - pad, pad]);

// Create
function histogram(data) {

  // histogram data
  var activations = [];
    for (var i = 0; i < data.length; i++) {
        var num = 200,
            bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(num))
            (data[i]);
        activations.push(bins);
    }

    // path function
    var valueline = d3.line()
      .x(function(d) { return x(d.x0); })
      .y(function(d) { return y(d.length); });

    // bind data to activation paths
    var lines = svg.selectAll("path.activations")
      .data(activations);

    // update path
    lines.attr("d", function(d,i) { 
      y.domain([0, d3.max(d, function(d) { return Math.max(d.length, y.domain()[1]); })]);
      var axis = d3.selectAll(".axis--y").nodes()[i];
      d3.select(axis).call(d3.axisLeft(y).ticks(5, "s"));
      return valueline(d)
    });

}


function setup(layers) {

  // number of layers
  var L = layers.length;

  // setup x scale 
  x.rangeRound([pad, width / L - pad]);

  // add plots
  var plots = svg.selectAll("g.layer")
    .data(layers.slice(1,-1));

  // enter new plots
  var newlayers = plots.enter().append("g")
    .attr("class", function(d,i) { return "layer layer-" + i; })
    .attr("transform",  function(d,i) { return "translate(" + layout(i / L) + ",0)"; });

  // add bounding box
  newlayers.append("rect")
    .attr('x', pad)
    .attr('y', pad)
    .attr('width', width / L - 2 * pad)
    .attr('height', height - 2 * pad);

  // add title
  newlayers.append('text')
    .attr('x', x(0))
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .text(function(d,i) { return "Hidden Layer " + (i + 1); });
  
  // add histogram path
  newlayers.append("path")
    .attr("class", "activations");

  // add axes
  newlayers.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + y.range()[0] + ")")
    .call(d3.axisBottom(x).ticks(3, "s"));
  newlayers.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + x.range()[0] + ",0)")
    .call(d3.axisLeft(y).ticks(5, "s"));

  // create MNIST object
  return MNIST(layers);
}


var layers = [784,300,300,300,300,10],
    nn = setup(layers),
    sample = input_plot(),
    mnist_train;


// temporary initialization buttons
// d3.select("#zero").on("click", function() {
//   nn.initialize('zero');
//   mnist_train = nn.train(histogram, sample);
// });
// d3.select("#unif").on("click", function() {
//   nn.initialize('uniform');
//   mnist_train = nn.train(histogram, sample);
// });
// d3.select("#xe").on("click", function() {
//   nn.initialize('xe');
//   mnist_train = nn.train(histogram, sample);
// });
// d3.select("#norm").on("click", function() {
//   nn.initialize('normal');
//   mnist_train = nn.train(histogram, sample);
// });


// bind radio buttons
$("input[name='mnist']").on("change", function () {
  nn.initialize(this.value);
  mnist_train = nn.train(histogram, sample);
});

// temporary train buttons
d3.select("#reset").on("click", function() {
  mnist_train.reset();
});
d3.select("#start").on("click", function() {
  mnist_train.start();
});
d3.select("#stop").on("click", function() {
  mnist_train.stop();
});
d3.select("#step").on("click", function() {
  mnist_train.step();
});


// load mnist
d3.select("#load").on("click", function() {
  if (DATA == null) {
    extract('data/mnist_test.csv.zip');
  }
});



//////////////////////////
// setup prediction plot
//////////////////////////
function input_plot() {

  // setup dimensions
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 100 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // setup size
  var n = 10,
      m = 20;

  // add canvas
  var canvas = d3.select("#mnist").append("canvas")
    .style("width", function(){ return width + "px"; })
    .style("height", function(){ return height + "px"; })
    .attr("width", n * 28)
    .attr("height", m * 28);

  // get context
  var ctx = canvas.node().getContext("2d")

  // add mnist image
  function drawDigit(xoff, yoff, pixels, label) {
    var i = 0;
    for (var y = 0; y < 28; y++) {
      for (var x = 0; x < 28; x++) {
        var c = Math.floor(255 * pixels[i]);
        var color= 'rgb(' + c + ',' + c + ',' + c + ')';
        ctx.fillStyle = color;
        ctx.fillRect(xoff * 28 + x, yoff * 28 + y, 1, 1);
        i++;
      }
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = label ? "green" : "red"; 
    ctx.strokeRect(xoff * 28, yoff * 28, 26, 26);
  }

  function sample(digits, labels) {
    for (var i = 0; i < n * m; i++) {
      drawDigit(i % n, Math.floor(i / n), digits[i], labels[i]);
    }
  }

  return sample;
}

