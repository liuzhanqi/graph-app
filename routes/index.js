var express = require('express');
var router = express.Router();
//var Graph = require('../Model/Graph');

var data=[];

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.post('/eventHandler', function(req,res,next) {
	//console.log(graph);
	data.push(req.body);
	var x=req.body.x;
	var y=req.body.y;
	console.log(JSON.stringify(data));
	res.send(JSON.stringify(data));
});

module.exports = router;
