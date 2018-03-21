
//////////////////////////
// load clickable images of datasets
//////////////////////////
function load_datasets() {
  // setup dimensions
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 250 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom
      padding = 10;

  // add svg
  var svg = d3.select("#datasets").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // setup scales
  var x = d3.scale.linear()
    .domain([0,1])
    .range([0, width]);
  var y = d3.scale.linear()
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
      .attr('xlink:href', function(d) { return 'img/' + d; });
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
  var images = ['circle.png', 'spiral.png', 'square.png', 'gaussian.png'];
  return load(images);
}



//////////////////////////
// create legend
//////////////////////////
function create_legend() {

  // setup dimensions
  var margin = {top: 5, right: 30, bottom: 20, left: 30},
      width = 250 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

  // add svg
  var svg = d3.select("#legend").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // scales
  var x = d3.scale.linear()
    .domain([0,1])
    .range([40,width])
  var y = d3.scale.linear()
    .domain([0,1])
    .range([0,height])
  var c1 = d3.scale.linear()
    .domain([0,0.5,1])
    .range(['#FF8686','#FFFFFF','#8FDEFF']);
  var c2 = d3.scale.linear()
    .domain([0,0.5,1])
    .range(['#F5D800','#FEF9D4','#FF9B41']);

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
      .text("Node:")
      .attr("class", "label");
  }
  
  // load scale gradient legend
  function gradient(color, id, x_cord, y_cord) {

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
      .attr("width", width - 40)
      .attr("height", 10);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(3);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (y(y_cord) + 10) + ")")
      .call(xAxis);

    svg.append("text")
      .attr("x", 0)
      .attr("y", y(y_cord) + 5)
      .attr("dy", "2.5")
      .style("text-anchor", "start")
      .text(id + ":")
      .attr("class", "label");
  }

  // Create Variance slider
  $( "#slider" ).slider({
      value: 2,
      min: 0,
      max: 3,
      step: 1
  })
  .each(function() {

    var opt = $(this).data().uiSlider.options,
        vals = opt.max - opt.min,
        labels = ["All Zeros", "Too Small", "Xe Initialization", "Too Large"];

    for (var i = 0; i <= vals; i++) {
      var el = $('<label>'+labels[i] +'</label>').css('left',(i / vals * 100)+'%');
      $( "#slider" ).append(el);
    }

  });

  // load legend
  add(['Input', 'Relu', 'Sigmoid']);
  gradient(c1, "Data", 0, 0);
  gradient(c2, "Link", 0, 0.45);

  return true;
}



//////////////////////////
// initialize network
//////////////////////////
function setup_network() {

  // setup dimensions
  var margin = {top: 0, right: 25, bottom: 0, left: 25},
      width = 500 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  // add svg
  var svg = d3.select("#network").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // setup scales
  var x = d3.scale.linear()
    .domain([0,1])
    .range([0, width]);
  var y = d3.scale.linear()
    .domain([0,1])
    .range([0, height]);
  var z = d3.scale.linear()
    .range([1,10])
    .clamp(true);
  var color = d3.scale.linear()
    .range(['#F5D800','#FEF9D4','#FF9B41'])
    .clamp(true);
  var activation = ['white', '#f5d800', '#f5d800', '#46c8b2'];

  // setup node and link structures
  function unit(layer, index) {
    return {'layer': layer, 'index': index};
  }
  function weight(source, target) {
    return {'source': source, 'target': target, 'weight': 0, 'style':"link"};
  }
  // create node data
  var layers = [2, 6, 3, 1],
      nodes = [];
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
        .style("fill", function(d) { return activation[d.layer]; })
        .style("stroke", "black")
        .style("stroke-width", "2px");

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
        .attr("class", function(d) { return d.style});

    line.enter().append("line")
        .attr("x1", function(d) { return x_position(d.source) })
        .attr("y1", function(d) { return y_position(d.source); })
        .attr("x2", function(d) { return x_position(d.target); })
        .attr("y2", function(d) { return y_position(d.target); })
        .attr("class", function(d) { return d.style});

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
function loss_plot() {

  // setup dimensions
  var margin = {top: 30, right: 40, bottom: 35, left: 40},
      width = 250 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  // add svg
  var svg = d3.select("#loss").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // scales
  var x = d3.scale.linear()
    .domain([])
    .range([0,width]);
  var y = d3.scale.linear()
    .domain([])
    .range([height,0]);

  // axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(3);
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(3);

  // axis groups
  var xGroup = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  var yGroup = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);

  // axes labels
  svg.append("text")
    .text("Epoch")
    .attr("class", "label")
    .attr("dy", "-5px")
    .attr("transform", "translate(" + width / 2 + "," + (height + margin.bottom) + ")");              
  svg.append("text")
    .text("Loss")
    .attr("class", "label")
    .attr("dy", "-10px")
    .attr("transform", "translate(" + -margin.left / 2 + "," + height / 2 + ")rotate(-90)");

  // path function
  var line = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d); })
    .interpolate("basis");

  // plot error curve
  function update(data) {

    y.domain([0, d3.max(data)]);
    yGroup.call(yAxis);

    x.domain([0, data.length]);
    xGroup.call(xAxis);

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
function prediction_plot() {

  // setup dimensions
  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = 250 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  // add parent div
  var output = d3.select("#output").append("div")
    .style({"position": "relative", "width": 250 + "px", "height": 250 + "px"});

  // add canvas
  var canvas = output.append("canvas")
    .style("width", function(){ return width + "px"; })
    .style("height", function(){ return height + "px"; })
    .style({"position": "absolute", "left": margin.left + "px", "top": 0 + "px"});

  // add svg
  var svg = output.append("svg")
    .attr("width", width + margin.right)
    .attr("height", height + margin.bottom)
    .style({"position": "absolute", "left": margin.left, "top": 0});

  // scales
  var x = d3.scale.linear()
    .domain([-5,5])
    .range([0, width]);
  var y = d3.scale.linear()
    .domain([-5,5])
    .range([height, 0]);
  var color = d3.scale.linear()
    .domain([0,0.5,1])
    .range(['#FF8686','#FFFFFF','#8FDEFF']);

  // axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(6);
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right")
      .ticks(6);

  // axes groups
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height + 3) + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (width + 3) + ",0)")
    .call(yAxis);

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
function setup() {
  // setup network
  var datasets = load_datasets(),
      legend = create_legend(),
      network_update = setup_network(),
      loss_update = loss_plot(),
      prediction_update = prediction_plot();
  // reset viz
  function reset() {
    stop = true;
    network_update([], "link");
    loss_update([]);
    prediction_update([],[[0.5]]);
  }
  d3.select("#reset").on("click",reset);
  // bind data
  datasets.on("click", function(d, i) {
    reset();
    var data = generate_data(100, i);
    prediction_update(data, [[0.5]]);
    d3.select("#train").on("click", function() {
      stop = false;
      train(data, prediction_update, network_update, loss_update);
    });
  });
  // bind radio buttons
  $("input[name='link']").on("change", function () {
    style = this.value;
  });
}  


// wait until all documents load then setup
$(window).load(function() {
  setup();
});

