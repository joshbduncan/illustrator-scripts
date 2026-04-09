/*
EmbedAllPlacedItems.jsx for Adobe Illustrator
---------------------------------------------
Embed all non locked, hidden, or layer locked placed items.

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
0.1.0 2025-09-22 initial release
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

  // no need to continue if there are no placedItems
  if (!doc.placedItems.length) {
    alert("No placed items found.");
    return;
  }

  var placed = doc.placedItems.length;
  var embedded = 0;
  for (var i = doc.placedItems.length - 1; i >= 0; i--) {
    if (doc.placedItems[i].locked || doc.placedItems[i].hidden) continue;
    try {
      doc.placedItems[i].embed();
      embedded++;
    } catch (e) {
      alert("Error embedding '" + doc.placedItems[i].name + "'." + "/n/n" + e);
    }
  }

  alert(
    "Embedded " +
      embedded.toString() +
      " of " +
      placed.toString() +
      " placed files.",
  );
})();
