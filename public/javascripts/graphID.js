var checkID = function() {
    $("#error").html("");
    inputID = document.querySelector('#graphID').value;
    console.log(inputID)
    //check empty
    errorMessage = "";
    if (0 === inputID.length) {
        errorMessage = "Empty ID is not allowed.";
        showError(errorMessage);
    }
    //check illegal character
    //check duplication
    if (0 === errorMessage.length) {
        //create the new graph with this ID
        $.post( "/createGraphID", {id: inputID}).done(function( data ) {
            if (data == 'old') {
                errorMessage = "This ID already exists.";
                showError(errorMessage);
            } else {
                location.href='/graphDefinition';
            }
        });
    }
}

var showError = function(errorMessage) {
    var errordiv = $("#error").append("<div></div>").find("div");
    errordiv.addClass("alert alert-danger");
    errordiv.attr("role","alert");
    errordiv.append(errorMessage);
}