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
