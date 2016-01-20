var Vertex = function(attr) {
	if (Vertex.count == undefined) {
		Vertex.count = 0;
	} else {
		Vertex.count ++;
	}
	//TODO:add graph ID
	this.id="Vertex"+Vertex.count;
	if (attr) {
		for (var key in attr) {
			if (attr.hasOwnProperty(key)) {
				this[key] = attr[key];
			}
		}
	}
	console.log("created vertex, id = " + this.id);
}

// Vertex.prototype.moveTo = function(x,y) {
// 	this.x=x;
// 	this.y=y;
// }

module.exports = Vertex;