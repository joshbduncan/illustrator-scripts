/*
DrawVisibleBounds.jsx for Adobe Illustrator
-------------------------------------------
Draw the "visible" bounds for selected objects.
Accurately shows clipped objects, compounds paths,
and even compound objects inside of a clipping mask
that's inside of other clipping masks.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
*/

var _title = "Draw Visible Bounds";
var _version = "1.0.0";
var _copyright = "Copyright 2021 Josh Duncan";
var _website = "joshbduncan.com";

// run script
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length > 0) {
        var object, visibleBounds;
        for (var i = 0; i < sel.length; i++) {
            object = sel[i];
            visibleBounds = getVisibleBounds(object);
            drawBounds(visibleBounds, "VISIBLE");
        }
    } else {
        alert("No objects are selected!\nSelect at least one object first.");
    }
} else {
    alert("No documents open!\nCreate or open a document first.");
}

/**
 * draw object bounds with line segments in each corner
 */
function drawBounds(bounds) {
    var boundsGroup = doc.groupItems.add();
    boundsGroup.name = "BOUNDS";
    var topLeft = drawBoundMark([
        [bounds[0], bounds[1] - 10],
        [bounds[0], bounds[1]],
        [bounds[0] + 10, bounds[1]],
    ]);
    topLeft.moveToEnd(boundsGroup);
    var topRight = drawBoundMark([
        [bounds[2], bounds[1] - 10],
        [bounds[2], bounds[1]],
        [bounds[2] - 10, bounds[1]],
    ]);
    topRight.moveToEnd(boundsGroup);
    var bottomLeft = drawBoundMark([
        [bounds[0], bounds[3] + 10],
        [bounds[0], bounds[3]],
        [bounds[0] + 10, bounds[3]],
    ]);
    bottomLeft.moveToEnd(boundsGroup);
    var bottomRight = drawBoundMark([
        [bounds[2], bounds[3] + 10],
        [bounds[2], bounds[3]],
        [bounds[2] - 10, bounds[3]],
    ]);
    bottomRight.moveToEnd(boundsGroup);
}

function drawBoundMark(pathCoordinates) {
    var bound = doc.pathItems.add();
    bound.setEntirePath(pathCoordinates);
    bound.filled = false;
    bound.strokeColor = doc.swatches["[Registration]"].color;
    bound.stroked = true;
    bound.strokeWidth = 1;
    return bound;
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
