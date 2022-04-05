/*
ArtboardExporter.jsx for Adobe Illustrator
------------------------------------------
Export all artboards in a variety of ways.

This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog:
1.0.0 initial release
*/

// TODO: add option for PDF export
// TODO: add option to convert all text to outlines

var _title = "Illustrator Artboard Exporter";
var _version = "1.0.0";
var _copyright = "Copyright 2021 Josh Duncan";
var _website = "joshd.xyz";

// run script
if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var boards = doc.artboards;
  // check current document save location
  if (doc.path == "") {
    var startPath = "~/";
  } else {
    var startPath = doc.path;
  }
  // prompt for a save location
  var saveLoc = Folder.selectDialog("Artboard(s) Save Location", startPath);
  if (saveLoc) {
    // iterate over all artboards and save them
    for (var i = 0; i < boards.length; i++) {
      doc.artboards.setActiveArtboardIndex(i);
      ab = doc.artboards[i];
      abDoc = new File(saveLoc + "/" + ab.name);
      saveOpts = new IllustratorSaveOptions();
      saveOpts.saveMultipleArtboards = true;
      saveOpts.artboardRange = (i + 1).toString();
      doc.saveAs(abDoc, saveOpts);
    }
    alert("Artboards saved to:\n" + decodeURI(saveLoc));
  }
} else {
  alert("No documents open!\nCreate or open a document first.");
}
