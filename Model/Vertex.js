var Vertex = function(attr) {
	console.log("in Vertex constructor");
	console.log("Vertex.INDEXMAX = " + Vertex.INDEXMAX);
	if (Vertex.INDEXMAX == undefined) {
		console.log("setting Vertex.INDEXMAX = 0");
		Vertex.INDEXMAX = 0;
	} else {
		Vertex.INDEXMAX ++;
	}
	this.graphID=attr.graphID;
	this.id="GraphID"+this.graphID+"Vertex"+Vertex.INDEXMAX;
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