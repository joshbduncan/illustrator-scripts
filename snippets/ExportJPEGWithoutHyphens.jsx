/*
ExportJPEGWithoutHyphens.jsx for Adobe Illustrator
--------------------------------------------------

Export an RGB JPEG bound to the artboard at 300 ppi without hyphens in the exported file name.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/export-for-screens-keeps-adding-artboard-name-in-the-file-suffix-how-to-remove-possible-script/td-p/15605169
*/

(function () {
  //@target illustrator

  // No need to continue if there is no active document.
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // Get the current document and it's path (if saved).
  var doc = app.activeDocument;
  var docFolder = doc.path == "" ? Folder.desktop : new Folder(doc.path);

  // Strip off any extensions from the document name and change the spaces to hyphens.
  var exportName = doc.name.replace(/\.pdf|\.ai|\.eps$/i, "") + ".jpg";
  var exportNameHyphenated = exportName.replace(/ +/g, "-");

  // Set export files.
  var exportFile = new File(docFolder + "/" + exportName);
  var exportFileHyphenated = new File(docFolder + "/" + exportNameHyphenated);

  // Since we are "hacking" the naming of the exported file, there is a situation when
  // you have already exported the file, then rerun the script and it will not remove
  // the hyphens from the name. This block, first checks to see if the "about to be" exported
  // file already exists on the system and if so, will get confirmation from the user
  // to overwrite the existing file before continuing.
  if (exportFile.exists) {
    if (
      Window.confirm(
        "File already exists!\nOverwrite " + decodeURI(exportFile.name) + "?",
        "noAsDflt",
        "File Already Exists",
      )
    ) {
      exportFile.remove();
    } else {
      return;
    }
  }

  // Calculate scale factor for 300 ppi (sized) image.
  var scaleFactor = 300 / 72;

  // Set jpeg export options. docs:https://ai-scripting.docsforadobe.dev/jsobjref/ExportOptionsJPEG/
  var opts = new ExportOptionsJPEG();
  opts.antiAliasing = true;
  opts.artBoardClipping = true;
  opts.horizontalScale = scaleFactor * 100; // Ai wants a percent value (100 = 1×)
  opts.verticalScale = scaleFactor * 100; // Ai wants a percent value (100 = 1×)
  opts.optimization = false; //
  opts.qualitySetting = 100;

  // Set export type.
  var type = ExportType.JPEG;

  // Export JPEG file. docs:https://ai-scripting.docsforadobe.dev/jsobjref/Document/?h=exportfile#documentexportfile
  doc.exportFile(exportFileHyphenated, type, opts);

  // Rename the file to match the Ai file by removing the inserted hyphens.
  exportFileHyphenated.rename(exportName);
})();
