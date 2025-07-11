/*
ArtboardFloodFill.jsx for Adobe Illustrator
-------------------------------------------
Flood fill the active artboard with the current fill color.

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
0.1.0 2025-04-01 initial release
0.1.1 2025-05-19 fix for non-standard ruler location
0.1.2 2025-06-18 refactor
0.1.3 2025-06-19 bug fix re-lock flood layer
0.1.4 2025-07-11 fix for weird no document.defaultFillColor big
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

  // grab document and selection info
  var doc = app.activeDocument;

  // create a layer to hold fill
  var floodLayer;
  var floodLayerName = "Flood Fill";
  var floodLayerWasLocked = false;
  try {
    floodLayer = doc.layers.getByName(floodLayerName);
    floodLayerWasLocked = floodLayer.locked;
    floodLayer.locked = false;
  } catch (e) {
    $.writeln(e.message);
    floodLayer = doc.layers.add();
    floodLayer.name = floodLayerName;
  }

  // get the active artboard
  var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];

  // do all operations inside of try block to ensure ruler origin is reset
  var oldRulerOrigin;
  try {
    // reset ruler for correct math
    oldRulerOrigin = doc.rulerOrigin;
    doc.rulerOrigin = [0, doc.height];

    // calculate guide size and placement
    var left = ab.artboardRect[0];
    var top = ab.artboardRect[1];
    var right = ab.artboardRect[2];
    var bottom = ab.artboardRect[3];

    var width = right - left;
    var height = top - bottom;

    // setup a fill color
    var fillColor = new GrayColor();
    fillColor.gray = 50;
    if (doc.documentColorSpace == DocumentColorSpace.CMYK) {
      fillColor = new CMYKColor();
      fillColor.yellow = 100;
    } else if (doc.documentColorSpace == DocumentColorSpace.RGB) {
      fillColor = new RGBColor();
      fillColor.red = fillColor.green = 255;
    }

    // create a flood fill rectangle
    var rect = floodLayer.pathItems.rectangle(top, left, width, height); // top, left, width, height
    rect.filled = true;
    rect.stroked = false;
    rect.fillColor = fillColor;
  } catch (e) {
    alert("Unexpected error:\n" + e.message);
  } finally {
    // reset guides layer locked status
    if (floodLayerWasLocked) floodLayer.locked = true;

    // reset ruler to original user setting
    doc.rulerOrigin = oldRulerOrigin;
  }
})();
