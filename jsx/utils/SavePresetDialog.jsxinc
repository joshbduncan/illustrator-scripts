/**
 * Dialog for saving/overwriting presets.
 * @param {Array} currentOptions Current presets (can be overwritten).
 * @returns {String|Boolean} Preset name on OK, false on Cancel.
 */
function savePresetDialog(currentOptions) {
  var win = new Window("dialog");
  win.text = "Save Settings";
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.margins = 18;

  win.add("statictext", undefined, "Save current settings as:");
  var name = win.add("edittext");
  name.preferredSize.width = 250;
  name.active = true;

  var cbReplace = win.add("checkbox", undefined, "Replace settings:");
  var replace = win.add("dropdownlist", undefined, currentOptions);
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

  btOK.onClick = function () {
    var saveName = name.text;

    if (!cbReplace.value) {
      // check to ensure a name was provided
      if (saveName.length == 0) {
        alert(
          "No name provided!\nMake sure to provide a save name or pick a current present to replace.",
        );
        return;
      }

      // check to see if preset already exist
      for (var i = 0; i < currentOptions.length; i++) {
        if (saveName == currentOptions[i]) {
          alert(
            "Preset Already Exist\nPreset '" +
              saveName +
              "' has already been saved. To overwrite your currently saved settings, use the 'Replace Settings' method.",
          );
          cbReplace.notify("onClick");
          replace.selection = replace.find(saveName);
          return;
        }
      }
    }

    win.close(1);
  };

  // if "ok" button clicked then return savename
  if (win.show() == 1) {
    var saveName;
    if (cbReplace.value && replace.selection) {
      saveName = replace.selection.text;
    } else if (!cbReplace.value && name.text) {
      saveName = name.text;
    }
    return saveName;
  } else {
    return false;
  }
}
