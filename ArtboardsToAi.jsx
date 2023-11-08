/*
ArtboardsToAi.jsx for Adobe Illustrator
---------------------------------------

Export the all artboards to a Ai files.

Changelog:
0.1.0 initial release
*/

(function () {
  //@target illustrator

  var _title = "Artboard to Ai";
  var _version = "0.1.0";
  var _copyright = "Copyright 2023 Josh Duncan";
  var _website = "joshbduncan.com";

  //@include "include/OverwriteFileProtection.jsxinc"

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

  // set up pdf save options
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

    // export the pdf file
    doc.saveAs(exportPath, saveOptions);

    // remove the old file
    exportPath.remove();

    // rename the file to remove the appended artboard name
    exportPath = new File(exportFolder + "/" + ab.name + "_" + ab.name + ".ai");
    exportPath.rename(ab.name + ".ai");
  }
})();
