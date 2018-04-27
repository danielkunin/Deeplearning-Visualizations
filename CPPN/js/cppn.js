


export type ActivationFunction = 'tanh'|'sin'|'relu'|'step';
const activationFunctionMap: {
  [activationFunction in ActivationFunction]: (tensor: dl.Tensor2D) =>
      dl.Tensor2D
} = {
  'tanh': x => x.tanh(),
  'sin': x => x.sin(),
  'relu': x => x.relu(),
  'step': x => x.step()
};

const NUM_IMAGE_SPACE_VARIABLES = 3;  // x, y, r
const NUM_LATENT_VARIABLES = 2;

export class CPPN {
  private inputAtlas: dl.Tensor2D;
  private ones: dl.Tensor2D;

  private firstLayerWeights: dl.Tensor2D;
  private intermediateWeights: dl.Tensor2D[] = [];
  private lastLayerWeights: dl.Tensor2D;

  private z1Counter = 0;
  private z2Counter = 0;
  private z1Scale: number;
  private z2Scale: number;
  private numLayers: number;

  private selectedActivationFunctionName: ActivationFunction;

  private isInferring = false;

  constructor(private inferenceCanvas: HTMLCanvasElement) {
    const canvasSize = 128;
    this.inferenceCanvas.width = canvasSize;
    this.inferenceCanvas.height = canvasSize;

    this.inputAtlas = nn_art_util.createInputAtlas(
        canvasSize, NUM_IMAGE_SPACE_VARIABLES, NUM_LATENT_VARIABLES);
    this.ones = dl.ones([this.inputAtlas.shape[0], 1]);
  }

  generateWeights(neuronsPerLayer: number, weightsStdev: number) {
    for (let i = 0; i < this.intermediateWeights.length; i++) {
      this.intermediateWeights[i].dispose();
    }
    this.intermediateWeights = [];
    if (this.firstLayerWeights != null) {
      this.firstLayerWeights.dispose();
    }
    if (this.lastLayerWeights != null) {
      this.lastLayerWeights.dispose();
    }

    this.firstLayerWeights = dl.truncatedNormal(
        [NUM_IMAGE_SPACE_VARIABLES + NUM_LATENT_VARIABLES, neuronsPerLayer], 0,
        weightsStdev);
    for (let i = 0; i < MAX_LAYERS; i++) {
      this.intermediateWeights.push(dl.truncatedNormal(
          [neuronsPerLayer, neuronsPerLayer], 0, weightsStdev));
    }
    this.lastLayerWeights = dl.truncatedNormal(
        [neuronsPerLayer, 3 /** max output channels */], 0, weightsStdev);
  }

  setActivationFunction(activationFunction: ActivationFunction) {
    this.selectedActivationFunctionName = activationFunction;
  }

  setNumLayers(numLayers: number) {
    this.numLayers = numLayers;
  }

  setZ1Scale(z1Scale: number) {
    this.z1Scale = z1Scale;
  }

  setZ2Scale(z2Scale: number) {
    this.z2Scale = z2Scale;
  }

  start() {
    this.isInferring = true;
    this.runInferenceLoop();
  }

  private async runInferenceLoop() {
    if (!this.isInferring) {
      return;
    }

    this.z1Counter += 1 / this.z1Scale;
    this.z2Counter += 1 / this.z2Scale;

    const lastOutput = dl.tidy(() => {
      const z1 = dl.scalar(Math.sin(this.z1Counter));
      const z2 = dl.scalar(Math.cos(this.z2Counter));
      const z1Mat = z1.mul(this.ones) as dl.Tensor2D;
      const z2Mat = z2.mul(this.ones) as dl.Tensor2D;

      const concatAxis = 1;
      const latentVars = z1Mat.concat(z2Mat, concatAxis);

      const activation = (x: dl.Tensor2D) =>
          activationFunctionMap[this.selectedActivationFunctionName](x);

      let lastOutput = this.inputAtlas.concat(latentVars, concatAxis);
      lastOutput = activation(lastOutput.matMul(this.firstLayerWeights));

      for (let i = 0; i < this.numLayers; i++) {
        lastOutput = activation(lastOutput.matMul(this.intermediateWeights[i]));
      }

      return lastOutput.matMul(this.lastLayerWeights).sigmoid().reshape([
        this.inferenceCanvas.height, this.inferenceCanvas.width, 3
      ]);
    });

    await renderToCanvas(lastOutput as dl.Tensor3D, this.inferenceCanvas);
    await dl.nextFrame();
    this.runInferenceLoop();
  }

  stopInferenceLoop() {
    this.isInferring = false;
  }
}

// TODO(nsthorat): Move this to a core library util.
async function renderToCanvas(a: dl.Tensor3D, canvas: HTMLCanvasElement) {
  const [height, width, ] = a.shape;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = await a.data();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;
    imageData.data[j + 0] = Math.round(255 * data[k + 0]);
    imageData.data[j + 1] = Math.round(255 * data[k + 1]);
    imageData.data[j + 2] = Math.round(255 * data[k + 2]);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}


import * as dl from 'deeplearn';

export function createInputAtlas(
    imageSize: number, inputNumDimensions: number, numLatentVariables: number) {
  const coords = new Float32Array(imageSize * imageSize * inputNumDimensions);
  let dst = 0;
  for (let i = 0; i < imageSize * imageSize; i++) {
    for (let d = 0; d < inputNumDimensions; d++) {
      const x = i % imageSize;
      const y = Math.floor(i / imageSize);
      const coord = imagePixelToNormalizedCoord(
          x, y, imageSize, imageSize, numLatentVariables);
      coords[dst++] = coord[d];
    }
  }

  return dl.tensor2d(coords, [imageSize * imageSize, inputNumDimensions]);
}

// Normalizes x, y to -.5 <=> +.5, adds a radius term, and pads zeros with the
// number of z parameters that will get added by the add z shader.
export function imagePixelToNormalizedCoord(
    x: number, y: number, imageWidth: number, imageHeight: number,
    zSize: number): number[] {
  const halfWidth = imageWidth * 0.5;
  const halfHeight = imageHeight * 0.5;
  const normX = (x - halfWidth) / imageWidth;
  const normY = (y - halfHeight) / imageHeight;

  const r = Math.sqrt(normX * normX + normY * normY);

  const result = [normX, normY, r];

  return result;
}


class CPPN {

  // constructor
  constructor(layers, activation, z1Scale, z2Scale, canvas) {
    this.layers = layers;
    this.activation = activation;
    this.z1Scale = z1Scale;
    this.z2Scale = z2Scale;
    this.canvas = canvas

    this.z1Counter = 0;
    this.z2Counter = 0;

    this.parameters = {};
    this.batch = 100;
    this.learningRate = 0.1;
    this.optimizer = tf.train.sgd(learningRate);
    this.isTraining = false;
  }


  // Method
  data(imageSize: number, inputNumDimensions: number, numLatentVariables: number) {
  const coords = new Float32Array(imageSize * imageSize * inputNumDimensions);
  let dst = 0;
  for (let i = 0; i < imageSize * imageSize; i++) {
    for (let d = 0; d < inputNumDimensions; d++) {
      const x = i % imageSize;
      const y = Math.floor(i / imageSize);
      const coord = imagePixelToNormalizedCoord(
          x, y, imageSize, imageSize, numLatentVariables);
      coords[dst++] = coord[d];
    }
  }

  return dl.tensor2d(coords, [imageSize * imageSize, inputNumDimensions]);
}

  // Method
  initialize() {
	for (var l = 1; l < layers.length; l++) {
		parameters['w' + l] = tf.variable(tf.randomNormal([layers[l-1],layers[l]], 0, 1));
		parameters['b' + l] = tf.variable(tf.zeros([1,layers[l]]));
	}
  }

  async train() {
    if (!this.isTraining) {
      return;
    }

    this.z1Counter += 1 / this.z1Scale;
    this.z2Counter += 1 / this.z2Scale;

    const output = dl.tidy(() => {
      const z1 = dl.scalar(Math.sin(this.z1Counter));
      const z2 = dl.scalar(Math.cos(this.z2Counter));
      const z1Mat = z1.mul(this.ones) as dl.Tensor2D;
      const z2Mat = z2.mul(this.ones) as dl.Tensor2D;

      const concatAxis = 1;
      const latentVars = z1Mat.concat(z2Mat, concatAxis);

      const activation = (x: dl.Tensor2D) =>
          activationFunctionMap[this.selectedActivationFunctionName](x);

      let output = this.inputAtlas.concat(latentVars, concatAxis);
      output = activation(output.matMul(this.firstLayerWeights));

      for (let i = 0; i < this.numLayers; i++) {
        output = activation(output.matMul(this.intermediateWeights[i]));
      }

      return output.matMul(this.lastLayerWeights).sigmoid().reshape([
        this.inferenceCanvas.height, this.inferenceCanvas.width, 3
      ]);
    });

    await visualize(output);
    await tf.nextFrame();
    this.train();
  }

  visualize(output) {
  
  }

  start() {
  	this.isTraining = true;
  	this.train();
  }

  stop() {
  	this.isTraining = false;
  }

}

function mnist_input() {

  // setup dimensions
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // setup size for batch
  var n = 10,
      m = 10;

  // add canvas
  var canvas = d3.select("#mnist_input").append("canvas")
    .style("width", function(){ return width + "px"; })
    .style("height", function(){ return height + "px"; })
    .attr("width", n * 28)
    .attr("height", m * 28);

  // get context
  var ctx = canvas.node().getContext("2d")

  // add mnist image
  function draw_digit(xoff, yoff, pixels) {
    var i = 0;
    for (var y = 0; y < 28; y++) {
      for (var x = 0; x < 28; x++) {
        var c = Math.floor(255 * pixels[i]);
        var color= 'rgb(' + c + ',' + c + ',' + c + ')';
        ctx.fillStyle = color;
        ctx.fillRect(xoff * 28 + x, yoff * 28 + y, 1, 1);
        i++;
      }
    }
  }

  // draw input
  function draw(digits, batch, epoch) {
    for (var i = 0; i < digits.length; i++) {
      draw_digit(i % n, Math.floor(i / n), digits[i]);
    }
    $('#batch').html(batch);
    $('#epoch').html(epoch);
  }

  return draw;
}