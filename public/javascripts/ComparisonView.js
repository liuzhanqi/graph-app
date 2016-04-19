document.onload = (function (d3, saveAs, Blob, undefined) {
    var left_width = $('#left')[0].clientWidth;
    var left_height = $('#left')[0].clientHeight;
    var right_width = $('#right')[0].clientWidth;
    var right_height = $('#right')[0].clientHeight;

    graph1 = new ReadOnlyGraphView("#left",left_width,left_height,1);
    graph2 = new ReadOnlyGraphView("#right",right_width,right_height,2);

    console.log(graph1);
    console.log(graph2);

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

var MCSHandler = function(event) {
    graph1.removeMCSMarker();
    graph2.removeMCSMarker();
    d3.select(".MCS").each(function() {
        attr("class")
    });
    console.log("MCSHandler");
    var name = event.target.id;
    console.log(name);
    $.post( "/getMCS", {name: name})
        .done(function( data ) {
            var data = data.replace(/'/g, '"');
            data = JSON.parse(data);
            for (var i=0; i<data.graph1.length; ++i) {
                var s = data.graph1[i].s;
                var t = data.graph2[i].t;
                var selector1 = "circle[id='" + s + "']";
                var selector2 = "circle[id='" + t + "']";
                var flag = false;
                d3.select("#left").select(selector1).each(function() {
                    if (d3.select(this).classed("MCS")) flag = true;
                    else d3.select(this).classed("MCS MCSPair" + i, true);
                });
                if (!flag)
                    d3.select("#right").select(selector2).classed("MCS MCSPair" + i, true);
            }
            graph2.update();
        });
}

var removeHandler = function() {
    graph1.update();
    graph1.removeMCSMarker();
    graph2.update();
    graph2.removeMCSMarker();
}

$('#koch').click(MCSHandler);
$('#mc').click(MCSHandler);
$('#remove').click(removeHandler);
