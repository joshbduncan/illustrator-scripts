// Draw a crosshair mark at the center of each selected object.

(function () {
    // get the active document
    try {
        var doc = app.activeDocument;
    } catch (e) {
        alert("No active document.\n" + e);
        return;
    }

    // get the document selection
    var sel = doc.selection;
    if (!selection.length) {
        alert("Empty selection.\nMake a selection and rerun the script.");
        return;
    }

    // setup script defaults
    var marksLayerName = "Center Crosshair Marks";
    var crosshairStrokeWeight = ".0625 in";
    var crosshairWidth = ".5 in";
    var crosshairHeight = ".25 in";
    var crosshairStrokeColor = new RGBColor();
    crosshairStrokeColor.red = 255;
    crosshairStrokeColor.green = 0;
    crosshairStrokeColor.blue = 0;

    // convert default unit values to points
    var crosshairStrokeWeight = UnitValue(crosshairStrokeWeight).as("pt");
    var crosshairWidth = UnitValue(crosshairWidth).as("pt");
    var crosshairHeight = UnitValue(crosshairHeight).as("pt");

    // create a layer to hold the crosshair marks
    var crosshairLayer = createLayer(marksLayerName);

    // draw center crosshair mark for each selected object
    var bounds, centerX, centerY;
    for (var i = 0; i < sel.length; i++) {
        bounds = sel[i].geometricBounds; // [left, top, right, bottom]
        var centerX = bounds[0] + (bounds[2] - bounds[0]) / 2;
        var centerY = -(bounds[1] - (bounds[1] - bounds[3]) / 2);
        drawCrosshair(
            crosshairLayer,
            centerX,
            centerY,
            crosshairWidth,
            crosshairHeight,
            crosshairStrokeColor,
            crosshairStrokeWeight
        );
    }

    /**
     * ************************************
     *           HELPER FUNCTIONS
     * ************************************
     */
    function createLayer(name) {
        var layer;
        try {
            layer = doc.layers.getByName(name);
        } catch (e) {
            layer = doc.layers.add();
            layer.name = name;
        }
        return layer;
    }

    function drawCrosshair(layer, x, y, width, height, strokeColor, strokeWeight) {
        // make a group to hold the parts
        var crosshair = layer.groupItems.add();
        // draw x-line
        var xLine = crosshair.pathItems.add();
        xLine.setEntirePath([
            [x - width / 2, -y],
            [x + width / 2, -y],
        ]);
        xLine.strokeColor = strokeColor;
        xLine.stroked = true;
        xLine.strokeWidth = strokeWeight;
        xLine.filled = false;
        // draw y-line
        var yLine = crosshair.pathItems.add();
        yLine.setEntirePath([
            [x, -y + height / 2],
            [x, -y - height / 2],
        ]);
        yLine.strokeColor = strokeColor;
        yLine.stroked = true;
        yLine.strokeWidth = strokeWeight;
        yLine.filled = false;
    }
})();
