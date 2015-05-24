var Vertex = function(x,y) {
	if (Vertex.count == undefined) {
		Vertex.count = 0;
	} else {
		Vertex.count ++;
	}
	this.id="Vertex"+Vertex.count;
	this.x=x;
	this.y=y;
	console.log("created vertex");
}

Vertex.prototype.moveTo = function(x,y) {
	this.x=x;
	this.y=y;
}

module.exports = Vertex;