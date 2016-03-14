from Graph import Graph

class McGregor():
    def __init__(self, g1, g2):
        self.g1 = g1
        self.g2 = g2
        self.iters = 0
        self.mcssize = 0
        self.mcslist = []
        self.verbose = False
        self.stop = False

    def match(self, s):
        if self.verbose:
            print("match(" , s, ") with stop = ", self.stop)
        self.iters += 1

        if self.stop:
            return

        # if self.iters > 100:
        #     return

        if len(s) > self.mcssize:
            self.mcslist = [s.map]  # save newest result as sole
            self.mcssize = len(s)

            if self.mcssize == len(self.g1.vertices()) or self.mcssize == len(self.g2.vertices()):
                self.stop = True

            if self.verbose:
                # print("optimal mcs size now", len(s))
                print("optional mcs noe ", s, " len = ",  len(s))
        elif len(s) == self.mcssize:
            self.mcslist.append(s.map)
            if self.verbose:
                print("+ mcs")

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
        # print("feasible (" , n1, n2, ")")
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
                if self.g1.get_edge_attribute((n1,node)) == self.g2.get_edge_attribute((n2,s.map[node])):
                    # print("set at_least_one_edge_matched = Ture")
                    at_least_one_edge_matched = True
        if not at_least_one_edge_matched:
            return False
        return True

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


if __name__ == "__main__":
    g_data1 = {"u1": ["u2", "u3"],
               "u2": ["u4", "u1"],
               "u3": ["u4", "u1"],
               "u4": ["u2", "u3"]}
    node_attr_1 = {"u1": {"label": "l"},
                   "u3": {"label": "l"},
                   "u2": {"label": "s"},
                   "u4": {"label": "s"}}
    edge_attr_1 = {("u1", "u2"): {"label": "d"},
                   ("u1", "u3"): {"label": "d"},
                   ("u2", "u4"): {"label": "s"},
                   ("u3", "u4"): {"label": "x"}}
    node_attr_2 = {"v1": {"label": "l"},
                   "v3": {"label": "l"},
                   "v2": {"label": "s"},
                   "v4": {"label": "s"}}
    edge_attr_2 = {("v1", "v2"): {"label": "s"},
                   ("v1", "v3"): {"label": "x"},  # the difference
                   ("v2", "v4"): {"label": "s"},
                   ("v3", "v4"): {"label": "x"}}
    g_data2 = {"v1": ["v2", "v3"],
               "v2": ["v4", "v1"],
               "v3": ["v4", "v1"],
               "v4": ["v2", "v3"]}
    graph1 = Graph(g_data1)
    graph1.set_node_attribute(node_attr_1)
    graph1.set_edge_attribute(edge_attr_1)
    graph2 = Graph(g_data2)
    graph2.set_node_attribute(node_attr_2)
    graph2.set_edge_attribute(edge_attr_2)
    # print(graph2.get_edge_attribute(("v1", "v2")))
    # print(graph1.edges())
    mcs = McGregor(graph1, graph2)
    mcs.verbose = False
    mcslist, mcssize = mcs.mcs()
    # print("maximum mcs", mcssize)
    print(mcslist)
