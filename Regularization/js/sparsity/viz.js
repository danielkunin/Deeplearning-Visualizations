
//////////////////////////
// setup hidden layers plot
//////////////////////////
function mnist_network(layers) {
  // setup dimensions
  var margin = {top: 20, right: 0, bottom: 20, left: 0},
    width = 425 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom
    pad = 5;

  // add svg
  var svg = d3.select("#mnist_network").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // setup scales
  var layout = d3.scaleLinear()
    .domain([0,1])
    .rangeRound([0, width]);
  var x = d3.scaleLinear()
    .domain([-0.2,0.2]);
  var y = d3.scaleLinear()
    .domain([0,1])
    .range([height - pad, pad]);


  function merge(data) {
    var length = 0;
    for (var i = 0; i < data.length; i++) {
      length += data[i].length;
    }
    var result = new Float32Array(length),
        start = 0;
    for (var i = 0; i < data.length; i++) {
      result.set(data[i], start);
      start += data[i].length;
    }
    return result;
  }

  // histogram function
  function histogram(data) {

    // // histogram data
    // var activations = [],
    //     max = 0;
    //   for (var i = 0; i < data.length; i++) {
    //       var num = 200,
    //           bins = d3.histogram()
    //           .domain(x.domain())
    //           .thresholds(x.ticks(num))
    //           (data[i]);
    //       activations.push(bins);
    //       max = d3.max(bins, function(d) { return Math.max(max, d.length); });
    //   }
      // histogram data
      merged_data = merge(data);
      var num = 200,
          bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(num))
            (merged_data);
      activations = [bins]
      max = d3.max(bins, function(d) { return d.length; });
      // console.log(bins)

      // update y scale
      y.domain([0, 1.1 * max]);

      // path function
      var valueline = d3.line()
        .x(function(d) { return x(d.x0); })
        .y(function(d) { return y(d.length); });

      // bind data to activation paths
      var lines = svg.selectAll("path.activations")
        .data(activations);

      // update path
      lines.attr("d", valueline);
  }


  // number of layers
  var L = 1;//layers.length;

  // setup x scale 
  x.rangeRound([pad, width / L - pad]);

  // add plots
  var plots = svg.selectAll("g.layer")
    .data(layers);

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
    .text("Weights");
  
  // add histogram path
  newlayers.append("path")
    .attr("class", "activations");

  // add axes
  newlayers.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + y.range()[0] + ")")
    .call(d3.axisBottom(x).ticks(3, "s"));

  return histogram;
}


//////////////////////////
// setup MNIST plot
//////////////////////////
function mnist_input() {

  // setup dimensions
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // setup size for batch
  var n = 10,
      m = 10;

  // add canvas
  var canvas = d3.select("#mnist_input").append("canvas")
    .style("width", function(){ return width + "px"; })
    .style("height", function(){ return height + "px"; })
    .attr("width", n * 28)
    .attr("height", m * 28)
    .style("border", "2px solid black");

  // get context
  var ctx = canvas.node().getContext("2d")

  // add mnist image
  function draw_digit(xoff, yoff, pixels) {
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
  }

  // draw input
  function draw(digits, batch, epoch) {
    for (var i = 0; i < digits.length; i++) {
      draw_digit(i % n, Math.floor(i / n), digits[i]);
    }
    $('#batch').html(batch);
    $('#epoch').html(epoch);
  }

  return draw;
}


//////////////////////////
// setup softmax plot
//////////////////////////
function mnist_output() {

  // setup dimensions
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // setup bacth size
  var n = 10,
      m = 10;

  // add canvas
  var canvas = d3.select("#mnist_output").append("canvas")
    .style("width", function(){ return width + "px"; })
    .style("height", function(){ return height + "px"; })
    .attr("width", n * 28)
    .attr("height", m * 28)
    .style("border", "2px solid black");

  // get context
  var ctx = canvas.node().getContext("2d")

  // add image classification
  function draw_error(xoff, yoff, label) {
    var i = 0;
    for (var y = 0; y < 28; y++) {
      for (var x = 0; x < 28; x++) {
        var color = label ? "#009CDE" : "#FF8686"; 
        ctx.fillStyle = color;
        ctx.fillRect(xoff * 28 + x, yoff * 28 + y, 1, 1);
        i++;
      }
    }
  }

  // draw output
  function draw(labels, error, cost) {
    for (var i = 0; i < labels.length; i++) {
      draw_error(i % n, Math.floor(i / n), labels[i]);
    }
    $('#accuracy').html(d3.format(".2r")(100 * error) + '/' + (n * m));
    $('#cost').html(d3.format(".2f")(cost));
  }

  return draw;
}


//////////////////////////
// setup MNIST visualization
//////////////////////////
function mnist_setup() {

  // define layers and setup plots
  var layers = [784,300,300,300,300,10],
      batch = mnist_input(),
      histogram = mnist_network(layers.slice(1,-1)),
      softmax = mnist_output();

  // create MNIST object
  var mnist = MNIST(layers),
      alpha = 1,
      lambda = 0,
      train = mnist.train(alpha, lambda, histogram, batch, softmax);

  // bind initialization buttons
  $("input[name='mnist_init']").on("change", function () {
    $("#mnist_reset").click();
    alpha = this.value
    train = mnist.train(alpha, lambda, histogram, batch, softmax);
  });

  $("#lambda_sparsity").on("input", function () {
    $("#mnist_reset").click();
    $("#lambda_sparsity_val").html(d3.format(".2")(this.value));
    lambda = this.value
    train = mnist.train(alpha, lambda, histogram, batch, softmax);
  });

  // reset training button
  d3.select("#mnist_reset").on("click", function() {
    train.reset();
    d3.select("#mnist_start").classed("hidden", false);
    d3.select("#mnist_stop").classed("hidden", true);
  });

  // start training button
  d3.select("#mnist_start").on("click", function() {
    train.start();
    d3.select("#mnist_start").classed("hidden", true);
    d3.select("#mnist_stop").classed("hidden", false);
  });

  // stop training button
  d3.select("#mnist_stop").on("click", function() {
    train.stop();
    d3.select("#mnist_start").classed("hidden", false);
    d3.select("#mnist_stop").classed("hidden", true);
  });

  // step train button
  d3.select("#mnist_step").on("click", function() {
    train.step();
  });

  // load mnist
  d3.select("#mnist_load").on("click", function() {
    // extract zip
    extract('data/mnist_test.csv.zip', mnist.data, batch);
    // change button activations
    d3.select("#mnist_load").classed("inactive", true)
    d3.select("#mnist_start").classed("inactive", false)
    d3.select("#mnist_step").classed("inactive", false)
  });

}

// wait until all documents load then setup
$(window).load(function() {
  mnist_setup();
});

// make sure training stops when visualization is not in viewport
$(window).on('resize scroll', function() {
  if(!$("#mnist").inView()) {
    $("#mnist_stop").click();
  }
});