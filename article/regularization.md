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
abstract: Add abstract here...
table-of-content:
- index: I
  title: First Header
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

{% include article/regularization/earlystopping.html %}

{% include article/regularization/sparsity.html %}

{% include article/regularization/landscape.html %}

{% include article/regularization/dropout.html %}

