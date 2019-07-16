$( document ).ready(function() {
    $('#dropout-placeholder').load("./img/dropout.svg", main_dropout);
});

function main_dropout() {
    let keep_prob = 0.50,
        play_button = $('#play_button'),
        pause_button = $('#pause_button'),
        prog_bar = $('#prog_bar'),
        dot = $('#dot'),
        iter_count = 0,
        iter_group = $('#iter_group'),
        iter_light = $('#iter_light'),
        iteration_text = $('#iteration_text'),
        // keepprob_text =$('#keepprob_text'),
        box_text = $('#box_text'),
        slide_box = $('#slide_box'),
        drop_0 = $("#drop_0"),
        drop_1 = $("#drop_1"),
        drop_2 = $("#drop_2"),
        drop_3 = $("#drop_3"),
        drop_4 = $("#drop_4"),
        drop_5 = $("#drop_5"),
        drop_6 = $("#drop_6"),
        drop_arr = [drop_0, drop_1, drop_2, drop_3, drop_4, drop_5, drop_6];

    let tl_time = 1.0,
        anim_time = 0.4;

    let tl = new TimelineMax({
        repeat: -1,
        onRepeat: drop_out,
        // paused: true
    });

    init();

    function init() {
        TweenMax.to(dot, 0.0001, {y: -177}); //initial keep prob vale

        // keepprob_text.html("keep_prob: " + keep_prob);
        TweenMax.set([slide_box, iter_light], {opacity: 0});
        TweenMax.set(iter_group, {transformOrigin: "50% 50%"});
        play_button.attr("visibility", "hidden");
        play_button.click(function() {
            tl.play();
            play_button.attr("visibility", "hidden");
            pause_button.attr("visibility", "visible");
        });
        pause_button.click(function() {
            tl.pause();
            play_button.attr("visibility", "visible");
            pause_button.attr("visibility", "hidden");
        });

        tl.to(play_button, tl_time+anim_time, {opacity: 1});

        Draggable.create(dot, {
            type: 'y', //vertical movement only
            onPress: dotPressed,
            bounds: {
              minY: 0,
              maxY: prog_bar.attr('y2') - prog_bar.attr('y1'),
          },
            onDrag: update_keep_prob,
            onRelease: dotReleased,
        })
    }


    function drop_out() {
        // console.log("lol")
        let n = drop_arr.length;
        let num_kept = 0;
        for (var i = 0; i < n; i ++) {
            if (is_keeping()) {
                // drop_arr[i].css("visibility", "visible");
                anim_add_unit(drop_arr[i]);
                num_kept++;
            } else {
                // drop_arr[i].css("visibility", "hidden");
                anim_drop_unit(drop_arr[i]);
            }
        }
        // console.log(num_kept);
        // keeping at least one neuron in the network
        // if (num_kept == 0) {
        //     let idx = parseInt(Math.random() * 7);
        //     anim_add_unit(drop_arr[idx]);
        //     num_kept++;
        // }

        //update iteration text
        update_iteration_text();

    }

    function is_keeping() {
        let num = parseInt(Math.random() * 101);
        if (num <= keep_prob * 100) {
            return true;
        }
        return false;
    }

    function update_keep_prob() {
        let perc = (dot[0]._gsTransform.y) / (prog_bar.attr('y2') - prog_bar.attr('y1'))
        keep_prob = Math.abs(Math.round(100*perc)/100) * 0.95 + 0.05;
        keep_prob = Math.round(keep_prob * 100) / 100;
        // keepprob_text.html("keep_prob: " + keep_prob);
        // console.log(keep_prob)
        update_slide_box();
    }

    function dotPressed() {
        update_keep_prob();
        TweenMax.to(slide_box, 0.5, {opacity: 1});
    }

    function dotReleased(){
        iter_count = 0;
        update_iteration_text();
        tl.restart();
        play_button.attr("visibility", "hidden");
        pause_button.attr("visibility", "visible");
        update_keep_prob();
        TweenMax.to(slide_box, 0.5, {opacity: 0});
    }

    function anim_drop_unit(unit) {
        // TweenMax.to(unit.children("line"), anim_time/2, {drawSVG: "0%"});
        TweenMax.to(unit, anim_time, {opacity: 0.13});
    }

    function anim_add_unit(unit) {
        // TweenMax.to(unit.children("line"), anim_time/2, {drawSVG: "100%"});
        TweenMax.to(unit, anim_time, {opacity: 1});
    }

    function update_slide_box() {
        TweenMax.to(slide_box, 0.0001, {
            y: dot[0]._gsTransform.y
        });
        box_text.html(keep_prob);
    }

    function update_iteration_text() {
        iteration_text.html('Iteration: ' + iter_count);
        if (iter_count == 0) {
            TweenMax.to(iter_light, 0.001, {opacity: 1})
            TweenMax.fromTo(iter_light, 0.9, {drawSVG:'0% 15%'}, {drawSVG: "85%, 100%"})
            TweenMax.to(iter_group, 0.3, {scale:1.6})
            TweenMax.to(iter_group, 0.2, {scale:1, delay:0.7})
            TweenMax.to(iter_light, 0.1, {opacity: 0, delay: 0.8})
        }
        iter_count++;
    }
}
