var express = require('express');
var router = express.Router();
var Graph = require('../Model/Graph');

var graph= new Graph();

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

router.get('/editor', function(req, res, next) {
	res.render('index');
});

router.post('/createGraphID', function(req,res,next) {
	var id =req.body.id;
	console.log(id);
	graph.createNewGraphID(id, function(message) {
		res.send(message);
	});
});

router.post('/createGraphDefinition', function(req,res,next) {
	console.log("in index.js /createGraphDefinition")
	graph.addGraphDefinition(req.body);
});

router.get('/getGraph', function(req,res,next) {
	var data = graph.getGraph();
	res.send(JSON.stringify(data));
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
	var data = graph.createEdge(source,target);
	res.send(JSON.stringify(data));
});

router.post('/removeEdge' , function(req,res,next) {
	var id =req.body.id;
	graph.removeEdge(id);
});

router.post('/saveGraph', function(req,rest,next) {
	//console.log("this is save graph in router");
	graph.saveGraph();
});

router.get('/loadGraph', function(req,res,next) {
	//console.log("this is save graph in router");
	graph.loadGraph(function(data) {
		res.send(JSON.stringify(data));
	});
});

module.exports = router;
