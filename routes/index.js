var express = require('express');
var router = express.Router();
var Graph = require('../Model/Graph');
var ReadOnlyGraph = require('../Model/ReadOnlyGraph');
var AlgoCaller = require('../Model/AlgoCaller');

console.log("creating new Graph");
var graph = new Graph();
//for comparison
var graph1 = new ReadOnlyGraph();
var graph2 = new ReadOnlyGraph();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('entry');
});

router.get('/graphID', function(req, res, next) {
	res.render('graphID');
});

router.get('/graphDefinition', function(req, res, next) {
	res.render('graphDefinition');
});

router.get('/retrieveGraphID', function(req, res, next) {
	res.render('retrieveGraphID');
})

router.get('/editor', function(req, res, next) {
	res.render('beautifulEditor');
});

router.get('/comparisonID', function(req, res, next) {
	res.render('comparisonID');
})

router.get('/comparison', function(req, res, next) {
	res.render('comparison');
})

router.get('/getGraph1', function(req,res,next) {
	var data = graph1.getGraph(function(message) {
		console.log(message);
		res.send(message);
	});
});

router.get('/getGraph2', function(req,res,next) {
	var data = graph2.getGraph(function(message) {
		console.log(message);
		res.send(message);
	});
});

router.post('/getMCS', function(req,res,next) {
	var name = req.body.name;
	var caller = new AlgoCaller(graph1, graph2);
	caller.executePython("koch", function(data) {
		res.send(data);
	});
})

router.post('/retrieveComparisonID', function(req,res,next) {
	//TODO: real one
	var id1 =req.body.id1;
	var id2 =req.body.id2;
	console.log(id1);
	console.log(id2);
	graph1.retrieveOldGraphID(id1, function(message) {
		l1 = message.length;
		graph2.retrieveOldGraphID(id2, function(message) {
			l2 = message.length;
			if (l1 * l2 == 0) {
				res.send("not exists");
			} else {
				res.send("exists");
			}
		});
	});
})

router.post('/retrieveOldGraphID', function(req,res,next) {
	var id =req.body.id;
	graph.retrieveOldGraphID(id, function(message) {
		res.send(message);
	});
});

router.post('/createGraphID', function(req,res,next) {
	var id =req.body.id;
	console.log(id);
	graph.createNewGraphID(id, function(message) {
		res.send(message);
	});
});

router.post('/createGraphDefinition', function(req,res,next) {
	graph.addGraphDefinition(req.body.def);
});

router.get('/getGraph', function(req,res,next) {
	var data = graph.getGraph(function(message) {
		console.log(message);
		res.send(message);
	});
});

router.get('/getGraphDefinition', function(req,res,next) {
	graph.getGraphDefinition(function(definition, vertexIndexMax, edgeIndexMax) {
		console.log(definition);
		if (vertexIndexMax !== undefined && edgeIndexMax !== undefined) {
			graph.setVertexIndexMax(vertexIndexMax);
			graph.setEdgeIndexMax(edgeIndexMax);
		}
		res.send(definition);
	});
});

router.post('/createNode' , function(req,res,next) {
	console.log(req.body);
	var attributes = req.body;
	var data = graph.createVertex(attributes);
	res.send(JSON.stringify(data));
});

router.post('/removeNode' , function(req,res,next) {
	var id =req.body.id;
	graph.removeVertex(id);
});

router.post('/createEdge' , function(req,res,next) {
	var source=req.body.source;
	var target=req.body.target;
	var attr = JSON.parse(req.body.attr);
	var data = graph.createEdge(source,target,attr);
	res.send(JSON.stringify(data));
});

router.post('/removeEdge' , function(req,res,next) {
	var id =req.body.id;
	graph.removeEdge(id);
});

router.post('/saveGraph', function(req,res,next) {
	//graph.saveGraphToDB();
	/*
	1. clear the old graph in db; 
	2. update nodecount/edgecount;
	3. save the new graph to db;
	*/
	graph.saveGraphAtOnce(function (message) {
		res.send(message);
	});
});

router.get('/loadGraph', function(req,res,next) {
	//console.log("this is save graph in router");
	graph.loadGraph(function(data) {
		res.send(JSON.stringify(data));
	});
});

router.post('/extractSubgraph', function(req,res,next) {
	var nodes = JSON.parse(req.body['nodes']);
	console.log("in index /extractSubgraph");
	console.log(nodes);
	graph.extractSubgraph(nodes, function(data) {
		res.send(data);
	})
})

router.post('/extractSubgraphByAttribute', function(req,res,next) {
	var name = req.body.name;
	var value = req.body.value;
	var hop = req.body.hop;
	console.log("in index /extractSubgraphByAttribute");
	console.log(name);
	console.log(value);
	console.log(hop);
	graph.extractSubgraphByAttribute(name, value, hop, function(data) {
		res.send(data);
	})
})

router.post('/extractSubgraphByCenter', function(req,res,next) {
	var id = req.body.id;
	var hop = req.body.hop;
	console.log("in index /extractSubgraphByCenter");
	console.log(id);
	console.log(hop);
	graph.extractSubgraphByCenter(id, hop, function(data) {
		res.send(data);
	})
})

router.post('/jsonUpload', function(req,res,next) {
	console.log("jsonUpload");
	console.log(req.body);
	var data = JSON.parse(req.body.data);
	console.log(data);
	graph.createGraphFromJson(data, function() {
		res.send("200");
	})
})

module.exports = router;
