/*
ArtboardRectGuides.jsx for Adobe Illustrator
--------------------------------------------
Easily add a rectangle guide offset +/- from your current artboard.

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
0.1.0 2025-06-18 initial release
*/

(function () {
    //@target illustrator

    var _title = "ArtboardRectGuides";
    var _version = "0.1.0";
    var _copyright = "Copyright 2025 Josh Duncan";
    var _website = "joshbduncan.com";

    //////////////
    // INCLUDES //
    //////////////


    /**
     * Parse a ScriptUI `edittext` value into a valid `UnitType` number.
     * @param {Number|String} n Value to parse.
     * @param {Number} defaultValue Default value to return if `n` is invalid.
     * @param {String} defaultUnit Default unit type to return the input as if not included in `n`.
     * @returns {UnitValue}
     */
    function parseNumberInput(n, defaultValue, defaultUnit) {
        defaultValue = typeof defaultValue !== "undefined" ? defaultValue : 0;

        var rulerUnits = app.activeDocument.rulerUnits
            .toString()
            .split(".")[1]
            .toLowerCase();
        defaultUnit = typeof defaultUnit !== "undefined" ? defaultUnit : rulerUnits;

        var val = UnitValue(n);
        if (val.type === "?") {
            val = UnitValue(n, defaultUnit);
            if (isNaN(val.value)) {
                app.beep();
                val = UnitValue(defaultValue, defaultUnit);
            }
        }
        return val;
    }

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

    // grab ruler units
    var rulerUnits = app.activeDocument.rulerUnits
        .toString()
        .split(".")[1]
        .toLowerCase();

    // prompt for guides offset
    var userInput = prompt(
        "Offset Guides By?\nPositive offset = guides outside artboard\nNegative offset = guides inside artboard\n\nExample Values: 2 in, -3 pt, 6 mm, -5 px",
        "2 " + rulerUnits,
        "ArtboardRectGuides"
    );
    if (userInput === null) return;
    var offset = parseNumberInput(userInput).as("px");

    // create a layer to hold guides
    var guidesLayer;
    var guidesLayerName = "Artboard Guides";
    var guidesLayerWasLocked = false;
    try {
        guidesLayer = doc.layers.getByName(guidesLayerName);
        guidesLayerWasLocked = guidesLayer.locked;
        guidesLayer.locked = false;
    } catch (e) {
        guidesLayer = doc.layers.add();
        guidesLayer.name = guidesLayerName;
    }

    // grab the active artboard
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];

    // do all operations inside of try block to ensure ruler origin is reset
    var oldRulerOrigin;
    try {
        // reset ruler for correct math
        oldRulerOrigin = doc.rulerOrigin;
        doc.rulerOrigin = [0, doc.height];

        // calculate guide size and placement
        var left = ab.artboardRect[0] - offset;
        var top = ab.artboardRect[1] + offset;
        var right = ab.artboardRect[2] + offset;
        var bottom = ab.artboardRect[3] - offset;

        var width = right - left;
        var height = top - bottom;

        // validate values
        if (width <= 0 || height <= 0) {
            alert("Provided offset smaller than artboard. Exiting.");
            return;
        }

        // create a rectangle and turn it into guides
        var rect = guidesLayer.pathItems.rectangle(top, left, width, height); // top, left, width, height
        rect.guides = true;
    } catch (e) {
        alert("Unexpected error:\n" + e.message);
    } finally {
        // reset guides layer locked status
        if (guidesLayerWasLocked) guidesLayer.locked = true;

        // reset ruler to original user setting
        doc.rulerOrigin = oldRulerOrigin;
    }
})();
