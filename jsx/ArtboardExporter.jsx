/*
ArtboardExporter.jsx for Adobe Illustrator
------------------------------------------
Export all artboards in a variety of ways.

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
1.0.0 initial release
*/

// TODO: add option for PDF export
// TODO: add option to convert all text to outlines

var _title = "Illustrator Artboard Exporter";
var _version = "1.0.0";
var _copyright = "Copyright 2025 Josh Duncan";
var _website = "joshbduncan.com";

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
