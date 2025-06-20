/*
ExportPrintCutPDFs.jsx for Adobe Illustrator
--------------------------------------------
Export proper print and cut PDFs for decal and signage production.

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
0.1.0            initial release
0.1.1            fixed reg mark placement when ruler origin isn't at normal position
0.1.2 2023-11-08 moved ruler origin fix into `createRegMarks()` function
0.1.3 2024-04-12 better file name output in export notification, parent folder opens after export, dialog closes after export
0.1.4 2024-05-21 reg mark size calculation now factors in `app.activeDocument.scaleFactor`
0.1.5 2025-06-20 refactor
*/

//@target illustrator

(function () {
  //@target illustrator

  var scriptTitle = "Export Print and Cut PDFs";
  var scriptVersion = "0.1.5";

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document
  var doc = app.activeDocument;

  // setup layer defaults
  var artLayer;
  var cutLayer;
  var regLayer;
  var artLayerName = "art";
  var cutLayerName = "cut";
  var regLayerName = "reg";
  var layerStack = [artLayerName, cutLayerName, regLayerName];

  // setup reg mark defaults
  var regColor = new GrayColor();
  regColor.gray = 100;
  var regSize = 72 / 4 / app.activeDocument.scaleFactor; // .25 inches
  var regPlacements = [
    { top: 0, left: 0 }, // top-left
    { top: 0, left: doc.width - regSize }, // top-right
    { top: -doc.height + regSize, left: 0 }, // bottom-left
    { top: -doc.height + regSize, left: doc.width - regSize }, // bottom-right
  ];

  // setup pdf defaults
  var pdfPresetArt = "Print-Cut-Preset-ART";
  var pdfPresetCut = "Print-Cut-Preset-CUT";
  var suffixArt = " - " + artLayerName.toUpperCase();
  var suffixCut = " - " + cutLayerName.toUpperCase();

  // ------------------
  // show script dialog
  // ------------------

  // setup script ui dialog variables
  var btnAddRegMarks;
  var btnCreateLayers;
  var btnCancel;
  var btnExportFiles;
  var dlg;
  var gButtons;

  dlg = new Window("dialog");
  dlg.text = scriptTitle + " " + scriptVersion;
  dlg.orientation = "column";
  dlg.alignChildren = "fill";

  // group - buttons
  gButtons = dlg.add("group", undefined);
  gButtons.orientation = "column";
  gButtons.spacing = 20;
  btnCreateLayers = gButtons.add("button", undefined, "Create Layers");
  btnAddRegMarks = gButtons.add("button", undefined, "Add Reg Marks");
  btnExportFiles = gButtons.add("button", undefined, "Export Files");
  btnCancel = gButtons.add("button", undefined, "Close", { name: "ok" });

  btnCreateLayers.preferredSize.width = 250;
  btnAddRegMarks.preferredSize.width = 250;
  btnExportFiles.preferredSize.width = 250;
  btnCancel.preferredSize.width = 250;

  // check to make sure layers are setup correctly for all buttons
  if (!checkLayerStack()) {
    btnAddRegMarks.enabled = false;
    btnExportFiles.enabled = false;
  }

  btnCreateLayers.onClick = function () {
    createLayers();
    btnCreateLayers.enabled = false;
    btnAddRegMarks.enabled = true;
    btnExportFiles.enabled = true;
  };

  btnAddRegMarks.onClick = function () {
    createRegMarks();
    btnCreateLayers.enabled = false;
    btnAddRegMarks.enabled = false;
  };

  btnExportFiles.onClick = function () {
    exportFiles();
    dlg.close();
  };

  // show the dialog
  dlg.show();

  // ----------------
  // helper functions
  // ----------------

  function createLayers() {
    // get or make "art" layer
    try {
      artLayer = doc.layers.getByName(artLayerName);
    } catch (e) {
      $.writeln(e.message);
      artLayer = doc.layers[0];
      artLayer.name = "art";
    }

    // get or make "cut" layer
    try {
      cutLayer = doc.layers.getByName(cutLayerName);
    } catch (e) {
      $.writeln(e.message);
      cutLayer = doc.layers.add();
      cutLayer.name = cutLayerName;
    }

    // get or make "reg" layer
    try {
      regLayer = doc.layers.getByName(regLayerName);
    } catch (e) {
      $.writeln(e.message);
      regLayer = doc.layers.add();
      regLayer.name = regLayerName;
    }

    // make sure the layers are in the correct order
    regLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    cutLayer.zOrder(ZOrderMethod.BRINGTOFRONT);

    // redraw the app to show the results
    app.redraw();
  }

  function createRegMarks() {
    // reset ruler for correct reg mark placement
    var oldRulerOrigin = doc.rulerOrigin;
    doc.rulerOrigin = [0, doc.height];

    // setup function variables
    var regMark;
    var regPlacement;

    // grab the required layers
    regLayer = doc.layers[regLayerName];

    // remove any current reg marks before adding new
    regLayer.pageItems.removeAll();

    // add reg marks to the reg layer
    for (var i = 0; i < regPlacements.length; i++) {
      regPlacement = regPlacements[i];
      regMark = regLayer.pathItems.ellipse(
        regPlacement.top,
        regPlacement.left,
        regSize,
        regSize,
      );
      regMark.filled = true;
      regMark.stroked = false;
      regMark.fillColor = regColor;
    }

    // redraw the app to show the results
    app.redraw();

    // reset ruler to original user setting
    doc.rulerOrigin = oldRulerOrigin;

    // close the dialog
    dlg.close();
  }

  function exportFiles() {
    // setup function variables
    var fileArt;
    var fileCut;
    var fileName;
    var parentFolder;
    var saveOptions;

    // grab the base name of the document
    fileName = doc.fullName.fullName.replace(/\.pdf|\.ai|\.eps$/i, "");

    // grab the folder location of the document
    parentFolder = doc.path;

    // grab the required layers
    artLayer = doc.layers[artLayerName];
    cutLayer = doc.layers[cutLayerName];
    regLayer = doc.layers[regLayerName];

    // check to make sure document has been saved
    if (!doc.saved) {
      if (
        !Window.confirm(
          "Document Has Unsaved Changes!\nContinuing exporting files?",
          "noAsDflt",
          "Unsaved Changes",
        )
      ) {
        return;
      }
    }

    // setup file objects for save operation
    fileArt = new File(fileName + suffixArt + ".pdf");
    fileCut = new File(fileName + suffixCut + ".pdf");

    // export art file
    saveOptions = new PDFSaveOptions();
    saveOptions.pDFPreset = pdfPresetArt;
    cutLayer.visible = false;
    doc.saveAs(fileArt, saveOptions);

    // remove all layers not required for cut
    var layer;
    for (var i = doc.layers.length - 1; i >= 0; i--) {
      layer = doc.layers[i];
      if (layer.name == cutLayerName || layer.name == regLayerName) {
        layer.visible = true;
        layer.locked = true;
        continue;
      }
      layer.remove();
    }

    // export cut file
    saveOptions.pDFPreset = pdfPresetCut;
    doc.saveAs(fileCut, saveOptions);

    // close the document
    doc.close(SaveOptions.DONOTSAVECHANGES);

    // alert user
    alert(
      "Files Exported!\n" +
        File.decode(fileArt.name) +
        "\n" +
        File.decode(fileCut.name),
    );

    // open the parent folder
    parentFolder.execute();

    // close the dialog
    dlg.close();
  }

  function checkLayerStack() {
    for (var i = 0; i < layerStack.length; i++) {
      try {
        doc.layers.getByName(layerStack[i]);
      } catch (e) {
        $.writeln(e.message);
        return false;
      }
    }
    return true;
  }
})();
