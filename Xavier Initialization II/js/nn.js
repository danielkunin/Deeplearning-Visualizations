function MNIST(histogram) {

	// dimensions of network
	var layers = [784,300,300,300,300,10],
		batch = 10,
		sample = 50;

	// declare data
	var x = dl.variable(dl.zeros([batch,layers[0]])),
		y = dl.variable(dl.zeros([batch,10]));
	      
	// declare parameters for weights and biases
	var parameters = {};
	for (var l = 1; l < layers.length; l++) {
		parameters['w' + l] = dl.variable(dl.zeros([layers[l-1],layers[l]]));
		parameters['b' + l] = dl.variable(dl.zeros([1,layers[l]]));
	}

	// declare variables for activations
	var activations = {};
	for (var l = 1; l < layers.length - 1; l++) {
		activations['a' + l] = dl.variable(dl.zeros([batch,layers[l]]), false)
	}

	// forward propogation
	var f = x => {
		// layer 1
		activations['a1'].assign(dl.tanh(dl.matMul(x, parameters["w1"]).add(parameters["b1"])));
		// layer 2
		activations['a2'].assign(dl.tanh(dl.matMul(activations['a1'], parameters["w2"]).add(parameters["b2"])));
		// layer 3
		activations['a3'].assign(dl.tanh(dl.matMul(activations['a2'], parameters["w3"]).add(parameters["b3"])));
		// layer 4
		activations['a4'].assign(dl.tanh(dl.matMul(activations['a3'], parameters["w4"]).add(parameters["b4"])));
		// layer 5
		return dl.sigmoid(dl.matMul(activations['a4'], parameters["w5"]).add(parameters["b5"]));
	}

	// loss function
	var loss = (logits, labels) => dl.losses.softmaxCrossEntropy(labels, logits).mean();

	// optimizer + learning rate
	var learningRate = 0.01;
	var optimizer = dl.train.sgd(learningRate);

	// initialize parameters
	for (var l = 1; l < layers.length; l++) {
		// Xe-Initialization
		// parameters['w' + l].assign(dl.randomNormal([layers[l-1],layers[l]],0,Math.sqrt(2/layers[l-1])));
		// Uniform
		parameters['w' + l].assign(dl.randomUniform([layers[l-1],layers[l]],-Math.sqrt(1/layers[l-1]),Math.sqrt(1/layers[l-1])));
	}

	// train model
	var index = 0;
	var epoch = 0;
	var max = 100;
	d3.timer(() => {
		// get batch
		dl.tidy(() => {
			x.assign(dl.tensor2d(mnist["images"].slice(index,index + batch)));
			y.assign(dl.oneHot(dl.tensor(mnist["labels"].slice(index,index + batch)),10));
		});
		// minimize
		optimizer.minimize(() => loss(f(x), y));
		// update plot
		histogram([activations['a1'].dataSync(), activations['a2'].dataSync(), activations['a3'].dataSync(), activations['a4'].dataSync()]);
		// increment
		index = (index + batch) % sample
		epoch += 1;
		// return epoch == max;
	}, 100);
}