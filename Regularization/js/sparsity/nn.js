// creates MNIST Neural Network
function MNIST(layers) {

	// constants of network
	const DATA = {"images": [], "labels": [], "size": 0};
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
	const loss = (logits, labels, a, l) => {
		alpha = tf.scalar(a)
		lambda = tf.scalar(l)
		total = tf.losses.softmaxCrossEntropy(labels, logits).mean();
		for (var l = 1; l < layers.length; l++) {
			l1 = total.add(parameters['w' + l].abs().sum().mul(lambda));
			l2 = total.add(parameters['w' + l].square().sum().mul(lambda));
			total = l1.mul(alpha).add(l2.mul(tf.scalar(1.0).sub(alpha)))
		}
		return total
	}


	// initialize parameters
	function initialize() {
		tf.tidy(() => {
			for (var l = 1; l < layers.length; l++) {
				// Xe-Initialization
				parameters['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(1/layers[l-1])));
				// // Standard Normal
				// parameters['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0, 1));
				// Zero Bias
				parameters['b' + l].assign(tf.variable(tf.zeros([1,layers[l]])));
			}
		});
	}

	// train model
	function train(alpha, lambda, histogram, summary) {//, draw, softmax) {
		// initialize
		initialize();

		var index = 0,
			epoch = 0,
			iterate = true;
		function iteration() {
			// get batch
			tf.tidy(() => {
				activations['a0'].assign(tf.tensor2d(DATA["images"].slice(index,index + batch)));
				labels.assign(tf.oneHot(tf.tensor(DATA["labels"].slice(index,index + batch)),10));
			});
			// minimize
			const cost = optimizer.minimize(() => loss(f(activations['a0']), labels, alpha, lambda), true);
			summary(index/batch, epoch, cost.dataSync()[0]);
			// tf.tidy(() => {
			// 	var images = DATA["images"].slice(index,index + batch),
			// 		digits = tf.equal(activations['a' + (layers.length - 1)].argMax(1), labels.argMax(1)).dataSync();
			// 	// draw(images, index / batch, epoch);
			// 	// softmax(digits, 1 - d3.mean(digits), cost.dataSync()[0]);
			// 	summary(index/batch, epoch, cost.dataSync()[0]);
			// });
			cost.dispose();
			// update histograms
			var data = [];
			for (var l = 1; l < layers.length - 1; l++) {
				data.push(parameters['w' + l].flatten().dataSync());
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
			initialize();
			index = 0,
			epoch = 0,
			iterate = true;
			var data = [];
			for (var l = 0; l < layers.length; l++) {
				data.push([]);
			}
			// update plots
			histogram(data);
			summary(0, 0, 0);
			// draw([], 0, 0);
			// softmax([], 0, 0);
		}
		return {'stop':stop, 'start':start, 'step':step, 'reset':reset};
	}


	return {'data': DATA, 'train': train};
}