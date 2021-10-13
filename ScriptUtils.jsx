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
    if (object.typename == "GroupItem") {
        // if the object is clipped
        if (object.clipped) {
            // check all sub objects to find the clipping path
            for (var i = 0; i < object.pageItems.length; i++) {
                if (object.pageItems[i].clipping) {
                    clippedItem = object.pageItems[i];
                    break;
                } else if (object.pageItems[i].typename == "CompoundPathItem") {
                    if (object.pageItems[i].pathItems[0].clipping) {
                        clippedItem = object.pageItems[i];
                        break;
                    }
                } else {
                    clippedItem = object.pageItems[i];
                    break;
                }
            }
            bounds = clippedItem.geometricBounds;
        } else {
            // if the object is not clipped
            var subObjectBounds;
            var allBoundPoints = [[], [], [], []];
            // get the bounds of every object in the group
            for (var i = 0; i < object.pageItems.length; i++) {
                subObjectBounds = getVisibleBounds(object.pageItems[i]);
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
