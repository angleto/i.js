(function () {
    var nextCellId = 0;

    function appendCell() {
        nextCellId++;
        var clone = $("#cell").clone();
        clone.css('display', '');
        clone.attr('id', 'cell' + nextCellId);
        clone.appendTo("#document");
        clone.find('.label-in').text('In [' + nextCellId + ']');
        clone.find('.label-out').text('Out [' + nextCellId + ']');
        clone.find('.cell-input').focus().autosize();
    }

    function insertTab(target) {
        var start = target.selectionStart;
        var end = target.selectionEnd;

        var ident = "    ";
        var newCaretPosition = start + ident.length;

        var textarea = $(target);
        var text = textarea.val().substring(0, start) + ident + textarea.val().substring(end);
        textarea.val(text);

        target.selectionStart = newCaretPosition;
        target.selectionEnd = newCaretPosition;
        target.focus();
    }

    function evalCell(target) {
        var textarea = $(target);
        var cell = textarea.parents('.cell');
        var output = cell.find('.cell-output');
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
                console.log('cellId: ' + nextCellId);

                // If we have just evaluated the last cell then append a new cell,
                // otherwise just move focus to the next cell.
                if (currentId === nextCellId) {
                    appendCell();
                } else if (currentId < nextCellId) {
                    $("#cell" + (currentId + 1)).find('textarea').focus();
                }
            })
            .fail(function () {
                console.log("error!");
            });
    }

    $('#document').keydown(function (e) {
        if ($(e.target).hasClass('cell-input')) {
            if (e.keyCode == 9) {
                // Tab was pressed: ident
                e.preventDefault();
                insertTab(e.target);
            } else if (e.keyCode == 13 && event.shiftKey) {
                // Shift+Enter was pressed: eval the cell content
                e.preventDefault();
                evalCell(e.target);
            }
        }
    });

    appendCell();
})();