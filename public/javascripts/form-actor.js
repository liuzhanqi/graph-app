$('#add').click(function() {
	$form = $('#add-node');
	$lastRow = $form.find('.attribute:last');
    $lastRow.clone().insertAfter($lastRow);
});

//for graphDefinition.jade
$('#more-node-attributes').click(function() {
    var lastRow = $("div.node-attribute-row").last();
    var lastinput = lastRow.find("input");
    // Read the Number from that TR's ID (i.e: 3 from "node-attribute3")
    // And increment that number by 1
    var num = parseInt( lastinput.attr("id").match(/\d+/g), 10 ) +1;
    // Clone it and assign the new ID (i.e: from num 4 to ID "klon4")
    var newRow = lastRow.clone();
    // Modify the input name
    newRow.find('input').attr('name', 'node-attribute'+num);
    newRow.find('input').attr('id', 'node-attribute'+num);
    newRow.find('label').html("Node Attribute " + num);
    // Append $newRow wherever you want
    newRow.insertAfter(lastRow);
});
$('#less-node-attributes').click(function() {
    // get the last TR which ID starts with ^= "node-attribute"
    var row = $("div.node-attribute-row").last();
    if (row.find('input').attr('id') != "node-attribute1") 
        row.remove();
});
$('#more-edge-attributes').click(function() {
    var lastRow = $("div.edge-attribute-row").last();
    var lastinput = lastRow.find("input");
    // Read the Number from that TR's ID (i.e: 3 from "node-attribute3")
    // And increment that number by 1
    var num = parseInt( lastinput.attr("id").match(/\d+/g), 10 ) +1;
    // Clone it and assign the new ID (i.e: from num 4 to ID "klon4")
    var newRow = lastRow.clone();
    // Modify the input name
    newRow.find('input').attr('name', 'edge-attribute'+num);
    newRow.find('input').attr('id', 'edge-attribute'+num);
    newRow.find('label').html("Edge Attribute " + num);
    // Append $newRow wherever you want
    newRow.insertAfter(lastRow);
});
$('#less-edge-attributes').click(function() {
    // get the last TR which ID starts with ^= "node-attribute"
    var row = $("div.edge-attribute-row").last();
    if (row.find('input').attr('id') != "edge-attribute1") 
        row.remove();
});

$('#submit').click(function () {
    console.log("hello");
    var $inputs = $('input');
    var definitions = {};
    definitions.nodeAttribute=[];
    definitions.edgeAttribute=[];
    $inputs.each(function() {
        if (this.name != "submit") {
            if (this.name.substring(0,14) === "node-attribute") {
                definitions.nodeAttribute.push($(this).val());
            } else if (this.name.substring(0,14) === "edge-attribute") {
                definitions.edgeAttribute.push($(this).val());
            } else if (this.name == "isDirected") {
                definitions.isDirected = $(this).is(':checked');
            }
            else {
                //TODO: limit the name of attributes or modify the reserved names
                definitions[this.name] = $(this).val();
            }
        }    
    });
    console.log(JSON.stringify(definitions));
    //TODO: do some input checking
    $.post("/createGraphDefinition", {def: JSON.stringify(definitions)});
    location.href='/editor';
});
