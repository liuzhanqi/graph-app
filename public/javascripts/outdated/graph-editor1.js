var graph = null;
var svg = null;
var width = 0, height=0;
var graphData = {"nodes" : [], "links" : []}

document.onload = (function (d3, saveAs, Blob, undefined) {

	var GraphCreator = function() {
		var thisGraph = this;
		
		thisGraph.idct = 0;

    	thisGraph.svg = svg;
    	thisGraph.svgG = svg.append("g").classed("graph", true);
    	var svgG = thisGraph.svgG;

    	thisGraph.state = {
	      selectedNode: null,
	      selectedEdge: null,
	      creatingNode: false,
	      creatingEdge: false
	    };

		GraphCreator.prototype.setIdCt = function(idct){
    		this.idct = idct;
  		};

  		getGraph();

  		//listen to key events
	    d3.select(window)
	    .on("keydown", function(){
	    	//thisGraph.svgKeyDown.call(thisGraph);
	    	//console.log("key down");
	    })
	    .on("keyup", function(){
	    	//thisGraph.svgKeyUp.call(thisGraph);
	    	//console.log("key up");
	    })
	    svg.on("mousedown", function(d){
	    	if (d3.event.shiftKey) {
	    	}
	    });
	    svg.on("mouseup", function(d){
	    	//thisGraph.svgMouseUp.call(thisGraph, d);
	    	//console.log("mouse up");
	    });
	    svg.on("dblclick", function() {
	    	//TODO: if this is a node or an edge, dismiss the double click
	    	if (thisGraph.state.creatingNode) {
	    		console.log("double click at "+d3.mouse(this)+", created a node");
		    	var x=d3.mouse(this)[0];
		    	var y=d3.mouse(this)[1];
		    	var newNodeEvent = {"x": x,"y": y};
				$.ajax({
			        url: "http://localhost:3000/createNode",
			        contentType: "application/json",
			        dataType: "json",
			        type:"post",
			        data: JSON.stringify(newNodeEvent),
			        success: function(res) {
			        	console.log("creating node response ");
			        	console.log(res);
			        	graphData.nodes.push(res);
			        	updateGraph();
			        },
			        error: function(jqXHR, textStatus, errorThrown) {
			            alert('error ' + textStatus + " " + errorThrown);
			        }
			    });
	    	};
		});
	};

	var docEL = document.documentElement;
	var bodyEL = document.getElementsByTagName('body')[0];

	width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
	height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

	var xLoc = width/2 - 25,
		yLoc = 100;

	svg = d3.select("#graph").append("svg")
				.attr("width",width)
				.attr("height",height);

	graph = new GraphCreator();
	graph.setIdCt(1);
})(window.d3, window.saveAs, window.Blob);

function getGraph() {
	$.ajax({
        url: "http://localhost:3000/getGraph",
        contentType: "application/json",
        type:"get",
	    success: function(res) {
	    	console.log("creating node response: ");
	    	console.log(JSON.parse(res));
	    	graphData = JSON.parse(res);
	    	updateGraph();
	    },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

function updateGraph() {
	console.log("updating graph, current graph data:");
	var links = graphData.links;
	var nodes = graphData.nodes;
	if (links==[] && nodes==[]) return;
	/* Establish the dynamic force behavor of the nodes */
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width,height])
        .linkDistance([250])
        .charge([-1500])
        .gravity(0.3)
        .start();
	// Remove the old nodes
	svg.selectAll("circle").data(nodes).exit().remove();
    /* Draw the nodes themselves */                
	var nodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .attr("id", function(d) {return d.id;})
        .call(force.drag)
		.on("mouseover", function(){
        	if (graph.state.selectedNodeID!=d3.select(this).attr("id") )
        		d3.select(this).style("fill", "blue");
        		console.log("mouse over " + d3.select(this).attr("id"));
        })
        .on("mouseout", function(){
        	updateColor(d3.select(this));
        })
        .on("click", function() {
        	nodeID = d3.select(this).attr("id");
        	oldnodeID = graph.state.selectedNode;
        	if (oldnodeID!=null && oldnodeID!=nodeID && graph.state.creatingEdge) {
        		console.log("creating edge between "+oldnodeID+" and " + nodeID);
        		createEdge(parseInt(nodeID.replace("Vertex","")),parseInt(oldnodeID.replace("Vertex","")));
        	}
        	toggleSelectNode(nodeID);
        });	
    /* Draw the edges/links between the nodes */
    // Remove the old links
	svg.selectAll("lines").data(links).exit().remove();
	var edges = svg.selectAll("lines")
        .data(links)
        .enter()
        .append("line")
        .style("stroke", "#bbb")
        .style("stroke-width", 2);

    /* Run the Force effect */
  	force.on("tick", function() {
       edges.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
       nodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
       }); // End tick func
  
}

// function getNodePosition(id) {
// 	return d3.select(id);
// }

function toggle_draw_node() {
	//console.log(graph);
	graph.state.creatingEdge=false;
	d3.select("#create-edge").attr("style","opacity:0.4;");
	if (graph.state.creatingNode) {
		graph.state.creatingNode=false;
		d3.select("#create-node").attr("style","opacity:0.4;");
		console.log("draw node to false");
	} else {
		graph.state.creatingNode=true;
		d3.select("#create-node").attr("style","opacity:1.0;");
		console.log("draw node to true");
	}
}

function toggle_draw_edge() {
	graph.state.creatingNode=false;
	d3.select("#create-node").attr("style","opacity:0.4;");
	if (graph.state.creatingEdge) {
		graph.state.creatingEdge=false;
		d3.select("#create-edge").attr("style","opacity:0.4;");
		console.log("draw edge to false");
	} else {
		graph.state.creatingEdge=true;
		d3.select("#create-edge").attr("style","opacity:1.0;");
		console.log("draw edge to true");
	}
}

function updateColor (node) {
	//console.log("update color");
	//console.log(node[0]);
	if (!node) return;
	nodeID = node.attr("id");
	console.log("updating color for " + nodeID);
	if (!graph.state.selectedNode || graph.state.selectedNode != nodeID) {
		node.style("fill", "white");
	} else {
		node.style("fill", "LightCoral");
	}
};

function createEdge(node1, node2) {
	var newEdgeEvent={"node1":node1,"node2":node2};
	console.log("newEdgeEvent");
	console.log(newEdgeEvent);
	$.ajax({
        url: "http://localhost:3000/createEdge",
        contentType: "application/json",
        dataType: "json",
        type:"post",
        data: JSON.stringify(newEdgeEvent),
	    success: function(res) {
	    	console.log("response fron create edge: ");
	    	console.log(res);
	    	graphData.links.push(res);
	    	updateGraph();
	    },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

function toggleSelectNode(nodeID) {
		//cancel selection
		if (graph.state.selectedNode == nodeID) {
		graph.state.selectedNode = null;
		d3.select("#"+nodeID).style("fill", "white");
	} else {
		oldnodeID = graph.state.selectedNode;
		graph.state.selectedNode = nodeID;
		console.log("calling update color for " + oldnodeID);
		updateColor(oldnodeID);
		console.log("calling update color for " + nodeID);
		updateColor(nodeID);
	}
};