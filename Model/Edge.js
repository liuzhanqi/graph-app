var Edge = function(v1, v2) {
	if (Edge.count == undefined) {
    	Edge.count = 1;
    } else {
    	Edge.count ++;
    }
    this.id = Edge.count;
    this.vertex1=v1;
    this.vertex2=v2;
}