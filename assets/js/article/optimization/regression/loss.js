class regression_loss {

  // constructor
  constructor(div) {

    this.pad = 30;
    this.margin = {top: 50, right: 75, bottom: 75, left: 50};
    this.width = 450 - this.margin.left - this.margin.right,
    this.height = 450 - this.margin.top - this.margin.bottom;
    this.svg = addSVG(div, this.width, this.height, this.margin);
    
    this.n = 50; 
    this.m = 50;

    this.thresholds = [];
    this.contours = d3.contours().size([this.n, this.m]);
    this.color = d3.scaleLog().interpolate(function() { return d3.interpolateYlGnBu; });
    this.x = d3.scaleLinear().domain([-5, 5]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([-5, 5]).range([this.height, 0]);

    this.setup();
  }

  gradient(b0, b1, X) {
    var db0 = 0,
        db1 = 0;
    for (var i = 0; i < X.length; i++) {
      db0 += -2 * (X[i].y - (b0 + X[i].x * b1));
      db1 += -2 * (X[i].y - (b0 + X[i].x * b1)) * X[i].x;
    }
    return {'db0': db0 / X.length, 'db1': db1 / X.length};
  }

  value(b0, b1, X) {
    var loss = 0;
    for (var i = 0; i < X.length; i++) {
    	loss += Math.pow(X[i].y - (b0 + X[i].x * b1), 2);
    }
    return loss / X.length;
  }

  plot(train, time) {

    // get view for current loss function
    var x_range = this.x.domain(),
        y_range = this.y.domain();

    // sample loss landscape
    var values = new Array(this.n * this.m);
    for (var j = 0.5, k = 0; j < this.m; ++j) {
      for (var i = 0.5; i < this.n; ++i, ++k) {

        var b0 = i / this.n * (x_range[1] - x_range[0]) + x_range[0],
            b1 = (1 - j / this.m) * (y_range[1] - y_range[0]) + y_range[0];

        values[k] = this.value(b0, b1, train);
      }
    }

    this.thresholds = d3.range(-10, Math.log2(d3.max(values)), 0.5)
      .map(function(p) { return Math.pow(2, p); });
    this.contours.thresholds(this.thresholds);
    this.color.domain(d3.extent(this.thresholds));

    var logLegend = this.legend
      .cells(this.thresholds.filter(function(e,i) { return i % 4 == 0; }))
      .scale(this.color);

    this.svg.select(".legend").call(logLegend);


    // plot contours
    var contours = this.svg.selectAll("path.contour")
      .data(this.contours(values));
    contours.transition().duration(time)
      .attr("class", "contour")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(this.width / this.n)))
      .attr("fill", (d) => { return this.color(d.value); });
    contours.enter().append("path")
      .attr("class", "contour")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(this.width / this.n)))
      .attr("fill", (d) => { return this.color(d.value); });
    contours.exit().remove();

  }

  setup() {
    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));

    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + 0 + ",0)")
      .call(d3.axisLeft(this.y).ticks(3, "s"));

    this.svg.append("text")
      .text("b (intercept)")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging");              
    
    this.svg.append("text")
      .text("W (slope)")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")rotate(-90)")
      .attr("alignment-baseline","baseline");   

    this.svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (this.width + this.pad / 2) + ",0)"); 

    this.legend = d3.legendColor()
      .labelFormat(d3.format(".2g"))
      .title("Cost");

    this.svg.append("clipPath")
      .attr("id", "regression_clip")
      .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", this.height)
        .attr("width", this.width);

  }

}


  