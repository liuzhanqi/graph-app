var retrieve = function(event) {
    var selectID = event.target.id;
    $.post( "/retrieveOldGraphID", {id: selectID}).done(function(data) {
        if (data.length > 0) {
            location.href='/editor';
        } else {
            errorMessage = "This ID does not exists.";
            $("#error").text(errorMessage);
        }
    });
}

document.onload = (function() {
    var list = $("#graphidlist").append('<div></div>').find('div');
    list.addClass("list-group");
    $.post( "/retrieveAllGraphID").done(function(data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            var newButton = list.append('<button>' + data[i] + '</button>').find('button').last();
            newButton.addClass("list-group-item");
            newButton.attr( "type", "button" );
            newButton.attr( "id", data[i] );
            newButton.click(retrieve);
        }   
    });
})();
