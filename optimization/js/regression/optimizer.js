class regression_optimizer {

  constructor(line, loss, svg) {

  	// loss landscape
    this.line = line;
    this.loss = loss;

  	// global parameters
    this.lrate = 1e-3;
    this.bsize = 1;
    this.iter = 0;
    this.epoch = 0;

    // location and cost data
    this.training = false;
    this.initial = $.extend({}, this.line.net_coef);
    this.actual = this.line.obj_coef;
    this.path = [];
    this.cost = [[], []];

    // cost plot
    this.pad = 30;
    this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    this.svg = svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.width = +svg.attr("width") - this.margin.left - this.margin.right,
    this.height = +svg.attr("height") - this.margin.top - this.margin.bottom;

    // scales
    this.x = d3.scaleLinear().domain([]).range([0, this.width]);
    this.y = d3.scaleLinear().domain([]).range([this.height, 0]);

    // setup axes
    this.setup();
  }

  reset() {

    // stop training
    if (this.training) {
    	this.training.stop();
    	d3.timerFlush();
    }

    // reset parameters
    this.epoch = 0;
    this.iter = 0;


    this.path = [];
    this.cost = [[], []];


    // update plots
    this.plotPath();
    this.plotCost();

    this.line.network(this.initial.b0, this.initial.b1);
    this.line.plot(0);
  }


  stop() {
    if (this.training) {
      this.training.stop();
    }
  }

  start(X) {

    this.current = $.extend({}, this.line.net_coef);

    // iterate positions and configurations
    this.training = d3.interval(() => {

      var data = X.slice(this.iter, this.iter + this.bsize),
          b0 = this.current.b0,
          b1 = this.current.b1;

      var loss = this.loss.value(b0, b1, X),
          grad = this.loss.gradient(b0, b1, data);

      this.path.push({'b0' : b0, 'b1' : b1});
      this.cost[1].push(loss);
      this.cost[0].push(this.loss.value(this.actual.b0, this.actual.b1, X));

      // var lrate = 1 / (1 + this.ldecay * this.epoch) * this.lrate;

      b0 -= this.lrate * grad.db0;
      b1 -= this.lrate * grad.db1;

      this.epoch = this.epoch + Math.floor((this.iter + this.bsize) / X.length);
      this.iter = (this.iter + this.bsize) % X.length;

      this.current.b0 = b0;
      this.current.b1 = b1;


      this.plot(0);
      this.line.network(b0, b1);
      this.line.plot(0);

    }, 50);
  }

  plot(t) {
    this.plotCost();
    this.plotPath();
  }

  plotCost() {

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


    // var line = this.svg.selectAll("line.loss")
    //   .data(this.actual);

    // line.enter().append("line")
    //   .attr("class", "loss")
    //   .attr("x1", this.x(0))
    //   .attr("x2", this.x())
    //   .attr("y1", )
    //   .attr("y2", )
    //   .attr("id", 'true');

    // line.attr("d", line)
    //   .attr("stroke", "black")
    //   .attr("stroke-width", "2px")
    //   .attr("fill", "none");

    // line.exit().remove();

  }

  plotPath() {

  	// line function
  	var line = d3.line()
  	  .x((d) => { return this.loss.x(d.b0); })
  	  .y((d) => { return this.loss.y(d.b1); })
  	  .curve(d3.curveBasis);

    // bind
    var path = this.loss.svg.selectAll("path.trajectory")
      .data([this.path]);
    
    path.enter().append("path")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("class", "trajectory")
      .attr("id", "estimate")
      .attr("fill", "none")
      .attr("d", line);
    
    path.attr("d", line)
      .raise();
    
    path.exit().remove();


    // bind
    var circle = this.loss.svg.selectAll("circle.point")
      .data([this.actual, this.initial]);
    
    circle.enter().append("circle")
      .attr("r", 5)
      .attr("cx", (d) => { return this.loss.x(d.b0); })
      .attr("cy", (d) => { return this.loss.y(d.b1); })
      .attr("class", "point")
      .attr("id", (d, i) => { return i ? 'estimate' : 'true'; })
      .call(d3.drag()
        .on("start", () => { $("#regression_reset").click(); })
        .on("drag", dragged));

    circle.attr("cx", (d) => { return this.loss.x(d.b0); })
      .attr("cy", (d) => { return this.loss.y(d.b1); })
      .raise();
    
    circle.exit().remove();

    var x_scale = this.loss.x,
        y_scale = this.loss.y,
        line = this.line,
        initial = this.initial;

  	function dragged(d) {
  		var x = Math.max(x_scale.range()[0], Math.min(d3.mouse(this)[0], x_scale.range()[1])),
    			y = Math.min(y_scale.range()[0], Math.max(d3.mouse(this)[1], y_scale.range()[1]));
          initial.b0 = x_scale.invert(x);
          initial.b1 = y_scale.invert(y);
    	  	d3.select(this).attr("cx", x).attr("cy", y);
    	  	line.network(x_scale.invert(x), y_scale.invert(y));
  	}

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
      .text("Epoch")
      .attr("class", "titles")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height + this.pad) + ")")
      .attr("alignment-baseline","hanging"); 
    
    this.svg.append("text")
      .text("Cost")
      .attr("class", "titles")
      .attr("transform", "translate(" + -this.pad + "," + this.height / 2 + ")rotate(-90)")
      .attr("alignment-baseline","baseline");  

    this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (this.width + this.pad / 2) + ",0)"); 
    
    this.legend = d3.legendColor()
      .labelFormat(d3.format(".2g"))
      .title("Optimizer");
  }

}
