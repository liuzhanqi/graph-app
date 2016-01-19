Vertex = require("./Vertex");
Edge = require("./Edge");
var request = require("request");
var host = 'localhost', port = 7474;
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

var Graph = function() {
	this.vertexList=[];
	this.edgeList=[];
	this.adjList=[];
	this.graphID = "";
}

Graph.prototype.createNewGraphID = function(graphid, callback) {
	var that = this;
	runCypherQuery(
		'MERGE (newID:GRAPHID { graphid : {id}}) ' +
		'ON CREATE SET newID.state="new"' + 
		'ON MATCH SET newID.state="old"' +
		'RETURN newID.state', {id: graphid}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    		message = resp.results[0].data[0].row[0];
	    		that.graphID = graphid;
	    		callback(message);
	    	}
	  	}
	);
	//TODO: how to return message
}

Graph.prototype.addGraphDefinition = function(definitions) {
	console.log("in Graph.js addGraphDefinition");
	var that = this;
	console.log(that.graphID);
	console.log(JSON.stringify(definitions));
	runCypherQuery(
		'MATCH (n:GRAPHID { graphid: {id}}) SET n.definition = {def}',
		{id: that.graphID, def:JSON.stringify(definitions)}, 
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    	}
	  	}
	);
	//TODO: how to return message
}

Graph.prototype.getGraph = function() {
	var data = {
		"links" : this.edgeList,
		"nodes" : this.vertexList
	};
	console.log(data);
	return data;
}

Graph.prototype.createVertex = function () {
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
	return newVertex;
}

//create vertex with attributes
Graph.prototype.createVertex = function (attributes) {
	var newVertex = new Vertex(attributes);
	this.vertexList.push(newVertex);
	return newVertex;
}

Graph.prototype.removeVertex = function(id) {
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
Graph.prototype.createEdge = function(source,target) {
	var newEdge = new Edge(source,target);
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
}

Graph.prototype.saveGraph = function() {
	console.log(JSON.stringify(this.vertexList));
	console.log(JSON.stringify(this.edgeList));
	//TODO: unable to remove deleted nodes and edges
	//TODO: edge attributes
	runCypherQuery(
		'FOREACH (edge IN {edges} |' +
		'MERGE (node1:Node{id:edge.source})' +
		'MERGE (node2:Node{id:edge.target})' +
		'MERGE (node1)-[:Link{id:edge.id}]->(node2))' +
		'FOREACH (node IN {nodes} |' +
		'MERGE (n:Node{id:node.id}) ' + 
		'ON CREATE SET n = node ' +
		'ON MATCH SET n = node)',
		{edges: this.edgeList, nodes: this.vertexList},
	    function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		console.log(resp);
	    	}
	  	}
	);
}

Graph.prototype.loadGraph = function(callback) {
	var graph = this;
	runCypherQuery(
		'MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN r,n,m;',{},
		function (err, resp) {
	    	if (err) {
	    		console.log(err);
	    	} else {
				console.log(JSON.stringify(resp));
				var nodes = [];
				var edges = [];
				var rows=resp.results[0].data;
				rows.forEach(function(value, index, ar) {
					//TODO: add other attributs of nodes to the list
 	    			nodes.push(value.row[1]);
 	    			if (value.row[0]) {
 	    				var edge = {
 	    					id: value.row[0].id,
 	    					source: value.row[1].id,
 	    					target: value.row[2].id
 	    				}
 	    				edges.push(edge);
 	    			}
 	    		});
 	    		// console.log("in load graph before assignment");
 	    		// console.log(graph.vertexList);
 	    		// console.log(graph.edgeList);
 	    		graph.vertexList=nodes;
				graph.edgeList=edges;
				// console.log("in load graph after assignment");
 	  //   		console.log(graph.vertexList);
 	  //   		console.log(graph.edgeList);
 	    		callback({nodes:nodes, links:edges});
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