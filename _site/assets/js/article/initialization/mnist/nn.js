// creates MNIST Neural Network
function MNIST(layers) {

	// constants of network
	const DATA = {"images": [], "labels": [], "size": 0, "mean":0, "std": 0};
	const batch = 100;
	const learningRate = 0.1;
	const optimizer = tf.train.sgd(learningRate);
	      
	// declare parameters for weights and biases
	const parameters = {};
	for (var l = 1; l < layers.length; l++) {
		parameters['w' + l] = tf.variable(tf.zeros([layers[l-1],layers[l]]));
		parameters['b' + l] = tf.variable(tf.zeros([1,layers[l]]));
	}

	// declare variables for activations
	const activations = {};
	for (var l = 0; l < layers.length; l++) {
		activations['a' + l] = tf.variable(tf.zeros([batch,layers[l]]), false)
	}

	// declare output label variable
	const labels = tf.variable(tf.zeros([batch,10]));

	// forward propogation
	function f(x) {
		// hidden layers
		for (var l = 1; l < layers.length - 1; l++) {
			activations['a' + l].assign(tf.tanh(tf.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l])));
		}
		// output layer
		activations['a' + l].assign(tf.softmax(tf.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l])));
		// return logits
		return tf.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l]);
	}

	// loss function
	const loss = (logits, labels) => tf.losses.softmaxCrossEntropy(labels, logits).mean();


	// initialize parameters
	function initialize(style) {
		tf.tidy(() => {
			for (var l = 1; l < layers.length; l++) {
				if (style == "xe") {
					// Xe-Initialization
					parameters['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(1/layers[l-1])));
				} else if (style == "uniform"){
					// Uniform
					parameters['w' + l].assign(tf.randomUniform([layers[l-1],layers[l]],-Math.sqrt(1/layers[l-1]),Math.sqrt(1/layers[l-1])));
				} else if (style == "normal") {
					// Standard Normal
					parameters['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0,1));
				} else {
					// Zeros
					parameters['w' + l].assign(tf.variable(tf.zeros([layers[l-1],layers[l]])));
				}
				// Zero Bias
				parameters['b' + l].assign(tf.variable(tf.zeros([1,layers[l]])));
			}
		});
	}

	// train model
	function train(initialization, histogram, draw, softmax) {
		// initialize
		initialize(initialization);

		var index = 0,
			epoch = 0,
			iterate = true;
		function iteration() {
			// get batch
			tf.tidy(() => {
				activations['a0'].assign(tf.tensor2d(DATA["images"].slice(index,index + batch)));
				labels.assign(tf.oneHot(tf.tensor1d(DATA["labels"].slice(index,index + batch), 'int32'), 10).asType('float32'));
			});
			// minimize
			const cost = optimizer.minimize(() => loss(f(activations['a0']), labels), true);
			tf.tidy(() => {
				var images = DATA["images"].slice(index,index + batch),
					digits = tf.equal(activations['a' + (layers.length - 1)].argMax(1), labels.argMax(1)).dataSync();
				draw(images, index / batch, epoch);
				softmax(digits, 1 - d3.mean(digits), cost.dataSync()[0]);
			});
			cost.dispose();
			// update histograms
			var data = [];
			for (var l = 1; l < layers.length - 1; l++) {
				data.push(activations['a' + l].dataSync());
			}
			histogram(data);
			// increment
			index = (index + batch) % DATA['size'];
			epoch += (index == 0);
			// check
			if (!iterate) {
				t.stop();
			}
		}
		// create timer
		var t = d3.timer(iteration);
		t.stop();

		// play functions
		function stop() {
			t.stop();
		}
		function start() {
			iterate = true;
			t.restart(iteration);
		}
		function step() {
			t.stop();
			iterate = false;
			t.restart(iteration);
		}
		function reset() {
			t.stop();
			initialize(initialization);
			index = 0,
			epoch = 0,
			iterate = true;
			var data = [];
			for (var l = 0; l < layers.length; l++) {
				data.push([]);
			}
			// update plots
			histogram(data);
			draw([], 0, 0);
			softmax([], 0, 0);
		}
		return {'stop':stop, 'start':start, 'step':step, 'reset':reset};
	}


	return {'data': DATA, 'train': train};
}