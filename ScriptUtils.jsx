/**
 * write text to the document for debugging
 */
function writeText(text, position, fontSize, align) {
    if (typeof position === "undefined") position = [0, 0];
    if (typeof fontSize === "undefined") fontSize = 12;
    if (typeof align === "undefined") align = "c";
    var doc = app.activeDocument;
    var textObject = doc.textFrames.pointText([position[0], position[1]]);
    textObject.contents = text;
    textObject.textRange.characterAttributes.size = fontSize;
    if (align == "l") {
        textObject.textRange.justification = Justification.LEFT;
    } else if (align == "r") {
        textObject.textRange.justification = Justification.RIGHT;
    } else {
        textObject.textRange.justification = Justification.CENTER;
    }
    return textObject;
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
