// creates MNIST Neural Network
function MNIST(layers) {

	// constants of network
	const DATA = {"images": [], "labels": [], "size": 0};
	const batch = 100;
	const learningRate = 0.1;
	const optimizer = dl.train.sgd(learningRate);
	      
	// declare parameters for weights and biases
	const parameters = {};
	for (var l = 1; l < layers.length; l++) {
		parameters['w' + l] = dl.variable(dl.zeros([layers[l-1],layers[l]]));
		parameters['b' + l] = dl.variable(dl.zeros([1,layers[l]]));
	}

	// declare variables for activations
	const activations = {};
	for (var l = 0; l < layers.length; l++) {
		activations['a' + l] = dl.variable(dl.zeros([batch,layers[l]]), false)
	}

	// declare output label variable
	const labels = dl.variable(dl.zeros([batch,10]));

	// forward propogation
	function f(x) {
		// hidden layers
		for (var l = 1; l < layers.length - 1; l++) {
			activations['a' + l].assign(dl.tanh(dl.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l])));
		}
		// output layer
		activations['a' + l].assign(dl.softmax(dl.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l])));
		// return logits
		return dl.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l]);
	}

	// loss function
	const loss = (logits, labels) => dl.losses.softmaxCrossEntropy(labels, logits).mean();


	// initialize parameters
	function initialize(style) {
		dl.tidy(() => {
			for (var l = 1; l < layers.length; l++) {
				if (style == "xe") {
					// Xe-Initialization
					parameters['w' + l].assign(dl.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(2/layers[l-1])));
				} else if (style == "uniform"){
					// Uniform
					parameters['w' + l].assign(dl.randomUniform([layers[l-1],layers[l]],-Math.sqrt(1/layers[l-1]),Math.sqrt(1/layers[l-1])));
				} else if (style == "normal") {
					// Standard Normal
					parameters['w' + l].assign(dl.randomNormal([layers[l-1],layers[l]],0,1));
				} else {
					// Zeros
					parameters['w' + l].assign(dl.variable(dl.zeros([layers[l-1],layers[l]])));
				}
				// Zero Bias
				parameters['b' + l].assign(dl.variable(dl.zeros([1,layers[l]])));
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
			dl.tidy(() => {
				activations['a0'].assign(dl.tensor2d(DATA["images"].slice(index,index + batch)));
				labels.assign(dl.oneHot(dl.tensor(DATA["labels"].slice(index,index + batch)),10));
			});
			// minimize
			const cost = optimizer.minimize(() => loss(f(activations['a0']), labels), true);
			dl.tidy(() => {
				var images = DATA["images"].slice(index,index + batch),
					digits = dl.equal(activations['a' + (layers.length - 1)].argMax(1), labels.argMax(1)).dataSync();
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


	return {'data': DATA, 'initialize':initialize, 'train':train};
}