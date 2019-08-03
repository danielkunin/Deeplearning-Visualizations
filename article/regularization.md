---

layout: article
permalink: regularization/
folder: regularization

# CSS & JS

js:
- dropout
- earlystopping
- landscape/loss
- landscape/viz
- sparsity/zip/zip
- sparsity/zip/zip-ext
- sparsity/data
- sparsity/nn
- sparsity/viz

css:
- earlystopping
- landscape
- sparsity


# Banner

title: Regularizing neural networks
abstract: Regularization prevents models from overfitting on the training data so they can better generalize to unseen data. In this post, we'll describe various ways to accomplish this. We'll support our recommendations with intuitive explanations and interactive visualizations.

table-of-content:
- index: I 
  title: Underfitting, overfitting, and generalization
- index: II
  title: Regularization techniques

colors:
  a: 0 233 222
  b: 41 156 222
  c: 98 0 222

# Authors, Acknowledgments, Reference

authors:
- name: <!-- name of author -->
  link: <!-- URL for personal website or Linkedin -->
  description: <!-- description of author's contributions -->
acknowledgments:
- <!-- list acknowledgments -->
reference: <!-- (ex. Katanforoosh & Kunin, "Initializing neural networks", deeplearning.ai, 2019.) -->


# Footnotes & Sidenotes

footnotes:
- <!-- footnote text in order -->
sidenotes:
- <!-- sidenote text in order -->

---

To be useful in the real world, a neural network must be able to generalize to data it didn't encounter in the data set used for training. But that doesn’t always happen. Sometimes, a model learns the training data so well — both its common features and its peculiarities — it doesn’t understand anything else. When this happens, regularization can address the problem.

# I &emsp; Underfitting, overfitting, and generalization {#I}

A good classifier will learn a decision boundary (the red line in the illustration below) that correctly classifies most of the training data and generalizes to novel data.

![appropriate](/assets/images/article/regularization/appropriate.png "appropriate")

A neural network's ability to generalize to novel data depends on two factors:

- The network's capacity: By capacity, we mean the scope of functions it can learn. Usually, the more parameters a network uses, the more functions it can learn.
- The complexity of information in the training data: For example, images taken from the front-facing camera of a car, filled with cars, trucks, bicycles, scooters, pedestrians, and buildings of various shapes and colors, are more complex than images of the sky that contain only white clouds against a blue background.

When a model lacks sufficient capacity or the training data set doesn't adequately represent the range of real-world variation, it can lead to problems known as underfitting and ovcerfitting.

### Case 1: The network has a small capacity and the complexity of information in the training data set is high.

Consider training a two-layer convolutional neural network to classify photos in the ImageNet data set, which contains 1,000 classes. Such a network is too simple to represent the data’s salient features. 

In this case, the model will learn a simple decision boundary that doesn't correspond to the structure of the training data. Consequently, it will misclassify many data points. 

![underfit](/assets/images/article/regularization/underfit.png "underfit")

Such a model is said to <i>underfit</i> the training data set.

### Case 2: The network has a large capacity, but the complexity of information in the training data set is low.

You might try training a 100-layer convolutional neural network to detect, in images of the sky, clouds (label 1) or no clouds (label 0). This network is more capable than the task requires.

The network's capacity is sufficient to learn the mapping between the training images and their labels. But the network learns salient features that are particular to these particular images. It doesn't learn inherent features such as the colors of the sky. Given new data, it tends not to find an accurate mapping. In other words, it doesn't generalize to novel data.

![overfit](/assets/images/article/regularization/overfit.png "overfit")

This model is said to <i>overfit</i> the training set.

When a model is overfitting in this way, regularization techniques can fix the problem. Regularization helps models strike a good balance between learning inherent features and salient features in the training data.

### How to assess a model's ability to generalize

How can you determine when regularization is in order? 

You can estimate a model’s ability to generalize by splitting to generalize by splitting training data into three subsets: training, dev and test. 

- If a model performs well on the training set but not the dev or test sets, it is overfitting.
- If it turns in mediocre performance on all three sets, it is underfitting. 
- If it is trained on the training set and tuned on the dev set, and it still performs well on the test set, the model is able to generalize successfully.

<!-- TABLE GOES HERE -->

### Addressing generalization issues

To fix underfitting, deepen your neural network by adding more layers.

To fix overfitting, reduce the model's capacity by removing layers and thus reducing the number of parameters. 

Another way to reduce capacity is to limit the growth of the weights through some kind of weight decay, as shown by Krogh and Hertz (1992). By decaying weights, in effect you're limiting the range of potential networks to choose from. 

<!-- THE ABOVE DESCRIBES L1 and L2 REG, RIGHT? 

	I THINK THINGS ARE GETTING GARBLED HERE. WE NEED TO CLARIFY DIFF BETWEEN NON-REGULARIZATION METHODS AND REGULARIZATION METHODS. -->

The best way to help a model generalize is to gather a larger data set. But this is not always possible. If you don't have access to more data, you can use regularization methods.

The aim to close the performance gap between the test set and the dev and training sets while keeping training performance as high as possible. Regularization will help you do so. Note that regularization isn't used to address an overfit network.

<!-- ENTERED FROM OLD WEB LAYOUT TO HERE -->

# II &emsp; Regularization techniques {#I}

Let’s take a look at three regularization techniques: Early stopping, L1 and L2 regularizations, and dropout regularization.

### Early stopping

One way to stop a neural network from overfitting is to halt the training process before the network has thoroughly memorized the data set. This widely used technique is called early stopping.

Recall that the process of optimizing a network to find the correct parameters is iterative. If you were to evaluate a model’s error on the training and dev set after every training epoch, you might see curves like these:

{% include article/regularization/earlystopping.html %}

Based on this observation, you could estimate that the model started overfitting after the 30,000th epoch. Early stopping would save the model’s parameters at the 30,000th epoch. The saved model would have the best performing parameter values on the dev set and likely would generalize better to the test set.



{% include article/regularization/sparsity.html %}

{% include article/regularization/landscape.html %}

{% include article/regularization/dropout.html %}

