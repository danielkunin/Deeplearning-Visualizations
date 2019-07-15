# AI Notes

This repository contains the code for generating [AI Notes](http://deeplearning.ai/ai-notes/) by [deeplearning.ai](https://www.deeplearning.ai/).  

## Running the website locally

If you haven't already installed [Jekyll](https://jekyllrb.com/), then run `gem install bundler jekyll` or `sudo gem install bundler jekyll`.

- `cd` into a local copy of this repository from terminal.
- Run `jekyll serve`.
- A local version of the website should be accessible at `http://127.0.0.1:4000`.

## Creating an article

To create a new article, copy the folling code into a Markdown file (`.md`) in the `article` folder. 

```
---
layout: article
permalink: <!-- url used -->
folder: <!-- folder name used in assets -->

# CSS & JS
js:
- <!-- js files without .js -->
css:
- <!-- css files without .css -->

# Banner
title: <!-- article title -->
abstract: <!-- article abstract -->
table-of-content:
- index: <!-- header numeral (i.e. I, II, III) -->
  title: <!-- header title -->
colors:
  a: <!-- R G B code (space seperated) for color 1 -->
  b: <!-- R G B code (space seperated) for color 2 -->
  c: <!-- R G B code (space seperated) for color 3 -->

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

<!-- ARTICLE CONTENT GOES HERE -->
```

Then, in  `_config.yml` add a new bullet under `nav:` and fill in the following tags:
 - `title` is the name that will appear on the home page
 - `link` is the name that will appear in the navigation menu
 - `url` is the url that will be used (and must be the same as the `permalink` in the new Markdown file)
 - `published` is a flag denoting whether an article is ready for publication
 - 
Your article is now available at `http://127.0.0.1:4000/[url]`

## Editing an article

There are two parts of a Markdown file:
 - The *header* is the section between `---` and `---` and is where style specific content is declared
 - The *content* is the section after the second `---` and is where the text goes
For shortcuts to Markdown formatting check out this [cheat sheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).  Below are specific formatting instructions for this repository.

#### CSS & JS
All CSS and JS files should go in `assets/css/[folder]/` and `assets/js/[folder]/` respectively.  To load these files in the article simply add the name of the file to its respective list in the article header.

#### Visualizations
There are two types of visualizations we can handle:
 - Static images should go in the following folder `assets/images/[article]/` and use `![Alt text](/path/to/image.png)`
 - Interactive graphics and visualizations should be written independntly in HTML, CSS, and JS. The CSS and JS files should be added to the assets folder as described above.  The HTML should be added to `_includes/article/[folder]` and linked in the article content as `{% include article/[folder]/file.html %}`.

#### Footenotes
To add a footnote:
 - Add the footnote label as `<sup class="footnote"></sup>`
 - Add the footnote text in the article header under `footnotes:`
The order of the footnote text must be in the same order that the footnotes appear in the article.

#### Sidenotes
To add a sidenote:
 - Surround the sidenote anchor word as `<span class="sidenote"> anchor word </span>`
 - Add the sidenote text in the article header under `sidenotes:`
The order of the sidenote text must be in the same order that the sidenote anchors appear in the article.

#### Latex
This repository uses [KaTex](https://katex.org/) to render Latex.  Simply write normal Latex code in the Markdown files and surround it in dollar signs.  For `$inline math$` simply put it directly in a sentence, while for `$$display math$$` put it on its own line.

#### Table of Contents
In the article header under `table-of-contents:` add an item with `index` and `title`.  Next to the header with matching `title` in the body add `{#[index]}`

#### Inline Caption
To style a paragraph as an inline caption (i.e. indented and with vertical bar) then simply add `> ` in front of the paragraph.

#### Hyperlinks
For external links use `[link](https://...)` and for local links use `[link](/path/to/file)`.

#### Comments
You can comment out Markdown with HTML comment symbols.  Surround the text you would like to comment as `<!-- comment -->`.


## Publishing an article

Change the `published` tag in `_config.yml` to true for all articles that are being published.  Then, from terminal run `JEKYLL_ENV=production jekyll build` in the top folder for a local version of the website. A publishable HTML version of the website will be available in the `_site` folder. Transfer the content of the `_site` folder to the server.


## Improvements

Below is a list of suggested changes to the website and content:

Template:
- Handle the table of contents in a more systematic way such that the user doesn't need to input the title twice.  Consider using the liquid filter [jekyll-toc](https://github.com/toshimaru/jekyll-toc).
- Link footnotes and sidenotes with unique id instead of relying on the order of the anchors and the text being the same.
- Create unique include/plugin tag for the different visualization styles allowing a user to put placeholder visualizations to indicate a visualization should appear while editing. This will also make the Markdown more readable.
- Sometimes js files will need access to the assets.  Create a standardized url strcuture to handle these calls.  The simpelest solution would be to create a template js function for grabbing files.
- Make sure that in the published version relative and global links don't get messed up. In general clean up CSS and JS calls.
