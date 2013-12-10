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
        if ($(e.target).hasClass('cell-input')) {
            if (e.keyCode == 9) {
                // Tab was pressed: ident
                e.preventDefault();

                var textarea = $(e.target);
                var start = e.target.selectionStart;
                var end =  e.target.selectionEnd;

                var ident = "    ";
                var newCaretPosition = start + ident.length;

                var text = textarea.val().substring(0, start) + ident + textarea.val().substring(end);
                textarea.val(text);

                e.target.selectionStart = newCaretPosition;
                e.target.selectionEnd = newCaretPosition;
                e.target.focus();
            } else if (e.keyCode == 13 && event.shiftKey) {
                // Shift+Enter was pressed: eval
                e.preventDefault();
                var textarea = $(e.target);
                var cell = textarea.parents('.cell');
                var output = cell.find('.cell-output')
                var js = textarea.val();
                console.log(js);
                $.ajax({
                    url: '/repl',
                    data: {'js': js, 'id': location.pathname.split('/').slice(-1)[0]},
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
        }
    })
})();