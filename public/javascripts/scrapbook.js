(function () {
    var cellId = 0;

    function appendCell() {
        cellId++;
        var clone = $("#cell").clone();
        clone.css('display', '');
        clone.attr('id', 'cell' + cellId);
        clone.appendTo("#document");
        clone.find('.label-in').text('In [' + cellId + ']');
        clone.find('.label-out').text('Out [' + cellId + ']');
        clone.find('.cell-input').focus().autosize();
    }

    appendCell();


    $('#document').keydown(function (e) {
        if (e.keyCode == 13 && event.shiftKey && $(e.target).hasClass('cell-input')) {
            e.preventDefault();
            // Enter was pressed.
            var textarea = $(e.target);
            var cell = textarea.parents('.cell');
            var output = cell.find('.cell-output')
            var js = textarea.val();
            console.log(js);
            $.ajax({
                url: '/repl',
                data: {'js': js},
                type: 'post'
            })
                .done(function (data) {
                    output.text(data);
                    output.css('display', '');
                    var currentId = parseInt(cell.attr('id').replace(/^cell/, ''));
                    console.log('currentId: ' + currentId);
                    console.log('cellId: ' + cellId);
                    if (currentId === cellId) {
                        appendCell();
                    }
                })
                .fail(function () {
                    console.log("error!");
                });
        }
    })
})();