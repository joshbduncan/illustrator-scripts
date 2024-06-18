/*
DrawVisibleBounds.jsx for Adobe Illustrator
-------------------------------------------

Draw the "visible" bounds for selected objects.
Accurately shows clipped objects, compounds paths,
and even compound objects inside of a clipping mask
that's inside of other clipping masks.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
1.0.1 updated getVisibleBounds() to catch lots of weird edge cases
1.0.2 updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
1.1.0 moved `getVisibleBounds()` function to a separate imported file (see other updates there)
*/

(function () {
  //@target illustrator

  var _title = "Draw Visible Bounds";
  var _version = "1.1.0";
  var _copyright = "Copyright 2024 Josh Duncan";
  var _website = "joshbduncan.com";

  //@includepath "utils"

  //@include "GetVisibleBounds.jsxinc"

  // run script
  if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length > 0) {
      var object, visibleBounds;
      for (var i = 0; i < sel.length; i++) {
        object = sel[i];
        visibleBounds = getVisibleBounds(object);
        if (!visibleBounds) {
          $.writeln("Error: " + object.name + " has no visible bounds.");
          continue;
        }
        drawBounds(visibleBounds);
        sel[i].selected = true;
      }
    } else {
      alert("No objects are selected!\nSelect at least one object first.");
    }
  } else {
    alert("No documents open!\nCreate or open a document first.");
  }

  /**
   * draw object bounds with line segments in each corner
   */
  function drawBounds(bounds, lineLength) {
    // adjustable length of crosshair lines
    lineLength = typeof lineLength !== "undefined" ? lineLength : 20;
    var boundsGroup = doc.groupItems.add();
    boundsGroup.name = "BOUNDS";
    var topLeft = drawBoundMark([
      [bounds[0], bounds[1] - lineLength],
      [bounds[0], bounds[1]],
      [bounds[0] + lineLength, bounds[1]],
    ]);
    topLeft.moveToEnd(boundsGroup);
    var topRight = drawBoundMark([
      [bounds[2], bounds[1] - lineLength],
      [bounds[2], bounds[1]],
      [bounds[2] - lineLength, bounds[1]],
    ]);
    topRight.moveToEnd(boundsGroup);
    var bottomLeft = drawBoundMark([
      [bounds[0], bounds[3] + lineLength],
      [bounds[0], bounds[3]],
      [bounds[0] + lineLength, bounds[3]],
    ]);
    bottomLeft.moveToEnd(boundsGroup);
    var bottomRight = drawBoundMark([
      [bounds[2], bounds[3] + lineLength],
      [bounds[2], bounds[3]],
      [bounds[2] - lineLength, bounds[3]],
    ]);
    bottomRight.moveToEnd(boundsGroup);
  }

  function drawBoundMark(pathCoordinates) {
    var bound = doc.pathItems.add();
    bound.setEntirePath(pathCoordinates);
    bound.filled = false;
    bound.strokeColor = doc.swatches["[Registration]"].color;
    bound.stroked = true;
    bound.strokeWidth = 1;
    return bound;
  }
})();
