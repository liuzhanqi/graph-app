var Vertex = require("./Vertex");
var Edge = require("./Edge");
var request = require("request");
var host = 'localhost', port = 7474;
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

var Graph = function() {
	this.vertexList = [];
	this.edgeList = [];
	Edge.INDEXMAX = 0;
	Vertex.INDEXMAX = 0;
	this.graphID = "";
	this.state = "new";
	console.log("Graph Constructor that.savedToDB = true;");
	this.savedToDB = true;
	this.isDirected = "off";
	this.adjacencyList = [];
}

Graph.prototype.initialize = function() {
	this.vertexList = [];
	this.edgeList = [];
}

Graph.prototype.createNewGraphID = function(graphid, callback, optionalDefinitionFromJson) {
	console.log("createNewGraphID");
	console.log("optionalDefinitionFromJson = " + optionalDefinitionFromJson);
	this.savedToDB = true;
	var that = this;
	runCypherQuery(
		'MERGE (newID:GRAPHID { graphid : {id}}) ' +
		'ON CREATE SET newID.state="new", newID.NODEINDEXMAX=0, newID.EDGEINDEXMAX=0 ' + 
		'ON MATCH SET newID.state="old"' +
		'RETURN newID.state', {id: graphid}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    		message = resp.results[0].data[0].row[0];
	    		that.graphID = graphid;
	    		that.state = message.state;
	    		if (that.state == "new") {
	    			that.initialize();
	    		}
	    		if (optionalDefinitionFromJson)
	    			callback(optionalDefinitionFromJson, that.graphID);
	    		else
	    			callback(message);
	    	}
	  	}
	);
	//TODO: how to return message
}


Graph.prototype.retrieveOldGraphID = function(graphid, callback) {
	this.savedToDB = true;
	console.log("retrieveOldGraphID that.savedToDB = true;");
	var that = this;
	runCypherQuery(
		'MATCH (n:GRAPHID { graphid : {id}}) SET n.state="old" RETURN n',
		{id: graphid}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		message = resp.results[0].data;
	    		if (message.length>0) {
	    			console.log("changing graph id to");
	    			console.log(graphid);
	    			that.graphID = graphid;
	    			that.state = message[0].row[0].state;
	    		}
	    		callback(message);
	    	}
	  	}
	);
	//TODO: how to return message
}

Graph.prototype.addGraphDefinition = function(definitions, optionalGraphIDWhenJson) {
	console.log("addGraphDefinition");
	console.log(definitions);
	var that = this;
	var ide;
	if (optionalGraphIDWhenJson) ide = optionalGraphIDWhenJson;
	else ide = that.graphID;
	console.log("ide = " + ide);
	that.isDirected = JSON.parse(definitions).isDirected;
	runCypherQuery(
		'MATCH (n:GRAPHID { graphid: {id}}) SET n.definition = {def}',
		{id: ide, def:definitions}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    	}
	  	}
	);
}

Graph.prototype.getGraphDefinition = function(callback) {
	var that = this;
	runCypherQuery(
		'MATCH (n:GRAPHID { graphid: {id}}) return n.definition, n.NODEINDEXMAX, n.EDGEINDEXMAX',
		{id: that.graphID}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    		//console.log("Vertex = " + Vertex);
	    		// TODO: here, that.Vertex is undefined for newly created graph definition
	    		definition=resp.results[0].data[0].row[0];
	    		vertexIndexMax = 0;
	    		edgeIndexMax = 0;
	    		if (resp.results[0].data[0].row[1]) {
	    			vertexIndexMax = resp.results[0].data[0].row[1];
	    		}
	    		if (resp.results[0].data[0].row[2]) {
	    			edgeIndexMax = resp.results[0].data[0].row[2];
	    		}
	    		// if the graph is retrived from db, update the indexmax
	    		// else the indexmax maintained by current back-end is the corrent one
	    		if (!that.savedToDB) {
	    			callback(definition);
	    		} else {
	    			console.log("vertexIndexMax = " + vertexIndexMax);
		    		console.log("edgeIndexMax = " + edgeIndexMax);
		    		callback(definition, vertexIndexMax, edgeIndexMax);
	    		}
	    	}
	  	}
	);
}

Graph.prototype.setVertexIndexMax = function(vertexIndexMax) {
	Vertex.INDEXMAX = vertexIndexMax;
};

Graph.prototype.setEdgeIndexMax = function(edgeIndexMax) {
	Edge.INDEXMAX = edgeIndexMax;
};

Graph.prototype.extractSubgraph = function(nodes, callback) {
	this.savedToDB = false;
	console.log("extractSubgraph that.savedToDB = false;");
	console.log("extractSubgraph");
	console.log(JSON.stringify(nodes));
	for(var i = this.edgeList.length - 1; i >= 0; i--) {
		var s = false, t = false;
		for (var j = 0; j < nodes.length; j++) {
			if (this.edgeList[i].source == nodes[j]) s = true;
			if (this.edgeList[i].target == nodes[j]) t = true;
		}
	    if(!(s&&t)) {
	    	this.edgeList.splice(i, 1);
	    }
	}
	for(var i = this.vertexList.length - 1; i >= 0; i--) {
		var contains = false;
		for (var j = 0; j < nodes.length; j++) {
			if (this.vertexList[i].id == nodes[j]) contains = true;
		}
	    if(!contains) {
	    	this.vertexList.splice(i, 1);
	    }
	}
	var data = {
			"links" : this.edgeList,
			"nodes" : this.vertexList
	};
	console.log(data);
	callback(data);
}

Graph.prototype.buildAdjacencyList = function() {
	console.log("buildAdjacencyList");
	var IDtoindex = [];
	this.adjacencyList = [];
	for(var i = 0; i < this.vertexList.length; i++) { 
		this.adjacencyList[i] = [];
		IDtoindex[this.vertexList[i].id] = i;
	}
	for (var i = 0; i < this.edgeList.length; i++) {
		var s = this.edgeList[i].source;
		var t = this.edgeList[i].target;
		var si = IDtoindex[s];
		var ti = IDtoindex[t];
		this.adjacencyList[si].push(ti);
		this.adjacencyList[ti].push(si);
	}
	console.log(this.vertexList);
	console.log(this.edgeList);
	console.log(this.adjacencyList);
}


Graph.prototype.extractSubgraphByAttribute = function(name, value, hop, callback) {
	this.savedToDB = false;
	console.log("extractSubgraphByAttribute that.savedToDB = false;");
	console.log("extractSubgraphByAttribute");
	//TODO: Computation, implement graph data structure
	this.buildAdjacencyList();
	//TODO: BFS hop level and color the selected nodes and edges
	// step 1, make all node with name and value to selected
	var mark = [];
	var queue = [];
	var head = 0;
	var tail = 0;
	for(var i = 0; i < this.vertexList.length; i++) { 
		if (this.vertexList[i][name] == value) {
			mark[i] = true; 
			queue.push({index: i, depth: 0});
			tail++;
		} else {
			mark[i] = false;
		}
	}
	// step 2, BFS to mark all the node within k hops
	while (head < tail) {
		var v = queue[head];
		console.log(v);
		head++;
		if (v.depth == hop) continue;
		for (var i = 0; i < this.adjacencyList[v.index].length; i++) {
			var u = this.adjacencyList[v.index][i];
			if (mark[u] == false) {
				queue.push({index: u, depth:(v.depth+1) });
				tail++;
				mark[u] = true;
			}
		}
	}
	// step 3, prepare the id list for extraction
	var nodes = [];
	for(var i = 0; i < this.vertexList.length; i++) { 
		if (mark[i]) {
			nodes.push(this.vertexList[i].id);
		}
	}
	this.extractSubgraph(nodes,callback);
}

Graph.prototype.extractSubgraphByCenter = function(id, hop, callback) {
	console.log("id = " + id);
	this.savedToDB = false;
	console.log("extractSubgraphByCenter that.savedToDB = false;");
	console.log("extractSubgraphByCenter");
	//TODO: Computation, implement graph data structure
	this.buildAdjacencyList();
	//TODO: BFS hop level and color the selected nodes and edges
	// step 1, make all node with name and value to selected
	var mark = [];
	var queue = [];
	var head = 0;
	var tail = 0;
	for(var i = 0; i < this.vertexList.length; i++) { 
		console.log("this.vertexList[i].id = " + this.vertexList[i].id);
		if (this.vertexList[i].id == id) {
			mark[i] = true; 
			queue.push({index: i, depth: 0});
			tail++;
		} else {
			mark[i] = false;
		}
	}
	console.log("mark = " + mark);
	console.log("head = " + head);
	console.log("tail = " + tail);
	console.log("hop = " + hop);
	// step 2, BFS to mark all the node within k hops
	while (head < tail) {
		var v = queue[head];
		console.log(v);
		head++;
		if (v.depth == hop) continue;
		for (var i = 0; i < this.adjacencyList[v.index].length; i++) {
			var u = this.adjacencyList[v.index][i];
			if (mark[u] == false) {
				queue.push({index: u, depth:(v.depth+1) });
				tail++;
				mark[u] = true;
			}
		}
	}
	// step 3, prepare the id list for extraction
	var nodes = [];
	for(var i = 0; i < this.vertexList.length; i++) { 
		if (mark[i]) {
			nodes.push(this.vertexList[i].id);
		}
	}
	this.extractSubgraph(nodes,callback);
}


Graph.prototype.getGraph = function(callback) {
	console.log("in getGraph");
	console.log("this.savedToDB = " + this.savedToDB);
	//TODO: get graph from memory have errors
	if (!this.savedToDB) {
		var data = {
			"links" : this.edgeList,
			"nodes" : this.vertexList
		};
		console.log(data);
		callback(data);
	} else {
		this.initialize();
		console.log("getting nodes from db");
		that = this;
		runCypherQuery(
			'MATCH (n {graphID:{id}}) return DISTINCT n',
			{id: that.graphID}, 
		    function (err, r1) {
		    	if (err) {
		    		console.log(err);
		    	} else {
		    		n = r1.results[0].data;
		    		for (i=0; i<n.length; ++i) {
		                if (n[i].row[0]) {
		                    that.vertexList.push(n[i].row[0]);
		                }
		            }
		    		console.log("getting links from db");
		    		runCypherQuery(
		    			'MATCH ()-[r {graphID:{id}}]->() return DISTINCT r',
		    			{id: that.graphID}, 
		    			function (err, r2) {
		    				if (err) {
		    					console.log(err);
		    				} else {
		    					l = r2.results[0].data;
		    					for (i=0; i<l.length; ++i) {
					                that.edgeList.push(l[i].row[0]);
					            }
		    					var data = {
									"links" : that.edgeList,
									"nodes" : that.vertexList
								};
								callback(data);
							}
		    			}
		    		);
		    	}
		  	}
		);
	}
}


Graph.prototype.createGraphFromJson = function(data, callback) {
	console.log("createGraphFromJson");
	this.createNewGraphID(data.graphID, this.addGraphDefinition, JSON.stringify(data.definition));

	//TODO implement this method
	this.vertexList = data.nodes;
	this.edgeList = data.links;
	
	console.log(this.vertexList);
	console.log(this.edgeList);
	console.log("createGraphFromJson that.savedToDB = false;");
	this.savedToDB = false;
	callback();
}

Graph.prototype.createVertex = function () {
	console.log("createVertex that.savedToDB = false;");
	this.savedToDB = false;
	var newVertex = new Vertex();
	this.vertexList.push(newVertex);
	// Neo4j query to create vertex
	// runCypherQuery(
	// 	'CREATE (newNode : Node { id : {id}}) RETURN newNode', {id: newVertex.id}, 
	//     function (err, resp) {
	//     	if (err) {
	//     		console.log(err);
	//     	} else {
	//     		console.log(resp);
	//     	}
	//   	}
	// );
}


//create vertex with attributes
Graph.prototype.createVertex = function (attributes) {
	console.log("createVertex that.savedToDB = false;");
	this.savedToDB = false;
	attributes["graphID"] = this.graphID;
	var newVertex = new Vertex(attributes);
	this.vertexList.push(newVertex);
	return newVertex;
}

Graph.prototype.removeVertex = function(id) {
	console.log("removeVertex that.savedToDB = false;");
	this.savedToDB = false;
	var i = 0;
	while (i < this.edgeList.length) {
        if ((this.edgeList[i].source == id)||(this.edgeList[i].target == id)) {
        	this.edgeList.splice(i,1);
        }
        else i++;
    }
	for (var i = 0; i < this.vertexList.length; i++) {
        if (this.vertexList[i].id == id) {
            this.vertexList.splice(i, 1);
        }
    }
    // Neo4j query to remove Vertex
    // runCypherQuery(
	// 	'MATCH (node { id: {id} })-[link]-() DELETE node, link', {id: id}, 
	//     function (err, resp) {
	//     	if (err) {
	//     		console.log(err);
	//     	} else {
	//     		console.log(resp);
	//     	}
	//   	}
	// );
}

//source and target are both id
Graph.prototype.createEdge = function(source,target,attr) {
	console.log("createEdge that.savedToDB = false;");
	this.savedToDB = false;
	attr["graphID"] = this.graphID;
	var newEdge = new Edge(source,target,attr);
	console.log(newEdge);
	this.edgeList.push(newEdge);
	// Neo4j query to create Edge
	// runCypherQuery(
	// 	'MATCH (node1:Node{id:{node1ID}}), (node2:Node{id:{node2ID}})' +
	// 	'CREATE (node1)-[:Link{id:{edgeID}}]->(node2)',
	// 	{node1ID: source, edgeID: newEdge.id, node2ID: target},
	//     function (err, resp) {
	//     	if (err) {
	//     		console.log(err);
	//     	} else {
	//     		console.log(resp);
	//     	}
	//   	}
	// );
	return newEdge;
}

Graph.prototype.removeEdge = function(id) {
	console.log("removeEdge that.savedToDB = false;");
	this.savedToDB = false;
	for (var i=0; i<this.edgeList.length; i++) {
        if (this.edgeList[i].id === id) {
            this.edgeList.splice(i, 1);
        }
    }
    // Neo4j query to remove edge
    // runCypherQuery(
	// 	'MATCH ()-[link {id:{id}}]-() DELETE link', {id: id}, 
	//     function (err, resp) {
	//     	if (err) {
	//     		console.log(err);
	//     	} else {
	//     		console.log(resp);
	//     	}
	//   	}
	// );
};


//submit multiple queries at once
Graph.prototype.saveGraphAtOnce = function(callback) {
	var that = this;
	//TODO: unable to remove deleted nodes and edges
	//TODO: edge attributes
	runCypherQuery(
		'MATCH (n:Node {graphID: {graphid}}) ' +
		'OPTIONAL MATCH (n)-[r]-() DELETE n,r ' + 
		'WITH count(*) as dummy ' + 
		'MATCH (def:GRAPHID {graphid: {graphid}}) ' +
		'SET def.NODEINDEXMAX = {nodeindexmax}, def.EDGEINDEXMAX = {edgeindexmax}' +
		'WITH count(*) as dummy ' + 
		'FOREACH (edge IN {edges} | ' +
		'MERGE (node1:Node{id:edge.source}) ' +
		'MERGE (node2:Node{id:edge.target}) ' +
		'MERGE (node1)-[l:Link{id:edge.id}]->(node2) ' +
		'ON CREATE SET l = edge ' +
		'ON MATCH SET l = edge) ' +
		'FOREACH (node IN {nodes} | ' +
		'MERGE (nn:Node{id:node.id}) ' + 
		'ON CREATE SET nn = node ' +
		'ON MATCH SET nn = node)',
		{graphid: that.graphID, nodeindexmax: Vertex.INDEXMAX, edgeindexmax: Edge.INDEXMAX,
		edges: that.edgeList, nodes: that.vertexList},
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    		callback("500");
	    	} else {
	    		console.log(resp);
				that.savedToDB = true;
				console.log("saveGraphAtOnce that.savedToDB = true;");
				callback("200");
	    	}
	  	}
	);
}

Graph.prototype.returnVertexList = function() {
	return this.vertexList;
}

Graph.prototype.updateVertexPosition = function(id,x,y) {
	var vertex = this.vertexList[id];
	vertex.moveTo(x,y);
	return vertex;
}

//undirected edge
Graph.prototype.createUndirectedEdge = function(v1_id,v2_id) {
	if (Vertex.count >= v1_id) {
		v1=vertexList[v1_id];
	} else {
		return;
	}
	if (Vertex.count >= v2_id) {
		v2=vertexList[v2_id];
	} else {
		return;
	}
	newEdge = new Edge(v1,v2);
	edgeList.push(newEdge);
	adjList[v1_id].push(v2_id);
	adjList[v2_id].push(v1_id);
}

//directed edge, v1---->v2
Graph.prototype.createDirectedEdge = function(v1_id,v2_id) {
	if (Vertex.count >= v1_id) {
		v1=vertexList[v1_id];
	} else {
		return;
	}
	if (Vertex.count >= v2_id) {
		v2=vertexList[v2_id];
	} else {
		return;
	}
	newEdge = new Edge(v1,v2);
	edgeList.push(newEdge);
	adjList[v1_id].push(v2_id);
}

//Let’s define a function which fires the cypher query.
function runCypherQuery(query, params, callback) {
  request.post({
      uri: httpUrlForTransaction,
      json: {statements: [{statement: query, parameters: params}]}
    },
    function (err, res, body) {
      callback(err, body);
    })
}

module.exports = Graph;