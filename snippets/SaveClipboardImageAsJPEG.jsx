/**
 * Save an image from the system clipboard to the file system
 * @discussion https://community.adobe.com/t5/illustrator-discussions/how-to-save-clipboard-image-into-local-folder-as-jpeg-in-extendscript/td-p/13799758
 */

// make a new document and paste the image
var doc = app.documents.add(DocumentColorSpace.RGB);
app.executeMenuCommand("paste");
var img = doc.pageItems[0];

// resize the artboard to match the image size
app.executeMenuCommand("Fit Artboard to artwork bounds");

// setup export file info
var fpath = Folder.desktop + "/EXAMPLE/"; // folder where JPEG will be saved
var fname = "imageExport.jpeg"; // name of saved JPEG
var f = new File(fpath + "/" + fname);

// export the file as a JPEG
var exportOptions, exportType;
exportOptions = new ExportOptionsJPEG();
exportOptions.qualitySetting = 100;
doc.exportFile(f, ExportType.JPEG, exportOptions);
