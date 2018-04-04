var stop = false,
	max = 5000,
	style = "weight",
	variance = 2;

function train(data, output_update, network_update, loss_update) {
	// get data
	var XY = get_data(data),
		X = dl.tensor(XY[0]).transpose(),
		Y = dl.tensor(XY[1]).transpose();
	// initialize
	var params = dl.tidy(() => { return init_params(X); }),
		alpha = 0.05,
		costs = [],
		epoch = 0;

	d3.timer(() => {
		if (!stop) {
			// Increment epoch
			epoch += 1;
			// call epoch
			params = dl.tidy(() => { return one_epoch(X, Y, data, params, alpha, costs, network_update); });
			// Update decision boundary
			dl.tidy(() => { return boundary(params, data, output_update); });
			// Update Costs
			loss_update(costs)
		}
		// Check if done
		return stop || epoch == max;
	}, 0);

}

function get_data(data) {
	var X = [],
		Y = [];
	for (var i = 0; i < data.length; i++) {
		var point = data[i];
		X.push([point.x1, point.x2]);
		Y.push([point.y]);
	}

	return  [X,Y];
}


function one_epoch(X, Y, data, params, alpha, costs, network_update) {
	// Forward Propogration
	var cache = dl.tidy(() => { return forward_propagation(X, params); });
	// Backward Propogration
	var grads = dl.tidy(() => { return backward_propagation(X, Y, cache); });
	// Update Parameters
	var params = dl.tidy(() => { return update_parameters(params, grads, alpha); });
	// Compute cost
	costs.push(dl.tidy(() => { return compute_loss(cache[9], Y); }));
	// Update network weights or gradients
	var w = dl.tidy(() => { return get_weights(params, grads); });
	network_update(w, style);
	// Return parameters
	return params;
}

function get_weights(params, grads) {
	if (style == "gradient") {
		var W1 = grads["dW1"],
			W2 = grads["dW2"],
			W3 = grads["dW3"];
	} else {
		var W1 = params["W1"],
			W2 = params["W2"],
			W3 = params["W3"];
	}
	var w = [],
		w1 = W1.dataSync(),
		w2 = W2.dataSync(), 
		w3 = W3.dataSync();
	for (var i = 0; i < w1.length; i++) {
		w.push(w1[i]);
	}
	for (var i = 0; i < w2.length; i++) {
		w.push(w2[i]);
	}
	for (var i = 0; i < w3.length; i++) {
		w.push(w3[i]);
	}
	return w;
}





function boundary(params, data, output_update) {
	var grid = [];
	for (var i = 5; i >= -5; i -= 0.1) {
		for (var j = -5; j <= 5; j += 0.1) {
			grid.push([j,i]);
		}
	}
	grid = dl.tensor(grid).transpose();
	cache = forward_propagation(grid, params);
	output_update(data, cache[9].dataSync());
}



function init_params(X) {
	var params = {},
		layers_dims = [X.shape[0], 6, 3, 1],
		L = layers_dims.length - 1,
		scalar = [0, 0.01, 1, 100];

	for (var l = 1; l <= L; l++) {
		params['W' + l] = dl.tidy(() => { return dl.randomNormal([layers_dims[l], layers_dims[l-1]]).mul(dl.scalar( variance * 2 / layers_dims[l-1]).sqrt()); });
		params['b' + l] = dl.zeros([layers_dims[l], 1]);
	}

	return params;
}


function forward_propagation(X, params) {
      
	// retrieve parameters
	var W1 = params["W1"],
		b1 = params["b1"],
		W2 = params["W2"],
		b2 = params["b2"],
		W3 = params["W3"],
		b3 = params["b3"];

	// LINEAR -> RELU -> LINEAR -> RELU -> LINEAR -> SIGMOID
	var z1 = dl.matMul(W1, X).add(b1),
		a1 = dl.relu(z1),
		// a1 = dl.sigmoid(z1),
		z2 = dl.matMul(W2, a1).add(b2),
		a2 = dl.relu(z2),
		// a2 = dl.sigmoid(z2),
		z3 = dl.matMul(W3, a2).add(b3),
		a3 = dl.sigmoid(z3);

	return [z1, a1, W1, b1, z2, a2, W2, b2, z3, a3, W3, b3];
}

function backward_propagation(X, Y, cache) {

	var m = X.shape[1],
		z1 = cache[0], 
		a1 = cache[1], 
		W1 = cache[2], 
		b1 = cache[3], 
		z2 = cache[4], 
		a2 = cache[5], 
		W2 = cache[6], 
		b2 = cache[7], 
		z3 = cache[8], 
		a3 = cache[9], 
		W3 = cache[10], 
		b3 = cache[11];

	var dz3 = dl.tidy(() => { return a3.sub(Y).mul(dl.scalar(1./m)); }),
		dW3 = dl.matMul(dz3, a2.transpose()),
		db3 = dl.sum(dz3, 1, true);

	var da2 = dl.matMul(W3.transpose(), dz3),
		dz2 = dl.tidy(() => { return dl.mul(da2, a2.ceil().clipByValue(0, 1)); }),
		// dz2 = dl.tidy(() => { return dl.mul(da2, a2.mul(a2.neg().add(dl.scalar(1)))); }),
		dW2 = dl.matMul(dz2, a1.transpose()),
		db2 = dl.sum(dz2, 1, true);

	var da1 = dl.matMul(W2.transpose(), dz2),
		dz1 = dl.tidy(() => { return dl.mul(da1, a1.ceil().clipByValue(0, 1)); }),
		// dz1 = dl.tidy(() => { return dl.mul(da1, a1.mul(a1.neg().add(dl.scalar(1)))); }),
		dW1 = dl.matMul(dz1, X.transpose()),
		db1 = dl.sum(dz1, 1, true);

	return {"dz3": dz3, "dW3": dW3, "db3": db3,
			"da2": da2, "dz2": dz2, "dW2": dW2, "db2": db2,
			"da1": da1, "dz1": dz1, "dW1": dW1, "db1": db1};
}

function update_parameters(params, grads, learning_rate) {

	// number of layers in the neural networks
	L = Object.keys(params).length / 2;

	// Update rule for each parameter
	for (var k = 0; k < L; k++) {
	    params["W" + (k+1)] = dl.tidy(() => { return params["W" + (k+1)].sub(grads["dW" + (k+1)].mul(dl.scalar(learning_rate))); });
	    params["b" + (k+1)] = dl.tidy(() => { return params["b" + (k+1)].sub(grads["db" + (k+1)].mul(dl.scalar(learning_rate))); });
	}

	return params

}


function compute_loss(a3, Y) {
	var m = Y.shape[1],
		logprob = dl.tidy(() => { return dl.add(dl.mul(dl.log(a3).neg(),Y), dl.mul(dl.log(a3.neg().add(dl.scalar(1))).neg(), Y.neg().add(dl.scalar(1)))); }),
		logprobs = logprob.dataSync();
	var sum = 0;
	for (var i = 0; i < logprobs.length; i++) {
		sum += isNaN(logprobs[i]) ? 0 : logprobs[i];
	}
	return Math.min(10000, sum / m);
}