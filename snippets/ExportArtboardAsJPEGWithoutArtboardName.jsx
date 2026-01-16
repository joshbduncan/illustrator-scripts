(function () {
  //@target illustrator

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // get the current document and it's path (if saved)
  var doc = app.activeDocument;
  var docFolder = doc.path == "" ? Folder.desktop : new Folder(doc.path);

  // strip off any extensions from the document name
  var exportName = doc.name.replace(/\.pdf|\.ai|\.eps$/i, "");

  // The GUI version of Export For Screens allows the user to choose the export color space
  // but that option isn't available in ExtendScript so CMYK documents result in CMYK JPEGs.
  // To force the exported JPEGs as RGB we'll temporarily change the document color space
  // and then undo the change after export. Unfortunately this doesn't work as expected.
  // After executing the `doc-color-rgb` menu command, the ExtendScript engine loses
  // reference to any open Ai documents.
  if (doc.documentColorSpace == DocumentColorSpace.CMYK) {
    // app.executeMenuCommand("doc-color-rgb"); // this breaks the script
    alert(
      "Color Space Error!\nYour current document has a color space of CMYK. Please change the color space via File > Document Color Mode > RGB color and rerun the script.",
    );
    return;
  }

  // disable creating folders when exporting (same as setting in GUI)
  // thanks to Carlos Canto https://community.adobe.com/t5/user/viewprofilepage/user-id/9300165
  app.preferences.setIntegerPreference(
    "plugin/SmartExportUI/CreateFoldersPreference",
    0,
  );

  // set export for screens options
  var whatToExport = new ExportForScreensItemToExport();
  whatToExport.artboards = "1";
  whatToExport.document = false;

  // set jpeg export options
  var opts = new ExportForScreensOptionsJPEG();
  opts.embedICCProfile = true;
  opts.compressionMethod = JPEGCompressionMethodType.BASELINEOPTIMIZED;
  opts.antiAliasing = AntiAliasingMethod.TYPEOPTIMIZED;
  opts.scaleType = ExportForScreensScaleType.SCALEBYRESOLUTION;
  opts.scaleTypeValue = 300;

  doc.exportForScreens(
    docFolder,
    ExportForScreensType.SE_JPEG100,
    opts,
    whatToExport,
    exportName,
  );

  // When exporting artboards using the exportForScreens method, the api adds
  // "Artboard" to the actual artboard name resulting in `{prefix}Artboard X.{extension}`
  // To be able to correctly name the exported file, I am recreating the known
  // naming convention with a new `file` object to that path and then just renaming the file.
  var exportedFile = new File(
    doc.path + "/" + exportName + doc.artboards[0].name + ".jpg",
  );
  exportedFile.rename(exportName + ".jpg");
})();
