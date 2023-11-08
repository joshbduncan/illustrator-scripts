/*
ExportPrintCutPDFs.jsx for Adobe Illustrator
--------------------------------------------

Export proper print and cut PDFs for decal and signage production.

Changelog:
0.1.0 initial release
0.1.1 fixed reg mark placement when ruler origin isn't at normal position
0.1.2 moved ruler origin fix into `createRegMarks()` function
*/

//@target illustrator

(function () {
  var _title = "Export Print and Cut PDFs";
  var _version = "0.1.1";
  var _copyright = "Copyright 2023 Josh Duncan";
  var _website = "joshbduncan.com";

  if (app.documents.length > 0) {
    // -------------------------
    // script setup and defaults
    // -------------------------

    // grab reference to the current document
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
    var regSize = 72 / 4; // .25 inches
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
    dlg.text = _title + " " + _version;
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
    };

    // show the dialog
    dlg.show();
  } else {
    alert("No documents open!\nCreate or open a document first.");
  }

  // ----------------
  // helper functions
  // ----------------

  function createLayers() {
    // get or make "art" layer
    try {
      artLayer = doc.layers.getByName(artLayerName);
    } catch (e) {
      artLayer = doc.layers[0];
      artLayer.name = "art";
    }

    // get or make "cut" layer
    try {
      cutLayer = doc.layers.getByName(cutLayerName);
    } catch (e) {
      cutLayer = doc.layers.add();
      cutLayer.name = cutLayerName;
    }

    // get or make "reg" layer
    try {
      regLayer = doc.layers.getByName(regLayerName);
    } catch (e) {
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
        regSize
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
    var saveOptions;

    // grab the base name of the document
    fileName = doc.fullName.fullName.replace(/\.pdf|\.ai|\.eps$/i, "");

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
          "Unsaved Changes"
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
    alert("Files Exported!\n" + fileArt.fsName + "\n" + fileCut.fsName);

    // close the dialog
    dlg.close();
  }

  function checkLayerStack() {
    var layer;
    for (var i = 0; i < layerStack.length; i++) {
      try {
        layer = doc.layers.getByName(layerStack[i]);
      } catch (e) {
        return false;
      }
    }
    return true;
  }
})();
