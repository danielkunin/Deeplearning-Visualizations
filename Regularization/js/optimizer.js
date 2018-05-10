class optimizer {

  // constructor
  constructor(rule) {
    this.rule = rule;
    this.param = {
      'lRate': ,
      'lDecay': ,
      'v': ,
      'm': ,
      'cache': ,
      'beta1': ,
      'beta2': 
    }

    this.training = false;
    this.epoch = 0;
    this.loss = [];

    this.landscape = landscape
    this.width = +landscape.attr("width"),
    this.height = +landscape.attr("height");

    this.svg = svg
    this.width = +svg.attr("width"),
    this.height = +svg.attr("height");
  }

  reset() {

  }

  init() {

  }

  step() {

  }

  train() {

  }

}

function sgd() {
  x += - lRate * dx;
}

function momentum() {
  v = mu * v - learning_rate * dx;
  x += v
}

function nesterov() {
  v_prev = v
  v = mu * v - learning_rate * dx
  x += -mu * v_prev + (1 + mu) * v
}

function newton() {
  
}

function adagrad() {
  cache += dx**2
  x += - learning_rate * dx / (np.sqrt(cache) + eps)
}

function rmsprop() {
  cache = decay_rate * cache + (1 - decay_rate) * dx**2
  x += - learning_rate * dx / (np.sqrt(cache) + eps)
}

function adam() {
  m = beta1*m + (1-beta1)*dx
  mt = m / (1-beta1**t)
  v = beta2*v + (1-beta2)*(dx**2)
  vt = v / (1-beta2**t)
  x += - learning_rate * mt / (np.sqrt(vt) + eps)
}


// Add noise to simulate Stochastic Batch?
// Add second/quasi-newton methods? (L-BFGS)
// Visualizing acutal Loss space with random weight matrix...(CS231n notes)