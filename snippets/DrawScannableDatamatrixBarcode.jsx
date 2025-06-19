/*
DrawScannableDatamatrixBarcode.jsx for Adobe Illustrator
--------------------------------------------------------

Draw a scannable DATAMATRIX barcode in the current document.

Built to work with the Datamatrix.js library found at https://github.com/tualo/tualo-datamatrix/blob/master/lib/datamatrix.js.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/creating-a-scannable-datamatrix-barcode/m-p/14772045#M414748
*/

// do you datamatrix stuff here

// var dm = new Datamatrix();
// var ascii = dm.getDigit(str, false);

// below I am just using your example from the forum
// it seems the datamatrix package gives you a string separated with new lines
// so I just split the string into an array

var ascii =
  "00000000000000\
01010101010100\
01101001110110\
01001010100000\
01110010111010\
01101001100000\
01111011101110\
01110001101000\
01101110111010\
01111010001000\
01100011111010\
01100100010100\
01111111111110\
00000000000000";

// call the `drawDataMatrix` function to draw the shapes at the top-left of the artboard
drawDataMatrix(ascii);

function drawDataMatrix(str) {
  // setup defaults
  var defaultLayerName = "Layer 1";
  var defaultGroupName = "Matrix";
  var defaultRectangleScale = 10;
  var defaultPadding = 36;

  // convert the datamatrix string into an array
  var matrix = str.split("\n");

  // setup colors
  var zeroColor = new GrayColor();
  zeroColor.gray = 100; // black
  var oneColor = new GrayColor();
  oneColor.gray = 0; // white

  // setup a layer and a group to hold the art
  var layer, group;
  try {
    layer = app.activeDocument.layers.getByName(defaultLayerName);
  } catch (e) {
    layer = app.activeDocument.layers.add();
    layer.name = defaultLayerName;
  }
  group = layer.groupItems.add();
  group.name = defaultGroupName;

  // calculate start x,y position for bottom-right placement with padding
  var startX =
    app.activeDocument.width -
    matrix[0].length * defaultRectangleScale -
    defaultPadding;
  var startY =
    -app.activeDocument.height +
    matrix.length * defaultRectangleScale +
    defaultPadding;

  // iterate over the matrix and draw the rectangles
  var rec;
  for (var y = 0; y < matrix.length; y++) {
    for (var x = 0; x < matrix[y].length; x++) {
      rec = group.pathItems.rectangle(
        startY - y * defaultRectangleScale, // top
        startX + x * defaultRectangleScale, // left
        defaultRectangleScale, // width
        defaultRectangleScale, // height
      );
      rec.filled = true;
      rec.stroked = false;
      rec.fillColor = matrix[y][x] === "0" ? zeroColor : oneColor;
    }
  }
}
