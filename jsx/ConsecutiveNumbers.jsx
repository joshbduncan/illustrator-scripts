/*
ConsecutiveNumbers.jsx for Adobe Illustrator
--------------------------------------------
Populate selected text frames with consecutive numbers.

Prompts for a starting value, then replaces the contents of each selected text frame with incrementing numbers in selection order. Non-text objects are ignored.

Author
------
Josh Duncan
joshbduncan@gmail.com
https://joshbduncan.com
https://github.com/joshbduncan/

Wanna Support Me?
-----------------
Most of the things I make are free to download but if you would like
to support me that would be awesome and greatly appreciated!
https://joshbduncan.com/software.html

License
-------
This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog
---------
0.1.0 2026-01-15 initial release
0.1.1 2026-04-09 fix nested target directive
*/

//@target illustrator

(function () {
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
