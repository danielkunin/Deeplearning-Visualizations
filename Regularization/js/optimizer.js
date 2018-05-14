class optimizer {

  // constructor
  constructor(rule, loss, svg) {
    this.rule = rule;
    this.config = {
      'lrate': 1e-3,
      'ldecay': 1,
      'v': point(0,0),
      'm': point(0,0),
      'mu': 0.9,
      'cache': point(0,0),
      'beta1': 0.9,
      'beta2': 0.999,
      'eps': 1e-8,
      't': 0
    }

    this.training = false;
    this.pos = point(0,0);
    this.paths = [];
    this.costs = [];

    this.loss = loss;

    this.svg = svg
    this.width = +svg.attr("width"),
    this.height = +svg.attr("height");

    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);
    this.color = d3.scaleOrdinal(d3.schemeAccent);
  }

  reset() {
	this.config = {
      'lrate': 1e-3,
      'ldecay': 1,
      'v': point(0,0),
      'm': point(0,0),
      'mu': 0.9,
      'cache': point(0,0),
      'beta1': 0.9,
      'beta2': 0.999,
      'eps': 1e-8,
      't': 0
    }
	this.training = false;
	this.pos = point(0,0);
	this.paths = [];
	this.costs = [];
	this.plotPath();
  }

  init() {
  	var x = Math.random() * (this.loss.x.domain()[1] - this.loss.x.domain()[0]) + this.loss.x.domain()[0],
  		y = Math.random() * (this.loss.y.domain()[1] - this.loss.y.domain()[0]) + this.loss.y.domain()[0];
  	this.pos = point(x, y);

  	var circle = this.loss.svg.selectAll("circle")
  	  .data([this.pos]);

    circle.enter().append("circle")
      .attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      .attr("r", 4)
      .style("fill", "black")
      .style("stroke-width", 2)
      .style("stroke", "white");

    circle.attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      // TODO:  Add drag and drop feature

    circle.exit().remove();

  }

  update() {
  	// update parameter configurations
  }

  step() {
  	var dx = this.loss.gradient(this.pos.x, this.pos.y),
  		update = algorithms[this.rule](this.pos, dx, this.config);
  	this.pos = update[0];
  	this.config = update[1];
  }

  train() {
  	// if (!this.training) {
  	// 	return;
  	// }
  	// this.paths.push(new Point(this.pos.x, this.pos.y));
  	// this.costs.push(this.loss.value(this.pos));
  	// // this.plotCost();
  	// this.plotPath();
  	// this.config['t'] += 1;
  	// this.step();
  	// this.train();
  	this.training = true;

  	var t = d3.timer(() => {
	  	this.paths.push(this.pos);
	  	this.costs.push(this.loss.value(this.pos.x, this.pos.y));
	  	this.plotCost();
	  	this.plotPath();
	  	this.config['t'] += 1;
	  	var dx = this.loss.gradient(this.pos.x, this.pos.y),
  		update = algorithms[this.rule](this.pos, dx, this.config);
	  	this.pos = update[0];
	  	this.config = update[1];
	  if (!this.training || l2norm(dx) < 1e-5) t.stop();
	}, 200);
  }

  plotCost() {

	var line = d3.line()
	  .x((d, i) => { return this.x(i); })
	  .y((d) => { return this.y(d); })
	  .curve(d3.curveBasis);

	this.y.domain([0, d3.max(this.costs, function(d) { return d; })]);
    // yGroup.call(d3.axisLeft(y).ticks(3, "s"));

    this.x.domain([0, this.costs.length]);
    // xGroup.call(d3.axisBottom(x).ticks(3, "s"));

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

    path.attr("d", line);

    path.exit().remove();

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