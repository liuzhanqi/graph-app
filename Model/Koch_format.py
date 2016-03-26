from Graph import Graph
import sys, json

class Koch(object):
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
                result.add_vertex((e1, e2))
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
                    result.set_edge_attribute({(ee1,ee2) : "d-edge"})
                elif g1.get_node_attribute(middle_node1) == g2.get_node_attribute(middle_node2):
                    result.set_edge_attribute({(ee1,ee2) : "c-edge"})
                else:
                    result.set_edge_attribute({(ee1,ee2) : "d-edge"})
        return result

    def expand_c_clique(self, C, P, D, largest, G):
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
            P = set()
            D = set()
            N = G.get_neighbours(u)
            for v in N:
                if G.get_edge_attribute((u, v)) == "c-edge":
                    if v not in T:
                        P.add(v)
                elif G.get_edge_attribute((u, v)) == "d-edge":
                    D.add(v)
            u_set = set()
            u_set.add(u)
            E = self.expand_c_clique(u_set, P, D, largest, G)
            if len(E) > len(R):
                R = E.copy()
                largest = len(E)
            T.add(u)
        return R

def build_graph(data):
    g = Graph()
    dict = {}
    for v in data["nodes"]:
        g.add_vertex(v.id)
        g.set_node_attribute({v.id: v})
        dict[id] = v
    for e in data["edges"]:
        source = e["source"]
        target = e["target"]
        g.add_edge((source,target))
        g.set_edge_attribute({(source,target):e})
    return g

if __name__ == "__main__":
    a = sys.argv[1]
    b = sys.argv[2]
    g1 = json.loads(a)
    g2 = json.loads(b)
    graph1 = build_graph(g1)
    graph2 = build_graph(g2)
    k = Koch()
    result = k.maximal_c_clique(graph1, graph2)
    print()
    sys.stdout.flush()