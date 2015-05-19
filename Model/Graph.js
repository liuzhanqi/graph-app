Vertex = require("./Vertex");
Edge = require("./Edge");

Graph = function() {
	var vertexList=[];
	var edgeList=[];
	var adjList=[];

	// function getGraph() {
	// 	if (graph==undefined) {
	// 		graph=new Graph();
	// 	}
	// 	return graph;
	// }

	function createVertex(x,y) {
		newVertex = new Vertex(x,y);
		vertexList.push(newVertex);
		adjList[newVertex.id]=[];
	}

	function returnVertexList() {
		return vertexList;
	}

	//undirected edge
	function createUndirectedEdge(v1_id,v2_id) {
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
	function createDirectedEdge(v1_id,v2_id) {
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
}