// Collect all layers into a single layer named 'COLLECTED'
// Also includes locked and hidden layers.

// https://community.adobe.com/t5/illustrator-discussions/script-for-quot-select-all-layers-quot-and-quot-collect-in-new-layer-quot/td-p/13256232

var doc = app.activeDocument;
doc.layers.add().name = "COLLECTED";
var layerToMove, visible, locked;
for (var i = doc.layers.length - 1; i > 0; i--) {
  // get current layer and it's locked/hidden status
  layerToMove = doc.layers[i];
  visible = layerToMove.visible;
  locked = layerToMove.locked;
  // make visible and unhide layer for moving
  layerToMove.visible = true;
  layerToMove.locked = false;
  layerToMove.moveToBeginning(doc.layers[0]);
  // reapply the locked/hidden status after moving
  if (!visible) layerToMove.visible = false;
  if (locked) layerToMove.locked = true;
}
