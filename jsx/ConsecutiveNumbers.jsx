(function () {
  //@target illustrator

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and selection info
  var doc = app.activeDocument;
  var sel = doc.selection;

  // set start point
  var start = Number(prompt("Enter start value", 0));
  if (start === null || isNaN(start)) return;

  // iterate over text frame and up the contents
  var updates = 0;
  for (var i = 0; i < sel.length; i++) {
    if (sel[i].typename == "TextFrame") {
      sel[i].contents = start;
      updates++;
      start++;
    }
  }

  alert(updates + " updates made.");
})();
