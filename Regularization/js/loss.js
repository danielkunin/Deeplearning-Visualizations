class loss {

  // constructor
  constructor(func, alpha = 0, lambda = 0, svg) {
    this.func = func;
    this.alpha = alpha;
    this.lambda = lambda;

    this.svg = svg
    this.width = +svg.attr("width"),
    this.height = +svg.attr("height");

    this.n = 240; 
    this.m = 125;

    this.thresholds = [];
    this.contours = d3.contours().size([this.n, this.m]);
    this.color = d3.scaleLog().interpolate(function() { return d3.interpolateYlGnBu; });
  }

  value(x, y) {
    return lossFunctions[this.func].val(x, y) + this.lambda * elasticNet_val(x, y, this.alpha);
  }

  gradient(x, y) {
    var loss_grad = lossFunctions[this.func].grad(x, y),
        reg_grad = elasticNet_grad(x, y, this.alpha);
    return {'x': loss_grad.x + this.lambda * reg_grad.x,
            'y': loss_grad.y + this.lambda * reg_grad.y };
  }

  plot(time) {
    // get view for current loss function
    var x_range = lossFunctions[this.func].range,
        y_range = lossFunctions[this.func].range;

    // sample loss landscape
    var values = new Array(this.n * this.m);
    for (var j = 0.5, k = 0; j < this.m; ++j) {
      for (var i = 0.5; i < this.n; ++i, ++k) {

        var x = i / this.n * (x_range[1] - x_range[0]) + x_range[0],
            y = j / this.m * (y_range[1] - y_range[0]) + y_range[0];

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


function toGrad(x,y) {
  return {'x': x, 'y': y};
}

// Elastic Net Regularization
function elasticNet_val(x, y, alpha) {
  var L1 = (x,y) => { return Math.abs(x) + Math.abs(y); },
      L2 = (x,y) => { return Math.pow(x, 2) + Math.pow(y, 2); };
  return alpha * L1(x, y) + (1 - alpha) * L2(x, y);
}
function elasticNet_grad(x, y, alpha) {
  var L1 = {'x': alpha * Math.sign(x),
            'y': alpha * Math.sign(y) }; 
  var L2 = {'x': (1 - alpha) * 2 * x,
            'y': (1 - alpha) * 2 * y };
  return {'x': L1.x + L2.x,
          'y': L1.y + L2.y };
}

// See https://en.wikipedia.org/wiki/Test_functions_for_optimization
var lossFunctions = {
  'goldsteinPrice':   {'val': goldsteinPrice_val,
                       'grad': goldsteinPrice_grad,
                       'range': [-3, 1.5]},
  'beale':            {'val': beale_val,
                       'grad': beale_grad,
                       'range': [-4.5, 4.5]},
  'himmelblaus':      {'val': himmelblaus_val,
                       'grad': himmelblaus_grad,
                       'range': [-5, 5]},
  'mcCormick':        {'val': mcCormick_val, 
                       'grad': mcCormick_grad,
                       'range': [-2, 4]},
  'matyas':           {'val': matyas_val,
                       'grad': matyas_grad,
                       'range': [-10, 10]},
  'rosenbrock':       {'val': rosenbrock_val,
                       'grad': rosenbrock_grad,
                       'range': [-2, 2]},
  'rastrigin':        {'val': rastrigin_val,
                       'grad': rastrigin_grad,
                       'range': [-5.12, 5.12]},
  'bukin':            {'val': bukin_val,
                       'grad': bukin_grad,
                       'range': [-10, 5]},
  'levi':             {'val': levi_val,
                       'grad': levi_grad,
                       'range': [-10, 10]},
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
  return 0;
}

// Beale Function
function beale_val(x, y) {
  return Math.pow(1.5 - x + x * y, 2) + Math.pow(2.25 - x + x * y * y, 2) + 
         Math.pow(2.625 - x + x * y * y * y, 2) + Math.pow(2.625 - x + x * y * y * y, 2);
}
function beale_grad(x, y) {
  return 0;
}

// Himmelblaus Function
function himmelblaus_val(x, y) {
  return Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2); 
}
function himmelblaus_grad(x, y) {
  return 0; 
}

// McCormick Function (modified)
function mcCormick_val(x, y) {
  return Math.sin(x + y) + Math.pow(x - y, 2) - 1.5 * x + 2.5 * y + 1 + 1.9133;
}
function mcCormick_grad(x, y) {
  return 0;
}

// Matyas Function
function matyas_val(x, y) {
  return 0.26 * (x * x + y * y) - 0.48 * x * y;
}
function matyas_grad(x, y) {
  return 0;
}

// Rosenbrock Function
function rosenbrock_val(x, y) {
  return 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
}
function rosenbrock_grad(x, y) {
  return 0;
}

// Rastrigin Function
function rastrigin_val(x, y) {
  var A = 10, 
      n = 2;
  return A * n + x * x + y * y - A *  (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y));
}
function rastrigin_grad(x, y) {
  return 0;
}

// Bukin Function
function bukin_val(x, y) {
  return 100 * Math.sqrt(Math.abs(y - 0.01 * x * x)) + 0.01 * Math.abs(x + 10);
}
function bukin_grad(x, y) {
  return 0;
}

// Levi Function
function levi_val(x,y) {
  return Math.pow(Math.sin(3 * Math.PI * x), 2) + Math.pow(x - 1, 2) * 
         (1 + Math.pow(Math.sin(3 * Math.PI * y), 2)) + Math.pow(y - 1, 2) * 
         (1 + Math.pow(Math.sin(3 * Math.PI * x), 2));
}
function levi_grad(x,y) {
  return 0;
}

// Styblinski Tang Function (modified to be non-negative)
function styblinskiTang_val(x,y) {
  return (Math.pow(x, 4) - 16 * Math.pow(x, 2) + 5 * x) / 2 +
         (Math.pow(y, 4) - 16 * Math.pow(y, 2) + 5 * y) / 2 + 
         78.33234; 
}
function styblinskiTang_grad(x,y) {
  return 0;
}  