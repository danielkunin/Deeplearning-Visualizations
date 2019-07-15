function PLAYGROUND(layers) {


	function train(data, pred, network, loss) {

		// constants
		var costs = [],
			alpha = 0.1,
			training = true,
			epoch = 0;

		// get data
		var XY = get_data(data),
			X = tf.tensor(XY[0]).transpose(),
			Y = tf.tensor(XY[1]).transpose();

		// initialize
		var params = tf.tidy(() => { return init_params(); });

		
		// iteration
		function iteration() {
			// Increment epoch
			epoch += 1;
			// call epoch
			params = tf.tidy(() => { return one_epoch(X, Y, data, params, alpha, costs, network); });
			// Update decision boundary
			tf.tidy(() => { return boundary(params, data, pred); });
			// Update Costs
			loss(costs)
			// check stop
			if (!training) {
				t.stop();
				d3.selectAll('.link').classed('paused', true);
			}
		}

		// create timer
		var t = d3.timer(iteration);
		t.stop();

		// play functions
		function stop() {
			t.stop();
			d3.selectAll('.link').classed('paused', true);
		}

		function start() {
			training = true;
			t.restart(iteration);
			d3.selectAll('.link').classed('paused', false);
		}

		function step() {
			stop();
			training = false;
			t.restart(iteration);
		}

		function reset() {
			stop();
			params = tf.tidy(() => { return init_params(); });
			costs = [],
			epoch = 0,
			training = true;
			pred(data, [[0.5]]);
			loss(costs);
			network([], "connected");
		}

		return {'stop':stop, 'start':start, 'step':step, 'reset':reset};
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
		var cache = tf.tidy(() => { return forward_propagation(X, params); });
		// Backward Propogration
		var grads = tf.tidy(() => { return backward_propagation(X, Y, cache); });
		// Update Parameters
		var params = tf.tidy(() => { return update_parameters(params, grads, alpha); });
		// Compute cost
		costs.push(tf.tidy(() => { return compute_loss(cache[8], Y); }));
		// Update network weights or gradients
		var style = d3.select('input[name="playground_link"]:checked').property("value");
		var w = tf.tidy(() => { return get_weights(params, grads, style); });
		network_update(w, style);
		// Return parameters
		return params;
	}

	function get_weights(params, grads, style) {
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
		grid = tf.tensor(grid).transpose();
		cache = forward_propagation(grid, params);
		output_update(data, cache[9].dataSync());
	}


	function init_params() {
		var variance = d3.select('input[name="playground_init"]:checked').property("value"),
			params = {},
			L = layers.length - 1,
			scalar = [0, 0.001, 1, 100];

		for (var l = 1; l <= L; l++) {
			params['W' + l] = tf.tidy(() => { return tf.randomNormal([layers[l], layers[l-1]]).mul(tf.scalar( variance / layers[l-1]).sqrt()); });
			params['b' + l] = tf.zeros([layers[l], 1]);
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
		var z1 = tf.matMul(W1, X).add(b1),
			a1 = tf.relu(z1),
			z2 = tf.matMul(W2, a1).add(b2),
			a2 = tf.relu(z2),
			z3 = tf.matMul(W3, a2).add(b3),
			a3 = tf.sigmoid(z3);

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

		var dz3 = tf.tidy(() => { return a3.sub(Y).mul(tf.scalar(1./m)); }),
			dW3 = tf.matMul(dz3, a2.transpose()),
			db3 = tf.sum(dz3, 1, true);

		var da2 = tf.matMul(W3.transpose(), dz3),
			dz2 = tf.tidy(() => { return tf.mul(da2, a2.ceil().clipByValue(0, 1)); }),
			dW2 = tf.matMul(dz2, a1.transpose()),
			db2 = tf.sum(dz2, 1, true);

		var da1 = tf.matMul(W2.transpose(), dz2),
			dz1 = tf.tidy(() => { return tf.mul(da1, a1.ceil().clipByValue(0, 1)); }),
			dW1 = tf.matMul(dz1, X.transpose()),
			db1 = tf.sum(dz1, 1, true);

		return {"dz3": dz3, "dW3": dW3, "db3": db3,
				"da2": da2, "dz2": dz2, "dW2": dW2, "db2": db2,
				"da1": da1, "dz1": dz1, "dW1": dW1, "db1": db1};
	}

	function update_parameters(params, grads, learning_rate) {

		// number of layers in the neural networks
		L = Object.keys(params).length / 2;

		// Update rule for each parameter
		for (var k = 0; k < L; k++) {
		    params["W" + (k+1)] = tf.tidy(() => { return params["W" + (k+1)].sub(grads["dW" + (k+1)].mul(tf.scalar(learning_rate))); });
		    params["b" + (k+1)] = tf.tidy(() => { return params["b" + (k+1)].sub(grads["db" + (k+1)].mul(tf.scalar(learning_rate))); });
		}

		return params

	}


	function compute_loss(z3, Y) {
		var logprob = tf.add(tf.mul(Y,z3),tf.log(tf.sigmoid(z3.neg()))),
			loss = tf.mul(logprob, tf.sign(logprob)).mean();
		return loss.dataSync();
	}

	return {'train': train};
}