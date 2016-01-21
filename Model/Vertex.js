var Vertex = function(attr) {
	if (Vertex.count == undefined) {
		Vertex.count = 0;
	} else {
		Vertex.count ++;
	}
	this.graphID=attr.graphID;
	this.id="GraphID"+this.graphID+"Vertex"+Vertex.count;
	if (attr) {
		for (var key in attr) {
			if (attr.hasOwnProperty(key)) {
				this[key] = attr[key];
			}
		}
	}
	console.log("creating vertex with attributes");
	console.log(this);
}

// Vertex.prototype.moveTo = function(x,y) {
// 	this.x=x;
// 	this.y=y;
// }

module.exports = Vertex;