/*
ArtboardsToAi.jsx for Adobe Illustrator
---------------------------------------

Export all artboards to individual Ai files.

Copyright 2024 Josh Duncan
https://joshbduncan.com

See README.md for more info

This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog:
0.1.0 initial release
*/

(function () {
  //@target illustrator

  /**
   * If a file already exists, prompt for permission to overwrite.
   * @param   {FileObject} file ExtendScript file constructor.
   * @returns {Boolean}         Is it okay to overwrite the file.
   */
  function OverwriteFileProtection(file) {
    if (
      file.exists &&
      !Window.confirm(
        "File already exists!\nOverwrite " + decodeURI(file.name) + "?",
        "noAsDflt",
        "File Already Exists"
      )
    )
      return false;
    return true;
  }

  // define script variables
  var ab;
  var doc;
  var docFolder;
  var exportFolder;
  var exportPath;
  var fileName;
  var saveOptions;

  // pick a folder to save the file
  if (app.documents.length > 0) {
    // get the current document and it's path (if saved)
    doc = app.activeDocument;
    docFolder = new Folder(doc.path == "" ? "~/" : doc.path);
    // prompt for the file export location (defaults to document location)
    exportFolder = Folder.selectDialog("Save Location", docFolder);
  }

  if (exportFolder === null) return;

  // get the current file name
  fileName = doc.name.split(".")[0];

  // set up save options
  saveOptions = new IllustratorSaveOptions();
  saveOptions.saveMultipleArtboards = true;

  for (var i = 0; i < doc.artboards.length; i++) {
    // set the current artboard
    doc.artboards.setActiveArtboardIndex(i);
    ab = doc.artboards[i];
    saveOptions.artboardRange = i + 1;

    // set the final exportPath
    exportPath = new File(exportFolder + "/" + ab.name + ".ai");

    // overwrite protection
    if (!OverwriteFileProtection(exportPath)) continue;

    // export the file
    doc.saveAs(exportPath, saveOptions);

    // remove the old file
    exportPath.remove();

    // rename the file to remove the appended artboard name
    exportPath = new File(exportFolder + "/" + ab.name + "_" + ab.name + ".ai");
    exportPath.rename(ab.name + ".ai");
  }
})();
