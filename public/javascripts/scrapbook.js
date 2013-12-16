(function () {
    var id = location.pathname.split('/').slice(-1)[0];

    function load() {
        $.ajax({
            url: '/load',
            data: {'id': id},
            type: 'get'
        }).done(function (data) {
            console.log(data);

            console.log(data.name);
            $("#name").val(data.name);

            var cells = data.cells;
            for (var i = 0; i < cells.length; i++) {
                appendCell(cells[i].in, cells[i].out);
            }
            appendCell();
        }).fail(function () {
            console.log("error!");
        });
    }

    load();

    function save() {
        var array = [];

        $('.cell:visible').each(function() {
            var cell_in = $(this).find('.cell-input').val();
            if (cell_in.length > 0) {
                var cell_out = $(this).find('.cell-output').text();
                console.log(cell_in + " -> " + cell_out);
                array.push({in: cell_in, out: cell_out});
            }
        });

        console.log(array);

        var name = $("#name").val();
        console.log("name: " + name);
        $.ajax({
            url: '/save',
            data: {'data': {name: name, cells: array}, 'id': id},
            type: 'post'
        }).done(function () {
            console.log("done!");
            var status = $("#save-status");
            status.addClass('label-success').text("File saved");
            setTimeout(function() {status.text('');}, 1000);
        }).fail(function () {
            console.log("error!");
            var status = $("#save-status");
            status.addClass('label-danger').text("Save failed");
            setTimeout(function() {status.text('');}, 1000);
        });
    }

    $('#save').click(function () {
        save();
    });

    var nextCellId = 0;

    function appendCell(cell_in, cell_out) {
        nextCellId++;
        var clone = $("#cell").clone();
        clone.css('display', '');
        clone.attr('id', 'cell' + nextCellId);
        clone.appendTo("#document");
        clone.find('.label-in').text('In [' + nextCellId + ']');
        clone.find('.label-out').text('Out [' + nextCellId + ']');
        var textarea = clone.find('.cell-input');
        if (cell_in) {
            textarea.text(cell_in);
        }
        if (cell_out) {
            clone.find('.cell-output').text(cell_out);
            clone.find('.out').css('display', '');
        }

        textarea.focus().autosize();
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
        var js = textarea.val();
        console.log(js);
        $.ajax({
            url: '/repl',
            data: {'js': js, 'id': id},
            type: 'post'
        })
            .done(function (data) {
                cell.find('.cell-output').text(data);
                cell.find('.out').css('display', '');

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
})();