document.onload = (function () {

    entry = new EntryView();

})();

function EntryView() {

}

EntryView.prototype.create_new_graph = function() {
    $.get( "/graphDefinition");
};


EntryView.prototype.upload_file = function() {
    queue()
    .defer(d3.json, "./jsons/n.json")
    .defer(d3.json, "./jsons/l.json")
    .await(function (error, n, l) {
        for (i in n) {
            //TODO currenly, the id is not provided.
            this.addNode(n[i].id);
        }
        for (i in l) {
            this.addLink(n[l[i].source].id,n[l[i].target].id);
        }
    }); 
};

