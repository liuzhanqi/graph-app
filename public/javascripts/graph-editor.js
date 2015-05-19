document.onload = (function (d3, saveAs, Blob, undefined) {

	console.log("executing this funciton");
	var GraphCreator = function(svg) {
		var thisGraph = this;
		
		thisGraph.idct = 0;

    	thisGraph.svg = svg;
    	thisGraph.svgG = svg.append("g").classed("graph", true);
    	var svgG = thisGraph.svgG;

    	thisGraph.state = {
	      selectedNode: null,
	      selectedEdge: null
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
			    	console.log(res);
			    	svg.selectAll("circle")
						.data(res)
						.enter().append("circle")
						.attr("cx", function(d) {return d.x;})
						.attr("cy", function(d) {return d.y;})
						.attr("r", function(d) { return 10; });
			    },
		        error: function(jqXHR, textStatus, errorThrown) {
		            alert('error ' + textStatus + " " + errorThrown);
		            console.log(errorThrown.stack);
		        }
		    });
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

	var svg = d3.select("#graph").append("svg")
				.attr("width",width)
				.attr("height",height);

	var graph = new GraphCreator(svg);
		graph.setIdCt(1);

})(window.d3, window.saveAs, window.Blob);