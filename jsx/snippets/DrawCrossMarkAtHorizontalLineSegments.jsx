/*
DrawCrossMarkAtHorizontalLineSegments.jsx for Adobe Illustrator
--------------------------------------------------------------------------

Given a selected path draw crossmarks at the center of each horizontal segment.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/align-objects-to-a-line-with-different-heights/m-p/14717956#M412042
*/

(function () {
    // setup variables
    var doc,
        sel,
        selectedPath,
        layer,
        crossMarksGroup,
        crossMarkSize,
        crossMarkVerticalOffset,
        crossMarkColor,
        p1,
        p2,
        centerPointX;

    // no need to continue if there is no active document
    if (!app.documents.length) {
        alert("No active document.");
        return;
    }
    doc = app.activeDocument;

    // no need to continue if there is no active selection
    if (!doc.selection.length) {
        alert("No active selection.");
        return;
    }
    sel = doc.selection;

    // get the **FIRST** pathItem of the selected objects
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].typename === "PathItem") {
            selectedPath = sel[i];
            break;
        }
    }

    // no need to continue if no pathItems were selected
    if (typeof selectedPath === "undefined") {
        alert("No paths were selected.");
        return;
    }

    // create a new layer to hold the lines (use old if already present)
    try {
        layer = doc.layers.getByName("SCRIPT CROSSES");
    } catch (error) {
        $.writeln("layer not found");
    }
    if (typeof layer === "undefined") {
        layer = doc.layers.add();
        layer.name = "SCRIPT CROSSES";
    }

    // create a group to hold all cross marks
    crossMarksGroup = layer.groupItems.add();

    // setup cross mark
    crossMarkSize = 9; // points
    crossMarkVerticalOffset = 18; // point above line
    var crossMarkColor = new RGBColor();
    crossMarkColor.red = 255;
    crossMarkColor.green = crossMarkColor.blue = 0;

    // iterate over each set of 2 points and draw cross marks
    for (var i = 0; i < selectedPath.pathPoints.length - 1; i += 2) {
        p1 = selectedPath.pathPoints[i];
        p2 = selectedPath.pathPoints[i + 1];

        // skip set if y-values don't match
        if (p1.anchor[1] != p2.anchor[1]) {
            continue;
        }

        // calculate center point between x-values
        centerPointX = p1.anchor[0] + (p2.anchor[0] - p1.anchor[0]) / 2;

        // draw cross at center point
        drawCrossMark(centerPointX, p1.anchor[1]);
    }

    function drawCrossMark(x, y) {
        // make a group to hold cross mark parts
        var crossGroup = crossMarksGroup.groupItems.add();
        // draw x-line part
        var xLine = crossGroup.pathItems.add();
        xLine.setEntirePath([
            [x - crossMarkSize / 2, y + crossMarkVerticalOffset],
            [x + crossMarkSize / 2, y + crossMarkVerticalOffset],
        ]);
        // draw y-line part
        var yLine = crossGroup.pathItems.add();
        yLine.setEntirePath([
            [x, y + crossMarkVerticalOffset + crossMarkSize / 2],
            [x, y + crossMarkVerticalOffset - crossMarkSize / 2],
        ]);
        // set cross mark styling
        xLine.strokeColor = yLine.strokeColor = crossMarkColor;
        xLine.stroked = yLine.stroked = true;
        xLine.strokeWidth = yLine.strokeWidth = selectedPath.strokeWidth;
        xLine.filled = yLine.filled = false;
    }
})();
