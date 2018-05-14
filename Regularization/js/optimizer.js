class optimizer {

  // constructor
  constructor(rule, loss, svg) {
    this.rule = rule;
    this.config = {
      'lrate': 1e-3,
      'ldecay': 1,
      'v': 0,
      'm': 0,
      'cache': 0,
      'beta1': 0.9,
      'beta2': 0.999,
      'eps': 1e-8,
      't': 0
    }

    this.training = false;
    this.pos = 0;
    this.paths = [];
    this.costs = [];

    this.loss = loss;

    this.svg = svg
    this.width = +svg.attr("width"),
    this.height = +svg.attr("height");
  }

  reset() {
	this.config = {
		'lrate': 1e-3,
		'ldecay': 1,
		'v': Zero(),
		'm': Zero(),
		'cache': Zero(),
		'beta1': 0.9,
		'beta2': 0.999,
		'eps': 1e-8,
		't': 0
	}
	this.training = false;
	this.pos = Zero();
	this.paths = [];
	this.costs = [];
  }

  init() {

  }

  update() {

  }

  step() {
  	var dx = loss.gradient(this.x),
  		update = algorithms[this.rule](this.x, dx, this.config);
  	this.x = update[0];
  	this.config = update[1];
  }

  train() {
  	if (!this.training) {
  		return;
  	}
  	this.config['t'] += 1;
  	this.step();
  	this.path.push(this.x);
  	this.cost.push(this.loss.value(this.x));
  	this.plot();
  	this.train();
  }

  plot() {

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
  x += - config['lrate'] * dx;
  return (x, config);
}

// Stochastic Gradient Descent with Momentum
function momentum(x, dx, config) {
  config['v'] = config['mu'] * config['v'] - config['lrate'] * dx;
  x += config['v'];
  return (x, config);
}

// Nesterov Accelerated Gradient
function nesterov(x, dx, config) {
  var v_prev = config['v'];
  config['v'] = config['mu'] * config['v'] - config['lrate'] * dx;
  x += - config['mu'] * v_prev + (1 + config['mu']) * config['v'];
  return (x, config);
}

// Adagrad
function adagrad(x, dx, config) {
  config['cache'] += dx**2
  x += - config['lrate'] * dx / (sqrt(config['cache']) + config['eps']);
  return (x, config);
}

// RMSprop
function rmsprop(x, dx, config) {
  config['cache'] = config['drate'] * config['cache'] + (1 - config['drate']) * dx**2;
  x += - config['lrate'] * dx / (np.sqrt(config['cache']) + config['eps']);
  return (x, config);
}

// Adam
function adam(x, dx, config) {
  config['m'] = config['beta1'] * config['m'] + (1 - config['beta1']) * dx;
  var mt = config['m'] / (1 - config['beta1']**config['t']);
  config['v'] = config['beta2'] * config['v'] + (1 - config['beta2']) * (dx**2);
  var vt = config['v'] / (1 - config['beta2']**config['t']);
  x += - config['lrate'] * mt / (np.sqrt(vt) + config['eps']);
  return (x, config);
}


// Add noise to simulate Stochastic Batch?
// Add second/quasi-newton methods? (L-BFGS)
// Visualizing acutal Loss space with random weight matrix...(CS231n notes)