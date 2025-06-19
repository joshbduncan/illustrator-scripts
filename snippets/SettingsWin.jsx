var nameFile = new File("~/Downloads/CustomNumber.json"); // this is for testing on my Mac machine
var loadedCustomNumber = nameFile.exists ? readJSONData(nameFile) : "";

var customNumber = settingsWin(loadedCustomNumber);
if (customNumber) {
  alert(customNumber);
}

function settingsWin(loadedCustomNumber) {
  var enWin = new Window("dialog");
  enWin.orientation = "column";
  enWin.alignChildren = ["center", "top"];
  enWin.spacing = 15;
  enWin.margins = [10, 10, 10, 10];

  // PANEL1
  // ======
  var panel1 = enWin.add("panel", undefined, undefined, { name: "panel1" });
  panel1.text = "Custom Number";
  panel1.orientation = "column";
  panel1.alignChildren = ["left", "top"];
  panel1.spacing = 10;
  panel1.margins = 10;

  var eN = panel1.add('edittext {justify: "center", properties: {name: "eN"}}');
  eN.active = true;
  eN.text = loadedCustomNumber;
  eN.preferredSize.width = 150;
  eN.preferredSize.height = 30;

  // BUTTONGROUP
  // ===========
  var buttonGroup = enWin.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["right", "center"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  var saveButton = buttonGroup.add("button", undefined, undefined, {
    name: "OK",
  });
  saveButton.text = "Save";
  saveButton.preferredSize.width = 125;
  // if "save" button clicked then return inputs
  if (enWin.show() == 1) {
    // only write the custom number to file if
    // it's different than what is already saved
    if (eN.text != loadedCustomNumber) {
      writeJSONData(eN.text, nameFile);
    }
    // return the result in case you need it later in the script
    return eN.text;
  } else {
    return;
  }
}

// write json "type" date to a file
function writeJSONData(obj, file) {
  var data = obj.toSource();
  try {
    file.encoding = "UTF-8";
    file.open("w");
    file.write(data);
  } catch (e) {
    alert("Error writing file " + file + "!");
  } finally {
    file.close();
  }
}

// read json "type" data from a file
function readJSONData(file) {
  var obj, json;
  try {
    file.encoding = "UTF-8";
    file.open("r");
    json = file.read();
    file.close();
  } catch (e) {
    alert("Error loading " + file + " file!");
  }
  obj = eval(json);
  return obj;
}
