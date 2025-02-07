/*
GroupLayersOfSameName.jsx for Adobe Illustrator
-----------------------------------------------

Find all layers in a document with matching name and move them into a single parent layer of the same name.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/how-to-return-boolean-from-array/td-p/14970413
*/

var doc = app.activeDocument;
var groups = groupLayersByName();

// sanity check
for (var i = 0; i < groups.length; i++) {
    $.writeln(
        "Group " +
            (i + 1) +
            "\nName: " +
            groups[i][0].name +
            "\nCount: " +
            groups[i].length
    );
}

moveGroupedLayersToNewLayer(groups);

function groupLayersByName() {
    var groups = [];
    var group, cur, found, comp;
    // iterate over each layer
    for (var i = 0; i < doc.layers.length; i++) {
        cur = doc.layers[i];
        found = false;
        // iterate over groups of layer with same names
        for (var j = 0; j < groups.length; j++) {
            group = groups[j];
            comp = group[0];
            // check if the current layer name matches the group
            if (cur.name === comp.name) {
                found = true;
                group.push(cur);
                break;
            }
        }
        // if the current layer didn't match any groups create a new group
        if (!found) groups.push([cur]);
    }
    return groups;
}

function unlockUnhideMoveLayer(layer, target) {
    // get layer locked and visible status
    var locked = layer.locked;
    var visible = layer.visible;
    // unlock and make layer visible for move
    layer.locked = false;
    layer.visible = true;
    // move the layer into the parent layer
    layer.move(target, ElementPlacement.INSIDE);
    // reset the layer locked and visible status
    layer.locked = locked;
    layer.visible = visible;
}

function moveGroupedLayersToNewLayer(groups) {
    var tagName = "mergeParent";
    var group, commonName, parent, tags, parentTag, layer;
    // iterate over commong layer groups
    // please note the iteration is going in reverse to
    // try and keep the inital layer similar (not exact because of method)
    for (var i = groups.length - 1; i >= 0; i--) {
        group = groups[i];
        // skip groups with only one layer
        if (group.length === 1) continue;
        commonName = group[0].name;
        // create a new layer to hold common layers
        parent = doc.layers.add();
        parent.name = commonName;
        // add a tag for later script runs
        parentTag = parent.tags.add();
        parentTag.name = tagName;
        parentTag.value = "true";
        // iterate over common layer and move each into new parent layer
        // going in reverse again to keep layer order similar
        var tagged, locked, visible;
        for (var j = group.length - 1; j >= 0; j--) {
            layer = group[j];
            // check to see if this layer is a parent from a previous script run
            try {
                layer.tags.getByName(tagName);
                tagged = true;
            } catch (e) {
                tagged = false;
            }
            if (tagged) {
                var sublayer;
                for (var n = 0; n < layer.layers.length; n++) {
                    sublayer = layer.layers[n];
                    unlockUnhideMoveLayer(layer, parent);
                }
                layer.remove();
            } else {
                unlockUnhideMoveLayer(layer, parent);
            }
        }
    }
}

// ALTERNATE VERSION THAT DOESN'T CREATE A PARENT LAYER
// IT JUST MOVES ANY LAYER OF THE SAME NAME INSIDE OF
// THE TOPMOST LAYER (WITH THE SAME NAME)

// doc = app.activeDocument;

// var parent, parentLocked, parentVisible;
// for (var i = 0; i < doc.layers.length; i++) {
//   parent = doc.layers[i];
//   var child, childLocked, childVisible;
//   for (var j = i + 1; j < doc.layers.length; j++) {
//     child = doc.layers[j];
//     $.writeln(i, " vs ", j, " : ", parent.name, " vs ", child.name);

//     // no need to continue if the names don't match
//     if (child.name !== parent.name) continue;

//     // get parent layer locked and visible status
//     parentLocked = parent.locked;
//     parentVisible = parent.visible;
//     // unlock and make parent layer visible for move
//     parent.locked = false;
//     parent.visible = true;

//     // get child layer locked and visible status
//     childLocked = child.locked;
//     childVisible = child.visible;
//     // unlock and make child layer visible for move
//     child.locked = false;
//     child.visible = true;
//     // move the child layer into the parent layer
//     child.move(parent, ElementPlacement.PLACEATEND);
//     // reset the child layer locked and visible status
//     child.locked = childLocked;
//     child.visible = childVisible;

//     // reset the parent layer locked and visible status
//     parent.locked = parentLocked;
//     parent.visible = parentVisible;
//   }
// }
