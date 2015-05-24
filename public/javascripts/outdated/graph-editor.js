var graph = null;
var svg = null;

document.onload = (function (d3, saveAs, Blob, undefined) {

	var dragNode = d3.behavior.drag()
		.on("drag", function (){
		    var dragTarget = d3.select(this);
		    dragTarget
		        .attr("cx", function() {
		        	return d3.event.dx + parseInt(dragTarget.attr("cx"));
		        })
		        .attr("cy", function() {
		        	return d3.event.dy + parseInt(dragTarget.attr("cy"));
		        });
		})
		.on("dragend", function() {
			var dragTarget = d3.select(this);
			updateNodeEvent = {
				"eventType": "update-vertex",
		        "x": dragTarget.attr("cx"),
		        "y": dragTarget.attr("cy"),
		        "id": dragTarget.attr("id")
			};
			console.log("update Node Event" + updateNodeEvent);
			$.ajax({
			        url: "http://localhost:3000/eventHandler",
			        contentType: "application/json",
			        dataType: "json",
			        type:"post",
			        data: JSON.stringify(updateNodeEvent),
				    success: function(res) {
				    	console.log(res);
				    },
			        error: function(jqXHR, textStatus, errorThrown) {
			            alert('error ' + textStatus + " " + errorThrown);
			        }
			    });
		});

	console.log("executing this funciton");
	var GraphCreator = function(svg) {
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

	    GraphCreator.prototype.setIdCt = function(idct){
    		this.idct = idct;
  		};

	    //listen for key events
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
	    	if (thisGraph.state.creatingNode) {
	    		console.log("double click at "+d3.mouse(this)+", created a node");
		    	var x=d3.mouse(this)[0];
		    	var y=d3.mouse(this)[1];
		    	var newNodeEvent = {
						    	"eventType": "create-vertex",
						        "x": x,
						        "y": y,
						    };
				//var data=[];
		    	$.ajax({
			        url: "http://localhost:3000/eventHandler",
			        contentType: "application/json",
			        dataType: "json",
			        type:"post",
			        data: JSON.stringify(newNodeEvent),
				    success: function(res) {
				    	console.log("creating node response "+ res);
				    	svg.selectAll("circle")
							.data(res)
							.enter().append("circle")
							.attr("cx", function(d) {return d.x;})
							.attr("cy", function(d) {return d.y;})
							.attr("r", function(d) { return 10; })
							.attr("id", function(d) {return d.id;})
							//.call(dragNode)
							.on("mouseover", function(){
					        	if (thisGraph.state.selectedNodeID!=d3.select(this).attr("id") )
					        		d3.select(this).style("fill", "blue");
					        		console.log("mouse over " + d3.select(this).attr("id"));
					        })
					        .on("mouseout", function(){
					        	updateColor(d3.select(this).attr("id"));
					        })
					        .on("click", function() {
					        	nodeID = d3.select(this).attr("id");
					        	oldnodeID = graph.state.selectedNode;
					        	if (oldnodeID!=null && oldnodeID!=nodeID && thisGraph.state.creatingEdge) {
					        		createEdge(nodeID,oldnodeID);
					        		console.log("creating edge between "+oldnodeID+" and " + nodeID);
					        	}
					        	toggleSelectNode(nodeID);
					        });
				    },
			        error: function(jqXHR, textStatus, errorThrown) {
			            alert('error ' + textStatus + " " + errorThrown);
			        }
			    });
	    	}
	    	
		    //console.log("data = " + data);
		    
	    	//var newNode = new Node(svg,d3.mouse(this)[0],d3.mouse(this)[1]);
	    	//thisGraph.nodes.push(newNode);
	    });
	};


	var docEL = document.documentElement,
	bodyEL = document.getElementsByTagName('body')[0];

	var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
		height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

	var xLoc = width/2 - 25,
		yLoc = 100;

	svg = d3.select("#graph").append("svg")
				.attr("width",width)
				.attr("height",height);

	graph = new GraphCreator(svg);
	graph.setIdCt(1);
})(window.d3, window.saveAs, window.Blob);

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

function updateColor (nodeID) {
	if (!nodeID) return;
	target = d3.select("#"+nodeID);
	console.log("updating color for " + nodeID);
	if (!graph.state.selectedNode || graph.state.selectedNode != nodeID) {
		target.style("fill", "white");
	} else {
		target.style("fill", "LightCoral");
	}
};

function createEdge(nodeID1, nodeID2) {
	$.ajax({
        url: "http://localhost:3000/createEdge",
        contentType: "application/json",
        dataType: "json",
        type:"post",
        data: JSON.stringify(updateNodeEvent),
	    success: function(res) {
	    	console.log(res);
	    },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
