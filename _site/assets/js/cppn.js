
var activationFunctionMap = {
  'tanh': function(x) { return x.tanh(); },
  'sin': function(x) { return x.sin(); },
  'cos': function(x) { return x.cos(); },
  'relu': function(x) { return x.relu(); },
  'leakyRelu': function(x) { return x.leakyRelu(); },
  'step': function(x) { return x.step(); },
  'sigmoid': function(x) { return x.sigmoid(); },
  'linear': function(x) { return x; }
};

var activationzScaleMap = {
  'tanh': [60,40],
  'sin': [200,100],
  'cos': [200,100],
  'relu': [60,40],
  'leakyRelu': [60,40],
  'step': [200,100],
  'sigmoid': [1,1],
  'linear': [200,100]
}


// Normalizes x, y to -.5 <=> +.5, adds a radius term, and pads zeros with the
// number of z parameters that will get added by the add z shader.
function imagePixelToNormalizedCoord(x, y, imageWidth, imageHeight,zSize) {
  const halfWidth = imageWidth * 0.5;
  const halfHeight = imageHeight * 0.5;
  const normX = (x - halfWidth) / imageWidth;
  const normY = (y - halfHeight) / imageHeight;

  const r = Math.sqrt(normX * normX + normY * normY);

  const result = [normX, normY, r];

  return result;
}

function convexCombination(coef, colors) {

  var comb = [0,0,0];
  for (var i = 0; i < colors.length; i++) {
    for (var j = 0; j < 3; j++) {
      comb[j] += colors[i][j] * coef[i]; 
    }
  }

  return 'rgb(' + Math.floor(comb[0]) + ',' + Math.floor(comb[1]) + ',' + Math.floor(comb[2]) + ')';
}


class CPPN {

  // constructor
  constructor(layers, activation, zScale, colors, canvas) {
    this.layers = layers;
    this.activation = activation;
    this.z1Scale = zScale[0];
    this.z2Scale = zScale[1];
    this.colors = colors,
    this.canvas = canvas

    this.z1Counter = 0;
    this.z2Counter = 0;
    this.parameters = {};
    this.isTraining = false;


    const canvasSize = 32;
    const NUM_IMAGE_SPACE_VARIABLES = 3;  // x, y, r
    const NUM_LATENT_VARIABLES = 2;
    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;

    this.data = this.generateData(canvasSize, NUM_IMAGE_SPACE_VARIABLES, NUM_LATENT_VARIABLES);
    this.ones = tf.ones([this.data.shape[0], 1]);
  }


  // Method
  generateData(imageSize, inputNumDimensions, numLatentVariables) {
  const coords = new Float32Array(imageSize * imageSize * inputNumDimensions);
  var dst = 0;
  for (var i = 0; i < imageSize * imageSize; i++) {
    for (var d = 0; d < inputNumDimensions; d++) {
      const x = i % imageSize;
      const y = Math.floor(i / imageSize);
      const coord = imagePixelToNormalizedCoord(x, y, imageSize, imageSize, numLatentVariables);
      coords[dst++] = coord[d];
    }
  }
  return tf.tensor2d(coords, [imageSize * imageSize, inputNumDimensions]);
}

  // Method
  initialize() {
    tf.tidy(() => {
      for (var l = 1; l < this.layers.length; l++) {
          this.parameters['w' + l] = tf.variable(tf.randomNormal([this.layers[l-1],this.layers[l]], 0, 0.6));
      }
    });
  }

  update(layers, activation) {
    this.stop;
    for (var l = 1; l < this.layers.length; l++) {
      this.parameters['w' + l].dispose();
    }
    this.layers = layers;
    this.z1Scale = activationzScaleMap[activation][0];
    this.z2Scale = activationzScaleMap[activation][1];
    this.z1Counter = 0;
    this.z2Counter = 0;
    this.activation = activation;
    this.initialize();
    this.start;
  }


  async train() {
    if (!this.isTraining) {
      return;
    }

    this.z1Counter += 1 / this.z1Scale;
    this.z2Counter += 1 / this.z2Scale;

    const output = tf.tidy(() => {

      const z1 = tf.scalar(Math.sin(this.z1Counter));
      const z2 = tf.scalar(Math.cos(this.z2Counter));
      const z1Mat = z1.mul(this.ones);
      const z2Mat = z2.mul(this.ones);

      const concatAxis = 1;
      const latentVars = z1Mat.concat(z2Mat, concatAxis);

      const activation = (x) => activationFunctionMap[this.activation](x);

      let output = this.data.concat(latentVars, concatAxis);

      for (var l = 1; l < this.layers.length; l++) {
        output = activation(output.matMul(this.parameters['w' + l]));
      }

      return output.sigmoid().reshape([this.canvas.height, this.canvas.width, 3]);
    });

    await this.visualize(output);
    output.dispose();
    await tf.nextFrame();
    this.train();
  }

  async visualize(output) {
    var [height, width] = output.shape,
        ctx = this.canvas.getContext('2d'),
        data = await output.data();

    var i = 0;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          // indexing
          var k = i * 3;
          i++;

          // create color
          var color = convexCombination(data.slice(k, k + 3), this.colors)
          
          // add color
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  start() {
    this.isTraining = true;
    this.train();
  }

  stop() {
    this.isTraining = false;
  }

  step() {
    this.start();
    this.stop();
  }

}

function cppnSetup(color) {
    // add canvas
    const canvas = d3.select("#vis-background").append("canvas")
        .style("width", "100%")
        .style("height", "100%")
        .attr("class", "cppn");

    // define architecture
    var layers = [5,20,20,20,3],
        activation = 'sin'
        zScale = [180, 130];

    // make cppn
    var cppn = new CPPN(layers, activation, zScale, color, canvas.node());

    // start
    cppn.initialize();
    cppn.start();

    // toggle start/stop if in view
    $(window).on('resize scroll', function() {
      // in view
      if($('.cppn').inView() & !cppn.isTraining) {
          cppn.start();
      }
      // out of view 
      if(!$('.cppn').inView()) {
        cppn.stop();
      }
    });

    $(".article-banner").fadeTo(300, 1);

    return cppn;
}


// // COLOR SPECTURM

// // initialization
// var i1 = [255,139,34],
//     i2 = [255,87,87],
//     i3 = [255,31,103];
// // regularization
// var r1 = [0,233,222],
//     r2 = [41,156,222],
//     r3 = [98,0,222];
// // optimization
// var o1 = [120,184,66],
//     o2 = [45,155,106],
//     o3 = [0,125,117];
// // tuning
// var l1 = [248,73,73],
//     l2 = [240,159,180],
//     l3 = [116,0,116];
// // evaluation
// var g1 = [246,174,29],
//     g2 = [230,170,25],
//     g3 = [195,135,35];


