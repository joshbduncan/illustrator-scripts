/*
ArtboardToAi.jsx for Adobe Illustrator
--------------------------------------

Export the current artboard to a Ai file.

Changelog:
0.1.0 initial release
*/

(function () {
  //@target illustrator

  var _title = "Artboard to Ai";
  var _version = "0.1.0";
  var _copyright = "Copyright 2023 Josh Duncan";
  var _website = "joshbduncan.com";

  //@include "../include/OverwriteFileProtection.jsxinc"

  // define script variables
  var ab;
  var abIdx;
  var doc;
  var docFolder;
  var exportFolder;
  var exportName;
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

  // get the current artboard
  abIdx = doc.artboards.getActiveArtboardIndex();
  ab = doc.artboards[abIdx];

  // get the current file name
  fileName = doc.name.split(".")[0];

  // prompt for a filename
  exportName = prompt("Save File As", fileName + " - " + ab.name + ".ai");

  if (exportName === null) return;

  // strip off any extensions from the provided name
  exportName = exportName.replace(/\.pdf|\.ai|\.eps$/i, "");

  // set the final exportPath
  exportPath = new File(exportFolder + "/" + exportName + ".ai");

  // set up pdf save options
  saveOptions = new IllustratorSaveOptions();
  saveOptions.saveMultipleArtboards = true;
  saveOptions.artboardRange = abIdx + 1;

  // export the pdf file
  doc.saveAs(exportPath, saveOptions);
})();
