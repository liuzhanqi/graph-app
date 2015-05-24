Vertex = require("./Vertex");
Edge = require("./Edge");

var Graph = function() {
	this.vertexList=[];
	this.edgeList=[];
	this.adjList=[];
}

Graph.prototype.getGraph = function() {
	var data = {
		"links" : this.edgeList,
		"nodes" : this.vertexList
	};
	return data;
}

Graph.prototype.createVertex = function (x,y) {
	var newVertex = new Vertex(x,y);
	this.vertexList.push(newVertex);
	//return this.getGraph();
	return newVertex;
}

Graph.prototype.createEdge = function(node1,node2) {
	var newEdge = new Edge(node1,node2);
	this.edgeList.push(newEdge);
	// this.adjList[node1].push(node2);
	// this.adjList[node2].push(node1);
	//return this.getGraph();
	return newEdge;
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

module.exports = Graph;