class loss {

  // constructor
  constructor(func, alpha = 0, lambda = 0, svg) {
    this.func = func;
    this.alpha = alpha;
    this.lambda = lambda;

    this.svg = svg
    this.width = +svg.attr("width"),
    this.height = +svg.attr("height");

    this.n = 250; 
    this.m = 250;

    this.thresholds = [];
    this.contours = d3.contours().size([this.n, this.m]);
    this.color = d3.scaleLog().interpolate(function() { return d3.interpolateYlGnBu; });
    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);
  }

  value(x, y) {
    return lossFunctions[this.func].val(x, y) + this.lambda * elasticNet_val(x, y, this.alpha);
  }

  gradient(x, y) {
    var loss_grad = lossFunctions[this.func].grad(x, y),
        reg_grad = elasticNet_grad(x, y, this.alpha);
    return add(loss_grad, scale(reg_grad, this.lambda));
  }

  plot(time) {
    // get view for current loss function
    var x_range = lossFunctions[this.func].range,
        y_range = lossFunctions[this.func].range;

    this.x.domain(x_range);
    this.y.domain(y_range);

    // sample loss landscape
    var values = new Array(this.n * this.m);
    for (var j = 0.5, k = 0; j < this.m; ++j) {
      for (var i = 0.5; i < this.n; ++i, ++k) {

        var x = i / this.n * (x_range[1] - x_range[0]) + x_range[0],
            y = (1 - j / this.m) * (y_range[1] - y_range[0]) + y_range[0];

        values[k] = this.value(x, y);
      }
    }

    // update scales
    this.thresholds = d3.range(-10, Math.log2(d3.max(values)), 0.5)
      .map(function(p) { return Math.pow(2, p); });
    this.contours.thresholds(this.thresholds);
    this.color.domain(d3.extent(this.thresholds));

    // plot contours
    var contours = this.svg.selectAll("path")
      .data(this.contours(values));
    contours.transition().duration(time)
      .attr("d", d3.geoPath(d3.geoIdentity().scale(this.width / this.n)))
      .attr("fill", (d) => { return this.color(d.value); });
    contours.enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(this.width / this.n)))
      .attr("fill", (d) => { return this.color(d.value); });
    contours.exit().remove();
  }

}


// Elastic Net Regularization
function elasticNet_val(x, y, alpha) {
  var L1 = (x,y) => { return Math.abs(x) + Math.abs(y); },
      L2 = (x,y) => { return Math.pow(x, 2) + Math.pow(y, 2); };
  return alpha * L1(x, y) + (1 - alpha) * L2(x, y);
}
function elasticNet_grad(x, y, alpha) {
  var L1 = point(alpha * Math.sign(x),alpha * Math.sign(y)); 
  var L2 = point((1 - alpha) * 2 * x, (1 - alpha) * 2 * y);
  return add(L1, L2);
}

// See https://en.wikipedia.org/wiki/Test_functions_for_optimization
var lossFunctions = {
  'goldsteinPrice':   {'val': goldsteinPrice_val,
                       'grad': goldsteinPrice_grad,
                       'range': [-3, 1]},
  'beale':            {'val': beale_val,
                       'grad': beale_grad,
                       'range': [-4.5, 4.5]},
  'himmelblaus':      {'val': himmelblaus_val,
                       'grad': himmelblaus_grad,
                       'range': [-5, 5]},
  'mcCormick':        {'val': mcCormick_val, 
                       'grad': mcCormick_grad,
                       'range': [-3, 5]},
  'matyas':           {'val': matyas_val,
                       'grad': matyas_grad,
                       'range': [-10, 10]},
  'rosenbrock':       {'val': rosenbrock_val,
                       'grad': rosenbrock_grad,
                       'range': [-2, 2]},
  'rastrigin':        {'val': rastrigin_val,
                       'grad': rastrigin_grad,
                       'range': [-5.12, 5.12]},
  'styblinskiTang':   {'val': styblinskiTang_val,
                       'grad': styblinskiTang_grad,
                       'range': [-5, 5]}
}

// Goldstein Price Function
function goldsteinPrice_val(x, y) {
  return (1 + Math.pow(x + y + 1, 2) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * x + 3 * y * y))
      * (30 + Math.pow(2 * x - 3 * y, 2) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
}
function goldsteinPrice_grad(x, y) {
  // TODO: FILL THIS IN... (UGLY)
  return point(0, 0); 
}

// Beale Function
function beale_val(x, y) {
  return Math.pow(1.5 - x + x * y, 2) + Math.pow(2.25 - x + x * y * y, 2) + 
         Math.pow(2.625 - x + x * y * y * y, 2) + Math.pow(2.625 - x + x * y * y * y, 2);
}
function beale_grad(x, y) {
  var dx = 2 * (1.5 - x + x * y) * (-1 + y) + 2 * (2.25 - x + x * y * y) * (-1 + y * y) +
  		   2 * (2.625 - x + x * y * y * y) * (-1 + y * y * y) + 2 * (2.625 - x + x * y * y * y) * (-1 + y * y * y),
  	  dy = 2 * (1.5 - x + x * y) * x + 2 * (2.25 - x + x * y * y) * 2 * x * y + 
           2 * (2.625 - x + x * y * y * y) * 3 * x * y * y + 2 * (2.625 - x + x * y * y * y) * 3 * x * y * y;
  return point(dx, dy);
}

// Himmelblaus Function
function himmelblaus_val(x, y) {
  return Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2); 
}
function himmelblaus_grad(x, y) {
  var dx = 4 * (x * x + y - 11) * x + 2 * (x + y * y - 7),
  	  dy = 2 * (x * x + y - 11) + 4 * (x + y * y - 7) * y;
  return point(dx, dy); 
}

// McCormick Function (modified to be non-negative)
function mcCormick_val(x, y) {
  return Math.sin(x + y) + Math.pow(x - y, 2) - 1.5 * x + 2.5 * y + 1 + 1.9133;
}
function mcCormick_grad(x, y) {
  var dx = Math.cos(x + y) + 2 * (x - y) - 1.5,
  	  dy = Math.cos(x + y) - 2 * (x - y) + 2.5;
  return point(dx, dy);
}

// Matyas Function
function matyas_val(x, y) {
  return 0.26 * (x * x + y * y) - 0.48 * x * y;
}
function matyas_grad(x, y) {
  var dx = 0.52 * x - 0.48 * y,
  	  dy = 0.52 * y - 0.48 * x;
  return point(dx, dy);
}

// Rosenbrock Function
function rosenbrock_val(x, y) {
  return 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
}
function rosenbrock_grad(x, y) {
  var dx = -400 * (y - x * x) * x - 2 * (1 - x),
  	  dy = 200 * (y - x * x);
  return point(dx, dy);
}

// Rastrigin Function
function rastrigin_val(x, y) {
  return 20 + x * x + y * y - 10 *  (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y));
}
function rastrigin_grad(x, y) {
  var dx = 2 * x + 20 * Math.PI * Math.sin(2 * Math.PI * x),
  	  dy = 2 * y + 20 * Math.PI * Math.sin(2 * Math.PI * y);
  return point(dx, dy);
}

// Styblinski Tang Function (modified to be non-negative)
function styblinskiTang_val(x,y) {
  return (Math.pow(x, 4) - 16 * Math.pow(x, 2) + 5 * x) / 2 +
         (Math.pow(y, 4) - 16 * Math.pow(y, 2) + 5 * y) / 2 + 
         78.33234; 
}
function styblinskiTang_grad(x,y) {
  var dx = (4 * Math.pow(x, 3) - 32 * x + 5) / 2,
  	  dy = (4 * Math.pow(y, 3) - 32 * y + 5) / 2;
  return point(dx, dy);
}  