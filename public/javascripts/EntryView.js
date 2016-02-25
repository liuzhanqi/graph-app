document.onload = (function () {

    entry = new EntryView();

})();

function EntryView() {

}

EntryView.prototype.create_new_graph = function() {
    $.get( "/graphDefinition");
};

function readFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            var contents = e.target.result;
            console.log(contents);
            var data = JSON.parse(contents);
            console.log(data);
            $.post( "/jsonUpload", {data: JSON.stringify(data)})
                .done(function( data ) {
                    console.log(data);
                    location.href='/editor';
                });
        }
        r.readAsText(f);
    } else { 
        alert("Failed to load file");
    }
}

$("input:file").change(readFile);
