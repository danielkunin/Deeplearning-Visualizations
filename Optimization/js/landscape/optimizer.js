class optimizer {

  constructor(line, loss, svg) {

  	// global parameters
    this.lrate = 0;
    this.ldecay = 1;
    this.epoch = 0;

    // location and loss data
    this.training = null;
    this.initial = point(0,0);
    this.rule = [];
    this.config = [];
    this.pos = [];
    this.paths = [];
    this.costs = [];

    // loss landscape
    this.line = line;
    this.loss = loss;

    // cost plot
    this.pad = 30;
    this.margin = {top: 20, right: 80, bottom: 50, left: 40};
    this.svg = svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.width = +svg.attr("width") - this.margin.left - this.margin.right,
    this.height = +svg.attr("height") - this.margin.top - this.margin.bottom;

    // scales
    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);
    this.color = d3.scaleOrdinal().domain([]).range(d3.schemeAccent);

    // setup axes
    this.setup();
  }

  reset() {
  	// stop training
	if (this.training != null) {
		this.training.stop();
		d3.timerFlush();
	}

	// reset parameters
	this.epoch = 0;
	this.config = []
	this.pos = [];
	this.paths = [];
	this.costs = [];

	// update plots
	this.plotPath();
  this.plotCost();
  }

  init() {

    var xscale = this.loss.x;
    var yscale = this.loss.y;


  	var x = Math.random() * (xscale.domain()[1] - xscale.domain()[0]) + xscale.domain()[0],
  		  y = Math.random() * (yscale.domain()[1] - yscale.domain()[0]) + yscale.domain()[0];

    $("input[name='x']").val(x);
    $("input[name='y']").val(y);

  	this.initial = point(x, y);

  	var circle = this.loss.svg.selectAll("circle")
  	  .data([this.initial]);

    circle.enter().append("circle")
      .attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      .attr("r", 4)
      .style("fill", "black")
      .style("stroke-width", 2)
      .style("stroke", "white");

    circle.attr("cx", (d) => { return this.loss.x(d.x); })
      .attr("cy", (d) => { return this.loss.y(d.y); })
      .raise();

    circle.exit().remove();

  }


  update() {
	 // update parameter configurations
    // update color scale
    this.color.domain(this.rule);

    // update legend
    var logLegend = this.legend
      .scale(this.color);
    this.svg.select(".legend").call(logLegend);
  }


  step(pos,config,rule,i) {

  	// get gradient and apply update
  	var dx = this.loss.gradient(pos.x, pos.y),
  		update = algorithms[rule](pos, dx, config);

  	// update position and configuration
  	this.pos[i] = update[0];
  	this.config[i] = update[1];

    return dx;
  }

  stop() {
    if (this.training != null) {
      this.training.stop();
    }
  }
  start() {
    if (this.training != null) {
      this.training.start();
    }
  }

  train() {

  	// initialize positions and configurations
  	this.rule.forEach((e,i) => {
  		this.config.push(Object.assign({}, parameters));
  		this.pos.push(this.initial);
  		this.paths.push([]);
		  this.costs.push([]);
  	});

  	// iterate positions and configurations
	this.training = d3.timer(() => {

		var done = true;
		this.epoch += 1;
		this.rule.forEach((e,i) => {

			var config = this.config[i],
				pos = this.pos[i],
				loss = this.loss.value(pos.x, pos.y);

			config['t'] = this.epoch;
			config["lrate"] = learningRates[e];
			var dx = this.step(pos,config,e,i);

			if (inrange(pos,[-1e4,1e4],[-1e4,1e4]) && isFinite(loss)) {
				this.paths[i].push(pos);
				this.costs[i].push(loss);
				done = done && (l2norm(dx) < 1e-1);
			} else {
				done = true;
			}
		});
		this.plotCost();
		this.plotPath();
		if (done) {
			this.training.stop();
		}
	}, 200);
  }

  plotCost() {

  	// line function
	var line = d3.line()
	  .x((d, i) => { return this.x(i); })
	  .y((d, i) => { return isFinite(d) ? this.y(d) : this.y.range()[1]; })
	  .curve(d3.curveBasis);

	// update y axis
	// var maxLoss = 0;
	// this.costs.forEach((cost) => {
	// 	maxLoss = Math.max(maxLoss, d3.max(cost, function(d) { return isFinite(d) ? d : 0; }));
	// })
  var maxLoss = this.costs.length != 0 ? this.costs[0][0] : 0;
	this.y.domain([0,maxLoss])
	this.yaxis.call(d3.axisLeft(this.y).ticks(3, "s"));

	// update x axis
	this.x.domain([0, this.epoch]);
	this.xaxis.call(d3.axisBottom(this.x).ticks(3, "s"));

	// bind
    var path = this.svg.selectAll("path.loss")
      .data(this.costs);

    // add
    path.enter().append("path")
      .attr("class", (d, i) => { return "loss " + this.rule[i]; });

    // update
    path.attr("d", line)
      .attr("stroke", (d, i) => { return this.color(this.rule[i]); })
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    // remove
    path.exit().remove();

  }

  plotPath() {

  	// line function
	var line = d3.line()
	  .x((d) => { return this.loss.x(d.x); })
	  .y((d) => { return this.loss.y(d.y); })
	  .curve(d3.curveBasis);

	// bind
    var path = this.loss.svg.selectAll("path.trajectory")
      .data(this.paths);

    // add
    path.enter().append("path")
      .attr("class", (d, i) => { return "trajectory " + this.rule[i]; })
      .attr("d", line)
      .attr("stroke", (d, i) => { return this.color(this.rule[i]); })
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    // update
    path.attr("d", line)
      .raise();

    // remove
    path.exit().remove();

  }

  setup() {

  	// add axis
    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));
    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(this.y).ticks(3, "s"));

    // add label
    this.svg.append("text")
      .text("Epoch")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging"); 
    this.svg.append("text")
      .text("Cost")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")rotate(-90)")
      .attr("alignment-baseline","baseline");  

    // add legend
    this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (this.width + this.pad / 2) + ",0)"); 
    this.legend = d3.legendColor()
      .title("Optimizer")
      .on("cellover", function(d) {
        d3.selectAll(".trajectory").style("display", "none");
        d3.selectAll(".loss").style("display", "none");
        d3.selectAll("." + d).style("display", "initial");
      })
      .on("cellout", function(d) {
        d3.selectAll(".trajectory").style("display", "initial");
        d3.selectAll(".loss").style("display", "initial");
      });
  }

}

// Gradient Descent Algorithms
var algorithms = {
	'gd': gd,
	'momentum': momentum,
	'nesterov': nesterov,
	'adagrad': adagrad,
	'rmsprop': rmsprop,
	'adam': adam
}
var algorithmTitles = {
  'gd': 'Gradient Descent',
  'momentum': 'Momentum',
  'nesterov': 'Nesterov',
  'adagrad': 'Adagrad',
  'rmsprop': 'RMSprop',
  'adam': 'Adam'
}
// Gradient Descent Learning Rates
var learningRates = {
	'gd': 1e-3,
	'momentum': 1e-3,
	'nesterov': 1e-3,
	'adagrad': 5e-1,
	'rmsprop': 1e-2,
	'adam': 1e-2
}
// Default Parameters
var parameters = {
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

// Stochastic Gradient Descent
function gd(x, dx, config) {
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