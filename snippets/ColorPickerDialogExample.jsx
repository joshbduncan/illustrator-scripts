var doc = app.activeDocument;

var c = new RGBColor();
c.red = 85;
c.green = 170;
c.blue = 255;

var win = new Window("dialog", "Color Picker Example");
var b = win.add("button", undefined, "Show Color Picker");
b.onClick = function () {
  pickedColor = app.showColorPicker(c);
  alert(pickedColor);
};
win.show();
