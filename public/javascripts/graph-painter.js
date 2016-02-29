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
    graph.shiftKeyPressed = false;
    $(window).keydown(function(evt) {
        if (evt.keyCode == 16) {
            graph.shiftKeyPressed = true;
        }
    }).keyup(function(evt) {
        if (evt.keyCode == 16) {
            graph.shiftKeyPressed = false;
        }
    });

    graph.svg.on( "mousedown", function() {
        console.log("mousedown selected false");
        //making this sentence outside cause bug in cancelling selection
        //d3.selectAll( 'circle.selected').classed("selected", false);    
        selectedNodes = d3.selectAll( 'circle.selected');
        if (selectedNodes.size() > 1) {
            selectedNodes.classed("selected", false);   
        }
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

var highlightHandler = function() {
    console.log("highlightHandler");
    var name = $('#extractname').val();
    var value = $('#extractvalue').val();
    var hop = $('#extracthop').val();
    if (name!="" && value!="" && hop!="") {
        var selector = "circle[" + name + "='" + value + "']";
        d3.selectAll(selector).style("fill", "red");
    }
}

var extractHandler = function() {
    console.log("extractHandler");
    var name = $('#extractname').val();
    var value = $('#extractvalue').val();
    var hop = $('#extracthop').val();    
    $.post( "/extractSubgraphByAttribute", {name: name, value: value, hop: hop})
        .done(function( data ) {
            console.log("in showGraph");
            console.log(data);
            // graph.nodes = graph.force.nodes();
            // graph.links = graph.force.links();
            graph.nodes.splice(0,graph.nodes.length);
            graph.links.splice(0,graph.links.length);
            console.log(graph.nodes);
            console.log(graph.links);
            var n = data.nodes;
            var l = data.links;
            for (i=0; i<n.length; ++i) {
                if (n[i]) {
                    graph.nodes.push(n[i]);
                    graph.update();
                }
            }
            for (i=0; i<l.length; ++i) {
                var sourceNode = graph.findNode(l[i].source);
                var targetNode = graph.findNode(l[i].target);
                newLink=l[i];
                newLink.source=sourceNode;
                newLink.target=targetNode;
                graph.links.push(newLink);
                graph.update();
            }
            console.log(graph.nodes);
            console.log(graph.links);
        });
}

var extractCenterHandler = function() {
    console.log("extractCenterHandler");
    var id = $('#extractcenterid').val();
    var hop = $('#extractcenterhop').val();
    console.log(id);
    $.post( "/extractSubgraphByCenter", {id: id, hop: hop})
        .done(function( data ) {
            console.log("in showGraph");
            console.log(data);
            // graph.nodes = graph.forjsonUploadce.nodes();
            // graph.links = graph.force.links();
            graph.nodes.splice(0,graph.nodes.length);
            graph.links.splice(0,graph.links.length);
            console.log(graph.nodes);
            console.log(graph.links);
            var n = data.nodes;
            var l = data.links;
            for (i=0; i<n.length; ++i) {
                if (n[i]) {
                    graph.nodes.push(n[i]);
                    graph.update();
                }
            }
            for (i=0; i<l.length; ++i) {
                var sourceNode = graph.findNode(l[i].source);
                var targetNode = graph.findNode(l[i].target);
                newLink=l[i];
                newLink.source=sourceNode;
                newLink.target=targetNode;
                graph.links.push(newLink);
                graph.update();
            }
            console.log(graph.nodes);
            console.log(graph.links);
        });
} 

var layoutHandler = function(event) {
    console.log(event.target.id);
    graph.changeLayout(event.target.id);
}

$('#colorname').change(colorHandler);
$('#colorvalue').change(colorHandler);
$('#colorcolor').change(colorHandler);
$('#highlightbutton').click(highlightHandler);
$('#extractbutton').click(extractHandler);
$('#extractcenterbutton').click(extractCenterHandler);
$('#nonoverlap').click(layoutHandler);
$('#force').click(layoutHandler);
$('#layout2').click(layoutHandler);
$('#expand-trigger1').click(function(){
    $('#expand-content1').slideToggle('slow');
});
$('#expand-trigger2').click(function(){
    $('#expand-content2').slideToggle('slow');
});
$('#expand-trigger3').click(function(){
    $('#expand-content3').slideToggle('slow');
});