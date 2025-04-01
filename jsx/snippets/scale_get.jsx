// scale_get.jsx

// get the "visibleBounds" of the first item of the app selection
var sourceItem = app.activeDocument.selection[0];

// get the "visible" bounds of the sourceItem
// https://ai-scripting.docsforadobe.dev/scripting/positioning.html#art-item-bounds
// to use a different type of bounds update the line below
var sourceBounds = getVisibleBounds(sourceItem);

// save sourceBounds to an environment variable so it can be retrieved by second script
$.setenv("scaleTargetBounds", sourceBounds.toSource());

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
