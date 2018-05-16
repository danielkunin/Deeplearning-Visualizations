class optimizer {

  // constructor
  constructor(rule, loss, svg) {
    this.rule = rule;
    this.config = {
      'lrate': 1e-3,
      'ldecay': 1,
      'drate': 0.9,
      'v': point(0,0),
      'm': point(0,0),
      'mu': 0.9,
      'cache': point(0,0),
      'beta1': 0.9,
      'beta2': 0.999,
      'eps': 1e-8,
      't': 0
    }

    this.training = null;
    this.initial = point(0,0);
    this.paths = [];
    this.costs = [];

    this.loss = loss;

    this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    this.svg = svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.width = +svg.attr("width") - this.margin.left - this.margin.right,
    this.height = +svg.attr("height") - this.margin.top - this.margin.bottom;

    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);
    this.color = d3.scaleOrdinal(d3.schemeAccent);

    this.setup();
  }

  reset() {
	this.config = {
      'lrate': 1e-3,
      'ldecay': 1,
      'drate': 0.9,
      'v': point(0,0),
      'm': point(0,0),
      'mu': 0.9,
      'cache': point(0,0),
      'beta1': 0.9,
      'beta2': 0.999,
      'eps': 1e-8,
      't': 0
    }
	if (this.training != null) {
    this.training.stop();
    d3.timerFlush();
  }
	this.pos = this.initial;
	this.paths = [];
	this.costs = [];
	this.plotPath();
  this.plotCost();
  }

  init() {

    var xscale = this.loss.x;
    var yscale = this.loss.y;

    function dragstart(d) {
      d3.select(this).raise().classed("active", true);
    }
    function dragged(d) {
      d3.select(this)
      .attr("cx", xscale.invert(d.x = d3.event.x))
      .attr("cy", yscale.invert(d.y = d3.event.y));
    }
    function dragend(d) {
      d3.select(this).classed("active", false);
    }


  	var x = Math.random() * (this.loss.x.domain()[1] - this.loss.x.domain()[0]) + this.loss.x.domain()[0],
  		  y = Math.random() * (this.loss.y.domain()[1] - this.loss.y.domain()[0]) + this.loss.y.domain()[0];
  	this.initial = point(x, y);

  	var circle = this.loss.svg.selectAll("circle")
  	  .data([this.initial]);

    circle.enter().append("circle")
      .attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      .attr("r", 4)
      .style("fill", "black")
      .style("stroke-width", 2)
      .style("stroke", "white")
      .call(d3.drag()
        .on("start", dragstart)
        .on("drag", dragged)
        .on("end", dragend));

    circle.attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      .raise();

    circle.exit().remove();

    this.pos = this.initial;

  }

  update() {
  	// update parameter configurations
  }

  step() {
  	var dx = this.loss.gradient(this.pos.x, this.pos.y),
  		  update = algorithms[this.rule](this.pos, dx, this.config);
  	this.pos = clamp(update[0], this.loss.x.domain(), this.loss.y.domain());
  	this.config = update[1];
    return dx;
  }

  train() {
  	this.training = d3.timer(() => {
	  	this.paths.push(this.pos);
	  	this.costs.push(this.loss.value(this.pos.x, this.pos.y));
	  	this.plotCost();
	  	this.plotPath();
	  	this.config['t'] += 1;
      var dx = this.step();
  	  if (l2norm(dx) < 1e-2) {
        this.training.stop();
      }
  	}, 200);
  }

  plotCost() {

	var line = d3.line()
	  .x((d, i) => { return this.x(i); })
	  .y((d) => { return this.y(d); })
	  .curve(d3.curveBasis);

	this.y.domain([0, d3.max(this.costs, function(d) { return d; })]);
  this.yaxis.call(d3.axisLeft(this.y).ticks(3, "s"));

  this.x.domain([0, this.costs.length]);
  this.xaxis.call(d3.axisBottom(this.x).ticks(3, "s"));

    var path = this.svg.selectAll("path.loss")
      .data([this.costs]);

    path.enter().append("path")
      .attr("class", "loss");

    path.attr("d", line)
      .attr("stroke", 'black')//(d, i) => { return this.color(i); })
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    path.exit().remove();

  }

  plotPath() {

	var line = d3.line()
	  .x((d) => { return this.loss.x(d.x); })
	  .y((d) => { return this.loss.y(d.y); })
	  .curve(d3.curveBasis);

    var path = this.loss.svg.selectAll("path.trajectory")
      .data([this.paths]);

    path.enter().append("path")
      .attr("class", "trajectory")
      .attr("d", line)
      .attr("stroke", 'black')//(d, i) => { return this.color(i); })
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    path.attr("d", line)
      .raise();

    path.exit().remove();

  }

  setup() {
    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));

    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(this.y).ticks(3, "s"));

    this.svg.append("text")
      .text("Epoch")
      .attr("class", "label")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.margin.bottom / 2) + ")");

    this.svg.append("text")
      .text("Cost")
      .attr("class", "label")
      .attr("transform", "translate(" + -this.margin.left / 2 + "," + this.height / 2 + ")rotate(-90)");

  }
}

// Gradient Descent Algorithms
var algorithms = {
	'sgd': sgd,
	'momentum': momentum,
	'nesterov': nesterov,
	'adagrad': adagrad,
	'rmsprop': rmsprop,
	'adam': adam
}

// Stochastic Gradient Descent
function sgd(x, dx, config) {
  x = add(x, scale(dx, -config['lrate']));
  return [x, config];
}

// Stochastic Gradient Descent with Momentum
function momentum(x, dx, config) {
  config['v'] = sub(scale(config['v'], config['mu']), scale(dx, config['lrate']));
  x = add(x, config['v']);
  return [x, config];
}

// Nesterov Accelerated Gradient
function nesterov(x, dx, config) {
  var v_prev = config['v'];
  config['v'] = sub(scale(config['v'], config['mu']), scale(dx, config['lrate']));
  x = add(x, add(scale(v_prev, -config['mu']), scale(config['v'], 1 + config['mu']))) ;
  return [x, config];
}

// Adagrad
function adagrad(x, dx, config) {
  config['cache'] = add(config['cache'], square(dx));
  x = add(x, div(scale(dx, -config['lrate']), shift(sqrt(config['cache']), config['eps'])));
  return [x, config];
}

// RMSprop
function rmsprop(x, dx, config) {
  config['cache'] = add(scale(config['cache'], config['drate']), scale(square(dx), (1 - config['drate'])));
  x = add(x, div(scale(dx, -config['lrate']), shift(sqrt(config['cache']), config['eps'])));
  return [x, config];
}

// Adam
function adam(x, dx, config) {
  config['m'] = add(scale(config['m'],config['beta1']), scale(dx, 1 - config['beta1']));
  var mt = scale(config['m'], 1 / (1 - config['beta1']**config['t']));
  config['v'] = add(scale(config['v'], config['beta2']), scale(square(dx), 1 - config['beta2']));
  var vt = scale(config['v'], 1 / (1 - config['beta2']**config['t']));
  x = add(x, div(scale(mt, -config['lrate']), shift(sqrt(vt), config['eps'])));
  return [x, config];
}



// Add noise to simulate Stochastic Batch?
// Add second/quasi-newton methods? (L-BFGS)
// Visualizing acutal Loss space with random weight matrix...(CS231n notes)