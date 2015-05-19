var Vertex = function(x,y) {
	if (Vertex.count == undefined) {
		Vertex.count = 1;
	} else {
		Vertex.count ++;
	}
	this.id=Vertex.count;
	this.x=x;
	this.y=y;
}

module.exports = Vertex;