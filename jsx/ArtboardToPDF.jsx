/*
ArtboardToPDF.jsx for Adobe Illustrator
---------------------------------------
Export the current artboard to a PDF file.

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
0.1.0 2023-11-08 initial release
*/

(function () {
  //@target illustrator

  //////////////
  // INCLUDES //
  //////////////

  /**
   * If a file already exists, prompt for permission to overwrite it.
   * @param {File} file ExtendScript file constructor.
   * @returns {Boolean} Is it okay to overwrite the file.
   */
  function overwriteFileProtection(file) {
    if (
      file.exists &&
      !Window.confirm(
        "File already exists!\nOverwrite " + decodeURI(file.name) + "?",
        "noAsDflt",
        "File Already Exists",
      )
    )
      return false;
    return true;
  }

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // get the current document and it's path (if saved)
  var doc = app.activeDocument;
  var docFolder = new Folder(doc.path == "" ? "~/" : doc.path);

  // prompt for the file export location (defaults to document location)
  var exportFolder = Folder.selectDialog("Save Location", docFolder);

  if (exportFolder === null) return;

  // get the current artboard
  var abIdx = doc.artboards.getActiveArtboardIndex();
  var ab = doc.artboards[abIdx];

  // prompt for a filename
  var exportName = prompt("Save File As", ab.name + ".pdf");

  if (exportName === null) return;

  // strip off any extensions from the provided name
  exportName = exportName.replace(/\.pdf|\.ai|\.eps$/i, "");

  // set the final exportPath
  var exportPath = new File(exportFolder + "/" + exportName + ".pdf");

  // overwrite protection
  if (!overwriteFileProtection(exportPath)) return;

  // set up save options
  var saveOptions = new PDFSaveOptions();
  saveOptions.compatibility = PDFCompatibility.ACROBAT7;
  saveOptions.preserveEditability = false;
  saveOptions.pDFPreset = "[Illustrator Default]";
  saveOptions.artboardRange = (abIdx + 1).toString();

  // export the file
  doc.saveAs(exportPath, saveOptions);
})();
