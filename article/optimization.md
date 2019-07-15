---

layout: article
permalink: optimization
folder: optimization

# CSS & JS

js:
- curvature/DrawSVGPlugin.min
- curvature/MorphSVGPlugin.min
- curvature/script
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
abstract: Add abstract here...
table-of-content:
- index: I
  title: First Header
colors:
  a: 120 184 66
  b: 45 155 106
  c: 0 125 117

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

{% include article/optimization/regression.html %}

{% include article/optimization/curvature.html %}

{% include article/optimization/landscape.html %}

