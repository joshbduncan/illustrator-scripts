// GetVisibleItemsFromArtboards.jsx

// https://community.adobe.com/t5/illustrator-discussions/illustrator-scripting-copy-only-visible-objects-on-different-layers-by-artboard/td-p/13575572

var doc = app.activeDocument;

// get all artboards and create and object to hold their pageItems
var captured = {};
for (var i = 0; i < doc.artboards.length; i++) {
    captured[doc.artboards[i].name] = [];
}

// go through all page items
var item;
for (var i = 0; i < doc.pageItems.length; i++) {
    item = doc.pageItems[i];
    // first check to see if the page item is visible and its parent layer is visible
    if (!item.hidden && item.layer.visible) {
        // then iterate over the captured artboards
        var ab;
        for (var j in captured) {
            var ab = doc.artboards.getByName(j);
            // and check if the item is within the artboard bounds
            if (withinArtboardBounds(item.visibleBounds, ab.artboardRect)) {
                captured[j].push(item);
            }
        }
    }
}

// for example purposes, show the capture items for each artboard
for (var a in captured) {
    alert(a + "\n" + captured[a]);
}

function withinArtboardBounds(itemVisibleBounds, artboardBounds) {
    return (
        itemVisibleBounds[0] >= artboardBounds[0] && // left
        itemVisibleBounds[1] <= artboardBounds[1] && // top
        itemVisibleBounds[2] <= artboardBounds[2] && // right
        itemVisibleBounds[3] >= artboardBounds[3] // bottom
    );
}
