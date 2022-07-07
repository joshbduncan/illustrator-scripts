/*
RenameLayers.jsx for Adobe Illustrator
--------------------------------------
Rename layers in Adobe Illustrator using find and replace (regex enabled).

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
*/

#target Illustrator

var _title = "Rename Layers";
var _version = "1.0.0";
var _copyright = "Copyright 2022 Josh Duncan";
var _website = "joshbduncan.com";

// -----------
// main script
// -----------

// run script
if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var layers = doc.layers;
  var settings = settingsWin();
  if (settings) {
    var changedLayers = [];
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var find = settings.regex ? new RegExp(settings.find, "g") : settings.find
      if ( (settings.regex && find.test(layer.name)) || (layer.name.indexOf(settings.find) > -1) ) {
        if ( (settings.selected && layer.hasSelectedArtwork) || (!settings.selected) ) {
          layer.name = layer.name.replace(find, settings.replace);
          changedLayers.push(i)
        }
      }
    }
    alert("Renamed " + changedLayers.length + " layer(s).")
  }
} else {
alert("No documents open!\nCreate or open a document first.");
}

function settingsWin() {
  // settings window
  var win = new Window("dialog");
  win.text = _title + " " + _version;
  win.orientation = "column";
  win.alignChildren = "fill";

  // panel - find
  var pFind = win.add("panel", undefined, "Rename Layers Matching");
  pFind.orientation = "column";
  pFind.alignChildren = ["left", "top"];
  pFind.margins = 18;

  // group - find
  var gFind = pFind.add("group", undefined);
  gFind.alignChildren = ["left", "center"];
  var stFind = gFind.add("statictext", undefined, "Find:");
  stFind.preferredSize.width = 55;
  var find = gFind.add("edittext", undefined, "");
  find.preferredSize.width = 200;

  // group - replace
  var gReplace = pFind.add("group", undefined);
  gReplace.alignChildren = ["left", "center"];
  var stReplace = gReplace.add("statictext", undefined, "Replace:");
  stReplace.preferredSize.width = 55;
  var replace = gReplace.add("edittext", undefined, "");
  replace.preferredSize.width = 200;

  //group - search type
  var gType = pFind.add("group", undefined);
  gType.alignChildren = ["left", "center"];
  var rbText = gType.add("radiobutton", undefined, "Plain Text");
  rbText.value = true;
  var rbRegex = gType.add("radiobutton", undefined, "Regular Expression");

  //checkbox - limit to layers with selected artwork
  var cbSelected = pFind.add("checkbox", undefined, "Limit to layer(s) with selected artwork");
  cbSelected.value = false;

  // group - window buttons
  var gWindowButtons = win.add("group", undefined);
  gWindowButtons.orientation = "row";
  gWindowButtons.alignChildren = ["Leftwards", "center"];
  gWindowButtons.alignment = ["center", "top"];
  var btOK = gWindowButtons.add("button", undefined, "OK");
  btOK.enabled = false;
  var btCancel = gWindowButtons.add("button", undefined, "Cancel");

  // copyright info
  var pCopyright = win.add("panel", undefined);
  pCopyright.orientation = "column";
  pCopyright.add("statictext", undefined, "Version " + _version + " " + _copyright);
  pCopyright.add("statictext", undefined, _website);

  find.onChanging = function() {
    if (find.text.length > 0) {
      btOK.enabled = true;
    } else {
      btOK.enabled = false;
    }
  }

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    return {
      "regex": rbRegex.value,
      "find": find.text,
      "replace": replace.text,
      "selected": cbSelected.value
    }
  } else {
    return;
  }

}