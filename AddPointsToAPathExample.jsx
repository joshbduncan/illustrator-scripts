/*
AddPointsToAPathExample.jsx for Adobe Illustrator
-------------------------------------------------

Example script for adding point(s) between any two consecutive anchor points along a path.

TO USE: Select any consecutive anchor points along a path (or an entire path) then run the script.

Note:
This script is just a working example I thought may be helpful. While working on a
larger project, I needed a way to calculate points along an ellipse. This lead me to
De Casteljau's algorith which can be used to calculate a point any percentage between
two anchor points on a bezier path (works for simple/straight paths too)

My version of De Casteljau's algorith is overly complicated to allow me to recreate paths
point by points. If you only need the [x, y] coordinates of the newly calculated point
I have also included the function `deCasteljauSimplified()` which is much simpler.

This example script allows you to do two things:
  1. Add a single anchor point at a specified position
    between two consecutive anchor points.
  2. Add a specified quantity of points equally spaced
     between two consecutive anchor points.

* Both example options work with closed paths or individually selected points along a path (points must be consecutive).

Versions:
0.1.0 [2023-02-16] initial release

*/

if (app.documents.length > 0) {
  var doc = app.activeDocument;
  // make sure there is a selected path or path anchor points
  if (app.activeDocument.selection.length == 1) {
    // present the settings dialog
    var settings = settingsWin();
    if (settings) {
      // setup info for displaying the results
      var hlGroup, hlColor, lineColor, hlPath, hlSize;
      setupHighlights();

      // for this working example I will capture all anchors from the first selected
      // path or if individual points have been selected only capture those anchors
      // allowing you to add points to just a segment of a path, or a full path
      var parentPath = app.activeDocument.selection[0];
      var anchors = [];
      for (var i = 0; i < parentPath.pathPoints.length; i++) {
        if (parentPath.pathPoints[i].selected == PathPointSelection.ANCHORPOINT) {
          anchors.push({
            anchor: parentPath.pathPoints[i].anchor,
            rightDirection: parentPath.pathPoints[i].rightDirection,
            leftDirection: parentPath.pathPoints[i].leftDirection,
            pointType: parentPath.pathPoints[i].pointType,
          });
        }
      }

      // if an entire path was selected and it is a closed path then the
      // first anchor points needs to be appended to the end of the array
      // so that the last segment of the line will be calculated
      if (anchors.length == parentPath.pathPoints.length && parentPath.closed) {
        anchors.push(anchors[0]);
      }

      // calculate all between points for each set of selected anchor points
      var hlPathPoints;
      if (settings.example == "singlePosition") {
        hlPathPoints = calcPointsBetweenAnchors(
          anchors,
          settings.points,
          settings.position
        );
      } else {
        hlPathPoints = calcPointsBetweenAnchors(anchors, settings.points);
      }

      // show the resuts
      var hl, left, top;
      for (var i = 0; i < hlPathPoints.length; i++) {
        // add red highlight points at each calculated anchor
        if (settings.hlPoints) {
          left = hlPathPoints[i].anchor[0] - hlSize / 2;
          top = hlPathPoints[i].anchor[1] + hlSize / 2;
          hl = hlGroup.pathItems.ellipse(top, left, hlSize, hlSize);
          hl.filled = false;
          hl.fillColor = hlColor;
          hl.stroked = false;
        }
        // draw a new path with the updated anchor points
        if (settings.drawPath) {
          var p = hlPath.pathPoints.add();
          p.anchor = hlPathPoints[i].anchor;
          p.leftDirection = hlPathPoints[i].leftDirection;
          p.rightDirection = hlPathPoints[i].rightDirection;
        }
      }
    }
  } else {
    alert(
      "Invalid Selection\nPlease select a path or a minimum of two consecutive anchor points along a path before running this script."
    );
  }
} else {
  alert("No Active Documents\nPlease make sure a document is open first.");
}

/**
 * **********************************
 *           WORK FUNCTIONS
 * **********************************
 */

/**
 * Calculate equally distanced points between anchor points along a path.
 * @param   {Array}   anchors  Anchor points to calculate new points between.
 * @param   {Number}  points   Number of points to calculate between anchor points.
 * @param   {Array}   position [[x, y],...] coordinates of all calculated points along a path.
 * @returns {Array}            Newly calculated path points in the following format.
 *                             { anchor: [x, y], rightDirection: [x, y], leftDirection: [x, y], pointType: pointType, }
 */
function calcPointsBetweenAnchors(anchors, points, position) {
  // create a custom array method to make things a bit cleaner down below
  Array.prototype.spliceArray = function (index, n, array) {
    return Array.prototype.splice.apply(this, [index, n].concat(array));
  };

  // iterate over the selected anchor points in pairs
  var pairs = anchors.length - 1;
  for (var i = 0; i < pairs; i++) {
    var calculatedPoints = [anchors[i * points + i], anchors[i * points + i + 1]];
    var segmentPoints;
    for (var j = 0; j < points; j++) {
      // calculate points for this segment (pair) using De Casteljau's algorithm
      // this will update the right control handle for the start anchor (1st in pair),
      // the left control handle for the end anchor (2nd in pair), and provide the
      // both handle control point and anchor information for the new calculated point
      segmentPoints = deCasteljau(
        calculatedPoints[calculatedPoints.length - 2],
        calculatedPoints[calculatedPoints.length - 1],
        position ? position : 1 / (points + 1 - j)
      );
      // splice the intermediate segments points in the array for this path segment
      calculatedPoints.spliceArray(j, 2, segmentPoints);
    }
    // splice the new anchor info into the anchors array
    anchors.spliceArray(i * points + i, 2, calculatedPoints);
  }
  return anchors;
}

/**
 * Calculate a point at position `t` along a path (between to anchors points) using De Casteljau's algorithm.
 * https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
 * @param   {Array}  start Start point of line segment.
 * @param   {Array}  end   End point of line segment.
 * @param   {Number} t     Percentage along the line the calculated point lies (0.0-1.0).
 * @returns {Array}        Newly calculated/recalculated points [start, newPointAlongPath, end].
 *                         { anchor: [x, y], rightDirection: [x, y], leftDirection: [x, y], pointType: pointType, }
 */
function deCasteljau(start, end, t) {
  // set points for algorithm to recursively work down from
  var points = [start.anchor, end.anchor];
  // track updated control points
  var controlPoints = [];
  // only add the control points of the start and end anchors if they are different
  // from the anchor points, otherwise the line is flat and they aren't needed
  if (
    start.anchor.toString() != start.rightDirection.toString() ||
    end.anchor.toString() != end.leftDirection.toString()
  ) {
    points.splice(1, 0, start.rightDirection);
    points.splice(2, 0, end.leftDirection);
  }
  // while there are still point pairs, keep calculating and reducing
  while (points.length > 1) {
    var midPoints = [];
    var p;
    for (var i = 0; i < points.length - 1; i++) {
      p = [
        (1 - t) * points[i][0] + t * points[i + 1][0],
        (1 - t) * points[i][1] + t * points[i + 1][1],
      ];
      points[i] = p;
      midPoints.push(p);
    }
    // add the updated control point information for the start and end points on curved paths
    if (controlPoints.length < 1 && midPoints.length > 1) {
      controlPoints = [midPoints[0], midPoints[midPoints.length - 1]];
    } else if (midPoints.length > 1) {
      controlPoints.splice(1, 0, midPoints[0], midPoints[midPoints.length - 1]);
    }
    points.pop();
  }
  return [
    {
      anchor: start.anchor,
      leftDirection: start.leftDirection,
      rightDirection:
        controlPoints.length > 0 ? controlPoints[0] : start.rightDirection,
      pointType: start.pointType,
    },
    {
      anchor: points[0],
      leftDirection: controlPoints.length > 0 ? controlPoints[1] : points[0],
      rightDirection:
        controlPoints.length > 0 ? controlPoints[controlPoints.length - 2] : points[0],
      pointType:
        start.pointType == PointType.CORNER && end.pointType == PointType.CORNER
          ? PointType.CORNER
          : PointType.SMOOTH,
    },
    {
      anchor: end.anchor,
      leftDirection:
        controlPoints.length > 0
          ? controlPoints[controlPoints.length - 1]
          : end.leftDirection,
      rightDirection: end.rightDirection,
      pointType: end.pointType,
    },
  ];
}

/**
 * Calculate a point at position `t` along a path (between to anchors points) using De Casteljau's algorithm.
 * https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
 * @param   {Array}  start Start point of line segment.
 * @param   {Array}  end   End point of line segment.
 * @param   {Number} t     Percentage along the line the calculated point lies (0.0-1.0).
 * @returns {Array}        [x, y] coordinates of the calculated point.
 */
function deCasteljauSimplified(start, end, t) {
  // set points for algorithm to recursively work down from
  var points = [start.anchor, end.anchor];
  // only add control points if they are different from anchor points
  if (
    start.anchor.toString() != start.rightDirection.toString() ||
    end.anchor.toString() != end.leftDirection.toString()
  ) {
    points.splice(1, 0, start.rightDirection);
    points.splice(2, 0, end.leftDirection);
  }
  // while there are still point pairs, keep calculating and reducing
  while (points.length > 1) {
    for (var i = 0; i < points.length - 1; i++) {
      points[i] = [
        (1 - t) * points[i][0] + t * points[i + 1][0],
        (1 - t) * points[i][1] + t * points[i + 1][1],
      ];
    }
    points.pop();
  }
  return points[0];
}

/**
 * ************************************
 *           HELPER FUNCTIONS
 * ************************************
 */
function setupHighlights() {
  hlGroup = app.activeDocument.activeLayer.groupItems.add();
  hlGroup.name = "Highlights";
  hlSize = 9;

  hlColor = new RGBColor();
  hlColor.red = 255;
  hlColor.green = 0;
  hlColor.blue = 0;

  lineColor = new RGBColor();
  lineColor.red = 255;
  lineColor.green = 128;
  lineColor.blue = 0;

  // setup a new path for recreating the original with additional points
  if (settings.drawPath) {
    hlPath = hlGroup.pathItems.add();
    hlPath.filled = false;
    hlPath.stroked = true;
    hlPath.strokeColor = lineColor;
  }
}

/**
 * ***************************
 *           DIALOGS
 * ***************************
 */

function settingsWin() {
  var description =
    "TO USE:\nSelect any consecutive anchor points along a path (or an entire path) then run the script." +
    "\n\nEXAMPLE OPTIONS:" +
    "\n1. Add a single anchor point at a specified position between two consecutive anchor points." +
    "\n2. Add a specified quantity of points equally spaced between two consecutive anchor points." +
    "\n\nNote:\nBoth example options work with closed paths (think circles) or individually selected points along a path (points must be consecutive).";

  var w = new Window("dialog", "Add Points To A Path Example");
  w.orientation = "column";
  w.alignChildren = ["left", "top"];

  // info
  w.add("statictext", [0, 0, 400, 200], description, {
    multiline: true,
  });

  // panel - example type
  var pType = w.add("panel", undefined, "Example Type and Options");
  pType.orientation = "column";
  pType.alignment = ["fill", "top"];
  pType.alignChildren = ["left", "top"];
  pType.margins = 20;

  var rbSinglePoint = pType.add(
    "radiobutton",
    undefined,
    "Place Single Point At Position"
  );
  rbSinglePoint.value = false;
  var rbEqualPoints = pType.add(
    "radiobutton",
    undefined,
    "Place Points Equally Between Anchors"
  );
  rbEqualPoints.value = true;

  var divider1 = pType.add("panel", undefined, undefined);
  divider1.alignment = "fill";

  // group - drawing options
  var gOptions = pType.add("group", undefined);
  gOptions.orientation = "row";
  gOptions.alignChildren = ["left", "center"];
  cbHlPoints = gOptions.add("checkbox", undefined, "Highlight Points?");
  cbHlPoints.value = true;
  cbDrawNewPath = gOptions.add("checkbox", undefined, "Draw Path?");
  cbDrawNewPath.value = true;

  // panel - single points
  var pSinglePoint = w.add("panel", undefined, "Place Single Point At Position");
  pSinglePoint.orientation = "row";
  pSinglePoint.alignment = ["fill", "top"];
  pSinglePoint.alignChildren = ["left", "top"];
  pSinglePoint.margins = 20;
  pSinglePoint.enabled = false;

  pSinglePoint.add("statictext", undefined, "Position (1-99%)?");
  var position = pSinglePoint.add("edittext");
  position.preferredSize.width = 60;
  position.text = "25";

  // input change buttons - points
  var btnPlusPosition = pSinglePoint.add("button", undefined, "+");
  btnPlusPosition.helpTip = "Increase Value";
  btnPlusPosition.alignment = ["left", "fill"];
  btnPlusPosition.preferredSize.width = 35;
  var btnMinusPosition = pSinglePoint.add("button", undefined, "-");
  btnMinusPosition.helpTip = "Decrease Value";
  btnMinusPosition.alignment = ["left", "fill"];
  btnMinusPosition.preferredSize.width = 35;

  // panel - equal points
  var pEqualPoints = w.add("panel", undefined, "Place Points Equally Between Anchors");
  pEqualPoints.orientation = "row";
  pEqualPoints.alignment = ["fill", "top"];
  pEqualPoints.alignChildren = ["left", "top"];
  pEqualPoints.margins = 20;
  pEqualPoints.enabled = true;

  pEqualPoints.add("statictext", undefined, "Points?");
  var points = pEqualPoints.add("edittext");
  points.preferredSize.width = 60;
  points.text = "2";

  // input change buttons - points
  var btnPlusPoints = pEqualPoints.add("button", undefined, "+");
  btnPlusPoints.helpTip = "Increase Value";
  btnPlusPoints.alignment = ["left", "fill"];
  btnPlusPoints.preferredSize.width = 35;
  var btnMinusPoints = pEqualPoints.add("button", undefined, "-");
  btnMinusPoints.helpTip = "Decrease Value";
  btnMinusPoints.alignment = ["left", "fill"];
  btnMinusPoints.preferredSize.width = 35;

  // group - window buttons
  var gButtons = w.add("group", undefined);
  gButtons.orientation = "row";
  gButtons.alignChildren = ["fill", "center"];
  gButtons.alignment = ["center", "center"];
  var ok = gButtons.add("button", undefined, "OK");
  var cancel = gButtons.add("button", undefined, "Cancel");

  // enable/disable onclick operations
  rbSinglePoint.onClick = function () {
    pSinglePoint.enabled = true;
    pEqualPoints.enabled = false;
  };

  rbEqualPoints.onClick = function () {
    pEqualPoints.enabled = true;
    pSinglePoint.enabled = false;
  };

  // increase/decrease value buttons onClick handlers
  btnPlusPosition.onClick = function () {
    var shiftDown = ScriptUI.environment.keyboardState.shiftKey;
    if (Number(position.text) + (shiftDown ? 10 : 1) > 99) {
      alert("Minimum of 1% position required for example.");
      position.text = 99;
    } else {
      position.text = Number(position.text) + (shiftDown ? 10 : 1);
    }
  };
  btnMinusPosition.onClick = function () {
    var shiftDown = ScriptUI.environment.keyboardState.shiftKey;
    if (Number(position.text) - (shiftDown ? 10 : 1) < 1) {
      alert("Minimum of 1% position required for example.");
      position.text = 1;
    } else {
      position.text = Number(position.text) - (shiftDown ? 10 : 1);
    }
  };

  btnPlusPoints.onClick = function () {
    points.text =
      Number(points.text) + (ScriptUI.environment.keyboardState.shiftKey ? 10 : 1);
  };
  btnMinusPoints.onClick = function () {
    var shiftDown = ScriptUI.environment.keyboardState.shiftKey;
    if (Number(points.text) - (shiftDown ? 10 : 1) < 1) {
      alert("Minimum of 1 points required for example.");
      points.text = 1;
    } else {
      points.text = Number(points.text) - (shiftDown ? 10 : 1);
    }
  };

  // if "ok" button clicked then return user selections in object
  if (w.show() == 1) {
    if (Number(points.text) < 1) {
      alert("Invalid Value\nNew points between anchors must be greater than 0.");
      return;
    }
    if (!cbHlPoints.value && !cbDrawNewPath.value) {
      alert(
        "Whoops\nYou didn't select either or both of the dialog checkboxes so this example script won't actually do anything."
      );
      return;
    }
    return {
      example: rbSinglePoint.value ? "singlePosition" : "equalPoints",
      position: rbSinglePoint.value ? Number(position.text) / 100 : null,
      points: rbSinglePoint.value ? 1 : Number(points.text),
      hlPoints: cbHlPoints.value,
      drawPath: cbDrawNewPath.value,
    };
  } else {
    return;
  }
}