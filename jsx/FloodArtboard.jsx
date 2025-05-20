/*
FloodArtboard.jsx for Adobe Illustrator
---------------------------------------
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
2025-04-01 initial release
2025-05-19 fix for non-standard ruler location
*/

(function () {
    //@target illustrator

    var _title = "FloodArtboard";
    var _version = "0.1.0";
    var _copyright = "Copyright 2025 Josh Duncan";
    var _website = "joshbduncan.com";

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

    // reset ruler for correct math
    var oldRulerOrigin = doc.rulerOrigin;
    doc.rulerOrigin = [0, doc.height];

    // get the active artboard
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var t = ab.artboardRect[0];
    var l = ab.artboardRect[1];
    var w = ab.artboardRect[2];
    var h = ab.artboardRect[3];

    // create a temp layer to hold preview items
    var floodLayer = doc.layers.add();
    floodLayer.name = "Flood Fill";

    // create a temporary item to fix any issues with the appearance panel
    var rect = floodLayer.pathItems.rectangle(t + h, l, w, h); // top, left, width, height
    rect.filled = true;
    rect.stroked = false;
    rect.fillColor = doc.defaultFillColor;

    // reset ruler to original user setting
    doc.rulerOrigin = oldRulerOrigin;
})();
