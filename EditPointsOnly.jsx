/*
EditPointsOnly.jsx for Adobe Illustrator
----------------------------------------
Select only path points and not segments for editing.

This script is distributed under the MIT License.
See the LICENSE file for details.

Chanelog:
1.0.0 initial release
*/

var _title = "Edit Points Only";
var _version = "1.0.0";
var _copyright = "Copyright 2021 Josh Duncan";
var _website = "joshd.xyz";

// run script
if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var sel = doc.selection;
  if (sel.length > 0) {
    if (sel instanceof Array) {
      // setup vars
      var paths = [];
      var points = [];
      // grab all path objects in the selection
      getPaths();
      // grab all selected points of paths
      getPoints();
      // deselect everything
      app.activeDocument.selection = null;
      // iterate over all points and reselect them for editing
      for (var i = 0; i < points.length; i++) {
        points[i].selected = PathPointSelection.ANCHORPOINT;
      }
    }
  } else {
    alert("No objects selected!\nSelect at least one anchor point first.");
  }
}

/**
 * iterate over all selected objects and
 * figure out if the object is a PathItem
 * if compound path or group then do deeper
 */
function getPaths() {
  for (var i = 0; i < sel.length; i++) {
    if (sel[i].typename == "GroupItem") {
      getPaths(sel[i].pageItems);
    } else if (sel[i].typename == "CompoundPathItem") {
      getPaths(sel[i].pathItems);
    } else if (sel[i].typename == "PathItem") {
      paths.push(sel[i]);
    }
  }
}

/**
 * iterate over all provided paths and figure out
 * if they have any currently selected points
 */
function getPoints() {
  for (var i = 0; i < paths.length; i++) {
    if (paths[i].pathPoints.length > 1) {
      var objPoints = paths[i].pathPoints;
      for (var j = 0; j < objPoints.length; j++) {
        if (objPoints[j].selected == PathPointSelection.ANCHORPOINT) {
          points.push(objPoints[j]);
        }
      }
    }
  }
}
