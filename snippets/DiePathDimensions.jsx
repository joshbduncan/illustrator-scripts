/*
DiePathDimensions.jsx for Adobe Illustrator
-------------------------------------------

Add **selected** die path width, height, and area to the artboard.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/can-this-be-automated-selecting-multiple-seperate-rectangle-shapes-and-calculating-the-l-amp-w/td-p/14648989
*/

(function () {
  // setup variables
  var doc, infoLayer, die, w, h, info, frame;

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  doc = app.activeDocument;

  // no need to continue if there is no active selection
  if (!doc.selection.length) {
    alert("No active selection.");
    return;
  }

  // cleanup old info if found
  try {
    infoLayer = doc.layers.getByName("DIE INFORMATION");
    infoLayer.remove();
  } catch (error) {
    $.writeln("infoLayer not present");
  }

  // setup the layer/info color info
  var color = new RGBColor();
  color.red = 255;
  color.green = color.blue = 0;

  // create a layer to hold the die information
  infoLayer = doc.layers.add();
  infoLayer.color = color;
  infoLayer.name = "DIE INFORMATION";

  // please note: in the sample file, each die was grouped by iteself and
  // withing another larger group that included a few text boxes so this script
  // only acts on the first pathItem within the die pathItem group

  // iterate over each selected object
  for (var i = 0; i < doc.selection.length; i++) {
    die = doc.selection[i].pathItems[0];
    w = UnitValue(die.width, "px").as("in");
    h = UnitValue(die.height, "px").as("in");
    a = w * h;
    // ensure minimum die size requirement of 2 for both width and height
    wString = w < 2 ? "2*" : w.toFixed(4);
    hString = h < 2 ? "2*" : h.toFixed(4);
    aString = w < 2 || h < 2 ? a.toFixed(4) + "*" : a.toFixed(4);
    // format the info as:
    // XX.XXXX in x XX.XXXX in
    // XX.XXXX sq/in
    info = wString + " in x " + hString + " in\n" + aString + " sq/in";
    // add a new text frame at the top left of the die with the die info
    frame = infoLayer.textFrames.add();
    frame.position = Array(die.left, die.top);
    frame.textRange.size = 12;
    frame.textRange.fillColor = color;
    frame.contents = info;
  }
})();
