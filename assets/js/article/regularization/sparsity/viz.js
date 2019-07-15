
//////////////////////////
// setup hidden layers plot
//////////////////////////
function mnist_network(layers) {
  // setup dimensions
  var margin = {top: 20, right: 0, bottom: 20, left: 0},
      width = 450 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom
      pad = 30;

  // add svg
  var svg = addSVG("#mnist_network", width, height, margin)

  // setup scales
  var layout = d3.scaleLinear()
    .domain([0,1])
    .rangeRound([0, width]);
  var x = d3.scaleLinear()
    .domain([-0.2,0.2])
    .range([pad, width - pad]);
  var y = d3.scaleLinear()
    .domain([0,1])
    .range([height - pad, pad]);


  // function merge(data) {
  //   var length = 0;
  //   for (var i = 0; i < data.length; i++) {
  //     length += data[i].length;
  //   }
  //   var result = new Float32Array(length),
  //       start = 0;
  //   for (var i = 0; i < data.length; i++) {
  //     result.set(data[i], start);
  //     start += data[i].length;
  //   }
  //   return result;
  // }

  // histogram function
  function histogram(data) {

    // histogram data
    var activations = [],
        max = 0;
      for (var i = 0; i < data.length; i++) {
          var num = 200,
              bins = d3.histogram()
              .domain(x.domain())
              .thresholds(x.ticks(num))
              (data[i]);
          activations.push(bins);
          max = d3.max(bins, function(d) { return Math.max(max, d.length); });
      }
      // // histogram data
      // // merged_data = merge(data);
      // var num = 200,
      //     bins = d3.histogram()
      //       .domain(x.domain())
      //       .thresholds(x.ticks(num))
      //       (merged_data);
      // activations = [bins]
      // max = d3.max(bins, function(d) { return d.length; });
      // console.log(bins)

      // update y scale
      y.domain([0, 1.1 * max]);
      yaxis.call(d3.axisRight(y).ticks(5, "s"))

      // path function
      var valueline = d3.line()
        .x(function(d) { return x(d.x0); })
        .y(function(d) { return y(d.length); });

      // bind data to activation paths
      var lines = svg.selectAll("path.sparsity")
        .data(activations);

      // update path
      lines.attr("d", valueline);
  }

  // add histogram paths
  svg.append("path")
    .attr('class', 'sparsity')
    .attr('id', 'regularized');
  svg.append("path")
    .attr('class', 'sparsity')
    .attr('id', 'unregularized');

  // add bounding box
  svg.append("rect")
    .attr('x', pad)
    .attr('y', pad)
    .attr('width', width - 2 * pad)
    .attr('height', height - 2 * pad)
    .attr('class', 'sparsity');

  // add title
  svg.append('text')
    .attr('x', x(0))
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .text("Histogram of Weights");

  // add axes
  var xaxis = svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + y.range()[0] + ")")
    .call(d3.axisBottom(x).ticks(3, "s"));
  var yaxis = svg.append("g")
	.attr("class", "axis axis--y")
	.attr("transform", "translate(" + (width - pad) + ", 0)");

  return histogram;
}



//////////////////////////
// sumarrize training
//////////////////////////
function summary(batch, epoch) {
	$('#batch').html(batch);
	$('#epoch').html(epoch);
}


//////////////////////////
// setup MNIST visualization
//////////////////////////
function mnist_setup() {

  // define layers and setup plots
  var layers = [784,100,50,10],
      histogram = mnist_network();

  // create MNIST object
  var mnist = MNIST(layers),
      alpha = 1,
      lambda = 0.01,
      train = mnist.train(alpha, lambda, histogram, summary);

  // bind initialization buttons
  $("input[name='mnist_init']").on("change", function () {
    $("#mnist_reset").click();
    alpha = parseInt(this.value);
    train = mnist.train(alpha, lambda, histogram, summary);
  });

  $("input[name='lambda_sparsity']").on("change", function () {
    $("#mnist_reset").click();
    lambda = parseFloat(this.value);
    train = mnist.train(alpha, lambda, histogram, summary);
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
    extract('data/mnist_test.csv.zip', mnist.data);
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