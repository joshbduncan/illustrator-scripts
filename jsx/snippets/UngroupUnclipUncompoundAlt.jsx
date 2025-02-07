/**
 * Clean-up junky Ai files by reducing any selected group, compound path, and clipping mask contents to just paths.
 *
 * This works no matter how nested the container object are and works for better for weird
 * edge cases than trying to remove each element from each container via the API.
 */

var doc = app.activeDocument;

// first get rid of pesky groups hidden inside of compound paths
var peskyGroups = [];
for (var i = 0; i < doc.groupItems.length; i++) {
    if (
        doc.groupItems[i].selected &&
        doc.groupItems[i].parent.typename == "CompoundPathItem"
    ) {
        peskyGroups.push(doc.groupItems[i]);
    }
}
for (var i = 0; i < peskyGroups.length; i++) {
    peskyGroups[i].move(peskyGroups[i].layer, ElementPlacement.PLACEATEND);
}

// clean-up all the junk and only get the path items
for (var i = 0; i < doc.selection.length; i++) {
    onlyPathItems(doc.selection[i]);
}

/**
 * Clean-up junky object by removing any groups and clipping masks and on keeping the path items.
 * @param {PageItem} obj A single Adobe Illustrator pageItem
 */
function onlyPathItems(obj) {
    // if pathItem found carry on
    if (obj.typename == "PathItem") {
        obj.move(obj.layer, ElementPlacement.PLACEATEND);
        return;
    }
    // remove clipping masks first
    if (obj.typename == "GroupItem" && obj.clipped && obj.pathItems.length > 0) {
        obj.pathItems[0].remove();
    }
    // remove all items of their container
    var subObject;
    if (obj.typename == "GroupItem") {
        while (obj.pageItems.length > 0) {
            subObject = obj.pageItems[0];
            subObject.move(obj.layer, ElementPlacement.PLACEATEND);
            onlyPathItems(subObject);
        }
    } else if (obj.typename == "CompoundPathItem") {
        while (obj.pathItems.length > 0) {
            subObject = obj.pathItems[0];
            subObject.move(obj.layer, ElementPlacement.PLACEATEND);
            onlyPathItems(subObject);
        }
    }
}
