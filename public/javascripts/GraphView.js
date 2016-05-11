function GraphView(el,w,h) {

    var that = this;
    this.w = w;
    this.h = h;

    this.zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", function() {
            if (!that.state.usingSelection) {
                vis.attr("transform", 
                    "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }
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

    var vis = this.vis = svg.append("g").attr("id", "vis");

    this.force = d3.layout.force()
        // .linkDistance(100)
        // .charge(-400)
        .charge(-400)
        .linkDistance(90)
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
    this.showInputBox(this.showGraph);
    // Make it all go
}

GraphView.prototype.showInputBox = function(callback) {
    that = this;
   $.get( "/getGraphDefinition")
    .done(function(definition) {
        definition = JSON.parse(definition);
        console.log("in showInputBox");
        console.log(definition);
        that.state.isDirected = definition.isDirected;
        document.getElementById("node-name").innerHTML = definition.nodeName;
        document.getElementById("edge-name").innerHTML = definition.edgeName;
        for (index = 0; index < definition.nodeAttribute.length; ++index) {
            if (index == 0) {
                $row = $('#node-attribute-row');
                $label = $row.find('#node-attribute-col');
                $label.text(definition.nodeAttribute[index]);
                $input = $row.find('#node-attribute-input');
                $input.attr('name', definition.nodeAttribute[index]);
                console.log($input);
            } else {
                $lastRow = $('#node-attribute-row:last');
                $row = $lastRow.clone();
                $label = $row.find('#node-attribute-col');
                $label.text(definition.nodeAttribute[index]);
                $input = $row.find('#node-attribute-input');
                $input.attr('name', definition.nodeAttribute[index]);
                $row.insertAfter($lastRow);
            }
        }
        for (index = 0; index < definition.edgeAttribute.length; ++index) {
            if (index == 0) {
                $row = $('#edge-attribute-row');
                $label = $row.find('#edge-attribute-col');
                $label.text(definition.edgeAttribute[index]);
                $input = $row.find('#edge-attribute-input');
                $input.attr('name', definition.edgeAttribute[index]);
                console.log($input);
            } else {
                $lastRow = $('#edge-attribute-row:last');
                $row = $lastRow.clone();
                $label = $row.find('#edge-attribute-col');
                $label.text(definition.edgeAttribute[index]);
                $input = $row.find('#edge-attribute-input');
                $input.attr('name', definition.edgeAttribute[index]);
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
    // console.log("removeNode " + id);
    var i = 0;
    var n = this.findNode(id);
    // console.log(n);
    // console.log("before deleting, links = ");
    // console.log(this.links);
    while (i < this.links.length) {
        if ((this.links[i]['source'] === n)||(this.links[i]['target'] === n)) {
            this.links.splice(i,1);
        }
        else {
            i++;
        }
    }
    // console.log("after deleting, links = ");
    // console.log(this.links);
    // console.log("before deleting, nodes = ");
    // console.log(this.nodes);
    var index = this.findNodeIndex(id);
    if(index !== undefined) {
        this.nodes.splice(index, 1);
        $.post( "/removeNode", {id: id});
    }
    // console.log("after deleting, nodes = ");
    // console.log(this.nodes);
    this.update();
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

GraphView.prototype.extract_subgraph = function() {
    this.all_button_false();
    console.log("extract_subgraph");
    var nodes = [];
    d3.selectAll("circle.selected").each(function (node) {
        nodes.push(node.id);
    });
    console.log(nodes);
    $.post( "/extractSubgraph", {nodes : JSON.stringify(nodes)})
        .done(function( data ) {
            console.log("in showGraph");
            console.log(data);
            // graph.nodes = graph.force.nodes();
            // graph.links = graph.force.links();
            graph.nodes.splice(0,graph.nodes.length);
            graph.links.splice(0,graph.links.length);
            console.log(graph.nodes);
            console.log(graph.links);
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
            console.log(graph.nodes);
            console.log(graph.links);
        });
}

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

GraphView.prototype.cancelNodeSelection = function() {
    d3.select('circle.selected').classed("selected", false);
    if (this.state.selectedNode !== null) {
        this.state.selectedNode=null;
    }
}

GraphView.prototype.cancelLinkSelection = function() {
    d3.select('line.selected').classed("selected", false);
    if (this.state.selectedEdge !== null) {
        this.state.selectedEdge=null;
    }
}

GraphView.prototype.toggleSelectNode = function (nodeID) {
    console.log("toggleSelectNode");
    this.cancelLinkSelection();
    var currentNode = d3.select("#"+nodeID);
    if (!currentNode.classed("selected")) {
        d3.select('circle.selected').classed("selected", false);
        currentNode.classed("selected", true);
    } else {
        currentNode.classed("selected", false);
    }
    //update selectedNode
    if (this.state.selectedNode == nodeID) {
        this.state.selectedNode = null;
    } else {
        this.state.selectedNode = nodeID;
        $('#extractcenterid').val(nodeID);
    }
};

GraphView.prototype.toggleSelectEdge = function (linkID) {
    this.cancelNodeSelection();
    var currentEdge = d3.select("#"+linkID);
    if (!currentEdge.classed( "selected")) {
        d3.select('line.selected').classed("selected", false);
        currentEdge.classed("selected", true);
    } else {
        currentEdge.classed("selected", false);
    }
    //update selectedEdge
    if (this.state.selectedEdge == linkID) {
        this.state.selectedEdge = null;
    } else {
        this.state.selectedEdge = linkID;
    }
};

GraphView.prototype.all_button_false = function() {
    this.state.creatingNode=false;
    this.state.creatingEdge=false;
    this.state.usingEraser=false;
    this.state.usingSelection=false;
    d3.select("#create-edge-button").attr("style","opacity:0.4;");
    d3.select("#create-node-button").attr("style","opacity:0.4;");
    d3.select("#eraser-button").attr("style","opacity:0.4;");
    d3.select('#selection-button').attr("style","opacity:0.4;");
}

GraphView.prototype.toggle_draw_node = function() {
    //console.log(this);
    if (this.state.creatingNode) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.creatingNode=true;
        d3.select("#create-node-button").attr("style","opacity:1.0;");
        console.log("draw node to true");
    }
};

GraphView.prototype.toggle_draw_edge = function() {
    if (this.state.creatingEdge) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.creatingEdge=true;
        d3.select("#create-edge-button").attr("style","opacity:1.0;");
        console.log("draw edge to true");
    }
};

GraphView.prototype.toggle_eraser = function() {
    if (this.state.usingEraser) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.usingEraser=true;
        d3.select("#eraser-button").attr("style","opacity:1.0;");
        console.log("using eraser to true");
    }
};

GraphView.prototype.toggle_selection = function() {
    if (this.state.usingSelection) {
        this.all_button_false();
    } else {
        this.all_button_false();
        this.state.usingSelection=true;
        d3.select("#selection-button").attr("style","opacity:1.0;");
        console.log("selection to true");
    }
}

GraphView.prototype.save_graph = function() {
    $.post( "/saveGraph").done(function(message) {
        console.log(message);
        if (message == "200") alert("Successfully saved.");
        else alert("Connection error")
    });
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

GraphView.prototype.changeLayout = function(layoutName) {
    console.log("changeLayout");
    if (layoutName == "hierarchy") {
        this.force = cola.d3adaptor()
            .avoidOverlaps(true)
            .size([this.w, this.h]);
        
        this.update();

        this.force
            .nodes(this.nodes)
            .links(this.links)
            .flowLayout("y", 60)
            .symmetricDiffLinkLengths(24)
            .start(10,20,20);   
    }
    if (layoutName == "force") {
        this.force = d3.layout.force()
            .linkDistance(100)
            .charge(-400)
            .size([this.w, this.h]);
            
        this.update();

        this.force
            .nodes(this.nodes)
            .links(this.links)
            .start();
    }
    if (layoutName == "flow") {
        this.force = cola.d3adaptor()
            .avoidOverlaps(true)  
            .size([this.w, this.h]);

        this.update();

        this.force
            .nodes(this.nodes)
            .links(this.links)
            .flowLayout('x', 60) 
            .jaccardLinkLengths(60)  
            .start(10,20,20);
    }
}

GraphView.prototype.downloadjson = function(callback) {
    window.open("/downloadjson");
}

GraphView.prototype.update = function() {
    var hiddenLabel = ["index", "weight", "x", "y", "px", "py", "fixed", "id", "source", "target", "variable", "bounds"]; 
    var hiddenLabel2 = ["preference", "index", "weight", "x", "y", "px", "py", "fixed", "id", "source", "target", "variable", "bounds"]; 

    var graph = this;

    var node = this.vis.selectAll("g.node").data(this.nodes, function(d){return d.id});

    var drag = this.force.drag() 
        .on('dragstart', function disableZooming() {
            console.log("dragstart");
            if (graph.state.usingEraser) {
                console.log("setting drag to null");
                drag.on("drag", null);
            }
            var fake = d3.behavior.zoom();
            graph.svg.call(fake);
        })
        .on('dragend', function enableZooming() {
            graph.svg.call(graph.zoom).on("dblclick.zoom", null);
        });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(drag);

    // var c20c = d3.scale.category20c().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    // console.log(c20c(5)); 
    nodeEnter.append("circle")
        .attr("class","circle")
        .attr("r", 15)
        .attr("x", "-8px")
        .attr("y", "-8px")
        .attr("id", function(d) {return d.id;})
        // .attr("fill", function(d) {
        //     console.log(c20c(5));
        //     return c20c(5);
        // })
        .each(function(d) {
            var header = d3.select(this);
            // loop through the keys - this assumes no extra data
            d3.keys(d).forEach(function(key) {
                if (key != "id")
                    header.attr(key, d[key]);
            });
        })
        .on("mouseover", function(d){
            d3.select(this).classed("selecting", true);
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
            d3.select(this).classed("selecting", false);
            d3.select("#console").text("");
            //d3.select(this.parentNode).select('text.info').remove();
        })
        .on("click", function(e) {
            nodeID = d3.select(this).attr("id");
            if (graph.state.usingEraser) {
                console.log("deleting nodeID" + nodeID);
                graph.removeNode(nodeID);
                if (graph.state.selectedNode == nodeID) graph.state.selectedNode=null;
                // if (d3.select(this).classed( "selected")) {
                //     console.log("selected true in node click event");
                //     d3.select(this).classed("selected", true);
                // }
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
        .text(function(d) { 
            var label = "";
            d3.keys(d).forEach(function(key) {
                if ($.inArray(key, hiddenLabel2) == -1 && key!="graphID")
                    label+=key+": "+d[key]+"; ";
            });
            return label;
        });

    node.exit().remove();

    this.force.on("tick", function() {
        link
        .attr("x1", function(d) { 
            diffX = d.source.x - d.target.x;
            diffY = d.source.y - d.target.y;
            pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
            offsetX = (diffX * 15) / pathLength;
            return (d.source.x - offsetX); 
        })
        .attr("y1", function(d) {
            diffX = d.source.x - d.target.x;
            diffY = d.source.y - d.target.y;
            pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
            offsetY = (diffY * 15) / pathLength;
            return (d.source.y - offsetY); 
        })
        .attr("x2", function(d) {
            //R = 20
            diffX = d.target.x - d.source.x;
            diffY = d.target.y - d.source.y;
            pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
            offsetX = (diffX * 15) / pathLength;
            return (d.target.x - offsetX); 
        })
        .attr("y2", function(d) { 
            //R = 20
            diffX = d.target.x - d.source.x;
            diffY = d.target.y - d.source.y;
            pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
            offsetY = (diffY * 15) / pathLength;
            return (d.target.y - offsetY);
        });
        node.attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });
    });

    var link = this.vis.selectAll("line.link")
        .data(this.links, function(d) { return d.source.id + "-" + d.target.id; });

    link.exit().remove();
    link.enter().insert("line")
        .attr("class", "link")
        .attr("source", function(d) {return d.source.id;})
        .attr("target", function(d) {return d.target.id;})
        .attr("id", function(d) {return d.id;})
        .attr("marker-end", function(d) {
            if (graph.state.isDirected)
                return "url(#arrow)";
            else return "";
        })
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
            d3.select(this).classed("selecting", true);
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
            d3.select(this).classed("selecting", false);
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

    // Restart the force layout.
    this.force.start();
}