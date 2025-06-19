/*
ExportArtboardRangeToPDF.jsx for Adobe Illustrator
--------------------------------------------------

Export a specified range of artboards as a pdf.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/save-artboards-to-pdf-with-customizable-number-of-artboards/m-p/14734694#M412827
*/

(function () {
  // Define the target folder for the exported pdf
  if (app.documents.length > 0)
    var exportFolder = Folder.selectDialog("Select a folder for export");

  if (exportFolder != null) {
    // Get the current document
    var doc = app.activeDocument;
    // Get the current file name
    var fileName = doc.name.split(".")[0];

    // Prompt user for artboard range
    var defaultArtboards = "1,2";
    var userInput = prompt(
      "Artboard export range (e.g. 1,3,4-5).",
      defaultArtboards,
    );

    // No need to continue if user cancelled or didn't specify any artboards
    if (userInput === null || !userInput.length) {
      alert("No artboard(s) specified.");
      return;
    }

    // Set up PDF Save Options
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT5;
    pdfOptions.preserveEditability = false;
    pdfOptions.pDFPreset = "[Smallest File Size]"; // set to a preset on your system

    // Export the pdf with the specficed artboards
    var filePath;
    pdfOptions.artboardRange = userInput;
    filePath = new File(
      exportFolder + "/" + fileName + " - Artboards " + userInput + ".pdf", // choose your own file name
    );
    doc.saveAs(filePath, pdfOptions);
  }
})();
