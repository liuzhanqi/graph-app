//v1 v2 are vertex id

var Edge = function(v1, v2, attr) {
	console.log("in the edge constructor");
	console.log(attr);
	if (Edge.INDEXMAX == undefined) {
    	Edge.INDEXMAX = 0;
    } else {
    	Edge.INDEXMAX ++;
    }
    //this.id = Edge.INDEXMAX;
    this.graphID=attr.graphID;
    this.source=v1;
    this.target=v2;
    this.id="GraphID"+this.graphID+"Edge"+Edge.INDEXMAX;
    if (attr) {
		for (var key in attr) {
			console.log(key);
			if (attr.hasOwnProperty(key)) {
				this[key] = attr[key];
			}
		}
	}
}

module.exports = Edge;