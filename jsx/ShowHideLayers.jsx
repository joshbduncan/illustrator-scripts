/*
ShowHideLayers.jsx for Adobe Illustrator
----------------------------------------
Show or Hide layers in Adobe Illustrator using find (regex enabled).

Author
------
Josh Duncan
joshbduncan@gmail.com
https://joshbduncan.com
https://github.com/joshbduncan/

Wanna Support Me?
-----------------
Most of the things I make are free to download but if you would like
to support me that would be awesome and greatly appreciated!
https://joshbduncan.com/software.html

License
-------
This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog
---------
1.0.0 initial release
1.0.1 2025-06-20 refactor, bug fixes
*/

(function () {
  //@target illustrator

  var scriptTitle = "Show/Hide Layers";
  var scriptVersion = "1.0.1";
  var scriptCopyright = "Copyright 2025 Josh Duncan";
  var website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////

  /**
   * Open a url in the system browser.
   * @param {String} url URL to open.
   */
  function openURL(url) {
    var html = new File(Folder.temp.absoluteURI + "/aisLink.html");
    html.open("w");
    var htmlBody =
      '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' +
      url +
      '"></head><body><p></p></body></html>';
    html.write(htmlBody);
    html.close();
    html.execute();
  }

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and layers
  var doc = app.activeDocument;
  var layers = doc.layers;

  var settings = settingsWin();
  if (!settings) return;

  var changedLayers = [];
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var find = settings.regex ? new RegExp(settings.find, "g") : settings.find;
    if (
      (settings.regex && find.test(layer.name)) ||
      layer.name.indexOf(settings.find) > -1
    ) {
      if (
        (settings.selected && layer.hasSelectedArtwork) ||
        !settings.selected
      ) {
        if (layer.visible != settings.visibility) {
          layer.visible = settings.visibility;
          changedLayers.push(i);
        }
      }
    }
  }
  alert("Visibility changed on " + changedLayers.length + " layer(s).");

  function settingsWin() {
    // settings window
    var win = new Window("dialog");
    win.text = scriptTitle + " " + scriptVersion;
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
      "Limit to layer(s) with selected artwork",
    );
    cbSelected.value = false;

    // panel - visibility
    var pVisibility = win.add("panel", undefined, "Visibility Settings");
    pVisibility.alignChildren = "fill";
    pVisibility.orientation = "column";
    pVisibility.margins = 18;
    var rbShow = pVisibility.add(
      "radiobutton",
      undefined,
      "Show Matching Layer(s)",
    );
    rbShow.value = true;
    pVisibility.add("radiobutton", undefined, "Hide Matching Layer(s)");

    // group - window buttons
    var gWindowButtons = win.add("group", undefined);
    gWindowButtons.orientation = "row";
    gWindowButtons.alignChildren = ["Leftwards", "center"];
    gWindowButtons.alignment = ["center", "top"];
    var btOK = gWindowButtons.add("button", undefined, "OK");
    btOK.enabled = false;
    gWindowButtons.add("button", undefined, "Cancel");

    // Copyright
    var stCopyright = win.add(
      "statictext",
      undefined,
      scriptCopyright + " @ " + website,
      {
        name: "stCopyright",
      },
    );

    stCopyright.addEventListener("click", function () {
      openURL("https://joshbduncan.com");
    });

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
})();
