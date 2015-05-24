var Edge = function(v1, v2) {
	if (Edge.count == undefined) {
    	Edge.count = 0;
    } else {
    	Edge.count ++;
    }
    //this.id = Edge.count;
    this.source=v1;
    this.target=v2;
}


module.exports = Edge;