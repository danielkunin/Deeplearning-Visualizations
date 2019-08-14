
//////////////////////////
// load clickable images of datasets
//////////////////////////
function playground_dataset() {
  // setup dimensions
  var margin = {top: 10, right: 20, bottom: 10, left: 20},
      width = 250 - margin.left - margin.right,
      height = 230 - margin.top - margin.bottom
      padding = 10;

  // add svg
  var svg = addSVG("#playground_dataset", width, height, margin);

  // setup scales
  var x = d3.scaleLinear()
    .domain([0,1])
    .range([0, width]);
  var y = d3.scaleLinear()
    .domain([0,1])
    .range([0,height]);

  // load images and borders
  function load(data) {
    svg.selectAll("image")
      .data(data)
      .enter().append("image")
      .attr('x', function(d,i) { return Math.floor(i / 2) * (width / 2 + padding); })
      .attr('y', function(d,i) { return(i % 2) * (height / 2 + padding); })
      .attr('width', width / 2 - padding)
      .attr('height',height / 2 - padding)
      .attr('xlink:href', function(d) { return '../assets/images/article/initialization/' + d; });
    var rects = svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("class", "dataset")
      .attr('x', function(d,i) { return Math.floor(i / 2) * (width / 2 + padding); })
      .attr('y', function(d,i) { return(i % 2) * (height / 2 + padding); })
      .attr('width', width / 2 - padding)
      .attr('height',height / 2 - padding);
    return rects;
  }

  // add images
  var images = ['circle.png', 'moon.png', 'square.png', 'gaussian.png'];
  return load(images);
}



//////////////////////////
// create legend
//////////////////////////
function playground_legend() {

  // setup dimensions
  var margin = {top: 5, right: 30, bottom: 20, left: 0},
      width = 250 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  // add svg
  var svg = addSVG("#playground_legend", width, height, margin);

  // scales
  var x = d3.scaleLinear()
    .domain([0,1])
    .range([80,width])
  var y = d3.scaleLinear()
    .domain([0,1])
    .range([0,height])
  var c1 = d3.scaleLinear()
    .domain([0,1])
    .range(['#FF8686','#8FDEFF']);
  var c2 = d3.scaleLinear()
    .domain([0,0.5,1])
    .range(['#FF9B41','#F5D800','#46c8b2']);

  // create activation unit legend
  function add(data) {
    svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", function(d, i) { return x(i / data.length) + 8; })
    .attr("cy", height)
    .attr("r", 8)
    .attr("class", function(d) { return d; });

    svg.selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d, i) { return x(i / data.length) + 20; })
    .attr("y", height)
    .attr("dy", "2.5")
    .style("text-anchor", "start")
    .text(function(d) { return d; })
    .attr("class", "label");

    svg.append("text")
      .attr("x", 0)
      .attr("y", height)
      .attr("dy", "2.5")
      .style("text-anchor", "start")
      .text("Node Type:")
      .attr("class", "label");
  }
  
  // load scale gradient legend
  function gradient(color, id, x_cord, y_cord, ticks) {

    var defs = svg.append("defs");

    var linearGradient = defs.append("linearGradient")
      .attr("id", "gradient-" + id);

    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient.selectAll("stop") 
      .data(color.range())                  
      .enter().append("stop")
      .attr("offset", function(d,i) { return i/(color.range().length-1); })
      .attr("stop-color", function(d) { return d; });

    var legend = svg.append("rect")
      .style("fill", "url(#gradient-" + id + ")")
      .attr("stroke-width",2)
      .attr('stroke','black')
      .attr("x", x(x_cord))
      .attr("y", y(y_cord))
      .attr("width", width - 80)
      .attr("height", 10);

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (y(y_cord) + 10) + ")")
      .call(d3.axisBottom(x)
        .ticks(3, "s")
        .tickFormat(function(d, i) { return ticks[i]; }));

    svg.append("text")
      .attr("x", 0)
      .attr("y", y(y_cord) + 5)
      .attr("dy", "2.5")
      .style("text-anchor", "start")
      .text(id + ":")
      .attr("class", "label");
  }

  // load legend
  add(['Input', 'Relu', 'Sigmoid']);
  gradient(c1, "Label/Prediction", 0, 0.1, ["0", "0.5", "1"]);
  gradient(c2, "Weight/Gradient", 0, 0.5, ["neg", "zero", "pos"]);

  return true;
}



//////////////////////////
// initialize network
//////////////////////////
function playground_network(layers) {

  // setup dimensions
  var margin = {top: 0, right: 25, bottom: 0, left: 25},
      width = 500 - margin.left - margin.right,
      height = 325 - margin.top - margin.bottom;

  // add svg
  var svg = addSVG("#playground_network", width, height, margin);

  // setup scales
  var x = d3.scaleLinear()
    .domain([0,1])
    .range([0, width]);
  var y = d3.scaleLinear()
    .domain([0,1])
    .range([0, height]);
  var z = d3.scaleLinear()
    .range([2,10])
    .clamp(true);
  var color = d3.scaleLinear()
    .range(['#FF9B41','#F5D800','#46c8b2'])
    .clamp(true);

  // setup node and link structures
  function unit(layer, index) {
    return {'layer': layer, 'index': index};
  }
  function weight(source, target) {
    return {'source': source, 'target': target, 'weight': 0, 'style':"connected"};
  }
  // create node data
  var nodes = [];
  for (var i = 0; i < layers.length; i++) {
    for (var j = 0; j < layers[i]; j++) {
      nodes.push(unit(i,j));
    }
  }
  // create link data
  var links = [];
  for (var i = 0; i < layers.length - 1; i++) {
    for (var j = 0; j < layers[i]; j++) {
      for (var k = 0; k < layers[i + 1]; k++) {
        links.push(weight(unit(i,j),unit(i+1,k), uniform(-1,1)));
      }
    }
  }

  // return x coord
  function x_position(unit) {
    return x(unit.layer / (layers.length - 1));
  }

  // return y coord
  function y_position(unit) {
    return y((unit.index + 1) / (layers[unit.layer] + 1));
  }

  // load nodes
  function update_nodes(data) {
    var circle = svg.selectAll("circle").data(data);

    circle.enter().append("circle")
        .attr("cx", function(d) { return x_position(d); })
        .attr("cy", function(d) { return y_position(d); })
        .attr("r", 10)
        .attr("class", function(d,i) {
          if (d.layer == 0)                       return "Input";
          else if (d.layer == layers.length - 1)  return "Sigmoid";
          else                                    return "Relu";
        });

    circle.exit().remove();
  }

  // load links
  function update_links(data) {

    var mean = Math.max(0.01, d3.mean(data, function(d) { return Math.abs(d.weight); }));
    z.domain([0, 2 * mean]);
    color.domain([-2 * mean, 0, 2 * mean]);

    var line = svg.selectAll("line").data(data);

    line.attr("stroke", function(d) { return color(d.weight); })
        .attr("stroke-width", function(d) { return z(Math.abs(d.weight)); })
        .attr("class", function(d) { return 'link ' + d.style});

    line.enter().append("line")
        .attr("x1", function(d) { return x_position(d.source) })
        .attr("y1", function(d) { return y_position(d.source); })
        .attr("x2", function(d) { return x_position(d.target); })
        .attr("y2", function(d) { return y_position(d.target); })
        .attr("class", function(d) { return 'link ' + d.style});

    line.exit().remove();
  }

  // create nodes and links
  update_links(links);
  update_nodes(nodes);

  // Add input labels
  svg.append("text")
    .text("X1")
    .attr("x", x_position(nodes[0]))
    .attr("y", y_position(nodes[0]))
    .attr("dy", "2.5px")
    .attr("class", "label");
  svg.append("text")
    .text("X2")
    .attr("x", x_position(nodes[1]))
    .attr("y", y_position(nodes[1]))
    .attr("dy", "2.5px")
    .attr("class", "label");

  // update function
  function update(weights, style) {
    for (var i = 0; i < weights.length; i++) {
      links[i].weight = weights[i];
    }
    for (var i = 0; i < links.length; i++) {
      links[i].style = style;
    }
    update_links(links);
  }

  return update;
}


//////////////////////////
// setup loss plot
//////////////////////////
function playground_loss() {

  // setup dimensions
  var margin = {top: 30, right: 40, bottom: 35, left: 60},
      width = 300 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  // add svg
  var svg = addSVG("#playground_loss", width, height, margin);

  // scales
  var x = d3.scaleLinear()
    .domain([])
    .range([0,width]);
  var y = d3.scaleLinear()
    .domain([])
    .range([height,0]);

  // axis groups
  var xGroup = svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(3, "s"));

  var yGroup = svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(0,0)")
    .call(d3.axisLeft(y).ticks(3, "s"));

  // axes labels
  svg.append("text")
    .text("Epoch")
    .attr("class", "label")
    .attr("dy", "-5px")
    .attr("transform", "translate(" + width / 2 + "," + (height + margin.bottom) + ")");              
  svg.append("text")
    .text("Cost")
    .attr("class", "label")
    .attr("dy", "-12px")
    .attr("transform", "translate(" + -margin.left / 2 + "," + height / 2 + ")rotate(-90)");

  // path function
  var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return isFinite(d) ? y(d) : y.range()[1]; })
    .curve(d3.curveBasis);

  // plot error curve
  function update(data) {

    y.domain([0, d3.max(data, function(d) { return isFinite(d) ? d : 0; })]);
    yGroup.call(d3.axisLeft(y).ticks(3, "s"));

    x.domain([0, data.length]);
    xGroup.call(d3.axisBottom(x).ticks(3, "s"));

    var path = svg.selectAll("path.loss")
      .data([data]);

    path.enter().append("path")
      .attr("class", "loss");

    path.attr("d", line)
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("fill", "none");
  }

  return update;
}



//////////////////////////
// setup prediction plot
//////////////////////////
function playground_pred() {

  // setup dimensions
  var margin = {top: 60, right: 40, bottom: 40, left: 0},
      width = 240 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  // add parent div
  var output = d3.select("#playground_pred").append("div")
    .style("position","relative")
    .style("width", 250)
    .style("height", 250);

  // add canvas
  var canvas = output.append("canvas")
    .style("width", width + "px")
    .style("height", height + "px")
    .style("position", "absolute")
    .style("left", margin.left + "px")
    .style("top", 0 + "px")
    .style("border", "2px solid black");

  // add svg
  var svg = output.append("svg")
    .attr("width", width + margin.right + "px")
    .attr("height", height + margin.bottom + "px")
    .style("position", "absolute")
    .style("left", margin.left + "px")
    .style("top", 0 + "px");

  // scales
  var x = d3.scaleLinear()
    .domain([-5,5])
    .range([0, width]);
  var y = d3.scaleLinear()
    .domain([-5,5])
    .range([height, 0]);
  var color = d3.scaleLinear()
    .domain([0,1])
    .range(['#FF8686','#8FDEFF']);

  // axes groups
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height + 3) + ")")
    .call(d3.axisBottom(x).ticks(6, "s"));
  svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + (width + 3) + ",0)")
    .call(d3.axisRight(y).ticks(6, "s"));

  // axes labels
  svg.append("text")
    .text("X1")
    .attr("class", "label")
    .attr("dy", "-5px")
    .attr("transform", "translate(" + width / 2 + "," + (height + margin.bottom) + ")");              
  svg.append("text")
    .text("X2")
    .attr("class", "label")
    .attr("dy", "10px")
    .attr("transform", "translate(" + (width + margin.right) + "," + height / 2 + ")rotate(90)");


  // plot points
  function points(data) {

    var circle = svg.selectAll("circle").data(data);

    circle.enter().append("circle")
        .attr("cx", function(d) { return x(d.x1); })
        .attr("cy", function(d) { return y(d.x2); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.y); })
        .style("stroke-width", 2)
        .style("stroke", "white");

    circle.exit().remove();
  }

  // draw heatmap
  function heatmap(grid) {

    var n = Math.floor(Math.sqrt(grid.length));

    canvas.attr("width", n).attr("height", n);

    var context = canvas.node().getContext("2d"),
        image = context.createImageData(n, n);

    for (var j = 0, k = 0, l = 0; j < n; ++j) {
      for (var i = 0; i < n; ++i, ++k, l += 4) {
        var c = d3.rgb(color(grid[k]));
        image.data[l + 0] = c.r;
        image.data[l + 1] = c.g;
        image.data[l + 2] = c.b;
        image.data[l + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
  }

  // update plot
  function update(data, grid) {
    points(data);
    heatmap(grid);
  }

  return update;
}




// setup visualization and bind on click functions 
function playground_setup() {

  // define layers and setup plots
  var layers = [2, 6, 3, 1],
      datasets = playground_dataset(),
      legend = playground_legend(),
      network = playground_network(layers),
      loss = playground_loss(),
      pred = playground_pred();

  // create PLAYGROUND object
  var playground = PLAYGROUND(layers);

  // bind initialization buttons
  $("input[name='playground_init']").on("change", function () {
    $("#playground_reset").click();
  });

  // reset visualization
  function clear() {
    // clear input datasets
    datasets.classed('active', false);
    // update plots
    network([], "connected");
    loss([]);
    pred([],[[0.5]]);
  }


  // load data and bind training buttons
  datasets.on("click", function(d, i) {

    // reset visualization
    $("#playground_reset").click();
    clear();

    // highlight current dataset
    d3.select(this).classed('active', true);

    // generate data
    var data = generate_data(100, i);
    pred(data, [[0.5]]);

    // create playground training
    var train = playground.train(data, pred, network, loss);

    // reset training button
    d3.select("#playground_reset").on("click", function() {
      train.reset();
      d3.select("#playground_start").classed("hidden", false);
      d3.select("#playground_stop").classed("hidden", true);
    });

    // start training button
    d3.select("#playground_start").on("click", function() {
      train.start();
      d3.select("#playground_start").classed("hidden", true);
      d3.select("#playground_stop").classed("hidden", false);
    });

    // stop training button
    d3.select("#playground_stop").on("click", function() {
      train.stop();
      d3.select("#playground_start").classed("hidden", false);
      d3.select("#playground_stop").classed("hidden", true);
    });

    // step train button
    d3.select("#playground_step").on("click", function() {
      train.step();
    });

    // remove inactive
    d3.select("#playground_start").classed("inactive", false)
    d3.select("#playground_step").classed("inactive", false)

  });

  // Load first dataset
  d3.select('#playground_dataset svg rect').dispatch('click');

}  



// wait until all documents load then setup
$(window).load(function() {
  playground_setup();
});

// make sure training stops when visualization is not in viewport
$(window).on('resize scroll', function() {
  if(!$("#playground").inView()) {
    $("#playground_stop").click();
  }
});
