/*
EllipseStepsBetween.jsx for Adobe Illustrator
---------------------------------------------
Create evenly spaced ellipses between two selected ellipses by interpolating their geometric bounds.

TIP: Think Object > Blend but with ellipses... I mainly use this when creating text on path circle layouts.

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
0.1.0 2026-04-09 initial release
*/

//@target illustrator

(function () {
  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and selection info
  var doc = app.activeDocument;
  var sel = doc.selection;

  // no need to continue if there is no active selection or not enough objects selected
  if (!sel || sel.length !== 2) {
    alert("Select exactly two ellipses.");
    return;
  }

  var a = sel[0];
  var b = sel[1];

  // no need to continue if the selected items are not path items
  if (a.typename !== "PathItem" || b.typename !== "PathItem") {
    alert("Both selected items must be path items.");
    return;
  }

  var input = prompt(
    "How many ellipses should be created between the selected ellipses?",
    "1",
  );
  if (input === null) {
    return;
  }

  var steps = parseInt(input, 10);
  if (isNaN(steps) || steps < 1 || steps > 1000) {
    alert("Enter a whole number from 1 to 1000.");
    return;
  }

  // geometricBounds = [left, top, right, bottom]
  var aBounds = a.geometricBounds;
  var bBounds = b.geometricBounds;

  var aLeft = aBounds[0];
  var aTop = aBounds[1];
  var aRight = aBounds[2];
  var aBottom = aBounds[3];

  var bLeft = bBounds[0];
  var bTop = bBounds[1];
  var bRight = bBounds[2];
  var bBottom = bBounds[3];

  // setup stroke color for new ellipses
  var strokeColor = new RGBColor();
  strokeColor.red = 255;
  strokeColor.green = strokeColor.blue = 0;

  // create a group to hold the ellipses
  var group = doc.groupItems.add();

  // create intermediate ellipses
  for (var i = 1; i <= steps; i++) {
    var t = i / (steps + 1); // runs from 1/(steps+1) to steps/(steps+1)

    var newLeft = lerp(aLeft, bLeft, t);
    var newTop = lerp(aTop, bTop, t);
    var newRight = lerp(aRight, bRight, t);
    var newBottom = lerp(aBottom, bBottom, t);

    var newWidth = newRight - newLeft;
    var newHeight = newTop - newBottom;

    var ellipse = doc.pathItems.ellipse(newTop, newLeft, newWidth, newHeight);

    // color the new ellipse to make it obvious
    ellipse.filled = false;
    ellipse.stroked = true;
    ellipse.strokeWidth = 1;
    ellipse.strokeColor = strokeColor;

    // add the ellipse to the group
    ellipse.moveToBeginning(group);
  }

  //////////////////////
  // HELPER FUNCTIONS //
  //////////////////////

  /**
   * Linearly interpolate between two numbers.
   *
   * Returns a value between `start` and `end` based on the interpolation factor `t`.
   *
   * @param {number} start - The starting value.
   * @param {number} end - The ending value.
   * @param {number} t - Interpolation factor (typically between 0 and 1).
   * @returns {number} The interpolated value.
   *
   * @example
   * lerp(0, 100, 0.5); // 50
   * lerp(10, 20, 0.25); // 12.5
   */
  function lerp(start, end, t) {
    return start + (end - start) * t;
  }
})();
