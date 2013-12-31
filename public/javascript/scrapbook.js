(function () {
    var id = location.pathname.split('/').slice(-1)[0];
    var cell_id_to_code_mirror = {};

    function load() {
        $.ajax({
            url: '/load',
            data: {'id': id},
            type: 'get'
        }).done(function (data) {
            console.log("AJAX /load request executed");

            $("#name").val(data.name);
            if (data.cells) {
                var cells = data.cells;
                for (var i = 0; i < cells.length; i++) {
                    appendCell(cells[i].in, cells[i].out);
                }
            }
            appendCell();
        }).fail(function () {
            console.error("AJAX /load request failed");
        });
    }

    load();

    function save() {
        var array = [];

        $('.cell:visible').each(function(index, cell) {
            var id = getId($(cell));
            var cell_in = cell_id_to_code_mirror[id].getValue();
            if (cell_in.length > 0) {
                var cell_out = $(this).find('.cell-output').text();
                array.push({in: cell_in, out: cell_out});
            }
        });

        var name = $("#name").val();
        $.ajax({
            url: '/save',
            data: {'data': {name: name, cells: array}, 'id': id},
            type: 'post'
        }).done(function () {
            console.log("AJAX /save request executed");
            setStatus("File saved", 'label-success');
        }).fail(function () {
            console.error("AJAX /load request failed");
            setStatus("Save failed", 'label-danger');
        });
    }

    function setStatus(text, css) {
        var status = $("#save-status");
        status.addClass(css).text(text);
        setTimeout(function() {status.text('');}, 1000);
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
        clone.find('.input-prompt').html('In&nbsp;&nbsp;[' + nextCellId + ']:');
        clone.find('.output-prompt').html('Out&nbsp;[' + nextCellId + ']:');
        var textarea = clone.find('.cell-input');
        if (cell_in) {
            textarea.text(cell_in);
        }
        if (cell_out) {
            clone.find('.cell-output').text(cell_out);
            clone.find('.out').css('display', '');
        }

        function textToCursor(editor, cur) {
            var lines = editor.getValue(false);
            var s = '';
            for (var i = 0; i < cur.line; i++) {
                s += lines[i];
            }
            s += lines[i].slice(0, cur.ch);
            return s;
        }

        function javascriptHint(editor, callback) {
            var cur = editor.getCursor();
            var token = editor.getTokenAt(cur);
            var s =  textToCursor(editor, cur);

            $.ajax({
                url: '/autocomplete',
                data: {'string': s, 'id': id},
                type: 'post'
            }).done(function (hints) {
                console.log("AJAX /autocomplete request executed");
                callback({list: hints,
                        from: CodeMirror.Pos(cur.line, token.end),
                        to: CodeMirror.Pos(cur.line, token.end)});
            }).fail(function () {
                console.error("AJAX /autocomplete request failed");
            });
        }

        CodeMirror.commands.autocomplete = function(cm) {
            CodeMirror.showHint(cm, javascriptHint, {async: true});
        };


        var code_mirror = CodeMirror.fromTextArea(textarea.get(0), {
            mode: 'text/javascript',
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: true,
            extraKeys: {"Ctrl-Space": "autocomplete"},
            hint: javascriptHint,
            viewportMargin: Infinity
        });
        code_mirror.addKeyMap({
            "Shift-Enter": function() {evalCell(code_mirror.getTextArea(), code_mirror.getValue());}
        });
        cell_id_to_code_mirror[nextCellId] = code_mirror;
        code_mirror.focus();
    }

    function evalCell(target, js) {
        var textarea = $(target);
        var cell = textarea.parents('.cell');

        js = preprocessJS(js);
        $.ajax({
            url: '/repl',
            data: {'js': js, 'id': id},
            type: 'post'
        })
        .done(function (data) {
            console.log("AJAX /repl request executed");
            cell.find('.cell-output').text(data);
            cell.find('.out').css('display', '');

            var next = cell.next('.cell');
            if (next.length > 0) {
                var id = getId($(next[0]));
                cell_id_to_code_mirror[id].focus();
            } else {
                appendCell();
            }
        })
        .fail(function () {
            console.error("AJAX /repl request failed");
        });
    }

    function preprocessJS(js) {
        var lines = js.split('\n');
        var preprocessedJS = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line === '.help' ||
                line === '.exit' ||
                line === '.save' ||
                line === '.load') {
                // Ignore blacklisted REPL commands
            } else {
                preprocessedJS += line + '\n';
            }
        }
        return preprocessedJS;
    }

    function getId(cell) {
        return cell.attr('id').replace(/^cell/, '');
    }

    $('#document').on('click', '.delete', function (e) {
        var cell = $(e.target).parents('.cell');
        var id = getId($(cell));
        delete cell_id_to_code_mirror[id];
        cell.remove();
    }).keydown(function (e) {
        if (e.keyCode == 83 && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            save();
        }
    });
})();