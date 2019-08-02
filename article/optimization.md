---

layout: article
permalink: optimization
folder: optimization

# CSS & JS


js:
- curvature
- regression/loss
- regression/optimizer
- regression/line
- regression/viz
- landscape/point
- landscape/loss
- landscape/optimizer
- landscape/viz

css:
- landscape
- regression

# Banner

title: Optimizing neural networks

abstract: Training a machine learning model is a matter of closing the gap between the model's predictions and reality. But optimizing the model isn't so straightforward. Through interactive visualizations, we'll help you develop your intuition for setting up and solving the optimization problem.

table-of-content:
- index: I
  title: Setting up the optimization problem
- index: II
  title: Running the optimization process

colors:
  a: 120 184 66
  b: 45 155 106
  c: 0 125 117

# Authors, Acknowledgments, Reference

authors:
- name: Kian Katanforoosh
  link: https://twitter.com/kiankatan
  description: Written content and structure
- name: Daniel Kunin
  link: http://daniel-kunin.com
  description: Visualizations (created using <a href="https://d3js.org/">D3.js</a> and <a href="https://js.tensorflow.org/">TensorFlow.js</a>)

acknowledgments:
- The template for the article was designed by <a href="https://www.jingru-guo.com/">Jingru Guo</a> and inspired by <a href="https://distill.pub/">Distill</a>
- The loss landscape visualization adapted code from Mike Bostock's <a href="https://bl.ocks.org/mbostock/f48ff9c1af4d637c9a518727f5fdfef5">visualization</a> of the Goldstein-Price function
- The banner visualization adapted code from deeplearn.js's implementation of a <a href="https://en.wikipedia.org/wiki/Compositional_pattern-producing_network">CPPN</a>

reference: Katanforoosh & Kunin, "Optimizing neural networks", deeplearning.ai, 2019.


# Footnotes & Sidenotes


footnotes:
- Chapter 4, <i>Deep Learning</i>, Goodfellow et al. (MIT Press)
- Check out these papers&#58; <a href="https://arxiv.org/pdf/1711.00489.pdf"><i>Don't decay the learning rate, increase the batch size</i></a>, <a href="https://papers.nips.cc/paper/6770-train-longer-generalize-better-closing-the-generalization-gap-in-large-batch-training-of-neural-networks.pdf"><i>Train longer generalize better</i></a>, <a href="https://arxiv.org/pdf/1706.02677.pdf"><i>Accurate, large minibatch SGD</i></a>


sidenotes:
- By definition, this function L has a low value when the model performs well on the task.
- Do you know the mathematical formula that allows a neural network to detect cats in images? Probably not. But using data you can find a function that performs this task. It turns out that a convolutional architecture with the right parameters defines a function that can perform this task well.
- While model parameters are derived during training, hyperparameters are values set before training starts. Hyperperameters include batch size and learning rate.
- We use the term inappropriate local minimum because, in optimizing a machine learning model, the optimization is often non-convex and unlikely to converge to the global minimum.
- Online optimization is when updates must be made with incomplete knowledge of the future, as in Stochastic Gradient Descent optimization.
- This term essentially describes inflection points (where the concavity of the landscape changes) for which the gradient is zero in some, but not all, directions. 
- Gradient descent makes a linear approximation of the loss function in a given point. It then moves downhill along the approximation of the loss function.
- For more information on hyperparameter tuning, see the Deep Learning Specialization Course 2, Week 3 (Hyperparameter Tuning, Batch Normalization and Programming Frameworks).

---

In machine learning, you start by defining a task and a model. The model consists of an architecture and parameters. For a given architecture, the values of the parameters determine how accurately the model performs the task. 
But how do you find good values? By defining a loss function that evaluates how well the model performs. The goal is to optimize the loss and thereby to find parameter values that match predictions with reality. This is the essence of training.



# I &emsp; Setting up the optimization problem {#I}

The <span class="sidenote">loss function</span> will be different in different tasks depending on the output desired. How you define it has a major influence on how the model will train and perform. Let's consider two examples:

### Example 1: House price prediction

Say your task is to predict the price of houses $y \in \mathbb{R}y∈R$ based on features such as floor area, number of bedrooms, and ceiling height. The loss function can be summarized by the sentence:

>Given a set of house features, the square of the difference between your prediction and the actual price should be as small as possible.

You define the loss function as

$$\mathcal{L} = ||y-\hat{y}||_2^2$$


where $\hat{y}$ is your predicted price and $y$ is the actual price, also known as ground truth.

### Example 2: Object localization

Let's consider a more complex example. Say your task is to localize the car in a set of images that contain one. The loss function should frame the following sentence in mathematical terms:

>Given an image containing one car, predict a bounding box (bbox) that surrounds the vehicle. The predicted box should match the size and position of the actual car as closely as possible.

In mathematical terms, a possible loss function $\mathcal{L}$ (Redmon et al., 2016) is:

$$\mathcal{L} = \underbrace{(x - \hat{x})^2 + (y - \hat{y})^2}_{\text{BBox Center}} + \underbrace{(w - \hat{w})^2 + (h - \hat{h})^2}_{\text{BBox Width/Height}}$$

This loss function depends on:

- The model’s prediction which, in turn, depends on the parameter values  (weights and biases) as well as the input (in this case, images).
- The ground truth corresponding to the input (labels; in this case, bounding boxes).

### Visualizing the loss function

For a given input batch along with the corresponding ground truths, the loss function has a landscape that depends on the parameters of the network. 

It is difficult to visualize this landscape, if there are more than two parameters. However, the landscape does exist, and our goal is to find the point where the loss function’s value is minimal. 

Updating the parameter values will move the value either closer to or farther from the target minimum point. 

### The model versus the loss function

It is important to distinguish between the function $f$ that will perform the task (the model) and the function $\mathcal{L}$ you are optimizing (the loss function).

- The model is an architecture and a set of parameters that approximates a <span class="sidenote">real function</span>that performs the task. Optimized parameter values will enable the model to perform the task with relative accuracy.
- The loss function quantifies how accurately the model has performed on given data set. Its value depends on the model's parameter values.

At this point, good parameter values are unknown. However, you have a formula for the loss function. Optimize that on your dataset, and theoretically you will find good parameter values. The way to do this is to feed a training data set into the model and adjust the parameters iteratively to make the loss function as small as possible. 

In summary, the way you define the loss function will dictate the performance of your model on the task at hand. The diagram below illustrates the process of finding a model that performs well.


# II &emsp; Running the optimization process {#II}

![optimization_chart](/assets/images/article/optimization/optimization_chart.png "optimization_chart")

In this section, we assume that you have chosen a task, a data set, and a loss function. You will minimize the loss on the data set to find good parameter values.

### Using gradient descent

First, you must initialize the parameter values so you have a starting point for optimization. Then, you will adjust the parameter values using gradient descent to reduce the value of the loss function.

Gradient descent is an iterative optimization algorithm that finds the minimum of a function. In machine learning, that means minimizing the loss. At every iteration, parameter values are adjusted according to the opposite direction of the gradient of the loss; that is, in the direction that reduces the loss.

The formula to remember is:

$$W = W - \alpha \frac{\partial \mathcal{L}}{\partial W}$$

Where:

- $W$ denotes the parameters
- $\frac{\partial \mathcal{L}}{\partial W}$ is a gradient indicating the direction to push the value $W$ to decrease $\mathcal{L}$.
- $\alpha$ is the learning rate which you can tune to decide how much you want to adjust the value of $W$.

You can learn more about gradient-based optimization algorithms in the Deep Learning Specialization. This topic is covered in Course 1, Week 2 (Neural Network Basics) and Course 2, Week 2 (Optimization Algorithms).


### Adjusting gradient descent hyperparameters

To use gradient descent, you must choose values for hyperparameters such as learning rate and batch size. These values will influence the optimization, so it’s important to set them appropriately.

In the visualization below, you can play with the starting point of initialization, learning rate, and batch size. With these hyperparameters, you will fit a linear model $$\hat{y} = wa x + b$$ (for the sake of simplicity) on a set of 300 data points using gradient descent.

Here are some questions to consider as you explore the visualization:

- What is the impact of the training set size?
- What is the impact of the learning rate on the optimization?
- Why does the loss landscape look like this?
- Why do the model parameters converge to values different than those of the ground-truth slope and intercept?

{% include article/optimization/regression.html %}

Note that the loss $\mathcal{L}$ takes as input a single example, so minimizing it doesn’t guarantee better model parameters for other examples. It is common to minimize the average of the loss computed over a batch of examples; for instance, $\mathcal{J} = \frac{1}{m_b} \sum_{i=1}^{m_b} \mathcal{L}^{(i)}$. We call this function the cost, and reducing it leads to a more accurate parameter-update direction to minimize training error. $m_b$  is called the batch size. This is a key <span class="sidenote">hyperparameter</span> to tune.

Here are some takeaways from the visualization:
<!-- Kian, please add, as a series of bullets, a taleaway statement for initialization, learning rate, batch size, and iterative update. -->

### Initialization

A good initialization can accelerate optimization and enable it to converge to the minimum or, if there are several minima, the best one. To learn more about initialization, read our AI Note,  <a href="http://www.deeplearning.ai/ai-notes/initialization/"> <i>Initializing Neural Networks</i></a>. 

### Learning rate

The learning rate influences the optimization’s convergence. It also counterbalances the influence of the loss function’s curvature. According to the gradient descent formula above, the direction and magnitude of the parameter update is given by the learning rate multiplied by the slope of the loss function at a certain point $W$. Specifically: $\alpha \frac{\partial \mathcal{L}}{\partial W}$.

- If the learning rate is too small, updates are small and optimization is slow, especially if the loss curvature is low. Also, you're likely to settle into an <span class="sidenote">inappropriate local minimum</span>.
- If the learning rate is too large, updates will be large and the optimization is likely to diverge, especially if the loss curvature is high. 
- If the learning rate is good, updates are appropriate and the optimization should converge.

Play with the visualization below to understand how learning rate and loss curvature influence an algorithm's convergence.

{% include article/optimization/curvature.html %}

The visuzation illustrates that:
- The choice of learning rate depends on the curvature of the loss function.
- Gradient descent makes a linear approximation of the loss function at a given point. Then it moves downhill along the approximation of the loss function.
- If the loss is highly curved, the larger the learning rate (step size), the larger the error of the <span class="sidenote">gradient approximation</span>. The approximation tends to overshoot.
- Taking small steps reduces the gradient approximation error.<sup class="footnote"></sup>

It is common to start with a large learning rate — say, between 0.1 and 1 — and decay it during training. Choosing the right decay (how often? by how much?) is non-trivial. An excessively aggressive decay schedule slows progress toward the optimum, while a slow-paced decay schedule leads to chaotic updates with small improvements.

In fact, nobody knows the right decay schedule. However, adaptive learning-rate algorithms such as Momentum Adam and RMSprop help adjust the learning rate during the optimization process. We’ll explain those algorithms below.

### Batch size

Batch size is the number of data points used to train a model in each iteration. Typical small batches are 32, 64, 128, 256, 512, while large batches can be thousands of examples.

Choosing the right batch size is crucial to ensure convergence of the loss function and parameter values, and to the generalization of your model. Some research<sup class="footnote"></sup> has considered how to make the choice, but there is no consensus. In practice, you can use a <span class="sidenote">hyperparameter search</span>.

Research into batch size has revealed the following principles:

- Batch size determines the frequency of updates. The smaller the batches, the more — though quicker the updates.
- The larger the batch size, the more accurate the gradient of the loss will be with respect to the parameters. That is, the direction of the update is most likely going down the local 
slope of the loss landscape.
- The largest batch size that fits into GPU memory leads to efficient parallelization and usually accelerates training.
- However, in practice, large batch sizes can hurt the model’s ability to generalize.

In choosing batch size, there’s a balance to be struck depending on the available computational hardware and the task you’re trying to achieve. Recall that the input batch is an input to the cost function. Large batch size typically leads to sharper cost function surfaces than a small batch size, as Keskar et al. find in their paper, “On large-batch training for deep learning: generalization gap and sharp minima.”

Here's a figure comparing a flat and a sharp minimum. Flat cost surfaces (and thus small batch sizes) are preferred because they lead to good generalization without requiring high precision.

![flat_vs_sharp](/assets/images/article/optimization/flat_vs_sharp.png "flat_vs_sharp")

In practice, hyperparameter search can help you find batch size and learning rate. These hyperparameters are two routes to the same outcome, according to Smith, Kindermans et al. in Don't Decay the Learning Rate, Increase the Batch Size. They argue that the benefits of decaying the learning rate can be achieved by increasing batch size during training. So if you change batch size, you may also need to change learning rate. Efficient use of vast batch sizes notably reduces the number of parameter updates required to train a model.

### Iterative update

Now that you have a starting point, a learning rate, and a batch size, it’s time to update the parameters iteratively to move toward the cost function’s minimum.

The optimization algorithm is also a core choice. You can play with various optimizers in the visualization below. That will help you build an intuitive sense of the pros and cons of each.

In the visualization below, your goal is to play with hyperparameters to find parameter values that minimize a loss function. You can choose the loss function and starting point of the optimization. Although there's no explicit model, you can assume that finding the minimum of the loss function is equivalent to finding the best model for your task. For the sake of simplicity, the model only has two parameters and the batch batch size is always 1.

{% include article/optimization/landscape.html %}

The choice of optimizer influences both the speed of convergence and whether it occurs. Several alternatives to the classic gradient descent algorithms have been developed in the past few years and are listed in the table below. (Notation: $dW = \frac{\partial \mathcal{L}}{\partial W}$)

Adaptive optimization methods such as Adam or RMSprop perform well in the initial portion of training, but they have been found to generalize poorly at later stages  compared to Stochastic Gradient Descent. In Improving Generalization Performance by Switching from Adam to SGD, Keskar et al. investigate a hybrid strategy that begins training with an adaptive method and switches to SGD.

You can find more information about these optimizers in the Deep Learning Specialization Course 2, Week 2 (Optimization Algorithms) on Coursera.

### Conclusion

Exploring optimization methods and hyperparameter values can help you build intuition for optimizing networks for your own tasks. During hyperparameter search, it’s important to understand intuitively the optimization’s sensitivity to learning rate, batch size, optimizer, and so on. That intuitive understanding, combined with the right method (random search or Bayesian optimization), will help you find the right model.



