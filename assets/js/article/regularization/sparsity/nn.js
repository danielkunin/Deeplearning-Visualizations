// creates MNIST Neural Network
function MNIST(layers) {

	// constants of network
	const DATA = {"images": [], "labels": [], "size": 0};
	const batch = 100;
	const learningRate = 0.1;
	const optimizer = tf.train.sgd(learningRate);
	      
	// declare parameters for weights and biases
	const params = {
		'unreg': {},
		'reg': {}
	}
	var params_size = 0;
	for (var l = 1; l < layers.length; l++) {
		params['unreg']['w' + l] = tf.variable(tf.zeros([layers[l-1],layers[l]]));
		params['unreg']['b' + l] = tf.variable(tf.zeros([1,layers[l]]));
		params['reg']['w' + l] = tf.variable(tf.zeros([layers[l-1],layers[l]]));
		params['reg']['b' + l] = tf.variable(tf.zeros([1,layers[l]]));
		params_size += layers[l-1] * layers[l]
	}
	var unreg = new Float32Array(params_size)
	var reg = new Float32Array(params_size)

	// declare variables for activations
	const activations = {};
	for (var l = 0; l < layers.length; l++) {
		activations['a' + l] = tf.variable(tf.zeros([batch,layers[l]]), false)
	}

	// declare output label variable
	const labels = tf.variable(tf.zeros([batch,10]));

	// forward propogation
	function f(x, reg) {
		// hidden layers
		for (var l = 1; l < layers.length - 1; l++) {
			activations['a' + l].assign(tf.tanh(tf.matMul(activations['a' + (l-1)], params[reg]['w' + l]).add(params[reg]['b' + l])));
		}
		// output layer
		activations['a' + l].assign(tf.softmax(tf.matMul(activations['a' + (l-1)], params[reg]['w' + l]).add(params[reg]['b' + l])));
		// return logits
		return tf.matMul(activations['a' + (l-1)], params[reg]['w' + l]).add(params[reg]['b' + l]);
	}

	// loss function
	const loss = (logits, labels, reg, a, l) => {
		alpha = tf.scalar(a)
		lambda = tf.scalar(l)
		total = tf.losses.softmaxCrossEntropy(labels, logits).mean();
		for (var l = 1; l < layers.length; l++) {
			l1 = total.add(params[reg]['w' + l].abs().sum().mul(lambda));
			l2 = total.add(params[reg]['w' + l].square().sum().mul(lambda));
			total = l1.mul(alpha).add(l2.mul(tf.scalar(1.0).sub(alpha)))
		}
		return total
	}


	// initialize parameters
	function initialize(reg) {
		tf.tidy(() => {
			for (var l = 1; l < layers.length; l++) {
				// Xe-Initialization
				params[reg]['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(1/layers[l-1])));
				// Zero Bias
				params[reg]['b' + l].assign(tf.variable(tf.zeros([1,layers[l]])));
			}
		});
	}

	// train model
	function train(alpha, lambda, histogram, summary) {
		// initialize
		initialize('unreg');
		initialize('reg');

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
			tf.tidy(() => {
				optimizer.minimize(() => loss(f(activations['a0'], 'unreg'), labels, 'unreg', 0, 0));
				optimizer.minimize(() => loss(f(activations['a0'], 'reg'), labels, 'reg', alpha, lambda));
			});
			// update histograms
			var start = 0;
			for (var l = 1; l < layers.length; l++) {
				tf.tidy(() => {
					unreg.set(params['unreg']['w' + l].flatten().dataSync(), start);
		    		reg.set(params['reg']['w' + l].flatten().dataSync(), start);
		    	});
		    	start += layers[l - 1] * layers[l];
		    }
		    histogram([reg, unreg]);
		    summary(index/batch, epoch);
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
			initialize('unreg');
			initialize('reg');
			index = 0,
			epoch = 0,
			iterate = true;
			var data = [];
			for (var l = 0; l < layers.length; l++) {
				data.push([]);
			}
			histogram(data);
			summary(0, 0);
		}
		return {'stop':stop, 'start':start, 'step':step, 'reset':reset};
	}


	return {'data': DATA, 'train': train};
}