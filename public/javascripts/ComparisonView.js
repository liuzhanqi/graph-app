document.onload = (function (d3, saveAs, Blob, undefined) {
    var left_width = $('#left')[0].clientWidth;
    var left_height = $('#left')[0].clientHeight;
    var right_width = $('#right')[0].clientWidth;
    var right_height = $('#right')[0].clientHeight;

    graph1 = new ReadOnlyGraphView("#left",left_width,left_height,1);
    graph2 = new ReadOnlyGraphView("#right",right_width,right_height,2);

    console.log(graph1);
    console.log(graph2);

    // graph1.svg.on("mousedown", function(d){
    //     //console.log("mouse down");
    // });

    // graph1.svg.on( "mousedown", function() {
    //     //making this sentence outside cause bug in cancelling selection
    //     //d3.selectAll( 'circle.selected').classed("selected", false);    
    //     selectedNodes = d3.selectAll( 'circle.selected');
    //     if (selectedNodes.size() > 1) {
    //         console.log("mousedown selected size>1, selection false");
    //         selectedNodes.classed("selected", false);   
    //     }
    //     if (graph.state.usingSelection) { 
    //         // cancel the coloring when starting selection box
    //         d3.selectAll("circle").style('fill', null);
    //         var p = d3.mouse( this);

    //         graph.svg.append("rect")
    //         .attr({
    //             rx      : 6,
    //             ry      : 6,
    //             class   : "selection",
    //             x       : p[0],
    //             y       : p[1],
    //             width   : 0,
    //             height  : 0
    //         });
    //     }
    // })
    // .on( "mousemove", function() {
    //     if (graph.state.usingSelection) {
    //         var s = graph.svg.select("rect.selection");

    //         if(!s.empty()) {
    //             var p = d3.mouse( this),
    //                 d = {
    //                     x       : parseInt(s.attr( "x"), 10),
    //                     y       : parseInt(s.attr( "y"), 10),
    //                     width   : parseInt(s.attr( "width"), 10),
    //                     height  : parseInt(s.attr( "height"), 10)
    //                 },
    //                 move = {
    //                     x : p[0] - d.x,
    //                     y : p[1] - d.y
    //                 };

    //             if(move.x < 1 || (move.x*2<d.width)) {
    //                 d.x = p[0];
    //                 d.width -= move.x;
    //             } else {
    //                 d.width = move.x;       
    //             }

    //             if(move.y < 1 || (move.y*2<d.height)) {
    //                 d.y = p[1];
    //                 d.height -= move.y;
    //             } else {
    //                 d.height = move.y;       
    //             }
               
    //             s.attr(d);

    //             d3.selectAll('circle').each(function(state_data, i) {
    //                 if( 
    //                     state_data.x>=d.x && state_data.x<=d.x+d.width && 
    //                     state_data.y>=d.y && state_data.y<=d.y+d.height
    //                 ) {
    //                     d3.select(this).classed("selecting", true);
    //                 } else {
    //                     d3.select(this).classed("selecting", false);
    //                 }
    //             });
    //         }
    //     } 
    // })
    // .on( "mouseup", function() {
    //     if (graph.state.usingSelection) {
    //         // remove selection frame
    //         graph.svg.selectAll( "rect.selection").remove();
    //         // mark all selecting to be selected
    //         d3.selectAll('circle.selecting').classed("selected", true);
    //         // remove temporary selection marker class
    //         d3.selectAll('circle.selecting').classed("selecting", false);
    //     }
    // });

    $('#arrow').html('<path d="M0,-5L10,0L0,5Z">');

})(window.d3, window.saveAs, window.Blob);

var colorHandler = function () {
    console.log("colorHandler");
    // d3.selectAll("circle").style("fill","#FFF");
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
