(function () {
  //@target illustrator

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // get the current document and it's path (if saved)
  var doc = app.activeDocument;
  var docFolder = new Folder(doc.path == "" ? "~/" : doc.path);

  // get the current artboard
  var abIdx = doc.artboards.getActiveArtboardIndex();
  var ab = doc.artboards[abIdx];

  // strip off any extensions from the provided name
  var exportName = doc.name.replace(/\.pdf|\.ai|\.eps$/i, "");

  // set the final exportPath
  var exportPath = new File(docFolder + "/" + exportName + ".pdf");

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
})();
