
// random sample from [a,b]
function uniform(a, b) {
  return Math.random() * (b - a) + a;
}

// random sample from bernoulli(p)
function bernoulli(p) {
  return Math.random() < p;
}

// random sample from normal(mean, variance)
function normal(mean, variance) {
	var s = 0;
	while (s == 0 || s > 1) {
		var u = uniform(-1,1),
			v = uniform(-1,1);
		s = u * u + v * v;
	}
	var standard = Math.sqrt(-2 * Math.log(s) / s) * u;
	return mean + Math.sqrt(variance) * standard;
}

// creates 2D point with class y
function point(x1, x2, y) {
	return {'x1':x1, 'x2':x2, 'y':y};
}

// generate classification data in concentric circles
function Circle(n) {
	var data = [];
	function generate(radius, y, n) {
		for (var i = 0; i < n; i++) {
			var angle = uniform(0, 2 * Math.PI);
				noise = uniform(-1, 1),
				r = radius + noise,
				x1 = Math.cos(angle) * r,
				x2 = Math.sin(angle) * r;
			data.push(point(x1, x2, y));
		}
	}
	generate(4, 1, n/2);
	generate(1, 0, n/2);
	return data;
}

// generate classification data in spiral
function Moon(n) {
	var data = [];
	function generate(delta, y, n) {
		for (var i = 0; i < n; i++) {
			var angle = i / n * Math.PI + delta,
				noise = normal(1, 0.25),
				r = i / n * 4 + noise,
				x1 = Math.cos(angle) * r + (y - 0.5),
				x2 = Math.sin(angle) * r - (y - 0.5);
			data.push(point(x1, x2, y));
		}
	}
	generate(0, 1, n/2);
	generate(Math.PI, 0, n/2);
	return data;
}

// generate classification data in checkerboard
function Square(n) {
	var data = [];
	function generate(y, n) {
		for (var i = 0; i < n; i++) {
			var p = bernoulli(0.5) * 2 - 1,
				x1 = uniform(0.5, 5) * p,
				x2 = (2 * y - 1) * uniform(0.5, 5) * p;
			data.push(point(x1, x2, y));
		}
	}
	generate(1, n/2);
	generate(0, n/2);
	return data;
}

// generate classification data in two 2D Gaussians
function Gauss(n) {
	var data = [];
	function generate(mean, variance, y, n) {
		for (var i = 0; i < n; i++) {
			var x1 = normal(mean, variance),
				x2 = normal(mean, variance);
			data.push(point(x1, x2, y));
		}
	}
	generate(-2, 1, 1, n/2);
	generate(2, 1, 0, n/2);
	return data;
}

// generate classification data
function generate_data(n, index) {
	var generators = [Circle, Moon, Square, Gauss];
	return generators[index](n);
}
