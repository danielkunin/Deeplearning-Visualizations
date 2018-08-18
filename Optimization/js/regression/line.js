class line {

  // constructor
  constructor(svg) {
    this.lines = [{'b0': 0, 'b1': 1}, {'b0': 0, 'b1': 0}]
    this.points = []

    this.pad = 30;
    this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    this.svg = svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.width = +svg.attr("width") - this.margin.left - this.margin.right,
    this.height = +svg.attr("height") - this.margin.top - this.margin.bottom;

    this.n = 250; 
    this.m = 250;

    this.x = d3.scaleLinear().domain([-10, 10]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([-10, 10]).range([this.height, 0]);

    this.setup();
  }

  true(b0, b1) {
    this.lines[0].b0 = b0;
    this.lines[0].b1 = b1;
  }

  estimate(b0, b1) {
    this.lines[1].b0 = b0;
    this.lines[1].b1 = b1;
  }

  sample(n) {
    this.points = [];
    for (var i = 0; i < n; i++) {
      var point_x = uniform(this.x.domain()[0], this.x.domain()[1]),
          point_y = this.lines[0].b0 + this.lines[0].b1 * point_x + normal(0, 1);
      this.points.push({'x': point_x, 'y': point_y});
    }
    return this.points;
  }

  plot(time) {

    var x1 = this.x.domain()[0],
        x2 = this.x.domain()[1];

    // add function lines
    var line = this.svg.selectAll("line.function").data(this.lines);

    line.attr("x1", this.x(x1))
        .attr("y1", (d) => { return this.y(d.b0 + d.b1 * x1); })
        .attr("x2", this.x(x2))
        .attr("y2", (d) => { return this.y(d.b0 + d.b1 * x2); });

    line.enter().append("line")
        .attr("x1", this.x(x1))
        .attr("y1", (d) => { return this.y(d.b0 + d.b1 * x1); })
        .attr("x2", this.x(x2))
        .attr("y2", (d) => { return this.y(d.b0 + d.b1 * x2); })
        .attr("class", "function")
        .attr("id", (d, i) => { return i ? 'estimate' : 'true'; });

    line.exit().remove();

    // add data points

    var circle = this.svg.selectAll("circle").data(this.points);

    circle.attr("cx", (d) => { return this.x(d.x) })
        .attr("cy", (d) => { return this.y(d.y); });

    circle.enter().append("circle")
        .attr("cx", (d) => { return this.x(d.x) })
        .attr("cy", (d) => { return this.y(d.y); })
        .attr("r", 2)
        .attr("class", "sample");

    circle.exit().remove();


  }

  setup() {
    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height / 2 + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));

    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + this.width / 2 + ",0)")
      .call(d3.axisLeft(this.y).ticks(3, "s"));

    this.svg.append("text")
      .text("X")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")")
      .attr("alignment-baseline","baseline");   

    this.svg.append("text")
      .text("Y")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging");              

    this.svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + this.width / 2 + "," + this.height + ")"); 

    this.legend = d3.legendColor()
      .labelFormat(d3.format(".2g"))
      .title("Loss");

    // var logLegend = this.legend
    //   .cells(this.thresholds.filter(function(e,i) { return i % 4 == 0; }))
    //   .scale(this.color);

    // this.svg.select(".legend").call(logLegend);

  }

}


// random sample from [a,b]
function uniform(a, b) {
  return Math.random() * (b - a) + a;
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