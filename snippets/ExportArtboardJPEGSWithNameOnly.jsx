var doc = app.activeDocument;

var artboard_idx = 0; // artboard you want to export (0-based index)
var artboard = doc.artboards[artboard_idx];
var prefix = "art_";

var jpegParam = new ExportForScreensOptionsJPEG();
var whatToExport = new ExportForScreensItemToExport();
whatToExport.artboards = artboard_idx + 1 + "";

doc.exportForScreens(
  doc.path,
  ExportForScreensType.SE_JPEG100,
  jpegParam,
  whatToExport,
  prefix
);

// When exporting artboard using the exportForScreens method, the api adds
// "Artboad" to the actual artboard name resulting in `{prefix}Artboard X.{extension}`
// To be able to correctly name the exported file, I am recreating the known
// naming convention with a new `file` object to that path and then just renaming the file.
exportedFile = new File(doc.path + "/" + prefix + artboard.name + ".jpg");
exportedFile.rename(prefix + ".jpg");

// var ab, tempFile, finalFile, testFile;
// for (var i = 0; i < doc.artboards.length; i++) {
//   ab = doc.artboards[i];
//   // When exporting artboard using the exportForScreens method, the api adds
//   // "Artboad" to the actual artboard name resulting in `{prefix}Artboard X.{extension}`

//   // To be able to correctly name the exported file(s), I am recreating the known
//   // naming convention with a new `file` object to that path.
//   incorrectPath = new File(doc.path + "/" + prefix + "Artboard" + ab.name + ".jpg");

//   // Then I can rename the exported file correctly
//   incorrectPath.rename(prefix + ab.name + ".eps");
// }
