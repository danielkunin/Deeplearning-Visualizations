class regression_optimizer {

  constructor(line, loss, svg) {

  	// global parameters
    this.lrate = 1e-3;
    this.ldecay = 0;
    this.bsize = 1;
    this.iter = 0;
    this.epoch = 0;

    // location and cost data
    this.training = false;
    this.initial = {'b0': 0, 'b1': 0};
    this.path = [this.initial];
    this.cost = [];

    // loss landscape
    this.line = line;
    this.loss = loss;

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
    this.path = [this.initial];
    this.cost = [];

    // update plots
    this.plotPath();
    this.plotCost();

    this.line.estimate(0, 0);
    this.line.plot(0);
  }


  step() {
  
  }

  stop() {
    if (this.training) {
      this.training.stop();
    }
  }

  start() {
    if (this.training) {
      this.training.start();
    }
  }

  train(X) {

    // iterate positions and configurations
    this.training = d3.timer(() => {

      // var done = true;

      var data = X.slice(this.iter, this.iter + this.bsize),
          b0 = this.path[this.path.length - 1].b0,
          b1 = this.path[this.path.length - 1].b1;

      var loss = this.loss.value(b0, b1, X),
          grad = this.loss.gradient(b0, b1, data);

      var lrate = 1 / (1 + this.ldecay * this.epoch) * this.lrate;

    	b0 -= lrate * grad.db0;
      b1 -= lrate * grad.db1;

      this.epoch = this.epoch + Math.floor((this.iter + this.bsize) / X.length);
      this.iter = (this.iter + this.bsize) % X.length;

      this.path.push({'b0' : b0, 'b1' : b1});
      this.cost.push(loss);

      this.plotCost();
      this.plotPath();

      this.line.estimate(b0, b1);
      this.line.plot(0);


    	// if (inrange(pos,[-1e4,1e4],[-1e4,1e4]) && isFinite(loss)) {
    	// 	this.paths[i].push(pos);
    	// 	this.costs[i].push(loss);
    	// 	done = done && (l2norm(dx) < 1e-1);
    	// } else {
    	// 	done = true;
    	// }

      // this.plotCost();
      // this.plotPath();
      if (this.epoch > 10) {
      	this.training.stop();
      }

    }, 200);
  }

  plotCost() {

    // line function
  	var line = d3.line()
  	  .x((d, i) => { return this.x(i); })
  	  .y((d, i) => { return this.y(d); })
  	  .curve(d3.curveBasis);

  	// update y axis
  	// var maxLoss = 0;
  	// this.costs.forEach((cost) => {
  	// 	maxLoss = Math.max(maxLoss, d3.max(cost, function(d) { return isFinite(d) ? d : 0; }));
  	// })
    var maxLoss = this.cost.length != 0 ? this.cost[0] : 0;
  	this.y.domain([0,maxLoss])
  	this.yaxis.call(d3.axisLeft(this.y).ticks(3, "s"));

  	// update x axis
  	this.x.domain([0, this.cost.length]);
  	this.xaxis.call(d3.axisBottom(this.x).ticks(3, "s"));

  	// bind
    var path = this.svg.selectAll("path.loss")
      .data([this.cost]);

    // add
    path.enter().append("path")
      .attr("class", "loss");

    // update
    path.attr("d", line)
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("fill", "none");

    // remove
    path.exit().remove();

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

    // add
    path.enter().append("path")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("fill", "none")
      .attr("class", "trajectory")
      .attr("d", line);

    // update
    path.attr("d", line)
      .raise();

    // remove
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
