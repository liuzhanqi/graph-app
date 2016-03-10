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
    console.log("MCSHandler");
    var name = event.target.id;
    $.post( "/getMCS", {name: name})
        .done(function( data ) {
            var data = data.replace(/'/g, '"');
            data = JSON.parse(data);
            console.log(data);
            for (i=0; i<data.graph1.length; ++i) {
                var e = data.graph1[i]
                var selector = "circle[id='" + e.source + "']";
                d3.select(selector).classed("MCS", true);
                selector = "line[source='" + e.source + "']" + "[target='" + e.target + "']";
                // console.log(selector);
                // console.log($("#left").find(selector));
                // $("#left").find(selector).addClass("MCS");
            }
            // for (i=0; i<data.graph2.length; ++i) {
            //     var e = data.graph2[i]
            //     var selector = "line[source='" + e.source + "']" + "[target='" + e.target + "']";
            //     $("#right").find(selector).addClass("MCS");
            // }
        });
    // var name = $('#extractname').val();
    // var value = $('#extractvalue').val();
    // var hop = $('#extracthop').val();
    // if (name!="" && value!="" && hop!="") {
    //     var selector = "circle[" + name + "='" + value + "']";
    //     d3.selectAll(selector).style("fill", "red");
    // }
}

$('#koch').click(MCSHandler);
