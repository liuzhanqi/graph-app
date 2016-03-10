var Vertex = require("./Vertex");
var Edge = require("./Edge");
var request = require("request");
var host = 'localhost', port = 7474;
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

var ReadOnlyGraph = function() {
	this.vertexList = [];
	this.edgeList = [];
	this.graphID = "";
	this.isDirected = "off";
}

ReadOnlyGraph.prototype.retrieveOldGraphID = function(graphid, callback) {
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
	    			that.graphID = graphid;
	    		}
	    		callback(message);
	    	}
	  	}
	);
	//TODO: how to return message
}


ReadOnlyGraph.prototype.getGraph = function(callback) {
	this.vertexList = [];
	this.edgeList = [];
	console.log("getting nodes from db");
	console.log(this.graphID);
	var that = this;
	runCypherQuery(
		'MATCH (n {graphID:{id}}) return DISTINCT n',
		{id: that.graphID}, 
	    function (err, r1) {
	    	if (err) {
	    		console.log(err);
	    	} else {
	    		var n = r1.results[0].data;
	    		for (i=0; i<n.length; ++i) {
	                if (n[i].row[0] && n[i].row[0].graphID == that.graphID) {
	                    that.vertexList.push(n[i].row[0]);
	                }
	            }
	    		console.log("getting links from db");
	    		console.log(that.vertexList);
	    		console.log(that.graphID);
	    		runCypherQuery(
	    			'MATCH ()-[r {graphID:{id}}]->() return DISTINCT r',
	    			{id: that.graphID}, 
	    			function (err, r2) {
	    				if (err) {
	    					console.log(err);
	    				} else {
	    					var l = r2.results[0].data;
	    					for (i=0; i<l.length; ++i) {
	    						if (l[i].row[0].graphID == that.graphID)
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

module.exports = ReadOnlyGraph;