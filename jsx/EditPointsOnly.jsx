/*
EditPointsOnly.jsx for Adobe Illustrator
----------------------------------------
Select only the path points (not path segments) from a direct selection for manipulation.

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
0.1.1 2025-07-10 fix subroutines
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
    alert("No active selection.\nSelect at least one anchor point first.");
    return;
  }

  if (sel instanceof Array) {
    // grab all path objects in the selection
    var paths = getPaths(sel);
    // grab all selected points of paths
    var calculatedPoints = getPoints(paths);

    // deselect everything
    app.activeDocument.selection = null;

    // iterate over all points and reselect them for editing
    for (var i = 0; i < calculatedPoints.length; i++) {
      calculatedPoints[i].selected = PathPointSelection.ANCHORPOINT;
    }
  }

  /**
   * iterate over all selected objects and
   * figure out if the object is a PathItem
   * if compound path or group then go deeper
   */
  function getPaths(arr) {
    var paths = [];
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (item.typename == "GroupItem") {
        paths = paths.concat(getPaths(item.pageItems));
      } else if (item.typename == "CompoundPathItem") {
        paths = paths.concat(getPaths(item.pathItems));
      } else if (item.typename == "PathItem") {
        paths.push(item);
      }
    }
    return paths;
  }

  /**
   * iterate over all provided paths and figure out
   * if they have any currently selected points
   */
  function getPoints(arr) {
    var points = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].pathPoints.length > 1) {
        var objPoints = arr[i].pathPoints;
        for (var j = 0; j < objPoints.length; j++) {
          if (objPoints[j].selected == PathPointSelection.ANCHORPOINT) {
            points.push(objPoints[j]);
          }
        }
      }
    }
    return points;
  }
})();
