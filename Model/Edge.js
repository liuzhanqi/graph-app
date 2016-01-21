//v1 v2 are vertex id

var Edge = function(v1, v2, attr) {
	console.log("in the edge constructor");
	console.log(attr);
	if (Edge.count == undefined) {
    	Edge.count = 0;
    } else {
    	Edge.count ++;
    }
    //this.id = Edge.count;
    this.graphID=attr.graphID;
    this.source=v1;
    this.target=v2;
    this.id="GraphID"+this.graphID+"Edge"+Edge.count;
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