function myGraph(el,w,h) {

    var graph=this;

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", function() {
            vis.attr("transform", 
                "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    var svg = this.svg = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .call(zoom)
        .on("dblclick.zoom", null);

    var vis = this.vis = svg.append("g");

    var force = d3.layout.force()
        .linkDistance(100)
        .charge(-400)
        .size([w, h]);

    var nodes = force.nodes(),
        links = force.links();

    //TODO: backend should save the same thing as this front end for force layout
    console.log("nodes");
    console.log(nodes);
    console.log("links");
    console.log(links);

    this.state = {
        selectedNode: null,
        selectedEdge: null,
        creatingNode: false,
        creatingEdge: false,
        usingEraser: false
    };

    // TODO: bulk adding and bulk removal

    var findNode = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id === id)
                return nodes[i]
        };
    }

    var findNodeIndex = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id === id)
                return i
        };
    }

    var updateColor = function (target) {
        if (target==null) return;
        if (target.attr("class")==="circle") {
            var node=target;
            var nodeID = node.attr("id");
            //console.log("updating color for " + nodeID);
            if (!graph.state.selectedNode || graph.state.selectedNode != nodeID) {
                node.style("fill", "white");
            } else {
                node.style("fill", "LightCoral");
            }
        } else {
            var link=target;
            var linkID = link.attr("id");
            //console.log("updating color for " + nodeID);
            if (!graph.state.selectedEdge || graph.state.selectedEdge != linkID) {
                link.style("stroke", "#bbb");
            } else {
                link.style("stroke", "LightCoral");
            }
        }
    };

    function cancelNodeSelection() {
        if (graph.state.selectedNode !== null) {
            d3.select("#"+graph.state.selectedNode).style("fill", "white");
            graph.state.selectedNode=null;
        }
    }

    function cancelLinkSelection() {
        if (graph.state.selectedEdge !== null) {
            d3.select("#"+graph.state.selectedEdge).style("stroke", "#bbb");
            graph.state.selectedEdge=null;
        }
    }

    var toggleSelectNode = function (nodeID) {
        cancelLinkSelection();
        //cancel selection
        if (graph.state.selectedNode == nodeID) {
            graph.state.selectedNode = null;
            d3.select("#"+nodeID).style("fill", "white");
        } else {
            var oldnodeID = graph.state.selectedNode;
            graph.state.selectedNode = nodeID;
            if (oldnodeID!=null) {
                var oldnode = d3.select("#"+oldnodeID);
                //console.log("calling update color for " + oldnodeID);
                updateColor(oldnode);
            }
            var node=d3.select("#"+nodeID);
            //console.log("calling update color for " + nodeID);
            updateColor(node);
        }
    };

    var toggleSelectEdge = function (linkID) {
        cancelNodeSelection();
        if (graph.state.selectedEdge == linkID) {
            graph.state.selectedEdge = null;
            d3.select("#"+linkID).style("stroke", "#bbb");
        } else {
            var oldlinkID = graph.state.selectedEdge;
            graph.state.selectedEdge = linkID;
            if (oldlinkID!=null) {
                var oldlink = d3.select("#"+oldlinkID);
                //console.log("calling update color for " + oldnodeID);
                updateColor(oldlink);
            }
            var link=d3.select("#"+linkID);
            //console.log("calling update color for " + nodeID);
            updateColor(link);
        }
    };

    var all_button_false = function() {
        graph.state.creatingNode=false;
        graph.state.creatingEdge=false;
        graph.state.usingEraser=false;
        d3.select("#create-edge").attr("style","opacity:0.4;");
        d3.select("#create-node").attr("style","opacity:0.4;");
        d3.select("#eraser").attr("style","opacity:0.4;");
    }

    this.toggle_draw_node = function() {
        //console.log(graph);
        if (graph.state.creatingNode) {
            all_button_false();
        } else {
            all_button_false();
            graph.state.creatingNode=true;
            d3.select("#create-node").attr("style","opacity:1.0;");
            console.log("draw node to true");
        }
    };

    this.toggle_draw_edge = function() {
        if (graph.state.creatingEdge) {
            all_button_false();
        } else {
            all_button_false();
            graph.state.creatingEdge=true;
            d3.select("#create-edge").attr("style","opacity:1.0;");
            console.log("draw edge to true");
        }
    };

    this.toggle_eraser = function() {
        if (graph.state.usingEraser) {
            all_button_false();
        } else {
            all_button_false();
            graph.state.usingEraser=true;
            d3.select("#eraser").attr("style","opacity:1.0;");
            console.log("using eraser to true");
        }
    };

    this.upload_file = function() {
        queue()
        .defer(d3.json, "./jsons/n.json")
        .defer(d3.json, "./jsons/l.json")
        .await(function (error, n, l) {
            for (i in n) {
                graph.addNode(n[i].id);
            }
            for (i in l) {
                graph.addLink(n[l[i].source].id,n[l[i].target].id);
            }
        }); 
    };

    this.save_graph = function() {
        $.post( "/saveGraph");
    }

    this.load_graph = function() {
        // find a way to add all nodes first before adding edges.
        // $.get( "/loadGraph").done(function(data) {
        //     data = JSON.parse(data);
        //     console.log(data);
        //     graph.replaceWithGraph(data.nodes, data.edges);
        //     for (i in data.nodes) {
        //         graph.addNode();
        //     }
        //     //TODO: wait for all node added, then edge.
        //     for (i in data.edges) {
        //         graph.addLink(data.edges[i].source,data.edges[i].target);
        //     }
        //     console.log(JSON.stringify(nodes));
        //     console.log(JSON.stringify(links));
        // });
    }

    function enableZooming() {
        graph.svg.call(zoom).on("dblclick.zoom", null);
    }
     function disableZooming() {
        var fake = d3.behavior.zoom();
        graph.svg.call(fake);
    }

    function update () {
        //console.log(JSON.stringify(nodes));
        //console.log(JSON.stringify(links));
        console.log("nodes");
        console.log(nodes);
        console.log("links");
        console.log(links);
        var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

        link.exit().remove();

        link.enter().insert("line")
            .attr("class", "link")
            .attr("source", function(d) {return d.source.id;})
            .attr("target", function(d) {return d.target.id;})
            .attr("id", function(d) {return d.id;})
            .style("stroke", "#bbb")
            .style("stroke-width", 5)
            .on("mouseover", function(){
                //if (graph.state.selectedEdge!=d3.select(this).attr("id") )
                d3.select(this).style("stroke", "LightSkyBlue ");
                //console.log("mouse over " + d3.select(this).attr("id"));
            })
            .on("mouseout", function(){
                updateColor(d3.select(this));
            })
            .on("click", function() {
                linkID = d3.select(this).attr("id");
                if (graph.state.usingEraser) {
                    graph.removeLink(linkID);
                    if (graph.state.selectedEdge == linkID) graph.state.selectedEdge=null;
                }
                if (!graph.state.usingEraser) {
                    toggleSelectEdge(linkID);
                }

            }); 

        // var node = vis.selectAll("g.node")
        //     .data(nodes, function(d) { return d.id;});

        var node = vis.selectAll("g.node").data(nodes);

        var drag = force.drag() 
             .on('dragstart', function() { disableZooming(); })
             .on('dragend', function() { enableZooming(); });

        node.exit().remove();

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("class","circle")
            .attr("r",20)
            .attr("x", "-8px")
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
            .on("mouseover", function(){
                //if (graph.state.selectedNode!=d3.select(this).attr("id") )
                d3.select(this).style("fill", "LightSkyBlue ");
                console.log("mouse over");
                d3.select(this.parentNode).append("text")
                    .classed("info", true)
                    .attr("dx", 0)
                    .attr("dy", -20)
                    .text(function(d) {return JSON.stringify(d.attr)});
            })
            .on("mouseout", function(){
                updateColor(d3.select(this));
                d3.select(this.parentNode).select('text.info').remove();
            })
            .on("click", function() {
                nodeID = d3.select(this).attr("id");
                if (graph.state.usingEraser) {
                    graph.removeNode(nodeID);
                    if (graph.state.selectedNode == nodeID) graph.state.selectedNode=null;
                }
                if (graph.state.creatingEdge) {
                    oldnodeID = graph.state.selectedNode;
                    if (oldnodeID!=null && oldnodeID!=nodeID ) {
                        console.log("creating edge between "+oldnodeID+" and " + nodeID);
                        graph.addLink(nodeID,oldnodeID);
                    }
                }
                if (!graph.state.usingEraser) {
                    toggleSelectNode(nodeID);
                }
            }); 

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 22)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { 
                //console.log(d.x);
                //console.log(d.y);
                // var x = d.x || 700;
                // var y = d.y || 170;
                //console.log(nodes);
                return "translate(" + d.x + "," + d.y + ")"; 
            });
        });

        // Restart the force layout.
        force.start();
    }
    // Make it all go
    update();
}


this.showGraph = function() {
    $.get( "/getGraph")
        .done(function( data ) {
            data = JSON.parse(data);
            nodes = data.nodes;
            links = data.links;
            update();
        });
} 

// Add and remove elements on the graph object
// id is assigned by back-end
this.addNode = function () {
    $.post( "/createNode")
        .done(function( data ) {
            data = JSON.parse(data);
            //TODO 为什么在这里明明push的只是id，但是nodes里面有x，y，px，py？
            nodes.push({"id":data.id});
            console.log("nodes in addnode");
            console.log(nodes);
            update();
        });
};

this.addNode = function (attributeDict) {
    console.log(attributeDict);
    //attributeDict = JSON.stringify(attributeDict);
    $.post( "/createNode", attributeDict)
        .done(function( data ) {
            newNode = JSON.parse(data);
            nodes.push(newNode);
            console.log("nodes in addnode");
            console.log(data);
            console.log(nodes);
            update();
        });
};

this.removeNode = function (id) {
    var i = 0;
    var n = findNode(id);
    while (i < links.length) {
        if ((links[i]['source'] === n)||(links[i]['target'] == n)) links.splice(i,1);
        else i++;
    }
    var index = findNodeIndex(id);
    if(index !== undefined) {
        nodes.splice(index, 1);
        update();
        $.post( "/removeNode", {id: id});
    }
}

this.addLink = function (sourceId, targetId) {
    console.log("adding link: " + sourceId + " " + targetId);
    var sourceNode = findNode(sourceId);
    var targetNode = findNode(targetId);

    if((sourceNode !== undefined) && (targetNode !== undefined)) {
        $.post( "/createEdge", {source: sourceNode.id, target: targetNode.id})
            .done(function( data ) {
                data = JSON.parse(data);
                links.push({"source":sourceNode, "target":targetNode, "id":data.id});
                update();
            });
    }
}

this.removeLink = function (id) {
    //console.log("removing link, id = " + id);
    if(id !== undefined) {
        for (var i=0; i<links.length; i++) {
            if (links[i].id === id) {
                links.splice(i, 1);
                update();
                $.post( "/removeEdge", {id: id});
            }
        }
    }
}