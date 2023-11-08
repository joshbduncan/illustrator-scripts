/*
RemoveBezierHandles.jsx for Adobe Illustrator
---------------------------------------------

Remove bezier handles from selected anchor points.

Changelog:
0.1.0 initial release
*/

//@target illustrator

(function () {
  if (app.documents.length > 0) {
    // make sure there is a selection
    if (app.activeDocument.selection.length > 0) {
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
            anchorPoint.leftDirection.toString() === anchorPoint.anchor.toString() &&
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
    }
  }
})();
