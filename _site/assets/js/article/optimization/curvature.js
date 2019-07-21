$(document).ready(function() {
    // $('#loss-vis-container').load("../img/quadratic_curve.svg", main);
    main();
});

// ####################################################
function main() {
    // initialize vars
    let center_dot = $("#centerDot"),
        clone_dot = $("#cloneDot"),
        flat_curve = $("#flat_curve"),
        // flat_curve = $("#steep_curve"),
        ph_deriv = $('#ph_deriv'),
        deriv = $('#deriv'),
        ph_dot = $('#phDot'),
        error_line = $('#errorLine'),
        l_line = $("#learnLine"),
        error_text = $('#errorText'),
        curr_pos = [0, 0],
        l_big = 50, //default is big
        l_small = 25,
        l_rate = l_big,
        l_breakpoint = l_small + 1
        is_cur_lo = true,
        dir = true,
        deriv_tl = new TimelineMax({
            paused: true,
        }),
        abs_curveBezier = MorphSVGPlugin.pathDataToBezier(flat_curve[0].getAttribute('d')),
        iter_count = 0,
        iter_text = $('#iter_text'),
        replay_btn = $('#replay');

    // UI element
    let hi_toggle = $("#hi_toggle"),
        lo_toggle = $("#lo_toggle"),
        sm_toggle = $("#sm_toggle"),
        big_toggle = $("#big_toggle"),
        active_color = "#5ea0fa",
        default_color = "#c6c6c6";

    TweenMax.set("#steep_curve", {
        opacity: 0
    })

    TweenMax.set([lo_toggle, big_toggle], {
        attr: {
            stroke: "#5ea0fa"
        }
    })

    // beginning
    init()

    function init() {
        abs_curveBezier = MorphSVGPlugin.pathDataToBezier(flat_curve[0].getAttribute('d'));

        // set
        TweenMax.set([center_dot, deriv, clone_dot, ph_dot], {
            transformOrigin: "50% 50%",
            x: abs_curveBezier[0].x - parseFloat(center_dot.attr("cx")),
            y: abs_curveBezier[0].y - parseFloat(center_dot.attr("cy"))
        })

        TweenMax.set(error_text, {
            transformOrigin: "50% 50%",
            opacity: 0
        })

        TweenMax.set(deriv, {
            opacity: 0
        })

        let flat_curveBezier = MorphSVGPlugin.pathDataToBezier(flat_curve[0].getAttribute('d'), {
            align: "relative",
        });

        // derivative tl (main tl that moves the line)
        deriv_tl.to([deriv, center_dot], 10, {
            bezier: {
                values: flat_curveBezier,
                type: "cubic",
                autoRotate: true,
            },
            onUpdate: checkLocation,
        });

        deriv_tl.seek(0.60) // (1) move to a point 2.5 steep
        curr_pos = applyTransform(center_dot.attr('cx'), center_dot.attr('cy'), center_dot.attr('transform'))
        moveCloneDot() // (2) move clone dot forward
    }


    function moveCloneDot() {
        //show deriv line and copy it
        copyDeriv()

        // move clone dot to center dot curr loc
        TweenMax.to(clone_dot, 0.001, {
            x: center_dot[0]._gsTransform.x,
            y: center_dot[0]._gsTransform.y
        })

        TweenMax.from(clone_dot, 0.01, {
            opacity: 0
        })

        TweenMax.to(ph_dot, 0.0001, {
            x: moveForward()[0] - center_dot.attr("cx"),
            y: moveForward()[1] - center_dot.attr("cy"),
        })
    }

    //play animation until hit intersect
    function checkLocation() {
        if (Math.abs(center_dot[0]._gsTransform.x - ph_dot[0]._gsTransform.x) < 2) {
            let pause_time = 4;
            TweenMax.to(ph_dot, pause_time, {
                opacity: 0,
                onComplete: moveCloneDot
            })
            deriv_tl.pause()
            curr_pos = applyTransform(center_dot.attr('cx'), center_dot.attr('cy'), center_dot.attr('transform'))
            playPauseAnimation(pause_time)

        } else {
            // move both dots forward
            let ph_deriv_path = MorphSVGPlugin.convertToPath(ph_deriv.clone()[0])[0]
            let pos = findAndDrawIntersectionDot(center_dot, ph_deriv_path)
            TweenMax.set(l_line, {
                opacity: 1
            })

            if (pos) {
                TweenMax.set(clone_dot, {
                    x: pos.x - clone_dot.attr("cx"),
                    y: pos.y - clone_dot.attr("cy")
                })
                TweenMax.set(l_line, {
                    attr: {
                        x1: curr_pos[0],
                        y1: curr_pos[1],
                        x2: pos.x,
                        y2: pos.y
                    }
                })
            }
        }
    }

    // called when moveCloneDot is complete
    function moveCenterDotAnimForward() {
        if (dir) {
            deriv_tl.play()
        } else {
            deriv_tl.reverse()
        }
        TweenMax.set(clone_dot, {
            opacity: 1
        })
    }

    // move to a point along the line according to learning rate
    function moveForward() {
        let newStart = applyTransform(deriv.attr("x2"), deriv.attr("y2"), deriv.attr("transform"));
        let newEnd = applyTransform(deriv.attr("x1"), deriv.attr("y1"), deriv.attr("transform"));
        let newX = 0
        let newY = 0

        // calculate slope
        let slope = (newEnd[1] - newStart[1]) / (newEnd[0] - newStart[0])
        let offset = slope * l_rate

        // move dot horizontally
        TweenMax.set(ph_dot, {
            x: center_dot[0]._gsTransform.x + offset,
            y: center_dot[0]._gsTransform.y
        })

        //find intersection downwards
        let ph_deriv_path = MorphSVGPlugin.convertToPath(ph_deriv.clone()[0])[0]
        let pos = findAndDrawIntersectionDot(ph_dot, ph_deriv_path)

        newX = pos.x
        newY = pos.y

        dir = (slope < 0) ? false : true

        return [newX, newY]
    }


    // play pause animation and update counter
    function playPauseAnimation(pause_time) {
        let start = applyTransform(center_dot.attr('cx'), center_dot.attr('cy'), center_dot.attr('transform'))
        let end = applyTransform(clone_dot.attr('cx'), clone_dot.attr('cy'), clone_dot.attr('transform'))

        iter_count += 1;
        iter_text.html('Iteration: ' + iter_count);

        TweenMax.set(error_line, {
            attr: {
                x1: start[0],
                y1: start[1],
                x2: start[0],
                y2: end[1]
            },
            drawSVG: "100%"
        })

        let dir_val = (dir) ? 1.0 : -1.0
        // TweenMax.set(error_text, {
        //     // x: parseFloat(error_line.attr("x1")) + dir_val * 15,
        //     x: (parseFloat(error_line.attr("x1")) - parseFloat($('#text_frame').attr("width")) / 2) + dir_val * parseFloat($('#text_frame').attr("width")) / 1.5,
        //     y: (parseFloat(error_line.attr("y1")) + parseFloat(error_line.attr("y2") - parseFloat($('#text_frame').attr("height")))) / 2,
        //     opacity: 1
        // })

        // error line appears
        TweenMax.from(error_line, 1, {
            drawSVG: "50% 50%"
        })
        //error text appears
        TweenMax.from(error_text, 1, {
            opacity: 0
        })
        //error line disappears
        TweenMax.to(error_line, 1, {
            drawSVG: "50%, 50%",
            delay: 2
        })

        // //error text disappears
        // TweenMax.to(error_text, 1, {
        //     opacity: 0,
        //     delay: 2
        // })

        // clone dot and l line disappears
        TweenMax.to([clone_dot, l_line], 0.5, {
            opacity: 0,
            delay: 3
        })

        //derivativate line disappears
        TweenMax.to(ph_deriv, 1, {
            drawSVG: "50%, 50%",
            delay: 3
        })
    }

    function applyTransform(oldX, oldY, transMat) {
        transMat = transMat.substring(7, transMat.length - 1) //remove matrix(...)
        transMat = convertStrToFloat(transMat.split(","))
        let newX = transMat[0] * oldX + transMat[2] * oldY + transMat[4];
        let newY = transMat[1] * oldX + transMat[3] * oldY + transMat[5];
        return [newX, newY];
    }

    function convertStrToFloat(str) {
        let res = []
        for (var i = 0; i < str.length; i++) {
            let temp = str[i].split(" ");
            for (var j = 0; j < temp.length; j++) {
                res.push(parseFloat(temp[j]));
            }
        }
        return res;
    }

    //functional but not used here
    // dot: jQuery Object
    // curve: normal object
    function findAndDrawIntersectionDot(dot, curve) {
        let path_d = drawDownwardLine(dot);
        let pt = Snap.path.intersection(path_d, curve.getAttribute('d'))
        if (pt[0]) {
            return pt[0]
        }
        return null;
    }

    function drawDownwardLine(dot) {
        let new_center = applyTransform(dot.attr("cx"), dot.attr("cy"), dot.attr("transform"))
        let str = "M" + new_center[0] + "," + (new_center[1]-100) + "v" + '1000';
        return str;
    }

    function copyDeriv() {
        let trans = deriv.attr("transform")
        let new_start = applyTransform(deriv.attr("x2"), deriv.attr("y2"), trans)
        let new_end = applyTransform(deriv.attr("x1"), deriv.attr("y1"), trans)
        TweenMax.set(ph_deriv, {
            attr: {
                x1: new_start[0],
                y1: new_start[1],
                x2: new_end[0],
                y2: new_end[1]
            },
            drawSVG: "100%"
        })

        // time values has to > 0.001
        TweenMax.from(ph_deriv, 1, {
            drawSVG: "50% 50%",
            onComplete: moveCenterDotAnimForward
        })
    }

    function resetAttrLines() {
        TweenMax.set([l_line, error_line], {
            attr: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
            }
        })
    }

    // ################### UI Functions #######################
    hi_toggle.click({
        is_flat: false
    }, toggleCurve)
    lo_toggle.click({
        is_flat: true
    }, toggleCurve)

    big_toggle.click({
        is_sm: false
    }, toggleRate)
    sm_toggle.click({
        is_sm: true
    }, toggleRate)

    replay_btn.click(restartAnimation)

    function toggleRate(event) {
        if (event.data.is_sm) {
            l_rate = l_small
            toggleToggle(sm_toggle, big_toggle)
        } else {
            l_rate = l_big
            toggleToggle(big_toggle, sm_toggle)
        }
        console.log(l_rate)
    }

    function toggleCurve(event) {
        console.log(event.data.is_flat)
        TweenMax.set(flat_curve, {
            opacity: 0
        })

        if (event.data.is_flat) {
            flat_curve = $("#flat_curve");
            l_small = 25
            l_big = 50
            toggleToggle(lo_toggle, hi_toggle)
        } else {
            flat_curve = $("#steep_curve");
            l_small = 13
            l_big = 26
            toggleToggle(hi_toggle, lo_toggle)
        }

        TweenMax.set(flat_curve, {
            opacity: 1
        })

        if (l_rate >= l_breakpoint) {
            l_rate = l_big
        } else {
            l_rate = l_small
        }

        console.log(l_rate)
        restartAnimation()
    }

    function toggleToggle(btn1, btn2, is_btn1) {
            btn1.attr("stroke", active_color)
            btn1.attr("fill", "none")
            btn2.attr("stroke", default_color)
            btn2.attr("fill", "white")
    }

    function restartAnimation() {
        TweenMax.killAll(false, true, false, true)
        resetAttrLines()
        dir = true
        iter_count = 0
        iter_text.html("Iteration: 0")
        init()
    }


    // function lineToBezier(line) {
    //     // console.log(line.attr("transform"))
    //     line_path = MorphSVGPlugin.convertToPath(line);
    //     applyTransform(line.attr("x2"), line.attr("y2"), line.attr("transform"))
    //     return MorphSVGPlugin.pathDataToBezier(line_path[0].getAttribute('d'), {
    //         align: "relative"
    //     })
    // }

    //generate points y = ax^2+bx+c
    // function createPoints(a, b, c, rangeX, step) {
    //     return Array.apply(null, Array((rangeX[1] - rangeX[0]) / step | 0 + 1))
    //         .map(function(d, i) {
    //             var x = rangeX[0] + i * step;
    //             return [x, a * x * x + b * x + c];
    //         })
    // }

}
