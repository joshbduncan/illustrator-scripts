/*
RemoveBezierHandles.jsx for Adobe Illustrator
---------------------------------------------
Remove bezier handles from selected anchor points.

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
0.1.0 2023-11-08 initial release
*/

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

  // grab document
  var doc = app.activeDocument;

  // get the current selection
  var sel = doc.selection;

  // no need to continue if there is no active selection
  if (!sel.length) {
    alert("No active selection.");
    return;
  }

  var parentPath, anchorPoint;
  var counter = 0;
  for (var i = 0; i < app.activeDocument.selection.length; i++) {
    // get a path from the current selection
    parentPath = app.activeDocument.selection[i];

    // iterate each path point to determine which are selected
    for (var n = 0; n < parentPath.pathPoints.length; n++) {
      anchorPoint = parentPath.pathPoints[n];

      // skip anchor points without handles
      if (
        anchorPoint.leftDirection.toString() ===
          anchorPoint.anchor.toString() &&
        anchorPoint.rightDirection.toString() === anchorPoint.anchor.toString()
      ) {
        continue;
      }

      // if an anchor point is selected, reset then handles
      if (anchorPoint.selected == PathPointSelection.ANCHORPOINT) {
        anchorPoint.leftDirection = anchorPoint.anchor;
        anchorPoint.rightDirection = anchorPoint.anchor;
        counter++;
      }
    }
  }
  alert(counter + " anchor point(s) adjusted.");
})();
