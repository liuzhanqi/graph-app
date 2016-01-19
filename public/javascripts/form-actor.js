$('#add').click(function() {
	$form = $('#add-node');
	$lastRow = $form.find('.attribute:last');
    $lastRow.clone().insertAfter($lastRow);
});

$('#add-node').submit(function () {
	var $inputs = $('#add-node :input');
    var values = {};
    $inputs.each(function() {
    	if (this.name != "submit")
        	values[this.name] = $(this).val();
    });
	graph.addNode(values);
	return false;
});

//for graphDefinition.jade
$('#more-node-attributes').click(function() {
    $form = $('#node-form');
    // get the last TR which ID starts with ^= "node-attribute"
    var $lastRow = $form.find('tr[id^="node-attribute"]:last');
    // Read the Number from that TR's ID (i.e: 3 from "node-attribute3")
    // And increment that number by 1
    var num = parseInt( $lastRow.prop("id").match(/\d+/g), 10 ) +1;
    // Clone it and assign the new ID (i.e: from num 4 to ID "klon4")
    var $newRow = $lastRow.clone().prop('id', 'node-attribute'+num );
    // Modify the input name
    $newRow.find('input').prop('name', 'node-attribute'+num);
    // Append $newRow wherever you want
    $newRow.insertAfter($lastRow);
});
$('#less-node-attributes').click(function() {
    $form = $('#node-form');
    // get the last TR which ID starts with ^= "node-attribute"
    var $row = $form.find('tr[id^="node-attribute"]:last');
    if ($row.attr('id') != "node-attribute1") 
        $row.remove();
});
$('#more-edge-attributes').click(function() {
    $form = $('#edge-form');
    // get the last TR which ID starts with ^= "edge-attribute"
    var $lastRow = $form.find('tr[id^="edge-attribute"]:last');
    // Read the Number from that TR's ID (i.e: 3 from "edge-attribute3")
    // And increment that number by 1
    var num = parseInt( $lastRow.prop("id").match(/\d+/g), 10 ) +1;
    // Clone it and assign the new ID (i.e: from num 4 to ID "klon4")
    var $newRow = $lastRow.clone().prop('id', 'edge-attribute'+num );
    // Modify the input name
    $newRow.find('input').prop('name', 'edge-attribute'+num);
    // Append $newRow wherever you want
    $newRow.insertAfter($lastRow);
});
$('#less-edge-attributes').click(function() {
    $form = $('#edge-form');
    // get the last TR which ID starts with ^= "edge-attribute"
    var $row = $form.find('tr[id^="edge-attribute"]:last');
    if ($row.attr('id') != "edge-attribute1") 
        $row.remove();
});

$('#submit').click(function () {
    console.log("hello");
    var $inputs = $('input');
    var definitions = {};
    $inputs.each(function() {
        if (this.name != "submit")
            definitions[this.name] = $(this).val();
    });
    console.log(definitions);
    //TODO: do some input checking
    $.post("/createGraphDefinition", {def: definitions});
    location.href='/editor';
});