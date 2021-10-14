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
1.0.1 updated getVisibleBounds() to catch lots of weird edge cases
1.0.2 updated getVisibleBounds() again for more edge cases: william dowling @ github.com/wdjsdev
*/

var _title = "Draw Visible Bounds";
var _version = "1.0.1";
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
            drawBounds(visibleBounds);
            sel[i].selected = true;
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
    var bounds, clippedItem,sandboxLayer,sandboxItem;
    var curItem;
    if (object.typename == "GroupItem") {
        // if the object is clipped
        if (object.clipped) {
            // check all sub objects to find the clipping path
            for (var i = 0; i < object.pageItems.length; i++) {
                curItem = object.pageItems[i];
                if (curItem.clipping) {
                    clippedItem = curItem;
                    break;
                } else if (curItem.typename == "CompoundPathItem") {

                    if(!curItem.pathItems.length)
                    {
                        //this is the part i was talking about. if this
                        //compound path has no pathItems there'll be a runtime
                        //error. needs a recursive search for pathItem inside compoundPathItem
                        //however, there is no pageItems or groupItems property of a compound path
                        //so it's likely that the best solution is to duplicate the item in question
                        //into some kind of sandbox like a temp layer, break the compound path(s)
                        //and set the bounds to the sum of all the sub-items
                        sandboxLayer = app.activeDocument.layers.add();
                        sandboxItem = curItem.duplicate(sandboxLayer);
                        app.activeDocument.selection = null;
                        sandboxItem.selected = true;
                        app.executeMenuCommand("noCompoundPath");
                        sandboxLayer.hasSelectedArtwork = true;
                        app.executeMenuCommand("group");
                        clippedItem = app.activeDocument.selection[0];
                        break;


                    }
                    else if (curItem.pathItems[0].clipping) {
                        clippedItem = curItem;
                        break;
                    }
                } else {
                    clippedItem = curItem;
                    break;
                }
            }
            bounds = clippedItem.geometricBounds;
            if(sandboxLayer)
            {
                //eliminate the sandbox layer since it's no longer needed
                sandboxLayer.remove();
                sandboxLayer = undefined;
            }
        } else {
            // if the object is not clipped
            var subObjectBounds;
            var allBoundPoints = [[], [], [], []];
            // get the bounds of every object in the group
            for (var i = 0; i < object.pageItems.length; i++) {
                subObjectBounds = getVisibleBounds(curItem);
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