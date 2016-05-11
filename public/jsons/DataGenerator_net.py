import random
import json
graphid = "CityRing"
result = {
	"graphID" : graphid,
	"definition" : {
		"nodeAttribute":["cityname"],
	    "edgeAttribute":["km"],
	    "nodeName":"City",
	    "edgeName":"distance",
	    "isDirected":True
	}	
}
with open('net.txt', 'r') as f:
	content = [x.strip() for x in f.readlines()]
counter = 0
nodes = []
for name in content:
	counter = counter + 1
	id = "GraphID" + graphid + "Vertex" + str(counter)
	nodes.append({"name" : name, "id" : id})
counter = 0
links = []
for i in range(0, 14):
	for j in range(1, 15):
		counter = counter + 1
		id = "GraphID" + graphid + "Edge" + str(counter)
		sid = "GraphID" + graphid + "Vertex" + str(i*15+j)
		tid = "GraphID" + graphid + "Vertex" + str((i+1)*15+j)
		links.append({
			"id": id,
			"source": sid,
			"target": tid,
	        "years": random.randint(1,100)
	    }) 
		counter = counter + 1
		id = "GraphID" + graphid + "Edge" + str(counter)
		sid = "GraphID" + graphid + "Vertex" + str(i*15+j)
		tid = "GraphID" + graphid + "Vertex" + str(i*15+j+1)
		links.append({
			"id": id,
			"source": sid,
			"target": tid,
		    "years": random.randint(1,100)
		}) 
result["nodes"] = nodes
result["links"] = links
with open('net.json', 'w') as outfile:
    json.dump(result, outfile, indent=4)