import random
import json
result = {
	"graphID" : "Tree",
	"definition" : {
		"nodeAttribute":["name", "class"],
	    "edgeAttribute":["likes"],
	    "nodeName":"Fruits",
	    "edgeName":"Relationship",
	    "isDirected":True
	}	
}
with open('fruit.txt', 'r') as f:
	content = [x.strip() for x in f.readlines()]
counter = 0
nodes = []
for name in content:
	counter = counter + 1
	id = "GraphID" + "Tree" + "Vertex" + str(counter)
	nodes.append({"name" : name, "id" : id, "class" : random.randint(1,6)})
counter = 0
links = []
for i in range(2,len(content)+1):
	counter = counter + 1
	id = "GraphID" + "Tree" + "Edge" + str(counter)
	sid = "GraphID" + "Tree" + "Vertex" + str(i//2)
	tid = "GraphID" + "Tree" + "Vertex" + str(i)
	links.append({
		"id": id,
		"source": sid,
		"target": tid,
        "years": random.randint(1,100)
    }) 
result["nodes"] = nodes
result["links"] = links
with open('tree.json', 'w') as outfile:
    json.dump(result, outfile, indent=4)