/*
MatchObjects.jsx for Adobe Illustrator
--------------------------------------
Match one or more objects to another by size and/or position.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
1.0.1 added move to anchor point of source (not just center)
1.0.2 changed ui dialog
1.0.3 removed main function so main vars are global
1.0.4 updated settings dialog box
1.0.5 added fancy source object previewing
1.0.6 changed position anchor selection from drop-down to radio buttons
1.0.7 added ability to move targets to source object layer
1.0.8 added align to source edge option (similar to align panel in Illustrator)
*/

var _title = "Match Objects";
var _version = "1.0.8";
var _copyright = "Copyright 2021 Josh Duncan";
var _website = "www.joshbduncan.com";

// run script
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length > 1) {
        if (sel instanceof Array) {
            // prompt for settings user input
            var settings = settingsWin();
            if (settings) {
                if (
                    !settings.position &&
                    !settings.size &&
                    !settings.layer &&
                    !settings.alignment
                ) {
                    alert("No changes were made!");
                } else {
                    matchObjects();
                }
            }
        }
    } else {
        alert(
            "Not enough objects selected!\nSelect at least two objects first."
        );
    }
} else {
    alert("No documents open!\nCreate or open a document first.");
}

// ----------------
// helper functions
// ----------------

function previewSourceObject(object) {
    app.activeDocument.selection = null;
    object.selected = true;
    app.redraw();
}

// ---------------------
// main script functions
// ---------------------

function matchObjects() {
    // set user selected object as source
    var source, sourceLayer, sourceBounds;
    if (settings.source == "top") {
        source = sel.shift();
    } else {
        source = sel.pop();
    }
    sourceLayer = source.layer;
    sourceBounds = getVisibleBounds(source);

    // iterate over the target objects
    var target, targetBounds;
    for (var i = 0; i < sel.length; i++) {
        target = sel[i];
        targetBounds = getVisibleBounds(target);
        // if target should me resized
        if (settings.size) {
            // found it worked best to first scale the target object and then
            // move the target object since scaling clipped objects can shift
            // the object making previous move calculations incorrect
            var scaleMatrix = getScaleMatrix(
                sourceBounds,
                targetBounds,
                settings.scale
            );
            // work out any adjustment on art with strokes
            var strokeScale = getStrokeScale(
                sourceBounds,
                targetBounds,
                settings.scale
            );
            // scale the target object
            target.transform(
                scaleMatrix,
                true,
                settings.patterns,
                settings.gradients,
                settings.strokePatterns,
                settings.strokeWidth ? strokeScale : false,
                Transformation.CENTER
            );
        }
        // if target should be repositioned
        if (settings.position) {
            // get updated target bounds and info since scaling
            // clipped objects can shift the object on the artboard
            targetBounds = getVisibleBounds(target);
            var moveMatrix = getMoveMatrix(
                sourceBounds,
                targetBounds,
                settings.anchor
            );
            // move the target object
            target.transform(moveMatrix, true, true, true);
        }
        // if target should be aligned
        if (settings.alignment) {
            // get updated target bounds and info since scaling
            // clipped objects can shift the object on the artboard
            targetBounds = getVisibleBounds(target);
            var moveMatrix = getMoveMatrix(
                sourceBounds,
                targetBounds,
                settings.alignTo
            );
            // move the target object
            target.transform(moveMatrix, true, true, true);
        }
        // if target should be moved to same layer
        if (settings.layer) {
            target.move(source, ElementPlacement.PLACEBEFORE);
        }
    }
}

/**
 * figure out the actual "visible" bounds for an object
 * if clipping mask or compound path items are found
 */
function getVisibleBounds(object) {
    var bounds, clippedItem;
    if ((object.typename = "GroupItem" && object.clipped)) {
        for (var i = 0; i < object.pageItems.length; i++) {
            if (object.pageItems[i].clipping) {
                clippedItem = object.pageItems[i];
                break;
            } else if (object.pageItems[i].typename == "CompoundPathItem") {
                if (object.pageItems[i].pathItems[0].clipping) {
                    clippedItem = object.pageItems[i];
                    break;
                }
            }
        }
        bounds = clippedItem.geometricBounds;
    } else {
        bounds = object.geometricBounds;
    }
    return bounds;
}

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

function getScaleMatrix(sourceBounds, targetBounds, scale) {
    var sourceInfo = getObjectInfo(sourceBounds);
    var targetInfo = getObjectInfo(targetBounds);
    var widthProp, heightProp;
    if (scale == "both") {
        widthProp = (sourceInfo.width / targetInfo.width) * 100;
        heightProp = (sourceInfo.height / targetInfo.height) * 100;
    } else if (scale == "height") {
        widthProp = (sourceInfo.height / targetInfo.height) * 100;
        heightProp = (sourceInfo.height / targetInfo.height) * 100;
    } else {
        widthProp = (sourceInfo.width / targetInfo.width) * 100;
        heightProp = (sourceInfo.width / targetInfo.width) * 100;
    }
    return app.getScaleMatrix(widthProp, heightProp);
}

function getMoveMatrix(sourceBounds, targetBounds, anchor) {
    var sourceInfo = getObjectInfo(sourceBounds);
    var targetInfo = getObjectInfo(targetBounds);
    if (anchor == "tl") {
        return app.getTranslationMatrix(
            sourceInfo.left - targetInfo.left,
            sourceInfo.top - targetInfo.top
        );
    } else if (anchor == "tc") {
        return app.getTranslationMatrix(
            sourceInfo.centerX - targetInfo.centerX,
            sourceInfo.top - targetInfo.top
        );
    } else if (anchor == "tr") {
        return app.getTranslationMatrix(
            sourceInfo.right - targetInfo.right,
            sourceInfo.top - targetInfo.top
        );
    } else if (anchor == "cl") {
        return app.getTranslationMatrix(
            sourceInfo.left - targetInfo.left,
            sourceInfo.centerY - targetInfo.centerY
        );
    } else if (anchor == "cc") {
        return app.getTranslationMatrix(
            sourceInfo.centerX - targetInfo.centerX,
            sourceInfo.centerY - targetInfo.centerY
        );
    } else if (anchor == "cr") {
        return app.getTranslationMatrix(
            sourceInfo.right - targetInfo.right,
            sourceInfo.centerY - targetInfo.centerY
        );
    } else if (anchor == "bl") {
        return app.getTranslationMatrix(
            sourceInfo.left - targetInfo.left,
            sourceInfo.bottom - targetInfo.bottom
        );
    } else if (anchor == "bc") {
        return app.getTranslationMatrix(
            sourceInfo.centerX - targetInfo.centerX,
            sourceInfo.bottom - targetInfo.bottom
        );
    } else if (anchor == "br") {
        return app.getTranslationMatrix(
            sourceInfo.right - targetInfo.right,
            sourceInfo.bottom - targetInfo.bottom
        );
    } else if (anchor == "Top Edge") {
        return app.getTranslationMatrix(0, sourceInfo.top - targetInfo.top);
    } else if (anchor == "Left Edge") {
        return app.getTranslationMatrix(sourceInfo.left - targetInfo.left, 0);
    } else if (anchor == "Horizontal Center") {
        return app.getTranslationMatrix(
            sourceInfo.centerX - targetInfo.centerX,
            0
        );
    } else if (anchor == "Vertical Center") {
        return app.getTranslationMatrix(
            0,
            sourceInfo.centerY - targetInfo.centerY
        );
    } else if (anchor == "Right Edge") {
        return app.getTranslationMatrix(sourceInfo.right - targetInfo.right, 0);
    } else if (anchor == "Bottom Edge") {
        return app.getTranslationMatrix(
            0,
            sourceInfo.bottom - targetInfo.bottom
        );
    }
}

function getStrokeScale(sourceBounds, targetBounds, scale) {
    var sourceInfo = getObjectInfo(sourceBounds);
    var targetInfo = getObjectInfo(targetBounds);
    var strokeScale;
    if (scale == "width") {
        strokeScale = sourceInfo.width / targetInfo.width;
    } else if ((scale = "height")) {
        strokeScale = sourceInfo.height / targetInfo.height;
    } else {
        strokeScale =
            ((sourceInfo.width / targetInfo.width) * 100 +
                (sourceInfo.height / targetInfo.height) * 100) /
            2 /
            100;
    }
    return strokeScale;
}

// ------------
// user dialogs
// ------------

function settingsWin() {
    // settings window
    var win = new Window("dialog");
    win.text = _title + " " + _version;
    win.orientation = "column";
    win.alignChildren = "fill";

    // panel - source object
    var pSource = win.add("panel", undefined, "Source Object");
    pSource.alignChildren = "fill";
    pSource.orientation = "column";
    pSource.margins = 18;
    var rbTop = pSource.add(
        "radiobutton",
        undefined,
        "Top Object (of selection)"
    );
    var rbBottom = pSource.add(
        "radiobutton",
        undefined,
        "Bottom Object (of selection)"
    );
    rbBottom.value = true;
    var cbPreview = pSource.add(
        "checkbox",
        undefined,
        "Preview Source Selection"
    );

    // panel - match what
    var pWhat = win.add("panel", undefined, "Match To");
    pWhat.alignChildren = "fill";
    pWhat.orientation = "column";
    pWhat.margins = 18;

    // group - 1
    var group1 = pWhat.add("group", undefined);
    group1.alignChildren = "fill";
    group1.orientation = "row";
    var cbPosition = group1.add("checkbox", undefined, "Source Position");
    var cbSize = group1.add("checkbox", undefined, "Source Size");
    var cbLayer = group1.add("checkbox", undefined, "Source Layer");

    // group - 2
    var group2 = pWhat.add("group", undefined);
    group2.alignChildren = "fill";
    group2.orientation = "row";
    var cbAlignment = group2.add("checkbox", undefined, "Or Align To Source:");
    var arrAlignment = [
        "Top Edge",
        "Left Edge",
        "Horizontal Center",
        "Vertical Center",
        "Right Edge",
        "Bottom Edge",
    ];
    var ddAlignment = group2.add("dropdownlist", undefined, arrAlignment);
    ddAlignment.selection = 0;
    ddAlignment.enabled = false;

    // group - 3
    var group3 = win.add("group", undefined);
    group3.alignChildren = "fill";
    group3.orientation = "row";

    // create a radio button panel for position
    var pPosition = group3.add("panel", undefined, "Position Match");
    pPosition.alignChildren = ["left", "top"];
    pPosition.orientation = "column";
    pPosition.margins = 18;
    pPosition.enabled = false;

    // group - anchors
    var gAnchors = pPosition.add("group", undefined);
    gAnchors.alignChildren = ["left", "top"];
    gAnchors.orientation = "column";

    // group - top anchors
    var gAnchorsTop = gAnchors.add("group", undefined);
    gAnchorsTop.alignChildren = ["left", "top"];
    gAnchorsTop.orientation = "row";
    var tl = gAnchorsTop.add("radiobutton", undefined);
    var tc = gAnchorsTop.add("radiobutton", undefined);
    var tr = gAnchorsTop.add("radiobutton", undefined);

    // group - center anchors
    var gAnchorsCenter = gAnchors.add("group", undefined);
    gAnchorsCenter.alignChildren = ["left", "top"];
    gAnchorsCenter.orientation = "row";
    var cl = gAnchorsCenter.add("radiobutton", undefined);
    var cc = gAnchorsCenter.add("radiobutton", undefined);
    cc.value = true;
    var cr = gAnchorsCenter.add("radiobutton", undefined);

    // group - bottom anchors
    var gAnchorsBottom = gAnchors.add("group", undefined);
    gAnchorsBottom.alignChildren = ["left", "top"];
    gAnchorsBottom.orientation = "row";
    var bl = gAnchorsBottom.add("radiobutton", undefined);
    var bc = gAnchorsBottom.add("radiobutton", undefined);
    var br = gAnchorsBottom.add("radiobutton", undefined);

    // panel - size
    var pSize = group3.add("panel", undefined, "Size Match");
    pSize.alignChildren = ["left", "top"];
    pSize.orientation = "column";
    pSize.margins = 18;
    pSize.enabled = false;
    var rbScaleWidth = pSize.add("radiobutton", undefined, "Width");
    rbScaleWidth.value = true;
    var rbScaleHeight = pSize.add("radiobutton", undefined, "Height");
    var rbScaleBoth = pSize.add("radiobutton", undefined, "Both");

    // panel - also scale
    var pAlsoScale = group3.add("panel", undefined, "Also Scale");
    pAlsoScale.alignChildren = ["left", "top"];
    pAlsoScale.orientation = "column";
    pAlsoScale.margins = 18;
    pAlsoScale.enabled = false;
    var cbPatterns = pAlsoScale.add("checkbox", undefined, "Patterns");
    var cbGradients = pAlsoScale.add("checkbox", undefined, "Gradients");
    cbGradients.value = true;
    var cbStrokePatterns = pAlsoScale.add(
        "checkbox",
        undefined,
        "Stroke Patterns"
    );
    var cbStrokeWidth = pAlsoScale.add("checkbox", undefined, "Stroke Weight");
    cbStrokeWidth.value = true;

    // window control buttons
    var gButtons = win.add("group");
    gButtons.alignment = "center";
    gButtons.add("button", undefined, "OK");
    gButtons.add("button", undefined, "Cancel");

    // copyright info
    var pCopyright = win.add("panel", undefined);
    pCopyright.orientation = "column";
    pCopyright.add(
        "statictext",
        undefined,
        "Version " + _version + " " + _copyright
    );
    pCopyright.add("statictext", undefined, _website);

    // onclick/onchange operations

    // enable/disable source selection preview
    rbTop.onClick = function () {
        if (cbPreview.value) {
            previewSourceObject(sel[0]);
        }
    };
    rbBottom.onClick = function () {
        if (cbPreview.value) {
            previewSourceObject(sel[sel.length - 1]);
        }
    };
    cbPreview.onClick = function () {
        if (cbPreview.value) {
            previewSourceObject(rbTop.value ? sel[0] : sel[sel.length - 1]);
        } else {
            app.activeDocument.selection = sel;
            app.redraw();
        }
    };

    // enable/disable position, size, and alignment options
    cbPosition.onClick = function () {
        if (cbPosition.value) {
            pPosition.enabled = true;
            group2.enabled = false;
        } else {
            pPosition.enabled = false;
            group2.enabled = true;
        }
    };
    cbSize.onClick = function () {
        if (cbSize.value) {
            pSize.enabled = true;
            pAlsoScale.enabled = true;
        } else {
            pSize.enabled = false;
            pAlsoScale.enabled = false;
        }
    };
    cbAlignment.onClick = function () {
        if (cbAlignment.value) {
            ddAlignment.enabled = true;
            cbPosition.enabled = false;
        } else {
            ddAlignment.enabled = false;
            cbPosition.enabled = true;
        }
    };

    // since I'm using radio buttons in different groups
    // for the anchor point selection, I had reset them
    // all each time a different one is selected so that
    // there are never two anchors selected at the same time
    var anchors = [tl, tc, tr, cl, cc, cr, bl, bc, br];
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        anchor.onClick = function () {
            for (var n = 0; n < anchors.length; n++) {
                if (this != anchors[n]) {
                    anchors[n].value = false;
                }
            }
        };
    }

    // if "OK" button clicked then return inputs
    if (win.show() == 1) {
        // reset selection back to original user selection
        app.activeDocument.selection = sel;

        // figure out which dimensions to scale
        var scale;
        if (rbScaleWidth.value) {
            scale = "width";
        } else if (rbScaleHeight.value) {
            scale = "height";
        } else {
            scale = "both";
        }

        // figure out which dimensions to scale
        var anchorNames = [
            "tl",
            "tc",
            "tr",
            "cl",
            "cc",
            "cr",
            "bl",
            "bc",
            "br",
        ];
        var anchorTo = "cc";
        for (var i = 0; i < anchors.length; i++) {
            if (anchors[i].value == true) {
                anchorTo = anchorNames[i];
            }
        }

        return {
            source: rbTop.value ? "top" : "bottom",
            size: cbSize.value,
            scale: scale,
            layer: cbLayer.value,
            patterns: cbPatterns.value,
            gradients: cbGradients.value,
            strokePatterns: cbStrokePatterns.value,
            strokeWidth: cbStrokeWidth.value,
            position: cbPosition.value,
            anchor: anchorTo,
            alignment: cbAlignment.value,
            alignTo: cbAlignment.value ? ddAlignment.selection.text : false,
        };
    } else {
        // reset selection from preview if cancel is clicked
        app.activeDocument.selection = sel;
        return;
    }
}
