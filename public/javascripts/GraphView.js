function GraphView(el,w,h) {

    this.zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", function() {
            vis.attr("transform", 
                "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    var svg = this.svg = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .call(this.zoom)
        .on("dblclick.zoom", null);

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

    var vis = this.vis = svg.append("g");

    this.force = d3.layout.force()
        .linkDistance(100)
        .charge(-400)
        .size([w, h]);

    this.nodes = this.force.nodes();
    this.links = this.force.links();

    this.state = {
        selectedNode: null,
        selectedEdge: null,
        creatingNode: false,
        creatingEdge: false,
        usingEraser: false,
        isDirected: false
    };

    var graph = this;

    // TODO: bulk adding and bulk removal
    this.showInputBox(this.showGraph);
    // Make it all go
}

GraphView.prototype.showInputBox = function(callback) {
    that = this;
   $.get( "/getGraphDefinition")
    .done(function( data ) {
        data = JSON.parse(data);
        console.log("in showInputBox");
        console.log(data);
        that.state.isDirected = data.isDirected;
        document.getElementById("node-name").innerHTML = data.nodeName;
        document.getElementById("edge-name").innerHTML = data.edgeName;
        for (index = 0; index < data.nodeAttribute.length; ++index) {
            if (index == 0) {
                $row = $('#node-attribute-row');
                $label = $row.find('#node-attribute-col');
                $label.text(data.nodeAttribute[index]);
                $input = $row.find('#node-attribute-input');
                $input.attr('name', data.nodeAttribute[index]);
                console.log($input);
            } else {
                $lastRow = $('#node-attribute-row:last');
                $row = $lastRow.clone();
                $label = $row.find('#node-attribute-col');
                $label.text(data.nodeAttribute[index]);
                $input = $row.find('#node-attribute-input');
                $input.attr('name', data.nodeAttribute[index]);
                $row.insertAfter($lastRow);
            }
        }
        for (index = 0; index < data.edgeAttribute.length; ++index) {
            if (index == 0) {
                $row = $('#edge-attribute-row');
                $label = $row.find('#edge-attribute-col');
                $label.text(data.edgeAttribute[index]);
                $input = $row.find('#edge-attribute-input');
                $input.attr('name', data.edgeAttribute[index]);
                console.log($input);
            } else {
                $lastRow = $('#edge-attribute-row:last');
                $row = $lastRow.clone();
                $label = $row.find('#edge-attribute-col');
                $label.text(data.edgeAttribute[index]);
                $input = $row.find('#edge-attribute-input');
                $input.attr('name', data.edgeAttribute[index]);
                $row.insertAfter($lastRow);
            }
        }
        callback();
    });
}

GraphView.prototype.showGraph = function() {
    console.log("in show graph");
    console.log(this.state);
    $.get( "/getGraph")
        .done(function( data ) {
            console.log("in showGraph");
            console.log(data);
            graph.nodes = graph.force.nodes();
            graph.links = graph.force.links();
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
        });
} 

// Add and remove elements on the this object
// id is assigned by back-end
GraphView.prototype.addNode = function () {
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

GraphView.prototype.addNode = function (attributeDict) {
    console.log(attributeDict);
    //attributeDict = JSON.stringify(attributeDict);
    var graph = this;
    $.post( "/createNode", attributeDict)
        .done(function( data ) {
            newNode = JSON.parse(data);
            graph.nodes.push(newNode);
            graph.update();
        });
};

GraphView.prototype.removeNode = function (id) {
    var i = 0;
    var n = this.findNode(id);
    while (i < this.links.length) {
        if ((this.links[i]['source'] === n)||(this.links[i]['target'] == n)) this.links.splice(i,1);
        else i++;
    }
    var index = this.findNodeIndex(id);
    if(index !== undefined) {
        this.nodes.splice(index, 1);
        this.update();
        $.post( "/removeNode", {id: id});
    }
};

GraphView.prototype.addLink = function (sourceId, targetId, attributeDict) {
    console.log("adding link: " + sourceId + " " + targetId);
    var sourceNode = this.findNode(sourceId);
    var targetNode = this.findNode(targetId);

    var graph = this;

    if((sourceNode !== undefined) && (targetNode !== undefined)) {
        $.post( "/createEdge", 
            {source: sourceNode.id, target: targetNode.id, attr: JSON.stringify(attributeDict)})
            .done(function( data ) {
                data = JSON.parse(data);
                newLink = {"source":sourceNode, "target":targetNode, "id":data.id};
                if (attributeDict) {
                    for (var key in attributeDict) {
                        if (attributeDict.hasOwnProperty(key)) {
                            newLink[key] = attributeDict[key];
                        }
                    }
                }
                console.log("newLink");
                console.log(newLink);
                graph.links.push(newLink);
                graph.update();
            });
    }
};

GraphView.prototype.removeLink = function (id) {
    //console.log("removing link, id = " + id);
    if(id !== undefined) {
        for (var i=0; i<this.links.length; i++) {
            if (this.links[i].id === id) {
                this.links.splice(i, 1);
                this.update();
                $.post( "/removeEdge", {id: id});
            }
        }
    }
};

GraphView.prototype.findNode = function (id) {
    for (var i=0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === id)
            return this.nodes[i]
    };
}

GraphView.prototype.findNodeIndex = function (id) {
    for (var i=0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === id)
            return i
    };
}

GraphView.prototype.updateColor = function (target) {
    if (target==null) return;
    if (target.attr("class")==="circle") {
        var node=target;
        var nodeID = node.attr("id");
        //console.log("updating color for " + nodeID);
        if (!this.state.selectedNode || this.state.selectedNode != nodeID) {
            node.style("fill", "white");
        } else {
            node.style("fill", "LightCoral");
        }
    } else {
        var link=target;
        var linkID = link.attr("id");
        //console.log("updating color for " + nodeID);
        if (!this.state.selectedEdge || this.state.selectedEdge != linkID) {
            link.style("stroke", "#bbb");
        } else {
            link.style("stroke", "LightCoral");
        }
    }
};

GraphView.prototype.cancelNodeSelection = function() {
    if (this.state.selectedNode !== null) {
        d3.select("#"+this.state.selectedNode).style("fill", "white");
        this.state.selectedNode=null;
    }
}

GraphView.prototype.cancelLinkSelection = function() {
    if (this.state.selectedEdge !== null) {
        d3.select("#"+this.state.selectedEdge).style("stroke", "#bbb");
        this.state.selectedEdge=null;
    }
}

GraphView.prototype.toggleSelectNode = function (nodeID) {
    this.cancelLinkSelection();
    //cancel selection
    if (this.state.selectedNode == nodeID) {
        this.state.selectedNode = null;
        d3.select("#"+nodeID).style("fill", "white");
    } else {
        var oldnodeID = this.state.selectedNode;
        this.state.selectedNode = nodeID;
        if (oldnodeID!=null) {
            var oldnode = d3.select("#"+oldnodeID);
            //console.log("calling update color for " + oldnodeID);
            this.updateColor(oldnode);
        }
        var node=d3.select("#"+nodeID);
        //console.log("calling update color for " + nodeID);
        this.updateColor(node);
    }
};

GraphView.prototype.toggleSelectEdge = function (linkID) {
    this.cancelNodeSelection();
    if (this.state.selectedEdge == linkID) {
        this.state.selectedEdge = null;
        d3.select("#"+linkID).style("stroke", "#bbb");
    } else {
        var oldlinkID = this.state.selectedEdge;
        this.state.selectedEdge = linkID;
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

GraphView.prototype.all_button_false = function() {
    this.state.creatingNode=false;
    this.state.creatingEdge=false;
    this.state.usingEraser=false;
    d3.select("#create-edge").attr("style","opacity:0.4;");
    d3.select("#create-node").attr("style","opacity:0.4;");
    d3.select("#eraser").attr("style","opacity:0.4;");
}

GraphView.prototype.toggle_draw_node = function() {
    //console.log(this);
    if (this.state.creatingNode) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.creatingNode=true;
        d3.select("#create-node").attr("style","opacity:1.0;");
        console.log("draw node to true");
    }
};

GraphView.prototype.toggle_draw_edge = function() {
    if (this.state.creatingEdge) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.creatingEdge=true;
        d3.select("#create-edge").attr("style","opacity:1.0;");
        console.log("draw edge to true");
    }
};

GraphView.prototype.toggle_eraser = function() {
    if (this.state.usingEraser) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.usingEraser=true;
        d3.select("#eraser").attr("style","opacity:1.0;");
        console.log("using eraser to true");
    }
};

GraphView.prototype.save_graph = function() {
    //TODO for now, save graph wont delete the deleted node in db.
    $.post( "/saveGraph");
}

GraphView.prototype.load_graph = function() {
    var graph = this;
    $.get( "/loadGraph").done(function(data) {
        data = JSON.parse(data);
        console.log("data");
        console.log(data);
        graph.nodes.splice(0,graph.nodes.length);
        graph.links.splice(0,graph.links.length);
        console.log(data.nodes);
        console.log(data.links);
        for (var i=0; i<data.nodes.length; i++) {
            graph.nodes.push(data.nodes[i]);
            graph.update();
        }
        for (var i=0; i<data.links.length; i++)  {
            var sourceNode = graph.findNode(data.links[i].source);
            var targetNode = graph.findNode(data.links[i].target);
            graph.links.push(
                { "source": sourceNode, 
                  "target": targetNode, 
                  "id": data.links[i].id
                });
            graph.update();
        }
    });
}

GraphView.prototype.update = function() {
    //console.log(JSON.stringify(nodes));
    //console.log(JSON.stringify(links));
    // console.log("nodes");
    // console.log(this.nodes);
    // console.log("links");
    var hiddenLabel = ["index", "weight", "x", "y", "px", "py", "fixed", "id", "source", "target"]; 

    var graph = this;

    var link = this.vis.selectAll("line.link")
        .data(this.links, function(d) { return d.source.id + "-" + d.target.id; });

    link.exit().remove();
    link.enter().insert("line")
        .attr("class", "link")
        .attr("source", function(d) {return d.source.id;})
        .attr("target", function(d) {return d.target.id;})
        .attr("id", function(d) {return d.id;})
        .attr("marker-end", function(d) {
            console.log("market-end");
            console.log(graph.state.isDirected);
            if (graph.state.isDirected)
                return "url(#arrow)";
            else return "";
        })
        .style("stroke", "#bbb")
        .style("stroke-width", 5)
        .each(function(d) {
            var header = d3.select(this);
            // loop through the keys - this assumes no extra data
            d3.keys(d).forEach(function(key) {
                if (key != "id")
                    header.attr(key, d[key]);
            });
        })
        .on("mouseover", function(d){
            //if (this.state.selectedEdge!=d3.select(this).attr("id") )
            d3.select(this).style("stroke", "LightSkyBlue ");
            //console.log("mouse over " + d3.select(this).attr("id"));
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
            graph.updateColor(d3.select(this));
            d3.select("#console").text("");
            //d3.select(this.parentNode).select('text.info').remove();
        })
        .on("click", function() {
            linkID = d3.select(this).attr("id");
            if (graph.state.usingEraser) {
                graph.removeLink(linkID);
                if (graph.state.selectedEdge == linkID) graph.state.selectedEdge=null;
            }
            if (!graph.state.usingEraser) {
                graph.toggleSelectEdge(linkID);
            }

        }); 

    var node = this.vis.selectAll("g.node").data(this.nodes);

    var drag = this.force.drag() 
        .on('dragstart', function disableZooming() {
            var fake = d3.behavior.zoom();
            graph.svg.call(fake);
        })
        .on('dragend', function enableZooming() {
            graph.svg.call(graph.zoom).on("dblclick.zoom", null);
        });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(this.force.drag);

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
        .on("mouseover", function(d){
            //if (this.state.selectedNode!=d3.select(this).attr("id") )
            d3.select(this).style("fill", "LightSkyBlue ");
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
            // show label near the circle
            // d3.select(this.parentNode).append("text")
            //     .classed("info", true)
            //     .attr("dx", 0)
            //     .attr("dy", -20)
            //     .text(function(d) {
            //         var header = d3.select(this);
            //         var label = "";
            //         // loop through the keys - this assumes no extra data
            //         d3.keys(d).forEach(function(key) {
            //             if ($.inArray(key, hiddenLabel) == -1 && key!="graphID")
            //                 label+=key+": "+d[key]+"; ";
            //         });
            //         return label;
            //     });
        })
        .on("mouseout", function(){
            graph.updateColor(d3.select(this));
            d3.select("#console").text("");
            //d3.select(this.parentNode).select('text.info').remove();
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
                    //get the current edge attribute in the form
                    var $inputs = $('#add-edge :input');
                    var values = {};
                    $inputs.each(function() {
                        values[this.name] = $(this).val();
                        $(this).val("");
                    });
                    console.log(values);
                    graph.addLink(oldnodeID,nodeID,values);
                }
            }
            if (!graph.state.usingEraser) {
                graph.toggleSelectNode(nodeID);
            }
        }); 

    nodeEnter.append("text")
        .attr("class", "nodetext")
        .attr("dx", 22)
        .attr("dy", ".35em")
        .text(function(d) {return d.id});

    this.force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });
    });

    // Restart the force layout.
    this.force.start();
}