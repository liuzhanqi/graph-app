var checkID = function() {
    inputID1 = document.querySelector('#graphID1').value;
    inputID2 = document.querySelector('#graphID2').value;
    console.log(inputID1)
    console.log(inputID2)
    //check empty
    errorMessage = "";
    if (0 === inputID1.length || 0 === inputID2.length) {
        errorMessage = "Empty ID is not allowed.";
    }
    //check illegal character
    //check duplication
    if (0 === errorMessage.length) {
        //create the new graph with this ID
        $.post( "/retrieveComparisonID", {id1: inputID1, id2: inputID2}).done(function( data ) {
            if (data == 'not exists') {
                errorMessage = "This ID does exists.";
                document.getElementById("error").innerHTML = errorMessage;
            } else {
                location.href='/comparison';
            }
        });
    }
    document.getElementById("error").innerHTML = errorMessage;
    console.log(errorMessage);
}

$("#nextbutton").click(checkID);