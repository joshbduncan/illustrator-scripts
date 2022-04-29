/*
ScreenSepMarks.jsx for Adobe Illustrator
---------------------------------------
Easily add screen printing registration marks
and spot color info to the current document.

This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog:
1.0.0 initial release
1.0.1 updated placement from dropdown to anchor checkboxes
1.0.2 added unit specifier to size, stroke, and inset along with converter function
1.0.3 added custom color selector
1.0.4 added file info, date, and time output options
1.0.5 rebuilt entire setting dialog
1.0.6 last used settings now save to preferences and auto-load on next run
1.1.0 added save/delete presets feature with a new save/replace dialog
1.1.1 setup defaults `[Default]` that save to preferences and load on first run, can be updated by user
1.1.2 took previous last used setting and added them to dropdown selection as [Last Used]
1.1.3 any changes to settings now empties preset dropdown selection to clear confusion
1.1.4 cleaned up a bug when not spot colors were found or no info was requested
*/

var _title = "Screen Print Separation Marks";
var _version = "1.1.4";
var _copyright = "Copyright 2022 Josh Duncan";
var _website = "joshd.xyz";

// set default settings for first run
defaults = {
  tl: false,
  tc: true,
  tr: false,
  cl: false,
  cc: false,
  cr: false,
  bl: false,
  bc: true,
  br: false,
  size: 0.5,
  sizeUnit: "Inches",
  stroke: 1.0,
  strokeUnit: "Points",
  inset: 0.25,
  insetUnit: "Inches",
  color: "[Registration]",
  spots: true,
  file: false,
  date: false,
  time: false,
  position: "Top",
  alignment: "Left",
};

// run script
if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var swatches = doc.swatches;
  var spotColors = getSpotColors();
  var arrSettings = [];

  // check to see if [default] presets are already saved
  if (!app.preferences.getStringPreference("ssmSettings")) {
    writeSettings("[Default]", defaults);
  }

  // load all stored settings names
  arrSettings = app.preferences.getStringPreference("ssmSettings").split(",");

  // load last used or default settings
  var loadedSettingsName, loadedSettings;
  if (indexOf(arrSettings, "[Last Used]") >= 0) {
    loadedSettingsName = "[Last Used]";
  } else {
    loadedSettingsName = "[Default]";
  }

  // display the script settings dialog
  var settings = settingsWindow();
  if (settings) {
    draw();
  }
} else {
  alert("No documents open!\nCreate or open a document first.");
}

// ----------------
// helper functions
// ----------------

function indexOf(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      return i;
    }
  }
  return -1;
}

function getSpotColors(value) {
  var arr = [];
  for (var i = 0; i < swatches.length; i++) {
    if (swatches[i].color == "[SpotColor]") {
      if (value == "name") {
        arr.push(swatches[i].name);
      } else {
        arr.push(swatches[i]);
      }
    }
  }
  return arr;
}

function toPoints(val, unit) {
  if (unit == "Inches") {
    return val * 72;
  } else if (unit == "mm") {
    return (val / 25.4) * 72;
  } else {
    return val;
  }
}

function checkForColor(name) {
  for (var i = 0; i < spotColors.length; i++) {
    if (spotColors[i].name == name) {
      return swatches.getByName(name);
    }
  }
  return swatches["[Registration]"].color;
}

// -----------------------
// presets and preferences
// -----------------------

function writePresetNames() {
  app.preferences.setStringPreference("ssmSettings", arrSettings.join(","));
}

function writeSettings(name, dict) {
  var arr = [];
  for (var key in dict) {
    if (dict.hasOwnProperty(key)) {
      arr.push(key + ":" + dict[key]);
    }
  }
  app.preferences.setStringPreference("ssm" + name, arr.join());
  if (indexOf(arrSettings, name) < 0) {
    arrSettings.push(name);
  }
  writePresetNames();
}

function readSettings(name) {
  var arr = app.preferences.getStringPreference("ssm" + name).split(",");
  var dict = {};
  var itemParts;
  for (var i = 0; i < arr.length; i++) {
    itemParts = arr[i].split(":");
    dict[itemParts[0]] = itemParts[1];
  }
  return dict;
}

function deleteSettings(name) {
  app.preferences.removePreference("ssm" + name);
  nameLoc = indexOf(arrSettings, name);
  arrSettings.splice(nameLoc, 1);
  writePresetNames();
}

// ---------------------
// main script functions
// ---------------------

function draw() {
  // check for previous sepmarks layer and delete them
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name.search("SEPMARKS") >= 0) {
      doc.layers[i].locked = false;
      doc.layers[i].remove();
    }
  }

  // reset ruler so math works
  doc.rulerOrigin = [0, doc.height];

  // make new layer to hold info items
  var layer = doc.layers.add();
  layer.name = "SEPMARKS";

  // convert provided inputs to points
  var size = toPoints(settings.size, settings.sizeUnit);
  var stroke = toPoints(settings.stroke, settings.strokeUnit);
  var inset = toPoints(settings.inset, settings.insetUnit);

  // make sure spot color is available
  var color = checkForColor(settings.color);

  // draw registration marks
  if (settings.tl) {
    makeReg(inset + size / 2, inset + size / 2, size, color, stroke);
  }
  if (settings.tc) {
    makeReg(doc.width / 2, inset + size / 2, size, color, stroke);
  }
  if (settings.tr) {
    makeReg(doc.width - inset - size / 2, inset + size / 2, size, color, stroke);
  }
  if (settings.cl) {
    makeReg(inset + size / 2, doc.height / 2, size, color, stroke);
  }
  if (settings.cr) {
    makeReg(doc.width - inset - size / 2, doc.height / 2, size, color, stroke);
  }
  if (settings.bl) {
    makeReg(inset + size / 2, doc.height - inset - size / 2, size, color, stroke);
  }
  if (settings.bc) {
    makeReg(doc.width / 2, doc.height - inset - size / 2, size, color, stroke);
  }
  if (settings.br) {
    makeReg(
      doc.width - inset - size / 2,
      doc.height - inset - size / 2,
      size,
      color,
      stroke
    );
  }

  // add output info
  if (settings.spots || settings.file || settings.date || settings.time) {
    writeInfo(
      settings.position,
      settings.alignment,
      settings.spots,
      settings.file,
      settings.date,
      settings.time
    );
  }

  // place layer in correct position and lock it
  layer.zOrderPosition = -1;
  layer.locked = true;
}

function makeReg(x, y, size, color, strokeWeight) {
  // make a group to hold reg mark parts
  var regGroup = doc.groupItems.add();
  // draw circle part
  var circle = regGroup.pathItems.ellipse(
    -y + size / 2 / 2,
    x - size / 2 / 2,
    size / 2,
    size / 2
  );
  circle.strokeColor = color.color;
  circle.stroked = true;
  circle.strokeWidth = strokeWeight;
  circle.filled = false;
  // draw x-line part
  var xLine = regGroup.pathItems.add();
  xLine.setEntirePath([
    [x - size / 2, -y],
    [x + size / 2, -y],
  ]);
  xLine.strokeColor = color.color;
  xLine.stroked = true;
  xLine.strokeWidth = strokeWeight;
  xLine.filled = false;
  // draw y-line part
  var yLine = regGroup.pathItems.add();
  yLine.setEntirePath([
    [x, -y + size / 2],
    [x, -y - size / 2],
  ]);
  yLine.strokeColor = color.color;
  yLine.stroked = true;
  yLine.strokeWidth = strokeWeight;
  yLine.filled = false;
}

function writeInfo(location, alignment, spots, file, date, time) {
  // check where info should be placed
  var topEdge = 0;
  var baselineShift = 0;
  if (location == "Bottom") {
    topEdge = -doc.height + 12;
    baselineShift = 0;
  }

  var infoSections = [];
  var spotColorNames = [];
  // insert spot color info first
  if (spots && spotColors.length > 1) {
    for (var i = 1; i < spotColors.length; i++) {
      var swatchName = spotColors[i].name.replace(/ /g, "_").toUpperCase();
      spotColorNames.push(swatchName);
    }
    infoSections.push(spotColorNames.join(" "));
  }
  // then file information
  if (file) {
    infoSections.push(doc.name);
  }
  // then date and time information
  var timestamp = new Date();
  var dateText =
    timestamp.getFullYear() +
    "-" +
    ("0" + (timestamp.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + (timestamp.getDate() + 1)).slice(-2);
  var timeText =
    ("0" + (timestamp.getHours() + 1)).slice(-2) +
    ":" +
    ("0" + (timestamp.getMinutes() + 1)).slice(-2) +
    ":" +
    ("0" + (timestamp.getSeconds() + 1)).slice(-2);
  if (date && time) {
    infoSections.push(dateText + " @ " + timeText);
  } else if (date) {
    infoSections.push(dateText);
  } else if (time) {
    infoSections.push(timeText);
  }

  if (infoSections.length > 0) {
    // add a text frame to the document
    var infoRec = doc.pathItems.rectangle(topEdge, 0, doc.width, 12);
    var info = doc.textFrames.areaText(infoRec);
    info.contents = infoSections.join(" -- ");
    info.textRange.baselineShift = baselineShift;
    info.textRange.characterAttributes.size = 9;
    info.textRange.fillColor = swatches["[Registration]"].color;

    // recolor the text using the correct spot color
    if (spots) {
      for (var j = 0; j < spotColors.length - 1; j++) {
        info.words[j].filled = true;
        info.words[j].fillColor = spotColors[j + 1].color;
      }
    }

    // shift the spot colors if colliding with file name
    if (alignment == "Left") {
      info.textRange.justification = Justification.LEFT;
    } else if (alignment == "Right") {
      info.textRange.justification = Justification.RIGHT;
    } else {
      info.textRange.justification = Justification.CENTER;
    }
  }
}

// ------------
// user dialogs
// ------------

function settingsWindow() {
  var currentSettings;

  // dropdown options
  var arrUnits = ["Inches", "Points", "mm"];
  var arrColors = getSpotColors("name");
  var arrPosition = ["Top", "Bottom"];
  var arrAlignment = ["Left", "Center", "Right"];

  // settings window
  var win = new Window("dialog");
  win.text = _title + " " + _version;
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.margins = 18;

  // panel - registration
  var pRegistration = win.add("panel", undefined, "Registration Marks");
  pRegistration.orientation = "row";
  pRegistration.alignChildren = ["left", "top"];
  pRegistration.margins = 18;

  // panel - placement
  var pPlacement = pRegistration.add("panel", undefined, "Placement");
  pPlacement.orientation = "column";
  pPlacement.alignChildren = ["left", "top"];
  pPlacement.spacing = 22;
  pPlacement.margins = 28;

  // group - top
  var gTop = pPlacement.add("group", undefined);
  gTop.orientation = "row";
  gTop.alignChildren = ["center", "center"];
  gTop.spacing = 20;
  gTop.alignment = ["center", "top"];
  var tl = gTop.add("checkbox", undefined);
  var tc = gTop.add("checkbox", undefined);
  var tr = gTop.add("checkbox", undefined);

  // group - center
  var gCenter = pPlacement.add("group", undefined);
  gCenter.orientation = "row";
  gCenter.alignChildren = ["center", "center"];
  gCenter.spacing = 20;
  gCenter.alignment = ["center", "top"];
  var cl = gCenter.add("checkbox", undefined);
  var cc = gCenter.add("checkbox", undefined);
  cc.enabled = false;
  var cr = gCenter.add("checkbox", undefined);

  // group - bottom
  var gBottom = pPlacement.add("group", undefined);
  gBottom.orientation = "row";
  gBottom.alignChildren = ["center", "center"];
  gBottom.spacing = 20;
  gBottom.alignment = ["center", "top"];
  var bl = gBottom.add("checkbox", undefined);
  var bc = gBottom.add("checkbox", undefined);
  var br = gBottom.add("checkbox", undefined);

  // panel - specs
  var pSpecs = pRegistration.add("panel", undefined, "Specs");
  pSpecs.orientation = "column";
  pSpecs.alignChildren = ["left", "top"];
  pSpecs.margins = 18;

  // group - size
  var gSize = pSpecs.add("group", undefined);
  gSize.alignChildren = ["left", "center"];
  var stSize = gSize.add("statictext", undefined, "Size:");
  stSize.preferredSize.width = 45;
  var size = gSize.add('edittext {justify: "center"}');
  size.preferredSize.width = 60;
  var sizeUnit = gSize.add("dropdownlist", undefined, arrUnits);
  sizeUnit.preferredSize.width = 70;

  // group - stroke
  var gStroke = pSpecs.add("group", undefined);
  gStroke.alignChildren = ["left", "center"];
  var stStroke = gStroke.add("statictext", undefined, "Stroke:");
  stStroke.preferredSize.width = 45;
  var stroke = gStroke.add('edittext {justify: "center"}');
  stroke.preferredSize.width = 60;
  var strokeUnit = gStroke.add("dropdownlist", undefined, arrUnits);
  strokeUnit.preferredSize.width = 70;

  // group - inset
  var gInset = pSpecs.add("group", undefined);
  gInset.alignChildren = ["left", "center"];
  var stInset = gInset.add("statictext", undefined, "Inset:");
  stInset.preferredSize.width = 45;
  var inset = gInset.add('edittext {justify: "center"}');
  inset.preferredSize.width = 60;
  var insetUnit = gInset.add("dropdownlist", undefined, arrUnits);
  insetUnit.preferredSize.width = 70;

  // group - color
  var gColor = pSpecs.add("group", undefined);
  var stColor = gColor.add("statictext", undefined, "Color:");
  stColor.preferredSize.width = 45;
  var color = gColor.add("dropdownlist", undefined, arrColors);

  // panel - output
  var pOutput = win.add("panel", undefined, "Output Information");
  pOutput.orientation = "column";
  pOutput.alignChildren = ["fill", "top"];
  pOutput.margins = 18;

  // group - outputoptions
  // ==============
  var gOutputOptions = pOutput.add("group", undefined);
  gOutputOptions.orientation = "row";
  gOutputOptions.alignChildren = ["left", "center"];

  var spots = gOutputOptions.add("checkbox", undefined, "Spot Colors");
  var file = gOutputOptions.add("checkbox", undefined, "File Info");
  var date = gOutputOptions.add("checkbox", undefined, "Date");
  var time = gOutputOptions.add("checkbox", undefined, "Time");

  // group - outputposition
  var gOutputPosition = pOutput.add("group", undefined);

  // group - position
  var gPosition = gOutputPosition.add("group", undefined);
  var stPosition = gPosition.add("statictext", undefined, "Position:");
  var position = gPosition.add("dropdownlist", undefined, arrPosition);
  position.preferredSize.width = 100;

  // group - alignment
  var gAlignment = gOutputPosition.add("group", undefined);
  var stAlignment = gAlignment.add("statictext", undefined, "Alignment:");
  var alignment = gAlignment.add("dropdownlist", undefined, arrAlignment);
  alignment.preferredSize.width = 100;

  // panel - settings
  var pSettings = win.add("panel", undefined, "Settings");
  pSettings.orientation = "column";
  pSettings.alignChildren = ["left", "top"];
  pSettings.margins = 18;

  // group - settings
  var gSettings = pSettings.add("group", undefined);
  gSettings.orientation = "row";
  gSettings.alignChildren = ["left", "center"];

  var stLoad = gSettings.add("statictext", undefined, "Load:");

  var settings = gSettings.add("dropdownlist", undefined, arrSettings);
  settings.preferredSize.width = 200;

  var btDelete = gSettings.add("button", undefined, "Delete");
  btDelete.enabled = false;
  btDelete.preferredSize.width = 70;

  var btSave = gSettings.add("button", undefined, "Save");
  btSave.preferredSize.width = 70;

  // group - windowbuttons
  var gWindowButtons = win.add("group", undefined);
  gWindowButtons.orientation = "row";
  gWindowButtons.alignChildren = ["left", "center"];
  gWindowButtons.alignment = ["center", "top"];

  var btOK = gWindowButtons.add("button", undefined, "OK");
  var btCancel = gWindowButtons.add("button", undefined, "Cancel");

  // panel - info
  var pInfo = win.add("panel", undefined);
  pInfo.orientation = "column";
  pInfo.alignChildren = ["center", "top"];

  var stCopyright = pInfo.add("statictext", undefined);
  stCopyright.text = _copyright + " @ " + _website;

  // onclick/onchange operations

  // load saved settings
  settings.onChange = function () {
    if (settings.selection) {
      var settingsValue = settings.selection.text;
      if (settingsValue) {
        // load in the selected settings
        loadedSettings = readSettings(settingsValue);

        // enable delete button if selection is not a built-in
        if (settingsValue == "[Default]" || settingsValue == "[Last Used]") {
          btDelete.enabled = false;
        } else {
          btDelete.enabled = true;
        }

        // placement checkbox setters
        tl.value = loadedSettings.tl == "true" ? true : false;
        tc.value = loadedSettings.tc == "true" ? true : false;
        tr.value = loadedSettings.tr == "true" ? true : false;
        cl.value = loadedSettings.cl == "true" ? true : false;
        cc.value = loadedSettings.cc == "true" ? true : false;
        cr.value = loadedSettings.cr == "true" ? true : false;
        bl.value = loadedSettings.bl == "true" ? true : false;
        bc.value = loadedSettings.bc == "true" ? true : false;
        br.value = loadedSettings.br == "true" ? true : false;

        // edittext value setters
        spots.value = loadedSettings.spots == "true" ? true : false;
        file.value = loadedSettings.file == "true" ? true : false;
        date.value = loadedSettings.date == "true" ? true : false;
        time.value = loadedSettings.time == "true" ? true : false;

        // input value setters
        size.text = loadedSettings.size;
        stroke.text = loadedSettings.stroke;
        inset.text = loadedSettings.inset;

        // dropdown value setters
        sizeUnit.selection = indexOf(arrUnits, loadedSettings.sizeUnit);
        strokeUnit.selection = indexOf(arrUnits, loadedSettings.strokeUnit);
        insetUnit.selection = indexOf(arrUnits, loadedSettings.insetUnit);
        color.selection = color.find(loadedSettings.color)
          ? color.find(loadedSettings.color)
          : color.find("[Registration]");
        position.selection = indexOf(arrPosition, loadedSettings.position);
        alignment.selection = indexOf(arrAlignment, loadedSettings.alignment);
      }
    }
  };

  // save current settings
  btSave.onClick = function () {
    currentSettings = {
      tl: tl.value,
      tc: tc.value,
      tr: tr.value,
      cl: cl.value,
      cc: cc.value,
      cr: cr.value,
      bl: bl.value,
      bc: bc.value,
      br: br.value,
      size: size.text,
      sizeUnit: sizeUnit.selection.text,
      stroke: stroke.text,
      strokeUnit: strokeUnit.selection.text,
      inset: inset.text,
      insetUnit: insetUnit.selection.text,
      color: color.selection.text,
      spots: spots.value,
      file: file.value,
      date: date.value,
      time: time.value,
      position: position.selection.text,
      alignment: alignment.selection.text,
    };
    var saveName = saveSettingsWindow(currentSettings);

    if (saveName) {
      // add new name to settings dropdown if not a replace
      if (!settings.find(saveName)) {
        settings.add("item", saveName);
      }
      // reset selection setting to new preset
      settings.selection = settings.find(saveName);
    }
  };

  // delete selected settings
  btDelete.onClick = function () {
    deleteSettings(settings.selection.text);
    deletedSettingsWindow(settings.selection.text);
    settings.remove(settings.find(settings.selection.text));
  };

  // load [default] settings
  settings.selection = indexOf(arrSettings, loadedSettingsName);

  // settings reset to null with any changes
  var onClickResets = [tl, tc, tr, cl, cc, cr, bl, bc, br, spots, file, date, time];

  for (var i = 0; i < onClickResets.length; i++) {
    onClickResets[i].onClick = function () {
      settings.selection = null;
      btDelete.enabled = false;
    };
  }

  var onChangeResets = [
    size,
    sizeUnit,
    stroke,
    strokeUnit,
    inset,
    insetUnit,
    color,
    position,
    alignment,
  ];

  for (var i = 0; i < onChangeResets.length; i++) {
    onChangeResets[i].onChange = function () {
      settings.selection = null;
      btDelete.enabled = false;
    };
  }

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    currentSettings = {
      tl: tl.value,
      tc: tc.value,
      tr: tr.value,
      cl: cl.value,
      cc: cc.value,
      cr: cr.value,
      bl: bl.value,
      bc: bc.value,
      br: br.value,
      size: size.text,
      sizeUnit: sizeUnit.selection.text,
      stroke: stroke.text,
      strokeUnit: strokeUnit.selection.text,
      inset: inset.text,
      insetUnit: insetUnit.selection.text,
      color: color.selection.text,
      spots: spots.value,
      file: file.value,
      date: date.value,
      time: time.value,
      position: position.selection.text,
      alignment: alignment.selection.text,
    };
    writeSettings("[Last Used]", currentSettings);
    return currentSettings;
  } else {
    return;
  }
}

function saveSettingsWindow(settings) {
  var win = new Window("dialog");
  win.text = "Save Settings";
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.margins = 18;

  var stSave = win.add("statictext", undefined, "Save current settings as:");
  var name = win.add("edittext");
  name.preferredSize.width = 250;

  var cbReplace = win.add("checkbox", undefined, "Replace settings:");
  var replace = win.add("dropdownlist", undefined, arrSettings);
  replace.enabled = false;
  replace.preferredSize.width = 250;

  // remove [last used] since it shouldn't be overwritten
  replace.remove(replace.find("[Last Used]"));

  cbReplace.onClick = function () {
    replace.enabled = cbReplace.value ? true : false;
    name.enabled = cbReplace.value ? false : true;
  };

  // window buttons
  var gWindowButtons = win.add("group", undefined);
  gWindowButtons.orientation = "row";
  gWindowButtons.alignChildren = ["left", "center"];
  gWindowButtons.alignment = ["center", "top"];

  var btOK = gWindowButtons.add("button", undefined, "OK");
  var btCancel = gWindowButtons.add("button", undefined, "Cancel");

  // if "ok" button clicked then return savename
  if (win.show() == 1) {
    var saveName;
    if (cbReplace.value && replace.selection) {
      saveName = replace.selection.text;
    } else if (!cbReplace.value && name.text) {
      saveName = name.text;
    } else {
      alert(
        "No name provided!\nMake sure to provide a save name or pick a current present to replace."
      );
      return false;
    }
    writeSettings(saveName, settings);
    return saveName;
  } else {
    return false;
  }
}

function deletedSettingsWindow(name) {
  var win = new Window("dialog");
  win.text = "Deleted Settings";
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.margins = 18;

  var st = win.add(
    "statictext",
    undefined,
    "Settings preset " + name + " was deleted."
  );

  // window buttons
  var gWindowButtons = win.add("group", undefined);
  gWindowButtons.orientation = "row";
  gWindowButtons.alignChildren = ["left", "center"];
  gWindowButtons.alignment = ["center", "top"];

  var btOK = gWindowButtons.add("button", undefined, "OK");

  win.show();
}
