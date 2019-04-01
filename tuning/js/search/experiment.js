class experiment {

  // constructor
  constructor(lrate, bsize) {

    // metric
    this.accuracy = 0;
    this.curve = [];

    // hyperparameters
  	this.lrate = lrate;
    this.bsize = bsize;

    // parameters
    this.model = tf.sequential({
     layers: [
       tf.layers.dense({inputShape: [784], units: 32, activation: 'relu'}),
       tf.layers.dense({units: 10, activation: 'softmax'}),
     ]
    });

    this.model.compile({
      optimizer: tf.train.sgd(this.lrate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

  }

  // train
  train(X, Y) {
    this.model.fit(X, Y, {
      epochs: 1,
      batchSize: this.bsize,
      callbacks: {onBatchEnd}
    });
  }

  // eval
  eval(X, Y) {
    const accuracy = model.evaluate(X, Y, {batchSize: 4});
    return accuracy;
  }
}
