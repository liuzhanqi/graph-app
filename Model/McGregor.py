from Graph import Graph
import sys
import json

class McGregor():
    def __init__(self, g1, g2):
        self.g1 = g1
        self.g2 = g2
        self.iters = 0
        self.mcssize = 0
        self.mcslist = []
        self.verbose = False
        self.stop = False
        self.visited = []

    def match(self, s):
        if self.verbose:
            print("match(" , s, ") with stop = ", self.stop)
        self.iters += 1

        if self.stop:
            return

        # if self.iters > 100:
        #     return

        if len(s) > self.mcssize:
            self.mcslist = s.map  # save newest result as sole
            self.mcssize = len(s)

            if self.mcssize == len(self.g1.vertices()) or self.mcssize == len(self.g2.vertices()):
                self.stop = True

            if self.verbose:
                # print("optimal mcs size now", len(s))
                print("optional mcs noe ", s, " len = ",  len(s))
        # elif len(s) == self.mcssize:
        #     self.mcslist.append(s.map)
        #     if self.verbose:
        #         print("+ mcs")

        if self.verbose:
            print("state", s)

        for n1, n2 in self.candidatepairs(s):
            # if self.verbose:
            # 	print " "*len(s), "cp [%s] [%s]" % (n1,n2), #state
            if self.feasible(s, n1, n2):
                # if self.verbose:
                # 	print
                ns = State()
                ns.map = s.map.copy()
                ns.map[n1] = n2

                ns.lhsborder = s.lhsborder[:]
                try:
                    ns.lhsborder.remove(n1)
                except:
                    pass
                for ne in self.g1.get_neighbours(n1):
                    if ne not in ns.lhsborder and ne not in ns.map.keys():
                        ns.lhsborder.append(ne)

                ns.rhsborder = s.rhsborder[:]
                try:
                    ns.rhsborder.remove(n2)
                except:
                    pass
                for ne in self.g2.get_neighbours(n2):
                    if ne not in ns.rhsborder and ne not in ns.map.values():
                        ns.rhsborder.append(ne)

                ns.lhsborder.sort()
                ns.rhsborder.sort()

                # only continue if border still contains stuff
                self.match(ns)

    # here need to check all pairs
    def candidatepairs(self, s):
        # print("candidatepairs")
        # print("s.lhsborder = ", s.lhsborder)
        # print("s.rhsborder = ", s.rhsborder)
        if s.lhsborder and s.rhsborder:
            # lhs = s.lhsborder[0]
            for lhs in s.lhsborder:
                for rhs in s.rhsborder:
                    yield lhs, rhs

        # empty lhsborder!
        elif not s.lhsborder and not s.rhsborder:
            for lhs in self.g1.vertices():
                for rhs in self.g2.vertices():
                    if (lhs not in s.map.keys()) and (rhs not in s.map.values()):
                        yield lhs, rhs

    def feasible(self, s, n1, n2):
        if (n1,n2) in self.visited:
            return False;
        self.visited.append((n1,n2))
        # print("feasible (" , n1, n2, ")")
        # if len(self.g1.get_neighbours(n1)) != len(self.g2.get_neighbours(n2)):
        #     print(n1,len(self.g1.get_neighbours(n1)),n2,len(self.g2.get_neighbours(n2)));
        #     return False
        if self.g1.get_node_attribute(n1) != self.g2.get_node_attribute(n2):
            if self.verbose:
                print("ATOM MISMATCH")
            return False
        # print("neighbour of n1 = " , self.g1.get_neighbours(n1))
        # print("neighbour of n2 = " , self.g2.get_neighbours(n2))
        n_mapped_neighs = []
        for ne in self.g1.get_neighbours(n1):
            if ne in s.map.keys():
                n_mapped_neighs.append(ne)
        m_mapped_neighs = []
        for ne in self.g2.get_neighbours(n2):
            if ne in s.map.values():
                m_mapped_neighs.append(ne)

        if len(n_mapped_neighs) != len(m_mapped_neighs):
            if self.verbose:
                print("UNCONNECTED")
            return False

        if len(n_mapped_neighs) == 0:
            return True

        # print(n_mapped_neighs)
        at_least_one_edge_matched = False
        for node in n_mapped_neighs:
            if not s.map[node] in m_mapped_neighs:
                if self.verbose:
                    print("UNCONNECTED")
                return False
            else:
                # print(n1, node)
                # print(self.g1.get_edge_attribute((n1,node)))
                # print(n2, s.map[node])
                # print(self.g2.get_edge_attribute((n2,s.map[node])))
                if self.g1.get_edge_attribute((n1,node)) != self.g2.get_edge_attribute((n2,s.map[node])):
                    return False;
        return True;

    def mcs(self):
        s = State()  # empty state
        self.match(s)

        return self.mcslist, self.mcssize


class State:
    def __init__(self):
        self.map = {}
        self.lhsborder = []
        self.rhsborder = []

    def __len__(self):
        return len(self.map)

    def __str__(self):
        s = "[" + ",".join([str(x) for x in self.map.keys()]) + "|" + ",".join(
                [str(self.map[x]) for x in self.map]) + "]"
        s += " [" + ",".join([str(x) for x in self.lhsborder]) + "]"
        s += " [" + ",".join([str(x) for x in self.rhsborder]) + "]"
        return s

def build_graph(data):
    g = Graph()
    dict = {}
    for v in data["nodes"]:
        id = v["id"]
        del v["graphID"], v["id"]
        g.add_vertex(id)
        g.set_node_attribute({id: v})
        dict[id] = v
    for e in data["edges"]:
        source = e["source"]
        target = e["target"]
        del e["graphID"], e["id"], e["source"], e["target"]
        g.add_edge((source,target))
        g.set_edge_attribute({(source,target):e})
    return g


if __name__ == "__main__":
    # g_data1 = {"u1": ["u2", "u3"],
    #            "u2": ["u4", "u1"],
    #            "u3": ["u4", "u1"],
    #            "u4": ["u2", "u3"]}
    # node_attr_1 = {"u1": {"label": "l"},
    #                "u3": {"label": "l"},
    #                "u2": {"label": "s"},
    #                "u4": {"label": "s"}}
    # edge_attr_1 = {("u1", "u2"): {"label": "d"},
    #                ("u1", "u3"): {"label": "d"},
    #                ("u2", "u4"): {"label": "s"},
    #                ("u3", "u4"): {"label": "x"}}
    # node_attr_2 = {"v1": {"label": "l"},
    #                "v3": {"label": "l"},
    #                "v2": {"label": "s"},
    #                "v4": {"label": "s"}}
    # edge_attr_2 = {("v1", "v2"): {"label": "s"},
    #                ("v1", "v3"): {"label": "x"},  # the difference
    #                ("v2", "v4"): {"label": "s"},
    #                ("v3", "v4"): {"label": "x"}}
    # g_data2 = {"v1": ["v2", "v3"],
    #            "v2": ["v4", "v1"],
    #            "v3": ["v4", "v1"],
    #            "v4": ["v2", "v3"]}
    a = sys.argv[1]
    b = sys.argv[2]
    g1 = json.loads(a)
    g2 = json.loads(b)
    # g1 = {"nodes":[{"name":"ivy","id":"GraphIDfriendVertex4","graphID":"friend"},{"name":"ray","id":"GraphIDfriendVertex14","graphID":"friend"},{"name":"kenneth","id":"GraphIDfriendVertex15","graphID":"friend"},{"name":"ruby","id":"GraphIDfriendVertex16","graphID":"friend"},{"name":"jack","id":"GraphIDfriendVertex17","graphID":"friend"},{"name":"derek","id":"GraphIDfriendVertex28","graphID":"friend"},{"name":"rick","id":"GraphIDfriendVertex26","graphID":"friend"},{"name":"peter","id":"GraphIDfriendVertex1","graphID":"friend"},{"name":"jason","id":"GraphIDfriendVertex18","graphID":"friend"},{"name":"sam","id":"GraphIDfriendVertex3","graphID":"friend"},{"name":"eric","id":"GraphIDfriendVertex19","graphID":"friend"},{"name":"jimmy","id":"GraphIDfriendVertex20","graphID":"friend"},{"name":"betty","id":"GraphIDfriendVertex2","graphID":"friend"},{"name":"kate","id":"GraphIDfriendVertex6","graphID":"friend"},{"name":"zillion","id":"GraphIDfriendVertex25","graphID":"friend"},{"name":"candy","id":"GraphIDfriendVertex21","graphID":"friend"},{"name":"cat","id":"GraphIDfriendVertex24","graphID":"friend"},{"name":"jason","id":"GraphIDfriendVertex5","graphID":"friend"},{"name":"jen","id":"GraphIDfriendVertex7","graphID":"friend"},{"name":"amy","id":"GraphIDfriendVertex8","graphID":"friend"},{"name":"dion","id":"GraphIDfriendVertex10","graphID":"friend"},{"name":"peter","id":"GraphIDfriendVertex9","graphID":"friend"},{"name":"cindy","id":"GraphIDfriendVertex13","graphID":"friend"},{"name":"alex","id":"GraphIDfriendVertex11","graphID":"friend"},{"name":"bob","id":"GraphIDfriendVertex12","graphID":"friend"},{"name":"david","id":"GraphIDfriendVertex22","graphID":"friend"}],"edges":[{"id":"GraphIDfriendEdge20","graphID":"friend","source":"GraphIDfriendVertex15","target":"GraphIDfriendVertex14","years":"4"},{"id":"GraphIDfriendEdge17","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex14","years":"3"},{"id":"GraphIDfriendEdge19","graphID":"friend","source":"GraphIDfriendVertex16","target":"GraphIDfriendVertex15","years":""},{"id":"GraphIDfriendEdge18","graphID":"friend","source":"GraphIDfriendVertex14","target":"GraphIDfriendVertex16","years":""},{"id":"GraphIDfriendEdge21","graphID":"friend","source":"GraphIDfriendVertex16","target":"GraphIDfriendVertex17","years":"3"},{"id":"GraphIDfriendEdge32","graphID":"friend","source":"GraphIDfriendVertex28","target":"GraphIDfriendVertex17","years":"1"},{"id":"GraphIDfriendEdge33","graphID":"friend","source":"GraphIDfriendVertex17","target":"GraphIDfriendVertex26","years":"4"},{"id":"GraphIDfriendEdge4","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex1","years":"3"},{"id":"GraphIDfriendEdge34","graphID":"friend","source":"GraphIDfriendVertex26","target":"GraphIDfriendVertex18","years":""},{"id":"GraphIDfriendEdge25","graphID":"friend","source":"GraphIDfriendVertex3","target":"GraphIDfriendVertex18","years":"4"},{"id":"GraphIDfriendEdge24","graphID":"friend","source":"GraphIDfriendVertex20","target":"GraphIDfriendVertex3","years":"6"},{"id":"GraphIDfriendEdge6","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex3","years":"2"},{"id":"GraphIDfriendEdge23","graphID":"friend","source":"GraphIDfriendVertex19","target":"GraphIDfriendVertex20","years":"5"},{"id":"GraphIDfriendEdge35","graphID":"friend","source":"GraphIDfriendVertex18","target":"GraphIDfriendVertex20","years":""},{"id":"GraphIDfriendEdge5","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex2","years":"2"},{"id":"GraphIDfriendEdge9","graphID":"friend","source":"GraphIDfriendVertex5","target":"GraphIDfriendVertex6","years":"4"},{"id":"GraphIDfriendEdge27","graphID":"friend","source":"GraphIDfriendVertex6","target":"GraphIDfriendVertex25","years":"3"},{"id":"GraphIDfriendEdge28","graphID":"friend","source":"GraphIDfriendVertex25","target":"GraphIDfriendVertex21","years":"2"},{"id":"GraphIDfriendEdge29","graphID":"friend","source":"GraphIDfriendVertex21","target":"GraphIDfriendVertex24","years":"1"},{"id":"GraphIDfriendEdge30","graphID":"friend","source":"GraphIDfriendVertex24","target":"GraphIDfriendVertex5","years":""},{"id":"GraphIDfriendEdge2","graphID":"friend","source":"GraphIDfriendVertex2","target":"GraphIDfriendVertex5","years":"2"},{"id":"GraphIDfriendEdge10","graphID":"friend","source":"GraphIDfriendVertex6","target":"GraphIDfriendVertex7","years":"6"},{"id":"GraphIDfriendEdge11","graphID":"friend","source":"GraphIDfriendVertex7","target":"GraphIDfriendVertex8","years":"6"},{"id":"GraphIDfriendEdge12","graphID":"friend","source":"GraphIDfriendVertex7","target":"GraphIDfriendVertex10","years":"8"},{"id":"GraphIDfriendEdge13","graphID":"friend","source":"GraphIDfriendVertex6","target":"GraphIDfriendVertex9","years":"7"},{"id":"GraphIDfriendEdge14","graphID":"friend","source":"GraphIDfriendVertex9","target":"GraphIDfriendVertex13","years":"6"},{"id":"GraphIDfriendEdge15","graphID":"friend","source":"GraphIDfriendVertex6","target":"GraphIDfriendVertex11","years":"2"},{"id":"GraphIDfriendEdge16","graphID":"friend","source":"GraphIDfriendVertex11","target":"GraphIDfriendVertex12","years":"1"},{"id":"GraphIDfriendEdge31","graphID":"friend","source":"GraphIDfriendVertex5","target":"GraphIDfriendVertex22","years":"4"}]}
    # g2 = {"nodes":[{"name":"ivy","id":"GraphIDfriend2Vertex4","graphID":"friend2"},{"name":"ray","id":"GraphIDfriend2Vertex14","graphID":"friend2"},{"name":"kenneth","id":"GraphIDfriend2Vertex15","graphID":"friend2"},{"name":"ruby","id":"GraphIDfriend2Vertex16","graphID":"friend2"},{"name":"derek","id":"GraphIDfriend2Vertex28","graphID":"friend2"},{"name":"jack","id":"GraphIDfriend2Vertex17","graphID":"friend2"},{"name":"rick","id":"GraphIDfriend2Vertex26","graphID":"friend2"},{"name":"peter","id":"GraphIDfriend2Vertex1","graphID":"friend2"},{"name":"jason","id":"GraphIDfriend2Vertex18","graphID":"friend2"},{"name":"jimmy","id":"GraphIDfriend2Vertex20","graphID":"friend2"},{"name":"eric","id":"GraphIDfriend2Vertex19","graphID":"friend2"},{"name":"betty","id":"GraphIDfriend2Vertex2","graphID":"friend2"},{"name":"jason","id":"GraphIDfriend2Vertex5","graphID":"friend2"},{"name":"kate","id":"GraphIDfriend2Vertex6","graphID":"friend2"},{"name":"zillion","id":"GraphIDfriend2Vertex25","graphID":"friend2"},{"name":"candy","id":"GraphIDfriend2Vertex21","graphID":"friend2"},{"name":"jen","id":"GraphIDfriend2Vertex7","graphID":"friend2"},{"name":"amy","id":"GraphIDfriend2Vertex8","graphID":"friend2"},{"name":"dion","id":"GraphIDfriend2Vertex10","graphID":"friend2"},{"name":"peter","id":"GraphIDfriend2Vertex9","graphID":"friend2"},{"name":"cindy","id":"GraphIDfriend2Vertex13","graphID":"friend2"},{"name":"alex","id":"GraphIDfriend2Vertex11","graphID":"friend2"},{"name":"bob","id":"GraphIDfriend2Vertex12","graphID":"friend2"},{"name":"david","id":"GraphIDfriend2Vertex22","graphID":"friend2"}],"edges":[{"id":"GraphIDfriend2Edge20","graphID":"friend2","source":"GraphIDfriend2Vertex15","target":"GraphIDfriend2Vertex14","years":"4"},{"id":"GraphIDfriend2Edge17","graphID":"friend2","source":"GraphIDfriend2Vertex4","target":"GraphIDfriend2Vertex14","years":"3"},{"id":"GraphIDfriend2Edge18","graphID":"friend2","source":"GraphIDfriend2Vertex14","target":"GraphIDfriend2Vertex16","years":""},{"id":"GraphIDfriend2Edge32","graphID":"friend2","source":"GraphIDfriend2Vertex28","target":"GraphIDfriend2Vertex17","years":"1"},{"id":"GraphIDfriend2Edge21","graphID":"friend2","source":"GraphIDfriend2Vertex16","target":"GraphIDfriend2Vertex17","years":"3"},{"id":"GraphIDfriend2Edge33","graphID":"friend2","source":"GraphIDfriend2Vertex17","target":"GraphIDfriend2Vertex26","years":"4"},{"id":"GraphIDfriend2Edge4","graphID":"friend2","source":"GraphIDfriend2Vertex4","target":"GraphIDfriend2Vertex1","years":"3"},{"id":"GraphIDfriend2Edge34","graphID":"friend2","source":"GraphIDfriend2Vertex26","target":"GraphIDfriend2Vertex18","years":""},{"id":"GraphIDfriend2Edge23","graphID":"friend2","source":"GraphIDfriend2Vertex19","target":"GraphIDfriend2Vertex20","years":"5"},{"id":"GraphIDfriend2Edge35","graphID":"friend2","source":"GraphIDfriend2Vertex18","target":"GraphIDfriend2Vertex20","years":""},{"id":"GraphIDfriend2Edge5","graphID":"friend2","source":"GraphIDfriend2Vertex1","target":"GraphIDfriend2Vertex2","years":"2"},{"id":"GraphIDfriend2Edge2","graphID":"friend2","source":"GraphIDfriend2Vertex2","target":"GraphIDfriend2Vertex5","years":"2"},{"id":"GraphIDfriend2Edge9","graphID":"friend2","source":"GraphIDfriend2Vertex5","target":"GraphIDfriend2Vertex6","years":"4"},{"id":"GraphIDfriend2Edge27","graphID":"friend2","source":"GraphIDfriend2Vertex6","target":"GraphIDfriend2Vertex25","years":"3"},{"id":"GraphIDfriend2Edge28","graphID":"friend2","source":"GraphIDfriend2Vertex25","target":"GraphIDfriend2Vertex21","years":"2"},{"id":"GraphIDfriend2Edge10","graphID":"friend2","source":"GraphIDfriend2Vertex6","target":"GraphIDfriend2Vertex7","years":"6"},{"id":"GraphIDfriend2Edge11","graphID":"friend2","source":"GraphIDfriend2Vertex7","target":"GraphIDfriend2Vertex8","years":"6"},{"id":"GraphIDfriend2Edge12","graphID":"friend2","source":"GraphIDfriend2Vertex7","target":"GraphIDfriend2Vertex10","years":"8"},{"id":"GraphIDfriend2Edge13","graphID":"friend2","source":"GraphIDfriend2Vertex6","target":"GraphIDfriend2Vertex9","years":"7"},{"id":"GraphIDfriend2Edge14","graphID":"friend2","source":"GraphIDfriend2Vertex9","target":"GraphIDfriend2Vertex13","years":"6"},{"id":"GraphIDfriend2Edge15","graphID":"friend2","source":"GraphIDfriend2Vertex6","target":"GraphIDfriend2Vertex11","years":"2"}]}
    graph1 = build_graph(g1)
    graph2 = build_graph(g2)
    mcs = McGregor(graph1, graph2)
    mcs.verbose = False
    mcslist, mcssize = mcs.mcs()
    # print("maximum mcs", mcssize)
    result = {}
    result["graph1"] = []
    result["graph2"] = []
    for key in mcslist:
        result["graph1"].append({"s": key})
        result["graph2"].append({"t": mcslist[key]})
    print(result)
    sys.stdout.flush()