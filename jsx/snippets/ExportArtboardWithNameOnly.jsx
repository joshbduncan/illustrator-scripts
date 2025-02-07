// Export artboards with the exported named the same as the artboard.

// https://community.adobe.com/t5/illustrator-discussions/exporting-multiple-artboards-names/m-p/13541592#M353974

doc = app.activeDocument;
exportArtboards("TEST");

function exportArtboards(baseName) {
    var epsOptions = new EPSSaveOptions();
    epsOptions.saveMultipleArtboards = true;

    var ab, tempFile, finalFile, testFile;
    for (var i = 0; i < doc.artboards.length; i++) {
        ab = doc.artboards[i];
        if (ab.name.toLowerCase().indexOf("export") === -1) continue;

        // When exporting specific artboards, the api only allows specifying the first part of
        // the file name, then it appends `_Artboard Name` and add the extension which result in:
        //`{baseName}_Artboard X.{extension}`
        tempFile = new File(doc.path + "/" + baseName);

        // To be able to correctly name the exported file(s), I am recreating the known
        // naming convention with a new `file` object to that path
        finalFile = new File(doc.path + "/" + baseName + "_" + ab.name + ".eps");

        // Since the export exported file path and the preferred file path are different the built-in
        // file overwrite protection will not prompt you so and the `rename` method would not
        // overwrite the existing file. So, here I do the checking and prompt if needed.
        testFile = new File(doc.path + "/" + ab.name + ".eps");
        if (testFile.exists) {
            if (
                !Window.confirm(
                    "File already exists!\nOverwrite " + ab.name + ".eps?",
                    "noAsDflt",
                    "File Already Exists"
                )
            ) {
                // If you choose not to overwrite I just remove the exported artboard
                finalFile.remove();
                continue;
            } else {
                // Otherwise, I remove the file at that path so the rename works
                testFile.remove();
            }
        }

        // Export the file
        epsOptions.artboardRange = i + 1 + "";
        doc.saveAs(tempFile, epsOptions);

        // Rename the file
        finalFile.rename(ab.name + ".eps");
    }
}

function exportedNamedArtboard(fPath, fName) {
    pass;
}
