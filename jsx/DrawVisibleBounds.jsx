/*
DrawVisibleBounds.jsx for Adobe Illustrator
-------------------------------------------
Draw the "visible" bounds for selected objects.
Accurately shows clipped objects, compounds paths,
and even compound objects inside of a clipping mask
that's inside of other clipping masks.

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
1.0.0 initial release
1.0.1 updated getVisibleBounds() to catch lots of weird edge cases
1.0.2 updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
1.1.0 moved `getVisibleBounds()` function to a separate imported file (see other updates there)
*/

(function () {
    //@target illustrator

    var _title = "Draw Visible Bounds";
    var _version = "1.1.0";
    var _copyright = "Copyright 2025 Josh Duncan";
    var _website = "joshbduncan.com";


    /*
      Changelog
      ---------
      2021-09-13
        - updated getVisibleBounds() to catch lots of weird edge cases
      2021-10-13
        - updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
      2021-10-15
        - fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
        - error catch for selected guides (William Dowling @ github.com/wdjsdev)
        - error catch for empty objects or item with no bounds
        - error catch for clipping masks inside of an empty group
    */

    /**
     * Determine the actual "visible" bounds for an object if clipping mask or compound path items are found.
     * @param {PageItem} o A single Adobe Illustrator pageItem.
     * @returns {Array} Object bounds [left, top, right, bottom].
     */
    function getVisibleBounds(o) {
        var bounds, clippedItem, sandboxItem, sandboxLayer;
        var curItem;

        // skip guides (via william dowling @ github.com/wdjsdev)
        if (o.guides) {
            return undefined;
        }

        if (o.typename == "GroupItem") {
            // if the group has no pageItems, return undefined
            if (!o.pageItems || o.pageItems.length == 0) {
                return undefined;
            }
            // if the object is clipped
            if (o.clipped) {
                // check all sub objects to find the clipping path
                for (var i = 0; i < o.pageItems.length; i++) {
                    curItem = o.pageItems[i];
                    if (curItem.clipping) {
                        clippedItem = curItem;
                        break;
                    } else if (curItem.typename == "CompoundPathItem") {
                        if (!curItem.pathItems.length) {
                            // catch compound path items with no pathItems (via William Dowling @ github.com/wdjsdev)
                            sandboxLayer = app.activeDocument.layers.add();
                            sandboxItem = curItem.duplicate(sandboxLayer);
                            app.activeDocument.selection = null;
                            sandboxItem.selected = true;
                            app.executeMenuCommand("noCompoundPath");
                            sandboxLayer.hasSelectedArtwork = true;
                            app.executeMenuCommand("group");
                            clippedItem = app.activeDocument.selection[0];
                            break;
                        } else if (curItem.pathItems[0].clipping) {
                            clippedItem = curItem;
                            break;
                        }
                    }
                }
                if (!clippedItem) {
                    clippedItem = o.pageItems[0];
                }
                bounds = clippedItem.geometricBounds;
                if (sandboxLayer) {
                    // eliminate the sandbox layer since it's no longer needed
                    sandboxLayer.remove();
                    sandboxLayer = undefined;
                }
            } else {
                // if the object is not clipped
                var subObjectBounds;
                var allBoundPoints = [[], [], [], []];
                // get the bounds of every object in the group
                for (var i = 0; i < o.pageItems.length; i++) {
                    curItem = o.pageItems[i];
                    subObjectBounds = getVisibleBounds(curItem);
                    for (var j = 0; j < subObjectBounds.length; j++) {
                        allBoundPoints[j].push(subObjectBounds[j]);
                    }
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
            bounds = o.geometricBounds;
        }
        return bounds;
    }

    // run script
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        var sel = doc.selection;
        if (sel.length > 0) {
            var object, visibleBounds;
            for (var i = 0; i < sel.length; i++) {
                object = sel[i];
                visibleBounds = getVisibleBounds(object);
                if (!visibleBounds) {
                    $.writeln("Error: " + object.name + " has no visible bounds.");
                    continue;
                }
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
    function drawBounds(bounds, lineLength) {
        // adjustable length of crosshair lines
        lineLength = typeof lineLength !== "undefined" ? lineLength : 20;
        var boundsGroup = doc.groupItems.add();
        boundsGroup.name = "BOUNDS";
        var topLeft = drawBoundMark([
            [bounds[0], bounds[1] - lineLength],
            [bounds[0], bounds[1]],
            [bounds[0] + lineLength, bounds[1]],
        ]);
        topLeft.moveToEnd(boundsGroup);
        var topRight = drawBoundMark([
            [bounds[2], bounds[1] - lineLength],
            [bounds[2], bounds[1]],
            [bounds[2] - lineLength, bounds[1]],
        ]);
        topRight.moveToEnd(boundsGroup);
        var bottomLeft = drawBoundMark([
            [bounds[0], bounds[3] + lineLength],
            [bounds[0], bounds[3]],
            [bounds[0] + lineLength, bounds[3]],
        ]);
        bottomLeft.moveToEnd(boundsGroup);
        var bottomRight = drawBoundMark([
            [bounds[2], bounds[3] + lineLength],
            [bounds[2], bounds[3]],
            [bounds[2] - lineLength, bounds[3]],
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
})();
