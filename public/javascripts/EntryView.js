document.onload = (function () {

    entry = new EntryView();

})();

function EntryView() {

}

EntryView.prototype.create_new_graph = function() {
    $.get( "/graphDefinition");
};

EntryView.prototype.upload_file = function() {
    queue()
    .defer(d3.json, "./jsons/n.json")
    .defer(d3.json, "./jsons/l.json")
    .await(function (error, n, l) {
        for (i in n) {
            //TODO currenly, the id is not provided.
            this.addNode(n[i].id);
        }
        for (i in l) {
            this.addLink(n[l[i].source].id,n[l[i].target].id);
        }
    }); 
};

function readFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            var contents = e.target.result;
            console.log(contents);
            var data = JSON.parse(contents);
            console.log(data);
            $.post( "/jsonUpload", {data: JSON.stringify(data)})
                .done(function( data ) {
                    // console.log("in showGraph");
                    console.log(data);
                    location.href='/editor';
                    // // graph.nodes = graph.force.nodes();
                    // // graph.links = graph.force.links();
                    // graph.nodes.splice(0,graph.nodes.length);
                    // graph.links.splice(0,graph.links.length);
                    // console.log(graph.nodes);
                    // console.log(graph.links);
                    // var n = data.nodes;
                    // var l = data.links;
                    // for (i=0; i<n.length; ++i) {
                    //     if (n[i]) {
                    //         graph.nodes.push(n[i]);
                    //         graph.update();
                    //     }
                    // }
                    // for (i=0; i<l.length; ++i) {
                    //     var sourceNode = graph.findNode(l[i].source);
                    //     var targetNode = graph.findNode(l[i].target);
                    //     newLink=l[i];
                    //     newLink.source=sourceNode;
                    //     newLink.target=targetNode;
                    //     graph.links.push(newLink);
                    //     graph.update();
                    // }
                    // console.log(graph.nodes);
                    // console.log(graph.links);
                });
        }
        r.readAsText(f);
    } else { 
        alert("Failed to load file");
    }
}

$("input:file").change(readFile);
