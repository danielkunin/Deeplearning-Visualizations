// creates Fully Connected Neural Network
function FC(layers, datapath) {

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

	// declare variables for hidden layer activations
	const activations = {};
	for (var l = 0; l < layers.length - 1; l++) {
		activations['a' + l] = tf.variable(tf.zeros([batch,layers[l]]), false)
	}

	// declare output label variable
	const labels = tf.variable(tf.zeros([batch,10]));

	// load data
	function load() {
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
	const loss = (logits, labels) => tf.losses.softmaxCrossEntropy(labels, logits).mean();
	// const loss = (logits, labels) => tf.losses.absoluteDifference(labels, logits).mean();

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
				labels.assign(tf.oneHot(tf.tensor(DATA["labels"].slice(index,index + batch)),10));
			});
			// minimize
			optimizer.minimize(() => loss(forward(activations['a0']), labels), true);
			// increment
			index = (index + batch) % DATA['size'];
			epoch += (index == 0);
		}
		// create timer
		while (epoch < 10) {
			console.log(epoch);
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
				labels.assign(tf.oneHot(tf.tensor(DATA["labels"].slice(index,index + batch)),10));
				sample = loss(forward(activations['a0']), labels).dataSync()[0];
			});
			// dispose scalars
			alpha.dispose();
			beta.dispose();
			return sample;
		}
	}




	return {'load': load, 
			'train': train,
			'landscape': landscape};
}