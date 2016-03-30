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

var updatePosition = function() {
    d3.select("#left").selectAll(".MCS").each(function () {
        console.log(this);
        console.log(this.parentNode);
        var currentx = d3.transform(d3.select(this.parentNode).attr("transform")).translate[0];
        var currenty = d3.transform(d3.select(this.parentNode).attr("transform")).translate[1];
        console.log(currentx);
        console.log(currenty);
        var classNames = d3.select(this).attr("class");
        var node2 = d3.select("#right").select("." + classNames.replace(/\ /g, '.'));
        console.log(node2);
        var x = currentx;
        var y = currenty;
        console.log(x);
        console.log(node2[0][0].parentNode);
        console.log(d3.select(node2[0][0].parentNode).attr("transform"));
        d3.select(node2[0][0].parentNode).transition().attr("transform", "translate(" + x + "," + y + ")");
        console.log(d3.select(node2[0][0].parentNode).attr("transform"));
    });
};

var MCSHandler = function(event) {
    console.log("MCSHandler");
    var name = event.target.id;
    $.post( "/getMCS", {name: name})
        .done(function( data ) {
            var data = data.replace(/'/g, '"');
            data = JSON.parse(data);
            console.log(data);
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
            updatePosition();
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
