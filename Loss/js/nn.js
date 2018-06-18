// creates Fully Connected Neural Network
function FC() {

	// constants of network
	const DATA = {"images": [], "labels": [], "size": 0};
	const batch = 100;
	const learningRate = 0.1;
	const optimizer = tf.train.sgd(learningRate);

	var layers;
	const parameters = {};
	const activations = {};
	function setLayers(x) {
		layers = x;
		// declare parameters for weights and biases
		for (var l = 1; l < layers.length; l++) {
			parameters['w' + l] = tf.variable(tf.zeros([layers[l-1],layers[l]]));
			parameters['b' + l] = tf.variable(tf.zeros([1,layers[l]]));
		}
		// declare variables for hidden layer activations
		for (var l = 0; l < layers.length - 1; l++) {
			activations['a' + l] = tf.variable(tf.zeros([batch,layers[l]]), false)
		}
		console.log(layers)
	}

	// declare output label variable
	const labels = tf.variable(tf.zeros([batch,10]));

	// load data
	function load(datapath) {
		extract(datapath, DATA);
	}

	// initialize parameters
	function initialize() {
		tf.tidy(() => {
			for (var l = 1; l < layers.length; l++) {
				// Xe-Initialization Weights
				parameters['w' + l].assign(tf.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(1/layers[l-1])));
				// Zero Bias
				parameters['b' + l].assign(tf.variable(tf.zeros([1,layers[l]])));
			}
		});
	}

	// forward propogation
	function forward(x) {
		// hidden layers
		for (var l = 1; l < layers.length - 1; l++) {
			activations['a' + l].assign(tf.tanh(tf.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l])));
		}
		// return logits
		return tf.matMul(activations['a' + (l-1)], parameters['w' + l]).add(parameters['b' + l]);
	}

	// loss function
	var lossFunction;
	function setLoss(x) {
		lossFunction = x;
		console.log(lossFunction)
	}
	function loss (logits, labels) {
		if (lossFunction == "entropy") {
			return tf.losses.softmaxCrossEntropy(labels, logits).mean();
		} else if (lossFunction == "square") {
			return tf.losses.meanSquaredError(labels, logits).mean();
		} else if (lossFunction == "hinge") {
			return tf.losses.hingeLoss(labels, logits).mean();
		} else if (lossFunction == "huber") {
			return tf.losses.huberLoss(labels, logits).mean();
		}
	}

	// train model for 100 epochs
	async function train() {
		// initialize
		initialize();
		// optimize
		var index = 0,
			epoch = 0;
		function iteration() {
			// assign batch
			tf.tidy(() => {
				activations['a0'].assign(tf.tensor2d(DATA["images"].slice(index,index + batch)));
				labels.assign(tf.cast(tf.oneHot(tf.tensor1d(DATA["labels"].slice(index,index + batch),'int32'),10),'float32'));
			});
			// minimize
			const cost = optimizer.minimize(() => loss(forward(activations['a0']), labels), true);
			// print
			if (index == 0) {
				console.log("Epoch: " + epoch + " Cost: " + cost);
			}
			cost.dispose();
			// increment
			index = (index + batch) % DATA['size'];
			epoch += (index == 0);
		}
		// create timer
		while (epoch < 10) {
			await iteration();
		}
	}

	// samples loss landscape
	function landscape() {
		// copy original parameters
		const original = {};
		for (var l = 1; l < layers.length; l++) {
			original['w' + l] = parameters['w' + l].clone();
			original['b' + l] = parameters['b' + l].clone();
		}
		// declare first random parameters
		const parameters1 = {};
		for (var l = 1; l < layers.length; l++) {
			parameters1['w' + l] = tf.variable(tf.randomNormal([layers[l-1],layers[l]]));
			parameters1['b' + l] = tf.variable(tf.randomNormal([1,layers[l]]));
		}
		// declare second random parameters
		const parameters2 = {};
		for (var l = 1; l < layers.length; l++) {
			parameters2['w' + l] = tf.variable(tf.randomNormal([layers[l-1],layers[l]]));
			parameters2['b' + l] = tf.variable(tf.randomNormal([1,layers[l]]));
		} 
		return function (a, b) {
			// create scalars
			const alpha = tf.scalar(a),
				  beta = tf.scalar(b);
			// assign parameters
			for (var l = 1; l < layers.length; l++) {
				parameters['w' + l].assign(tf.add(original['w' + l], tf.add(parameters1['w' + l].mul(alpha), parameters2['w' + l].mul(beta))));
				parameters['b' + l].assign(tf.add(original['b' + l], tf.add(parameters1['b' + l].mul(alpha), parameters2['b' + l].mul(beta))));
			}
			// determine loss
			var sample;
			tf.tidy(() => {
				var index = 0;
				activations['a0'].assign(tf.tensor2d(DATA["images"].slice(index,index + batch)));
				labels.assign(tf.cast(tf.oneHot(tf.tensor1d(DATA["labels"].slice(index,index + batch),'int32'),10),'float32'));
				sample = loss(forward(activations['a0']), labels).dataSync()[0];
			});
			// dispose scalars
			alpha.dispose();
			beta.dispose();
			return sample;
		}
	}




	return {'load': load,
			'setLayers': setLayers,
			'setLoss': setLoss, 
			'train': train,
			'landscape': landscape};
}