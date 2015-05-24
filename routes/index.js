var express = require('express');
var router = express.Router();
var Graph = require('../Model/Graph');

var graph= new Graph();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

// router.post('/eventHandler', function(req,res,next) {
// 	if (req.body.eventType == "create-vertex") {
// 		var x=req.body.x;
// 		var y=req.body.y;
// 		var data = graph.createVertex(x,y);
// 		res.send(JSON.stringify(data));
// 	} else if (req.body.eventType == "update-vertex") {
// 		var x=req.body.x;
// 		var y=req.body.y;
// 		var id=req.body.id;
// 		var data = graph.updateVertexPosition(id,x,y);
// 		res.send(JSON.stringify(data));
// 	}
	
// });

router.get('/getGraph', function(req,res,next) {
	var data = graph.getGraph();
	res.send(JSON.stringify(data));
});

router.post('/createNode' , function(req,res,next) {
	var x=req.body.x;
	var y=req.body.y;
	var data = graph.createVertex(x,y);
	res.send(JSON.stringify(data));
});

router.post('/createEdge' , function(req,res,next) {
	var node1=req.body.node1;
	var node2=req.body.node2;
	var data = graph.createEdge(node1,node2);
	res.send(JSON.stringify(data));
});

module.exports = router;
