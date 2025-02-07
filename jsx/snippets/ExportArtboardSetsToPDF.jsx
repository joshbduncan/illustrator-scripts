/*
ExportArtboardSetsToPDF.jsx for Adobe Illustrator
-------------------------------------------------

Export a specified set size of artboards as pdf(s).

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/save-artboards-to-pdf-with-customizable-number-of-artboards/td-p/13910550
*/

// Define the target folder for the exported files
if (app.documents.length > 0)
    var exportFolder = Folder.selectDialog("Select a folder for export");

if (exportFolder != null) {
    // Get the current document
    var doc = app.activeDocument;
    // Get the current file name
    var fileName = doc.name.split(".")[0];

    // Prompt user for artboards set size (defaults to exporting every artboard separately)
    var defaultSetSize = 1;
    var setSize = prompt(
        "Please enter the number of artboards per set:",
        defaultSetSize
    );
    setSize = setSize === null || isNaN(setSize) ? defaultSetSize : parseInt(setSize);

    // Set up PDF Save Options
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT5;
    pdfOptions.preserveEditability = false;
    pdfOptions.pDFPreset = "[Smallest File Size]";
    iterations = Math.ceil(doc.artboards.length / setSize);

    // Iterate over the total sets and export each pdf file
    var filePath;
    for (var i = 0; i < iterations; i++) {
        startAB = i * setSize + 1;
        endAB =
            i < Math.floor(doc.artboards.length / setSize) ? startAB + setSize - 1 : "";
        pdfOptions.artboardRange = startAB + "-" + endAB;
        filePath = new File(exportFolder + "/Set " + (i + 1) + ".pdf");
        doc.saveAs(filePath, pdfOptions);
    }
}
