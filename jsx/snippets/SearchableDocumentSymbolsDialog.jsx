/*
SearchableDocumentSymbolsDialog.jsx for Adobe Illustrator
---------------------------------------------------------

Display a searchable listbox dialog of all the symbols in the current document.

Uses the example dialog from ScriptUI for dummies by Peter Kahrel found at https://creativepro.com/files/kahrel/indesign/scriptui.html.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/create-a-searchable-icon-library/m-p/14730647#M412580
*/

// get the current document
var doc = app.activeDocument;

// get symbols from current document
var symbols = [];
for (var i = 0; i < doc.symbols.length; i++) {
    symbols.push(doc.symbols[i].name);
}

// show symbol picker
picked = picker(symbols);

// select symbol for later use
var symbol = doc.symbols.getByName(picked);

// alert choice for debugging
alert("You picked symbol...\n" + picked + "\n" + symbol);

// "type-ahead" listbox found in ScriptUI for dummies by Peter Kahrel (pgs. 37-38)
// https://creativepro.com/files/kahrel/indesign/scriptui.html
// NOTE: If you document has lots of symbols you may want to read the "Processing long lists" section (pgs. 39-40)
function picker(arr) {
    var w = new Window('dialog {text: "Document Symbols", alignChildren: "fill"}');
    var entry = w.add("edittext {active: true}");
    var list = w.add("listbox", [0, 0, 250, 250], arr);
    list.selection = 0;
    entry.onChanging = function () {
        var temp = this.text;
        list.removeAll();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].toLowerCase().indexOf(temp) == 0) {
                list.add("item", arr[i]);
            }
        }
        if (list.items.length > 0) {
            list.selection = 0;
        }
    };
    // We need the button to catch the Return/Enter key (CC and later)
    w.add("button", undefined, "Ok", { name: "ok" });
    if (w.show() != 2) {
        return list.selection.text;
    }
    w.close();
}
