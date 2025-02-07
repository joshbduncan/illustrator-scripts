/*
ExportArtboardsToPDFandJPEG.jsx for Adobe Illustrator
-----------------------------------------------------

Export artboard with a name including "LAYOUT" as a pdf,
and all other artboards as a JPEG to a user selected folder.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/pdf-and-jpg-export-script/td-p/13637835
*/

// Define the target folder for the exported files
if (app.documents.length > 0)
    var exportFolder = Folder.selectDialog("Select a folder for export");

if (exportFolder != null) {
    // Get the current document
    var doc = app.activeDocument;
    // Get the current file name
    var fileName = doc.name.split(".")[0];
    //set the resolution of the export
    var defaultResolution = 150;
    var resolution = prompt(
        "Please enter the resolution for export (in pixels per inch):",
        defaultResolution
    );
    resolution =
        resolution === null || isNaN(resolution) ? defaultResolution : resolution;

    // Set up PDF Save Options
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT5;
    pdfOptions.preserveEditability = false;
    pdfOptions.pDFPreset = "[Smallest File Size]";

    // Set up JPEG Save Options
    var jpegOptions = new ImageCaptureOptions();
    jpegOptions.antiAliasing = true;
    jpegOptions.matte = false;
    jpegOptions.resolution = resolution;
    jpegOptions.transparency = true;

    // Iterate through artboards and save them depending on their name
    var ab, filePath;
    for (var i = 0; i < doc.artboards.length; i++) {
        ab = doc.artboards[i];
        // Check if artboard name contains "LAYOUT", if so export PDF
        if (doc.artboards[i].name.indexOf("LAYOUT") >= 0) {
            filePath = new File(exportFolder + "/" + ab.name + ".pdf");
            // specify exact artboard to save in file
            pdfOptions.artboardRange = i + 1 + "";
            doc.saveAs(filePath, pdfOptions);
        } else {
            filePath = new File(exportFolder + "/" + ab.name + ".jpg");
            doc.imageCapture(filePath, ab.artboardRect, jpegOptions);
        }
    }
}
