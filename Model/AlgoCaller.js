var AlgoCaller = function(g1, g2) {
	this.basePath = "/Users/LZQ/Documents/Graph Visualization/graph-app/graph-app/Model"
	this.g1 = {};
	this.g2 = {};
	this.g1["nodes"] = g1.vertexList;
	this.g2["nodes"] = g2.vertexList;
	this.g1["edges"] = g1.edgeList;
	this.g2["edges"] = g2.edgeList;
}

AlgoCaller.prototype.executePython = function(name, callback) {
	console.log(name);
	var spawn = require("child_process").spawn;
	var path = this.basePath + "/Koch.py"
	var process = spawn('python3',[path, JSON.stringify(this.g1), JSON.stringify(this.g2)]);
	var StringDecoder = require('string_decoder').StringDecoder;
	var decoder = new StringDecoder('utf8');
	process.stdout.on('data', function (data){
		var textChunk = decoder.write(data);
		console.log(textChunk);
		callback(textChunk);
	});
}

module.exports = AlgoCaller;