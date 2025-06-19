var doc = app.activeDocument;
var sel = doc.selection;
var layer = doc.activeLayer;

var newColor = new CMYKColor();
newColor.cyan = 100;
newColor.magenta = 100;
newColor.yellow = 100;
newColor.black = 100;

var cp = layer.compoundPathItems.add();

path1 = layer.pathItems.rectangle(0, 0, 576, 720);
path1.move(cp, ElementPlacement.PLACEATBEGINNING);
path1.evenodd = true;
path1.fillColor = newColor;
path1.stroked = false;

path2 = layer.pathItems.rectangle(0 - 25, 0 + 25, 576 - 50, 720 - 50);
path2.move(cp, ElementPlacement.PLACEATBEGINNING);
// path2.evenodd = true;
path2.fillColor = newColor;
path2.stroked = false;

path3 = layer.pathItems.rectangle(0 - 50, 0 + 50, 576 - 100, 720 - 100);
path3.move(cp, ElementPlacement.PLACEATBEGINNING);
// path3.evenodd = true;
path3.fillColor = newColor;
path3.stroked = false;
