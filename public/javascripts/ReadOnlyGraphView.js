function ReadOnlyGraphView(el,w,h,whichgraph) {
    var that = this;
    this.w = w;
    this.h = h;
    this.whichgraph = whichgraph;

    var svg = this.svg = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h)

    svg.append("defs").append("marker")
        .attr({
            "id":"arrow",
            "viewBox":"0 -5 10 10",
            "refX":5,
            "refY":0,
            "markerWidth":4,
            "markerHeight":4,
            "orient":"auto"
        })
        .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class","arrowHead");

    var vis = this.vis = svg.append("g").attr("id", "vis");

    this.zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", function() {
            console.log("zoomiing");
            console.log(vis)
            vis.attr("transform", 
                "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    svg.call(this.zoom).on("dblclick.zoom", null);

    this.force = d3.layout.force()
        .charge(-400)
        .linkDistance(90)
        .theta(1)
        // .linkStrength(0.2)
        // .friction(0.5)
        .size([w, h]);

    this.nodes = this.force.nodes();
    this.links = this.force.links();

    this.state = {
        selectedNode: null,
        //selectedEdge: null,
        creatingNode: false,
        creatingEdge: false,
        usingEraser: false,
        isDirected: false
    };

    var graph = this;

    // Make it all go
    this.showGraph();
}

ReadOnlyGraphView.prototype.showGraph = function() {
    var that = this;
    console.log("in show graph " + this.whichgraph);
    $.get( "/getGraph" + this.whichgraph)
        .done(function( data ) {
            console.log("in showGraph");
            console.log(data);
            that.nodes = that.force.nodes();
            that.links = that.force.links();
            var n = data.nodes;
            var l = data.links;
            for (i=0; i<n.length; ++i) {
                if (n[i]) {
                    that.nodes.push(n[i]);
                }
            }
            for (i=0; i<l.length; ++i) {
                var sourceNode = that.findNode(l[i].source);
                var targetNode = that.findNode(l[i].target);
                var newLink=l[i];
                newLink.source=sourceNode;
                newLink.target=targetNode;
                that.links.push(newLink);
            }
            that.update();
        });
} 

ReadOnlyGraphView.prototype.findNode = function (id) {
    for (var i=0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === id)
            return this.nodes[i];
    };
}

ReadOnlyGraphView.prototype.findNodeIndex = function (id) {
    for (var i=0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === id) return i;
    };
}


ReadOnlyGraphView.prototype.update = function() {
    console.log("in update " + this.whichgraph);
    var hiddenLabel = ["index", "weight", "x", "y", "px", "py", "fixed", "id", "source", "target"]; 

    var graph = this;

    var link = this.vis.selectAll("line.link")
        .data(this.links, function(d) { 
            return d.source.id + "-" + d.target.id; 
        });

    link.exit().remove();
    link.enter().insert("line")
        .attr("class", "link")
        .attr("source", function(d) {return d.source.id;})
        .attr("target", function(d) {return d.target.id;})
        .attr("id", function(d) {return d.id;})
        // .attr("marker-end", function(d) {
        //     if (graph.state.isDirected)
        //         return "url(#arrow)";
        //     else return "";
        // })
        //.style("stroke", "#bbb")
        .style("stroke-width", 3)
        .each(function(d) {
            var header = d3.select(this);
            // loop through the keys - this assumes no extra data
            d3.keys(d).forEach(function(key) {
                if (key != "id")
                    header.attr(key, d[key]);
            });
        })
        .on("mouseover", function(d){
            // show edge attribute in console
            d3.select("#console").text(function() {
                    var header = d3.select(that);
                    var label = "";
                    // loop through the keys - this assumes no extra data
                    d3.keys(d).forEach(function(key) {
                        if ($.inArray(key, hiddenLabel) == -1 && key!="graphID")
                            label+=key+": "+d[key]+"; ";
                    });
                    return label;
                });
        })
        .on("mouseout", function(){
            d3.select("#console").text("");
        });

    var node = this.vis.selectAll("g.node").data(this.nodes);

    var drag = this.force.drag() 
        .on('dragstart', function disableZooming() {
            console.log("dragstart");
            var fake = d3.behavior.zoom();
            graph.svg.call(fake);
        })
        .on('dragend', function enableZooming() {
            graph.svg.call(graph.zoom).on("dblclick.zoom", null);
        });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(drag);

    //BUG: update issue, redo: delete a random node
    nodeEnter.append("circle")
        .attr("class","circle")
        .attr("r", 15)
        .attr("x", function(d) {return "-8px";})
        .attr("y", "-8px")
        .attr("id", function(d) {return d.id})
        .each(function(d) {
            var header = d3.select(this);
            // loop through the keys - this assumes no extra data
            d3.keys(d).forEach(function(key) {
                if (key != "id")
                    header.attr(key, d[key]);
            });
        })
        .on("mouseover", function(d){
            var that = this;
            // show label in the console
            d3.select("#console").text(function() {
                    var header = d3.select(that);
                    var label = "";
                    // loop through the keys - this assumes no extra data
                    d3.keys(d).forEach(function(key) {
                        if ($.inArray(key, hiddenLabel) == -1 && key!="graphID")
                            label+=key+": "+d[key]+"; ";
                    });
                    return label;
                });
        })
        .on("mouseout", function(){
            d3.select("#console").text("");
        });

    nodeEnter.append("text")
        .attr("class", "nodetext")
        .attr("dx", 22)
        .attr("dy", ".35em")
        .text(function(d) { 
            var label = "";
            d3.keys(d).forEach(function(key) {
                if ($.inArray(key, hiddenLabel) == -1 && key!="graphID")
                    label+=key+": "+d[key]+"; ";
            });
            return label;
        });

    this.force.on("tick", function() {
        node.attr("transform", function(d) { 
            if ((graph.whichgraph == 2) && (d3.select(this).select("circle").classed("MCS"))) {
                var classNames = d3.select(this).select("circle").attr("class");
                var node1 = d3.select("#left").select("." + classNames.replace(/\ /g, '.'));
                var x = d3.transform(d3.select(node1[0][0].parentNode).attr("transform")).translate[0];
                var y = d3.transform(d3.select(node1[0][0].parentNode).attr("transform")).translate[1];
                d.x = x;
                d.y = y;
                return "translate(" + x + "," + y + ")"; 
            } else {
                return "translate(" + d.x + "," + d.y + ")"; 
            }
        });
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    });

    // Restart the force layout.
    this.force.start();
}