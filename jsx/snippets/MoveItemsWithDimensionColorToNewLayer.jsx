/*
MoveItemsWithDimensionColorToNewLayer.jsx for Adobe Illustrator
---------------------------------------------------------------

Move any item stroked or filled with the "Dimension" swatch to a new layer.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/script-error-control/m-p/14967568#M426184
*/

// grab reference to the current document
var doc = app.activeDocument;

// deselect all items
doc.selection = null;

// grab reference to the work layer
var layerName = "Dimensions";
var layer;
try {
  layer = doc.layers.getByName(layerName);
} catch (e) {
  alert("'" + layerName + "' layer not found so it will be created now.");
  layer = doc.layers.add();
  layer.name = layerName;
}

// grab reference to the "Dimension" color
var colorName = "Dimension";
var color;
try {
  color = doc.swatches.getByName(colorName).color;
} catch (e) {
  alert("'" + colorName + "' swatch not found!");
  // I would typically create the spot color here
  color = null;
}

// check to see if the color was found, if so move any matching items
if (color != null) {
  // find items stroked with "Dimension" color and move to layer
  doc.defaultStrokeColor = color;
  app.executeMenuCommand("Find Stroke Color menu item");
  moveSelectedItemsToLayer(layer, ElementPlacement.PLACEATEND);

  // find items filled with "Dimension" color and move to layer
  doc.defaultFillColor = color;
  app.executeMenuCommand("Find Fill Color menu item");
  moveSelectedItemsToLayer(layer, ElementPlacement.PLACEATEND);
}

// Move any selected item to `layer` at `insertLocation`.
function moveSelectedItemsToLayer(layer, insertLocation) {
  var _selectedItems = app.selection;
  if (_selectedItems.length == 0) return; // no need to continue
  for (var i = _selectedItems.length - 1; i >= 0; i--) {
    _selectedItems[i].move(layer, insertLocation);
    _selectedItems[i].selected = false;
  }
  app.redraw();
  doc.selection = null;
}
