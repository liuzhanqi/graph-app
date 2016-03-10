from Graph import Graph
import sys
import json

class Koch(object):

    def __init__(self):
        """ initializes a graph object """

    def edge_product_graph(self, g1, g2):
        result = Graph()
        for e1 in g1.edges():
            for e2 in g2.edges():
                if g1.get_edge_attribute(e1) == None:
                    continue
                if g2.get_edge_attribute(e2) == None:
                    continue
                if g1.get_edge_attribute(e1) != g2.get_edge_attribute(e2):
                    continue
                if g1.get_node_attribute(e1[0]) != g2.get_node_attribute(e2[0]):
                    continue
                if g1.get_node_attribute(e1[1]) != g2.get_node_attribute(e2[1]):
                    continue
                # the two edges match
                # print("edge matches:" + str(e1) + str(e2))
                # print(g1.get_edge_attribute(e1),g2.get_edge_attribute(e2))
                result.add_vertex((e1, e2))
        # add edges in r (between edge pairs that are compatible)
        # print(len(result.vertices()))
        product_nodes = result.vertices()
        for i in range(len(product_nodes)):
            for j in range(i+1, len(product_nodes)):
                ee1 = product_nodes[i]
                ee2 = product_nodes[j]
                if ee1 == ee2:
                    continue
                middle_node1 = None
                middle_node2 = None
                for v1 in ee1[0]:
                    for v2 in ee2[0]:
                        if v1 == v2:
                            middle_node1 = v1
                for v1 in ee1[1]:
                    for v2 in ee2[1]:
                        if v1 == v2:
                            middle_node2 = v1
                result.add_edge((ee1,ee2))
                if middle_node1 == None or middle_node2 == None:
                    # print("d_edge setting : ", ee1, ee2)
                    result.set_edge_attribute({(ee1,ee2) : "d-edge"})
                elif g1.get_node_attribute(middle_node1) == g2.get_node_attribute(middle_node2):
                    result.set_edge_attribute({(ee1,ee2) : "c-edge"})
                else:
                    # print("d_edge setting : ", ee1, ee2)
                    result.set_edge_attribute({(ee1,ee2) : "d-edge"})
        # print(" resulting edge product graph: ")
        # for e in result.edges():
        #     print(str(e))
        #     print(result.get_edge_attribute(e))
        return result

    def expand_c_clique(self, C, P, D, largest, G):
        # print(C,P,D,largest,G)
        R = C.copy()
        if (len(P) == 0) or (len(P) + len(C) + len(D) <= largest):
            return R
        P_copy = P.copy()
        for u in P_copy:
            P.remove(u)
            N = G.get_neighbours(u)
            P2 = P.copy()
            P2.union(N)
            D2 = D.copy()
            D2.union(N)
            D2_copy = D2.copy()
            for v in D2_copy:
                if G.get_edge_attribute((u, v)) == "c-edge":
                    P2.add(v)
                    D2.remove(v)
            C2 = C.copy()
            C2.add(u)
            E = self.expand_c_clique(C2, P2, D2, largest, G)
            # print("expand_c_clique E = ", E)
            if len(E) > len(R):
                R = E.copy()
                largest = len(E)
        return R

    def maximal_c_clique(self, g1, g2):
        T = set()
        R = set()
        largest = 0
        G = self.edge_product_graph(g1, g2)
        V = G.vertices()
        V_copy = V.copy()
        for u in V_copy:
            # print("iterating V, current u = ", u)
            P = set()
            D = set()
            N = G.get_neighbours(u)
            # print("neighbours of u = ", N)
            for v in N:
                # print("iterating neighbours of u, current v = ", v)
                # print("edge attribute of (u,v) = ", G.get_edge_attribute((u, v)))
                if G.get_edge_attribute((u, v)) == "c-edge":
                    # print("v added to P", v)
                    if v not in T:
                        P.add(v)
                elif G.get_edge_attribute((u, v)) == "d-edge":
                    D.add(v)
            # print("maximal_c_clique P = ", P)
            u_set = set()
            u_set.add(u)
            E = self.expand_c_clique(u_set, P, D, largest, G)
            # print("maximal_c_clique E = ", E)
            if len(E) > len(R):
                R = E.copy()
                largest = len(E)
            T.add(u)
        return R

def build_graph(data):
    g = Graph()
    dict = {}
    for v in data["nodes"]:
        id = v["id"]
        del v["graphID"]
        del v["id"]
        g.add_vertex(id)
        g.set_node_attribute({id: v})
        dict[id] = v
    for e in data["edges"]:
        source = e["source"]
        target = e["target"]
        del e["graphID"]
        del e["id"]
        del e["source"]
        del e["target"]
        g.add_edge((source,target))
        g.set_edge_attribute({(source,target):e})
    return g

if __name__ == "__main__":
    a = sys.argv[1]
    b = sys.argv[1]
    g1 = json.loads(a)
    g2 = json.loads(b)
    # g1 = {"nodes":[{"name":"peter","id":"GraphIDfriendVertex1","graphID":"friend"},{"name":"sam","id":"GraphIDfriendVertex3","graphID":"friend"},{"name":"betty","id":"GraphIDfriendVertex2","graphID":"friend"},{"name":"jason","id":"GraphIDfriendVertex5","graphID":"friend"},{"name":"ivy","id":"GraphIDfriendVertex4","graphID":"friend"}],"edges":[{"id":"GraphIDfriendEdge4","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex1","years":"3"},{"id":"GraphIDfriendEdge6","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex3","years":"2"},{"id":"GraphIDfriendEdge8","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex2","years":"5"},{"id":"GraphIDfriendEdge5","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex2","years":"2"},{"id":"GraphIDfriendEdge1","graphID":"friend","source":"GraphIDfriendVertex3","target":"GraphIDfriendVertex2","years":"3"},{"id":"GraphIDfriendEdge2","graphID":"friend","source":"GraphIDfriendVertex2","target":"GraphIDfriendVertex5","years":"2"},{"id":"GraphIDfriendEdge3","graphID":"friend","source":"GraphIDfriendVertex5","target":"GraphIDfriendVertex4","years":"6"}]}
    # g2 = {"nodes":[{"name":"peter","id":"GraphIDfriendVertex1","graphID":"friend"},{"name":"sam","id":"GraphIDfriendVertex3","graphID":"friend"},{"name":"betty","id":"GraphIDfriendVertex2","graphID":"friend"},{"name":"jason","id":"GraphIDfriendVertex5","graphID":"friend"},{"name":"ivy","id":"GraphIDfriendVertex4","graphID":"friend"}],"edges":[{"id":"GraphIDfriendEdge4","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex1","years":"3"},{"id":"GraphIDfriendEdge6","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex3","years":"2"},{"id":"GraphIDfriendEdge8","graphID":"friend","source":"GraphIDfriendVertex4","target":"GraphIDfriendVertex2","years":"5"},{"id":"GraphIDfriendEdge5","graphID":"friend","source":"GraphIDfriendVertex1","target":"GraphIDfriendVertex2","years":"2"},{"id":"GraphIDfriendEdge1","graphID":"friend","source":"GraphIDfriendVertex3","target":"GraphIDfriendVertex2","years":"3"},{"id":"GraphIDfriendEdge2","graphID":"friend","source":"GraphIDfriendVertex2","target":"GraphIDfriendVertex5","years":"2"},{"id":"GraphIDfriendEdge3","graphID":"friend","source":"GraphIDfriendVertex5","target":"GraphIDfriendVertex4","years":"6"}]}
    graph1 = build_graph(g1)
    graph2 = build_graph(g2)
    k = Koch()
    ans = k.maximal_c_clique(graph1, graph2)
    result = {}
    result["graph1"] = []
    result["graph2"] = []
    for pair in ans:
        result["graph1"].append({"source":pair[0][0], "target":pair[0][1]})
        result["graph2"].append({"source":pair[1][0], "target":pair[1][1]})
    print(result)
    # print(ans)
    # edge_product_graph = k.edge_product_graph(graph1, graph2)
    # print(graph1.get_edge_attribute(("u1", "u2")) == graph2.get_edge_attribute(("v1", "v2")))
    sys.stdout.flush()