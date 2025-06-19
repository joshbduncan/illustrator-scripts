// https://community.adobe.com/t5/illustrator-discussions/extendscript-set-text-stroke/td-p/13057521

var doc = app.activeDocument;
var text = doc.selection[0];

var newColor = new CMYKColor();
newColor.cyan = 100;
newColor.magenta = 0;
newColor.yellow = 0;
newColor.black = 0;

var tr = text.textRange;
tr.stroked = true;
tr.strokeColor = newColor;
tr.strokeWeight = 9.2;
