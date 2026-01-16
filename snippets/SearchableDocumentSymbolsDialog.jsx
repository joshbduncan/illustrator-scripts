/*
SearchableDocumentSymbolsDialog.jsx for Adobe Illustrator
---------------------------------------------------------

Display a searchable listbox dialog of all the symbols in the current document.

Uses the example dialog from ScriptUI for dummies by Peter Kahrel found at https://creativepro.com/files/kahrel/indesign/scriptui.html.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/create-a-searchable-icon-library/m-p/14730647#M412580

REVISED 2026-01-15:
- Expand search query match to match any part of the symbol name.
- Added error handling for no active documents, and documents without symbols.
- Added ability to double-click symbol name to select it.
- Added ability to add selected symbol to the document (from request: https://community.adobe.com/t5/illustrator-discussions/create-a-searchable-icon-library/m-p/15664070#M461163).
- Fixed error when exiting the popup with the Escape key.
*/

(function () {
  //@target illustrator

  // Check if a document is open
  if (!app.documents.length) {
    alert("Please open a document first.");
    return;
  }

  var doc = app.activeDocument;

  // Check if document has symbols
  if (doc.symbols.length === 0) {
    alert("This document has no symbols.");
    return;
  }

  // get symbols from current document
  var symbols = [];
  for (var i = 0; i < doc.symbols.length; i++) {
    symbols.push(doc.symbols[i].name);
  }

  // show symbol picker
  var picked = picker(symbols);

  // exit if no symbol was picked (picker popup closed without a selection or by the Escape key)
  if (typeof picked === "undefined") return;

  // select symbol for later use
  var symbol = doc.symbols.getByName(picked);

  // do you want to add the selected symbol to the document?
  var placeSelectedSymbol = Window.confirm(
    "Add symbol '" + symbol.name + "' to the current document?",
    false,
    "Add Selected Symbol To Document",
  );

  // add selected symbol to the document
  if (placeSelectedSymbol) {
    var newSymbol = doc.symbolItems.add(symbol);

    // move to page origin
    newSymbol.top = 0;
    newSymbol.left = 0;
  }

  // "type-ahead" listbox found in ScriptUI for dummies by Peter Kahrel (pgs. 37-38)
  // https://creativepro.com/files/kahrel/indesign/scriptui.html
  // NOTE: If you document has lots of symbols you may want to read the "Processing long lists" section (pgs. 39-40)
  function picker(arr) {
    var w = new Window(
      'dialog {text: "Document Symbols", alignChildren: "fill"}',
    );
    var entry = w.add("edittext {active: true}");
    var list = w.add("listbox", [0, 0, 250, 250], arr);
    list.selection = 0;
    entry.onChanging = function () {
      var temp = this.text;
      list.removeAll();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase().indexOf(temp.toLowerCase()) > -1) {
          list.add("item", arr[i]);
        }
      }
      if (list.items.length > 0) {
        list.selection = 0;
      }
    };

    // Allow symbol selection by double clicking it (closes window and continues)
    list.onDoubleClick = function () {
      w.close(1);
    };

    // We need the button to catch the Return/Enter key (CC and later)
    w.add("button", undefined, "Ok", { name: "ok" });
    if (w.show() === 1) {
      return list.selection.text;
    }
  }
})();
