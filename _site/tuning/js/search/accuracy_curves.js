class accuracy_curves {

  constructor(div) {

    // cost plot
    this.pad = 30;
    this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    this.width = 350 - this.margin.left - this.margin.right,
    this.height = 350 - this.margin.top - this.margin.bottom;
    this.svg = addSVG(div, this.width, this.height, this.margin);

    // scales
    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([0, 1]).range([this.height, 0]);
    this.color = d3.interpolateRdYlBu;

    // setup axes
    this.setup();
  }


  update(experiments) {

    // line function
  	var line = d3.line()
  	  .x((d, i) => { return this.x(i); })
  	  .y((d, i) => { return this.y(d); })
  	  .curve(d3.curveBasis);

    var maxLoss = this.cost[1].length != 0 ? this.cost[1][0] : 0;
  	this.y.domain([0,maxLoss])
  	this.yaxis.call(d3.axisLeft(this.y).ticks(3, "s"));

  	// update x axis
  	this.x.domain([0, this.cost[1].length]);
  	this.xaxis.call(d3.axisBottom(this.x).ticks(3, "s"));

  	// bind
    var path = this.svg.selectAll("path.loss")
      .data(this.cost);

    path.enter().append("path")
      .attr("class", "loss")
      .attr("id", (d, i) => { return i ? 'estimate' : 'true'; });

    path.attr("d", line)
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    path.exit().remove();

  }


  setup() {

    this.xaxis = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x).ticks(3, "s"));
   
    this.yaxis = this.svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(this.y).ticks(3, "s"));

    this.svg.append("text")
      .text("Iteration")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging"); 
    
    this.svg.append("text")
      .text("Accuracy")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")rotate(-90)")
      .attr("alignment-baseline","baseline");  

 //    this.svg.append("g")
 //      .attr("class", "legend")
 //      .attr("transform", "translate(" + (this.width + this.pad / 2) + ",0)"); 
    
 //    this.legend = d3.legendColor()
 //      .labelFormat(d3.format(".2g"))
 //      .title("Optimizer");

 //    this.tip = d3.tip()
 //      .attr('class', 'd3-tip')
 //      .offset([-10, 0])
 //      .html(function(d, i) {
 //      	if (i == 1) {
 //      		return 'Initial Point <br>(W: ' + d3.format(".2f")(d.b1) + ', b: ' + d3.format(".2f")(d.b0) + ')';
 //      	} else {
	//   		return 'Ground Truth <br>(W: ' + d3.format(".2f")(d.b1) + ', b: ' + d3.format(".2f")(d.b0) + ')';
	//   	}
	//   });

	// this.loss.svg.call(this.tip);
  }

}
