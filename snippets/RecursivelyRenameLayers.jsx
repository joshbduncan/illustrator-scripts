// https://community.adobe.com/t5/illustrator-discussions/how-to-move-and-align-objects-with-scripts/m-p/13147307#M333310

// Do all of the layer duplication first as explained by Silly-V

// grab the current document and it's layers
var doc = app.activeDocument;
var layers = doc.layers;

// iterate through all layers from bottom to top
for (var i = doc.layers.length - 1; i > -1; i--) {
  doc.layers[i].name = Math.abs(i - doc.layers.length);
  // recursively remove "copy" every sublayer
  recursiveRename(doc.layers[i]);
}

function recursiveRename(parent) {
  for (var i = 0; i < parent.layers.length; i++) {
    parent.layers[i].name = parent.layers[i].name.replace(/\scopy.*$/, "");
    recursiveRename(parent.layers[i]);
  }
}
