/*
OffsetObjects.jsx for Adobe Illustrator
--------------------------------------
Offset selected objects by stacking order either vertically or horizontally.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
1.0.1 fixed bug where if no translation was needed the stroke would scale for some reason
*/

#target Illustrator

var _title = "Offset Objects";
var _version = "1.0.1";
var _copyright = "Copyright 2022 Josh Duncan";
var _website = "joshd.xyz";

// -----------
// main script
// -----------

// run script
if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var sel = doc.selection;
  if (sel.length > 1) {
    if (sel instanceof Array) {
      var settings = settingsWin();
      if (settings) {
        offsetObjects(settings.direction, settings.gutter, settings.reverse);
      }
    }
  } else {
    alert("Not enough objects selected!\nSelect at least two objects first.");
  }
  } else {
  alert("No documents open!\nCreate or open a document first.");
  }

/**
 * offset selected objects by stacking order either vertically or horizontally
 */
function offsetObjects(direction, gutter, reverse) {
  // reverse stacking order if requested
  if (reverse == true) {
    sel.reverse();
  }
  // iterate over the target objects
  var source, sourceBounds;
  var target, targetBounds;
  for (var i = 0; i < sel.length - 1; i++) {
    source = sel[i]
    sourceBounds = getVisibleBounds(source);
    target = sel[i + 1];
    targetBounds = getVisibleBounds(target);
    var noTranslationNeeded = app.getTranslationMatrix(0, 0)
    var moveMatrix = getMoveMatrix(sourceBounds, targetBounds, direction, gutter);
    // move the target object
    if (moveMatrix != false) {
      target.transform(moveMatrix, true, true, true);
    }
  }
}

// ----------------
// helper functions
// ----------------

/**
 * calculate the correct move matrix to match the user
 * requested offset direction and gutter size
 */
function getMoveMatrix(sourceBounds, targetBounds, direction, gutter) {
  var sourceInfo = getObjectInfo(sourceBounds);
  var targetInfo = getObjectInfo(targetBounds);
  if (direction == "Vertical" && sourceInfo.bottom != targetInfo.top) {
    return app.getTranslationMatrix(0, sourceInfo.bottom - targetInfo.bottom + targetInfo.height - gutter);
  } else if (direction == "Horizontal" && sourceInfo.right != targetInfo.left) {
    return app.getTranslationMatrix(sourceInfo.right - targetInfo.right + targetInfo.width + gutter, 0);
  }
  return false
}

/**
 * figure out the actual "visible" bounds for an object
 * if clipping mask or compound path items are found
 * determine the visible bounds from the contained objects
 */
 function getVisibleBounds(object) {
  var bounds, clippedItem, sandboxItem, sandboxLayer;
  var curItem;
  if (object.typename == "GroupItem") {
    // if the object is clipped
    if (object.clipped) {
      // check all sub objects to find the clipping path
      for (var i = 0; i < object.pageItems.length; i++) {
        curItem = object.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename == "CompoundPathItem") {
          if (!curItem.pathItems.length) {
            // catch compound path items with no pathItems via william dowling @ github.com/wdjsdev
            sandboxLayer = app.activeDocument.layers.add();
            sandboxItem = curItem.duplicate(sandboxLayer);
            app.activeDocument.selection = null;
            sandboxItem.selected = true;
            app.executeMenuCommand("noCompoundPath");
            sandboxLayer.hasSelectedArtwork = true;
            app.executeMenuCommand("group");
            clippedItem = app.activeDocument.selection[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        } else {
          clippedItem = curItem;
          break;
        }
      }
      bounds = clippedItem.geometricBounds;
      if (sandboxLayer) {
        // eliminate the sandbox layer since it's no longer needed
        sandboxLayer.remove();
        sandboxLayer = undefined;
      }
    } else {
      // if the object is not clipped
      var subObjectBounds;
      var allBoundPoints = [[], [], [], []];
      // get the bounds of every object in the group
      for (var i = 0; i < object.pageItems.length; i++) {
        curItem = object.pageItems[i];
        subObjectBounds = getVisibleBounds(curItem);
        allBoundPoints[0].push(subObjectBounds[0]);
        allBoundPoints[1].push(subObjectBounds[1]);
        allBoundPoints[2].push(subObjectBounds[2]);
        allBoundPoints[3].push(subObjectBounds[3]);
      }
      // determine the groups bounds from it sub object bound points
      bounds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bounds = object.geometricBounds;
  }
  return bounds;
}

/**
 * return a dictionary of easier to access object specs 
 */
function getObjectInfo(bounds) {
  var left = bounds[0];
  var top = bounds[1];
  var right = bounds[2];
  var bottom = bounds[3];
  // calculate target dimensions from "visual" bounds
  var width = right - left;
  var height = bottom - top;
  // calculate target object center point
  var centerX = (right - left) / 2 + left;
  var centerY = (bottom - top) / 2 + top;
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    width: width,
    height: height,
    centerX: centerX,
    centerY: centerY,
  };
}

/**
 * convert user specified unit of measure to points
 */
function toPoints(val, unit) {
  if (unit == "Inches") {
    return val * 72;
  } else if (unit == "mm") {
    return (val / 25.4) * 72;
  } else {
    return val;
  }
}

// ---------------
// settings dialog
// ---------------

function settingsWin() {
  // settings window
  var win = new Window("dialog");
  win.text = _title + " " + _version;
  win.orientation = "column";
  win.alignChildren = "fill";

  // panel - offset setup
  var pOffsetDirection = win.add("panel", undefined, "Offset Setup");
  pOffsetDirection.alignChildren = "fill";
  pOffsetDirection.orientation = "column";
  pOffsetDirection.margins = 18;

  // group - offset direction
  var gDirection = pOffsetDirection.add("group", undefined);
  gDirection.alignChildren = "fill";
  gDirection.orientation = "column";
  var rbVertical = gDirection.add("radiobutton", undefined, "Vertical Offset");
  rbVertical.value = true;
  var rbHorizontal = gDirection.add("radiobutton", undefined, "Horizontal Offset");

  // group - reverse stacking order
  var gReverse = pOffsetDirection.add("group", undefined);
  gReverse.alignChildren = "fill";
  gReverse.orientation = "row";
  var cbReverseStackingOrder = gReverse.add("checkbox", undefined, "Reverse Stacking Order");

  // panel - gutter
  var pGutter = win.add("panel", undefined, "Gutter Setup");
  pGutter.orientation = "row";
  var stSize = pGutter.add("statictext", undefined, "Size:");
  var size = pGutter.add('edittext {justify: "center"}');
  size.preferredSize.width = 60;
  size.text = 0;
  var ddSizeUnit = pGutter.add("dropdownlist", undefined, ["Inches", "Points", "mm"]);
  ddSizeUnit.preferredSize.width = 70;
  ddSizeUnit.selection = 0;

  // group - window buttons
  var gWindowButtons = win.add("group", undefined);
  gWindowButtons.orientation = "row";
  gWindowButtons.alignChildren = ["Leftwards", "center"];
  gWindowButtons.alignment = ["center", "top"];
  var btOK = gWindowButtons.add("button", undefined, "OK");
  var btCancel = gWindowButtons.add("button", undefined, "Cancel");

  // panel - info
  var pInfo = win.add("panel", undefined);
  pInfo.orientation = "column";
  pInfo.alignChildren = ["center", "top"];
  var stCopyright = pInfo.add("statictext", undefined);
  stCopyright.text = _copyright + " @ " + _website;

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    currentSettings = {
      direction: rbVertical.value ? "Vertical" : "Horizontal",
      reverse: cbReverseStackingOrder.value,
      gutter: toPoints(size.text ? size.text : 0, ddSizeUnit.selection.text)
    };
    return currentSettings;
  } else {
    return;
  }

}