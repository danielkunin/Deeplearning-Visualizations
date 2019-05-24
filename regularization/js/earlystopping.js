$( document ).ready(function() {
    $('#earlystopping-placeholder').load("./img/earlystopping.svg", main);
});

function main() {

    var xmlns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink",
      select = function(s) {
        return document.querySelector(s);
      },
      selectAll = function(s) {
        return document.querySelectorAll(ds);
      },
      mainSVG = select('.mainSVG'),
      box = select('#box'),
      box2 = select('#box2'),
      connector = select('#connector'),
      connector2 = select('#connector2'),
      connector3 = select('#connector3'),
      train_line = select('#train_err_line'),
      // connectorGroup = select('#connectorGroup'),
      dragger = select('#dragger'),
      graphDot = select('#graphDot'),
      interDot = select('#interDot'),
      boxLabel = select('#boxLabel'),
      nullDot = select('#nullDot'),
      graphLine = select('#graphLine'),
      graphBezier = MorphSVGPlugin.pathDataToBezier(graphLine.getAttribute('d')),
      perc, boxPos = {x: 0, y: 0},
      boxPos2 = {x: 0, y: 0},
      isPressed = false,
      bottomLine = select('#bottomLine'),
      labelOffset = 8;

    TweenMax.set('svg', {visibility: 'visible'})
    TweenMax.set([dragger, graphDot, nullDot, interDot], {transformOrigin: '50% 50%'})
    TweenMax.set([dragger, graphDot, nullDot], {x: graphBezier[0].x, y: graphBezier[0].y})
    TweenMax.set([box, box2], {transformOrigin: '50% 100%'})
    TweenMax.set(interDot, {alpha: 0, scale: 0})
    //fix boxes at certain axes
    TweenMax.set(box, {x: (bottomLine.getAttribute('x1') - labelOffset - (box.getBBox().width))})
    TweenMax.set(box2, {y: 467.1610 + labelOffset})

    let tl = new TimelineMax({paused: true});
    init()

    function init() {
        tl.to([graphDot, dragger], 5, {
          bezier: {
            type: "cubic",
            values: graphBezier,
            autoRotate: false
          },
          ease: Linear.easeNone
        })

        Draggable.create(nullDot, {
            // type: 'x', //horizontal movement only
            trigger: dragger,
            onPress: graphPress,
            bounds: {
              minX: graphBezier[0].x,
              maxX: graphBezier[graphBezier.length-1].x
          },
            zIndexBoost:false,
            onDrag: updateGraph,
            onRelease: graphRelease,
        })
    }

    function graphPress() {
        isPressed = true;
        TweenMax.to(dragger, 0.5, {
            attr: {r: 30},
            ease: Elastic.easeOut.config(1, 0.7)
        })

        appendGraphEle();
        TweenMax.to([box, box2, interDot], 0.5, {
            scale: 1,
            alpha: 1,
            ease: Elastic.easeOut.config(1.2, 0.7)
        });
    }

    function graphRelease() {
        appendGraphEle()
        isPressed = false;
        TweenMax.to(dragger, 0.2, {
          attr: {r: 15},
          ease: Elastic.easeOut.config(0.7, 0.7)
        })

        appendGraphEle()
        TweenMax.to([box, box2, interDot], 0.2, {
          scale: 0,
          alpha: 0,
        })
    }

    function updateGraph() {
        perc = (nullDot._gsTransform.x - graphBezier[0].x) / (graphBezier[graphBezier.length-1].x - graphBezier[0].x);
        TweenMax.to(tl, 0.0005, {
          progress: perc
        })
        appendGraphEle()
    }

    function appendGraphEle() {
      drawLines();
      drawBoxes();
    }

    function drawLines() {

          if (isPressed) {
            TweenMax.set(connector, { //vertical line
              attr: {
                x1: graphDot._gsTransform.x,
                y1: 467.1610 + labelOffset,
                x2: graphDot._gsTransform.x,
                y2: graphDot._gsTransform.y
              }
            })

            TweenMax.set(connector2, { //horizontal line ok
              attr: {
                x1: bottomLine.getAttribute('x1') - labelOffset,
                y1: graphDot._gsTransform.y,
                x2: graphDot._gsTransform.x,
                y2: graphDot._gsTransform.y
              }
            })

            findAndDrawIntersectionDot();

          } else {

            TweenMax.to([connector, connector2, connector3], 0.1, {
              attr: {
                x1: graphDot._gsTransform.x,
                y1: graphDot._gsTransform.y,
                x2: graphDot._gsTransform.x,
                y2: graphDot._gsTransform.y
              }
            })
          }
    }

    function drawBoxes() {
        // console.log("updating box pos " + boxPos.x)
        // boxPos.x = connector2.getAttribute("x1") - (box.getBBox().width);
        boxPos.y = connector2.getAttribute("y1") - (box.getBBox().height * 0.5);
        boxPos2.x = connector.getAttribute("x1") - (box2.getBBox().width /2);

        TweenMax.to(box, 0.01, {
          y: boxPos.y,
        })

        TweenMax.to(box2, 0.01, {
          x: boxPos2.x,
        })

        let curr_iter = mapTo6000(dragger._gsTransform.x, 59000);
        if ((curr_iter < 31000) && (curr_iter > 29000)) {
            curr_iter = 30000;
        }

        let err_msg = " ";
        if (curr_iter == 30000) {
            err_msg = "Optimal dev error"
        } else if (curr_iter < 30000) {
            err_msg = "Model underfitting"
        } else {
            err_msg = "Model overfitting"
        }
        boxLabel.textContent = err_msg //.toFixed(2);
        boxLabel2.textContent = parseInt(curr_iter) + "th epoch" //.toFixed(2);
    }

    function mapTo6000(currX, range) {
        let currRange = Math.floor(graphBezier[graphBezier.length - 1].x - graphBezier[0].x)
        return Math.floor((currX - graphBezier[0].x) / currRange * range)
    }

    function findAndDrawIntersectionDot() {
        let path_d = convertFromLineToPath(connector);
        let pt = Snap.path.intersection(path_d, train_line.getAttribute('d'))
        if(pt[0]) {
            TweenMax.set(interDot, {
                x: pt[0].x,
                y: pt[0].y,
            })
        }
    }

    function convertFromLineToPath(line) {
        let str = "M"+line.getAttribute('x2')+","+line.getAttribute('y2')+"V"+line.getAttribute('y1');
        return str;
    }
}
