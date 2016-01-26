document.onload = (function (d3, saveAs, Blob, undefined) {
    var docEL = document.documentElement;
    var bodyEL = document.getElementsByTagName('body')[0];

    width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
    height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

    graph = new GraphView("#graph",width,height);

    graph.svg.on("mousedown", function(d){
        //console.log("mouse down");
    });
    // graph.svg.on("dblclick", function() {
    //     if (graph.state.creatingNode) {
    //         var x=d3.mouse(this)[0];
    //         var y=d3.mouse(this)[1];
    //         graph.addNode("Node"+x+"_"+y);
    //     }
    // });

    graph.svg.on( "mousedown", function() {
        console.log("mousedown selected false");
        d3.selectAll( 'circle.selected').classed("selected", false);    
        if (graph.state.usingSelection) {
            var p = d3.mouse( this);

            graph.svg.append("rect")
            .attr({
                rx      : 6,
                ry      : 6,
                class   : "selection",
                x       : p[0],
                y       : p[1],
                width   : 0,
                height  : 0
            });
        }
    })
    .on( "mousemove", function() {
        if (graph.state.usingSelection) {
            var s = graph.svg.select("rect.selection");

            if(!s.empty()) {
                var p = d3.mouse( this),
                    d = {
                        x       : parseInt(s.attr( "x"), 10),
                        y       : parseInt(s.attr( "y"), 10),
                        width   : parseInt(s.attr( "width"), 10),
                        height  : parseInt(s.attr( "height"), 10)
                    },
                    move = {
                        x : p[0] - d.x,
                        y : p[1] - d.y
                    };

                if(move.x < 1 || (move.x*2<d.width)) {
                    d.x = p[0];
                    d.width -= move.x;
                } else {
                    d.width = move.x;       
                }

                if(move.y < 1 || (move.y*2<d.height)) {
                    d.y = p[1];
                    d.height -= move.y;
                } else {
                    d.height = move.y;       
                }
               
                s.attr(d);

                d3.selectAll('circle').each(function(state_data, i) {
                    if( 
                        state_data.x>=d.x && state_data.x<=d.x+d.width && 
                        state_data.y>=d.y && state_data.y<=d.y+d.height
                    ) {
                        d3.select(this).classed("selecting", true);
                    } else {
                        d3.select(this).classed("selecting", false);
                    }
                });
            }
        } 
    })
    .on( "mouseup", function() {
        if (graph.state.usingSelection) {
            // remove selection frame
            graph.svg.selectAll( "rect.selection").remove();
            // mark all selecting to be selected
            d3.selectAll('circle.selecting').classed("selected", true);
            // remove temporary selection marker class
            d3.selectAll('circle.selecting').classed("selecting", false);
        }
    });

    $('#arrow').html('<path d="M0,-5L10,0L0,5Z">');

})(window.d3, window.saveAs, window.Blob);

$('#addNodeButton').click(function () {
    var $inputs = $('#add-node :input');
    var values = {};
    $inputs.each(function() {
        values[this.name] = $(this).val();
        $(this).val("");
    });
    $('#console').text("Node Created: " + JSON.stringify(values));
    console.log(values);
    graph.addNode(values);
});

var colorHandler = function () {
    d3.selectAll("circle").style("fill","#FFF");
    var name = $('#colorname').val();
    var value = $('#colorvalue').val();
    var color = $('#colorcolor').val();
    if (name!="" && value!="" && color!="") {
        var selector = "circle[" + name + "='" + value + "']";
        d3.selectAll(selector).style("fill", "#"+color);
    }
}

$('#colorname').change(colorHandler);
$('#colorvalue').change(colorHandler);
$('#colorcolor').change(colorHandler);

