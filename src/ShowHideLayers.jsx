/*
ShowHideLayers.jsx for Adobe Illustrator
--------------------------------------

Show/Hide layers in Adobe Illustrator using find (regex enabled).

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
1.0.0 initial release
*/

//@target illustrator

var _title = "Show/Hide Layers";
var _version = "1.0.0";
var _copyright = "Copyright 2024 Josh Duncan";
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
      var find = settings.regex ? new RegExp(settings.find, "g") : settings.find;
      if (
        (settings.regex && find.test(layer.name)) ||
        layer.name.indexOf(settings.find) > -1
      ) {
        if ((settings.selected && layer.hasSelectedArtwork) || !settings.selected) {
          if (layer.visible != settings.visibility) {
            layer.visible = settings.visibility;
            changedLayers.push(i);
          }
        }
      }
    }
    alert("Visibility changed on " + changedLayers.length + " layer(s).");
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
  var pFind = win.add("panel", undefined, "Show/Hide Layers Matching");
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

  //group - search type
  var gType = pFind.add("group", undefined);
  gFind.alignChildren = ["left", "center"];
  var rbText = gType.add("radiobutton", undefined, "Plain Text");
  rbText.value = true;
  var rbRegex = gType.add("radiobutton", undefined, "Regular Expression");

  //checkbox - limit to layers with selected artwork
  var cbSelected = pFind.add(
    "checkbox",
    undefined,
    "Limit to layer(s) with selected artwork"
  );
  cbSelected.value = false;

  // panel - visibility
  var pVisibility = win.add("panel", undefined, "Visibility Settings");
  pVisibility.alignChildren = "fill";
  pVisibility.orientation = "column";
  pVisibility.margins = 18;
  var rbShow = pVisibility.add("radiobutton", undefined, "Show Matching Layer(s)");
  rbShow.value = true;
  var rbHide = pVisibility.add("radiobutton", undefined, "Hide Matching Layer(s)");

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

  find.onChanging = function () {
    if (find.text.length > 0) {
      btOK.enabled = true;
    } else {
      btOK.enabled = false;
    }
  };

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    return {
      visibility: rbShow.value,
      regex: rbRegex.value,
      find: find.text,
      selected: cbSelected.value,
    };
  } else {
    return;
  }
}
