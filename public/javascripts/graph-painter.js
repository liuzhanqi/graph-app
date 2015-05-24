document.onload = (function (d3, saveAs, Blob, undefined) {
    var docEL = document.documentElement;
    var bodyEL = document.getElementsByTagName('body')[0];

    width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
    height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

    graph = new myGraph("#graph",width,height);

    graph.vis.on("mousedown", function(d){
        //console.log("mouse down");
    });
    graph.vis.on("dblclick", function() {
        var x=d3.mouse(this)[0];
        var y=d3.mouse(this)[1];
        graph.addNode("Node"+x+"_"+y);
    });

    d3.select(window)
    .on("keydown", function(){
        //console.log("key down");
        //graph.addLink("A", "B");
    })
    .on("keyup", function(){
        //thisGraph.svgKeyUp.call(thisGraph);
        //console.log("key up");
    });

    // You can do this from the console as much as you like...
    // graph.addNode("Cause");
    // graph.addNode("Effect");
    // graph.addLink("Cause", "Effect");
    // graph.addNode("A");
    // graph.addNode("B");
    //graph.addLink("A", "B");

})(window.d3, window.saveAs, window.Blob);

function myGraph(el,w,h) {

    var graph=this;

    this.state = {
        selectedNode: null,
        selectedEdge: null,
        creatingNode: false,
        creatingEdge: false,
        usingEraser: false
    };

    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({"id":id});
        update();
    }

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
        }
    }

    this.addLink = function (sourceId, targetId) {
        var sourceNode = findNode(sourceId);
        var targetNode = findNode(targetId);

        if((sourceNode !== undefined) && (targetNode !== undefined)) {
            links.push({"source": sourceNode, "target": targetNode, "id":sourceId+"_"+targetId});
            update();
        }
    }

    this.removeLink = function (id) {
        if(id !== undefined) {
            for (var i=0; i<links.length; i++) {
                if (links[i].id === id) {
                    links.splice(i, 1);
                    update();
                }
            }
        }
    }

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

    // set up the D3 visualisation in the specified element

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    // d3.selectAll("circle").call(d3.behavior.zoom().on("zoom", function() {
    //     //console.log("here", d3.event.translate, d3.event.scale);
    //     console.log("translate(" + d3.event.translate + ")"
    //         + " scale(" + d3.event.scale + ")");
    //     vis.attr("transform",
    //         "translate(" + d3.event.translate + ")"
    //         + " scale(" + d3.event.scale + ")");
    // }));

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([w, h]);

    var nodes = force.nodes(),
        links = force.links();

    var update = function () {
        //console.log(nodes);
        var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

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

        link.exit().remove();

        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("class","circle")
            .attr("r",20)
            .attr("x", "-8px")
            .attr("y", "-8px")
            .attr("id", function(d) {return d.id}) 
            .on("mouseover", function(){
                //if (graph.state.selectedNode!=d3.select(this).attr("id") )
                d3.select(this).style("fill", "LightSkyBlue ");
                //console.log("mouse over " + d3.select(this).attr("id"));
            })
            .on("mouseout", function(){
                updateColor(d3.select(this));
            })
            .on("click", function() {
                nodeID = d3.select(this).attr("id");
                if (graph.state.usingEraser) {
                    graph.removeNode(nodeID);
                    if (graph.state.selectedNode == nodeID) graph.state.selectedNode=null;
                }
                console.log(graph.state.creatingEdge);
                if (graph.state.creatingEdge) {
                    oldnodeID = graph.state.selectedNode;
                    if (oldnodeID!=null && oldnodeID!=nodeID ) {
                        console.log("creating edge between "+oldnodeID+" and " + nodeID);
                        graph.addLink(nodeID,oldnodeID);
                    }
                }
                if (!graph.state.usingEraser) {
                    console.log("toggle");
                    toggleSelectNode(nodeID);
                }

            }); 

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 22)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});

        node.exit().remove();

        force.on("tick", function() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });

        // Restart the force layout.
        force.start();
    }

    // Make it all go
    update();
}

