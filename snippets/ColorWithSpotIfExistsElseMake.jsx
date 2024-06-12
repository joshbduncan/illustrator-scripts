// Set the fill of all selected objects to the specified spot color

// https://community.adobe.com/t5/illustrator-discussions/need-help-with-javascript-quot-if-else-quot-code-for-spot-color-creation/m-p/13494666#M351600

var doc = app.activeDocument;
var sel = doc.selection;

if (sel.length > 0) {
  spotColor = newSpotColor("HPI-White", 100, 0, 0, 0);
  for (var i = 0; i < sel.length; i++) {
    recolor(sel[i]);
  }
}

function recolor(object) {
  // check to see if object is a group or compound path
  // and if so dig into them and color their sub pathItems
  if (object.typename == "GroupItem") {
    for (var i = 0; i < object.pageItems.length; i++) {
      recolor(object.pageItems[i]);
    }
  } else if (object.typename == "CompoundPathItem") {
    for (var i = 0; i < object.pathItems.length; i++) {
      recolor(object.pathItems[i]);
    }
  } else {
    object.fillColor = spotColor;
  }
}

function newSpotColor(name, c, m, y, k) {
  try {
    newSpot = doc.spots.getByName(name);
  } catch (e) {
    // Create the new spot
    var newSpot = doc.spots.add();

    // Define the new color value
    var newColor = new CMYKColor();
    newColor.cyan = c;
    newColor.magenta = m;
    newColor.yellow = y;
    newColor.black = k;

    // Set the name and values for the spot color
    newSpot.name = name;
    newSpot.colorType = ColorModel.SPOT;
    newSpot.color = newColor;
  }
  var newSpotColor = new SpotColor();
  newSpotColor.spot = newSpot;
  return newSpotColor;
}
