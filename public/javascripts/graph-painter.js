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

    d3.select(window)
    .on("keydown", function(){
        //console.log("key down");
        //graph.addLink("A", "B");
    })
    .on("keyup", function(){
        //thisGraph.svgKeyUp.call(thisGraph);
        //console.log("key up");
    });

    //graph.showGraph();

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
