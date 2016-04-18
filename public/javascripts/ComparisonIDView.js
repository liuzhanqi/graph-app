var checkID = function() {
    inputID1 = document.querySelector('#graphID1').value;
    inputID2 = document.querySelector('#graphID2').value;
    console.log(inputID1)
    console.log(inputID2)
    //check empty
    errorMessage = "";
    if (0 === inputID1.length || 0 === inputID2.length) {
        errorMessage = "Empty ID is not allowed.";
        $("#error").html(errorMessage);
    } else {
        $.post( "/retrieveComparisonID", {id1: inputID1, id2: inputID2}).done(function( data ) {
            if (data == 'not exists') {
                errorMessage = "This ID does exists.";
                $("#error").html(errorMessage);
            } else {
                location.href='/comparison';
            }
        });
    }
}

$("#nextbutton").click(checkID);

var putinput1 = function(event) {
    var selectID = event.target.id;
    $("#list1").find(".active").removeClass("active");
    $(event.target).addClass("active");
    $("#graphID1").val(selectID);
}

var putinput2 = function(event) {
    var selectID = event.target.id;
    $("#list2").find(".active").removeClass("active");
    $(event.target).addClass("active");
    $("#graphID2").val(selectID);
}

document.onload = (function() {
    var list1 = $("#list1").append('<div></div>').find('div');
    list1.addClass("list-group");
    var list2 = $("#list2").append('<div></div>').find('div');
    list2.addClass("list-group");
    $.post( "/retrieveAllGraphID").done(function(data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            var newButton = list1.append('<button>' + data[i] + '</button>').find('button').last();
            newButton.addClass("list-group-item");
            newButton.attr( "type", "button" );
            newButton.attr( "id", data[i] );
            newButton.click(putinput1);
        }   
        for (var i = 0; i < data.length; i++) {
            var newButton = list2.append('<button>' + data[i] + '</button>').find('button').last();
            newButton.addClass("list-group-item");
            newButton.attr( "type", "button" );
            newButton.attr( "id", data[i] );
            newButton.click(putinput2);
        }   
    });
})();
