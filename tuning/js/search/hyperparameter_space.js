class hyperparameter_space {

  // constructor
  constructor(div) {

    this.pad = 30;
    this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    this.width = 350 - this.margin.left - this.margin.right;
    this.height = 350 - this.margin.top - this.margin.bottom;
    
    this.svg = addSVG(div, this.width, this.height, this.margin);
    
    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);
    this.color = d3.interpolateRdYlBu;

    this.setup();
  }

  update(experiments, x_rng, y_rng) {

    // update axes
    this.x.domain(x_rng);
    this.y.domain(y_rng);
    this.xaxis.call(d3.axisBottom(this.x).ticks(5, "s"));
    this.yaxis.call(d3.axisLeft(this.y).ticks(5, "s"));

    var circle = this.svg.selectAll("circle").data(experiments);

    circle.attr("cx", (d) => { return this.x(d.lrate) })
        .attr("cy", (d) => { return this.y(d.bsize); });

    circle.enter().append("circle")
        .attr("cx", (d) => { return this.x(d.lrate) })
        .attr("cy", (d) => { return this.y(d.bsize); })
        .attr("r", 5)
        .attr("fill", (d) => { return this.color(d.accuracy); })
        .attr("class", "sample");

    circle.exit().remove();


  }

  setup() {
    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));

    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(this.y).ticks(5, "s"));

    this.svg.append("rect")
      .attr("id", "border")
      .attr("x", "0")
      .attr("y", "0")
      .attr("width", this.width)
      .attr("height", this.height); 

    this.svg.append("text")
      .text("Learning Rate")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging"); 

    this.svg.append("text")
      .text("Batch Size")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")rotate(-90)")
      .attr("alignment-baseline","baseline");                

    this.svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + this.width / 2 + "," + this.height + ")"); 

  }

}
