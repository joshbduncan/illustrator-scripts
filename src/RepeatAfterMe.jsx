/*
  RepeatAfterMe.jsx for Adobe Illustrator
  ---------------------------------------
  Easily repeat Illustrator objects across row and columns (with visual preview).
  Useful for production layout, grid/pattern generation, and step-and-repeat operations.

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
  0.1.0 2024-05-31 initial release
  0.2.0 2024-06-03
    added:
      - repeat pattern option (grid, brick by row, brick by column)
    changed:
      - gutter values can be negative now, input arrows work below 0 as well
      - gutter arrows work in 1/8 inches and 1 inch with shift, when value is in inches, else 1 and 10
  0.3.0 2024-06-04
    added:
      - repeat preview rectangles can filled as well
    removed:
      - preview stroke weight option, stroke is now calculated based on user view zoom level
      - user alert warning when repeat count was > 100 as it was causing a second redraw during alert
  0.3.1 2024-06-04
    fixed:
      - if user selection had any objects where the appearance panel was "wonky" the template preview stroke wouldn't show
  0.4.0 2024-06-05
    added:
      - button to fill the current artboard with as many repeats as possible using the gutter settings
    fixed:
      - brick by row, and brick by column patterns we're slightly off
  0.5.0 2024-06-05
    added:
      - ability to change the bounds used to determine repeat placement
    fixed:
      - height number sign
  0.6.0 2024-06-10
    added:
      - auto-fill artboard with included artboard padding (margin/inset)
    changed:
      - removed preview fill option
      - removed preview stroke color option
    fixed:
      - preset gutter values converted to document ruler units on load
*/

(function () {
  //@target illustrator

  var _title = "RepeatAfterMe";
  var _version = "0.6.0";
  var _copyright = "Copyright 2024 Josh Duncan";
  var _website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////

  //@includepath "include"

  //@include "Logger.jsxinc"
  //@include "GetObjectPlacementInfo.jsxinc"
  //@include "GetSelectionBounds.jsxinc"
  //@include "OpenURL.jsxinc"
  //@include "ParseNumberInput.jsxinc"
  //@include "Prefs.jsxinc"
  //@include "ReadJSONData.jsxinc"
  //@include "SavePresetDialog.jsxinc"
  //@include "WriteJSONData.jsxinc"

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and selection info
  var doc = app.activeDocument;

  // get the current selection
  var sel = doc.selection;

  // no need to continue if there is no active selection
  if (!sel.length) {
    alert("No active selection.");
    return;
  }

  // setup script defaults
  var defaults = {};
  defaults["[Default]"] = {
    fill: false,
    padding: "0 in",
    rows: 3,
    rowGutter: ".25 in",
    cols: 2,
    colGutter: ".25 in",
    pattern: "Grid",
    bounds: "clipped",
  };
  var patterns = ["Grid", "Brick by Row", "Brick by Column"];
  var layerName = "REPEAT-AFTER-ME TEMPLATE";
  var outlineColor = new RGBColor();
  outlineColor.red = 255;
  outlineColor.green = outlineColor.blue = 128;

  // set development mode
  var dev = $.getenv("USER") === "jbd" ? true : false;

  // setup development logging
  var logger;
  if (dev) {
    var logFilePath = Folder.userData + "/JBD/" + _title + ".log";
    logger = new Logger(logFilePath, "a", undefined, true);
    logger.log("**DEV MODE**", $.fileName);
  } else {
    logger = {};
    logger.log = function (text) {
      $.writeln(text);
    };
  }

  // load user prefs
  prefs = new Prefs(Folder.userData + "/JBD/" + _title + ".json", _version);
  prefs.load(defaults);

  // get the current artboard
  ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];

  // get doc base ruler unit
  var rulerUnits = doc.rulerUnits.toString().split(".")[1].toLowerCase();

  // calculate sensible stroke width for preview
  var strokeWidth = UnitValue(Math.min(3, 1 / doc.views[0].visibleZoom), "pt");

  // get info about the selected objects
  var selectionBounds, placementInfo;

  // show the dialog
  dialog();

  ////////////////////////
  // MAIN SCRIPT DIALOG //
  ////////////////////////

  /**
   * Main Script Dialog
   */
  function dialog() {
    s = "[Default]";

    var positions;
    var top, left;

    // helpers to prevent multiple event from firing when loading presets
    var loading = false;
    var savingPreset = false;

    var win = new Window("dialog");
    win.text = _title + " " + _version;
    win.orientation = "column";
    win.alignChildren = ["center", "center"];
    win.spacing = 10;
    win.margins = 16;

    // Panel - Layout
    var pLayout = win.add("panel", undefined, "Layout", { name: "pLayout" });
    pLayout.orientation = "column";
    pLayout.alignChildren = ["left", "center"];
    pLayout.spacing = 10;
    pLayout.margins = 18;
    pLayout.alignment = ["fill", "center"];

    // Group - Fill Artboard
    var gFill = pLayout.add("group", undefined, { name: "gFill" });
    gFill.orientation = "row";
    gFill.alignChildren = ["left", "bottom"];
    gFill.spacing = 10;
    gFill.margins = 0;
    gFill.alignment = ["fill", "center"];

    var fill = gFill.add("checkbox", undefined, "Fill Current Artboard", {
      name: "fill",
    });

    // Group - Padding
    var gPadding = gFill.add("group", undefined, { name: "gPadding" });
    gPadding.orientation = "row";
    gPadding.alignChildren = ["left", "center"];
    gPadding.spacing = 10;
    gPadding.margins = 0;
    gPadding.alignment = ["right", "center"];

    var stPadding = gPadding.add("statictext", undefined, "Padding:", {
      name: "stPadding",
    });
    stPadding.justify = "right";
    stPadding.preferredSize.width = 60;

    var padding = gPadding.add(
      'edittext {justify: "center", properties: {name: "margin"}}'
    );
    padding.text = UnitValue(0, rulerUnits);
    padding.preferredSize.width = 100;
    padding.enabled = false;

    // Group - Rows
    var gRows = pLayout.add("group", undefined, { name: "gRows" });
    gRows.orientation = "row";
    gRows.alignChildren = ["left", "center"];
    gRows.spacing = 10;
    gRows.margins = 0;
    gRows.alignment = ["fill", "center"];

    var stRows = gRows.add("statictext", undefined, "Rows:", { name: "stRows" });
    stRows.preferredSize.width = 60;
    stRows.justify = "right";

    var rows = gRows.add('edittext {justify: "center", properties: {name: "rows"}}');
    rows.text = "";
    rows.preferredSize.width = 75;

    // Group - Row Gutter
    var gRowGutter = gRows.add("group", undefined, { name: "gRowGutter" });
    gRowGutter.orientation = "row";
    gRowGutter.alignChildren = ["left", "center"];
    gRowGutter.spacing = 10;
    gRowGutter.margins = 0;
    gRowGutter.alignment = ["fill", "center"];

    var stRowGutter = gRowGutter.add("statictext", undefined, "Gutter:", {
      name: "stRowGutter",
    });
    stRowGutter.justify = "right";
    stRowGutter.preferredSize.width = 60;

    var rowGutter = gRowGutter.add(
      'edittext {justify: "center", properties: {name: "rowGutter"}}'
    );
    rowGutter.text = "";
    rowGutter.preferredSize.width = 100;

    // Group - Cols
    var gCols = pLayout.add("group", undefined, { name: "gCols" });
    gCols.orientation = "row";
    gCols.alignChildren = ["left", "center"];
    gCols.spacing = 10;
    gCols.margins = 0;
    gCols.alignment = ["fill", "center"];

    var stCols = gCols.add("statictext", undefined, "Columns:", { name: "stCols" });
    stCols.preferredSize.width = 60;
    stCols.justify = "right";

    var cols = gCols.add('edittext {justify: "center", properties: {name: "cols"}}');
    cols.text = "";
    cols.preferredSize.width = 75;

    // Group - Col Gutter
    var gColGutter = gCols.add("group", undefined, { name: "gColGutter" });
    gColGutter.orientation = "row";
    gColGutter.alignChildren = ["left", "center"];
    gColGutter.spacing = 10;
    gColGutter.margins = 0;
    gColGutter.alignment = ["fill", "center"];

    var stColGutter = gColGutter.add("statictext", undefined, "Gutter:", {
      name: "stColGutter",
    });
    stColGutter.justify = "right";
    stColGutter.preferredSize.width = 60;

    var colGutter = gColGutter.add(
      'edittext {justify: "center", properties: {name: "colGutter"}}'
    );
    colGutter.text = "";
    colGutter.preferredSize.width = 100;

    // Group - Pattern
    var gPattern = pLayout.add("group", undefined, { name: "gPattern" });
    gPattern.orientation = "row";
    gPattern.alignChildren = ["left", "center"];
    gPattern.spacing = 10;
    gPattern.margins = 0;
    gPattern.alignment = ["fill", "center"];

    var stType = gPattern.add("statictext", undefined, "Pattern:", {
      name: "stType",
    });
    stType.preferredSize.width = 60;
    stType.justify = "right";

    var pattern = gPattern.add("dropdownlist", undefined, undefined, {
      name: "pattern",
      items: patterns,
    });
    pattern.selection = 0;
    pattern.alignment = ["fill", "center"];

    // Group - Bounds & Info
    var gBoundsInfo = win.add("group", undefined, { name: "gBoundsInfo" });
    gBoundsInfo.orientation = "row";
    gBoundsInfo.alignChildren = ["fill", "center"];
    gBoundsInfo.spacing = 10;
    gBoundsInfo.margins = 0;
    gBoundsInfo.alignment = ["fill", "fill"];

    // Panel - Bounds
    var pBounds = gBoundsInfo.add("panel", undefined, "Bounds", { name: "pBounds" });
    pBounds.orientation = "row";
    pBounds.alignChildren = ["fill", "center"];
    pBounds.spacing = 10;
    pBounds.margins = 18;
    pBounds.alignment = ["fill", "fill"];

    // Group - Bounds
    var gBounds = pBounds.add("group", undefined, { name: "gBounds" });
    gBounds.orientation = "column";
    gBounds.alignChildren = ["left", "center"];
    gBounds.spacing = 10;
    gBounds.margins = 0;

    var geometric = gBounds.add("radiobutton", undefined, "Geometric", {
      name: "geometric",
    });
    var visible = gBounds.add("radiobutton", undefined, "Visible", { name: "visible" });
    var trueVisible = gBounds.add("radiobutton", undefined, "Clipped", {
      name: "clipped",
    });

    // Panel - Info
    var pInfo = gBoundsInfo.add("panel", undefined, "Repeat Info", { name: "pInfo" });
    pInfo.orientation = "row";
    pInfo.alignChildren = ["fill", "center"];
    pInfo.spacing = 10;
    pInfo.margins = 18;
    pInfo.alignment = ["fill", "fill"];

    // Group - Info
    var gInfo = pInfo.add("group", undefined, { name: "gInfo" });
    gInfo.orientation = "column";
    gInfo.alignChildren = ["left", "center"];
    gInfo.spacing = 10;
    gInfo.margins = 0;

    // Group - Copies
    var gCopies = gInfo.add("group", undefined, { name: "gCopies" });
    gCopies.orientation = "row";
    gCopies.alignChildren = ["left", "center"];
    gCopies.spacing = 10;
    gCopies.margins = 0;

    var stCopies = gCopies.add("statictext", undefined, "Total Copies:", {
      name: "stCopies",
    });

    var copies = gCopies.add("statictext", undefined, "12345", { name: "copies" });

    // Group - Width
    var gWidth = gInfo.add("group", undefined, { name: "gWidth" });
    gWidth.orientation = "row";
    gWidth.alignChildren = ["left", "center"];
    gWidth.spacing = 10;
    gWidth.margins = 0;
    gWidth.alignment = ["fill", "center"];

    var stWidth = gWidth.add("statictext", undefined, "Width:", { name: "stWidth" });

    var width = gWidth.add("statictext", undefined, "", { name: "width" });
    width.alignment = ["fill", "center"];

    // Group - Height
    var gHeight = gInfo.add("group", undefined, { name: "gHeight" });
    gHeight.orientation = "row";
    gHeight.alignChildren = ["left", "center"];
    gHeight.spacing = 10;
    gHeight.margins = 0;
    gHeight.alignment = ["fill", "center"];

    var stHeight = gHeight.add("statictext", undefined, "Height:", {
      name: "stHeight",
    });

    var height = gHeight.add("statictext", undefined, "", { name: "height" });
    height.alignment = ["fill", "center"];

    // Panel - Presets
    var pPresets = win.add("panel", undefined, "Presets", { name: "pPresets" });
    pPresets.orientation = "row";
    pPresets.alignChildren = ["left", "center"];
    pPresets.spacing = 10;
    pPresets.margins = 18;
    pPresets.alignment = ["fill", "center"];

    // Group - Preset
    var gPreset = pPresets.add("group", undefined, { name: "gPreset" });
    gPreset.orientation = "row";
    gPreset.alignChildren = ["left", "center"];
    gPreset.spacing = 10;
    gPreset.margins = 0;
    gPreset.alignment = ["fill", "center"];

    var stLoad = gPreset.add("statictext", undefined, "Load:", { name: "stLoad" });

    var preset = gPreset.add("dropdownlist", undefined, undefined, {
      name: "preset",
      items: undefined,
    });
    var presets = loadPresetsDropdown();
    preset.alignment = ["fill", "center"];
    preset.selection = 0;

    // Group - Preset Buttons
    var gPresetButtons = pPresets.add("group", undefined, { name: "gPresetButtons" });
    gPresetButtons.orientation = "row";
    gPresetButtons.alignChildren = ["left", "center"];
    gPresetButtons.spacing = 10;
    gPresetButtons.margins = 0;
    gPresetButtons.alignment = ["right", "center"];

    var btDelete = gPresetButtons.add("button", undefined, "Delete", {
      name: "btDelete",
    });
    btDelete.preferredSize.width = 70;
    btDelete.enabled = false;

    var btSave = gPresetButtons.add("button", undefined, "Save", { name: "btSave" });
    btSave.preferredSize.width = 70;

    // Group - Buttons
    var gButtons = win.add("group", undefined, { name: "gButtons" });
    gButtons.orientation = "row";
    gButtons.alignChildren = ["left", "center"];
    gButtons.spacing = 10;
    gButtons.margins = 0;

    var btOK = gButtons.add("button", undefined, "OK", { name: "btOK" });
    btOK.preferredSize.width = 70;

    var btCancel = gButtons.add("button", undefined, "Cancel", { name: "btCancel" });
    btCancel.preferredSize.width = 70;

    // Copyright
    var stCopyright = win.add("statictext", undefined, _copyright + " @ " + _website, {
      name: "stCopyright",
    });

    /////////////////////////////
    // HELPER FUNCTIONS //
    /////////////////////////////

    /**
     * Load preset data into.
     * @param {String} k Key for preset lookup. Defaults to '[Default]'.
     */
    function loadPreset(k) {
      // no need to load after saving a preset
      if (savingPreset) return;

      loading = true;

      k = prefs.data.hasOwnProperty(k) ? k : "[Default]";

      logger.log("loading preset:", k);

      var s = prefs.data[k];
      for (prop in s) {
        logger.log(prop + ":", s[prop]);
      }

      // convert rowGutter, colGutter, and padding units to match the document ruler units
      var rowGutterUnitValue = parseNumberInput(s.rowGutter);
      rowGutterUnitValue.convert(rulerUnits);
      rowGutterUnitValue.value = rowGutterUnitValue.value.toFixed(4);
      var colGutterUnitValue = parseNumberInput(s.colGutter);
      colGutterUnitValue.convert(rulerUnits);
      colGutterUnitValue.value = colGutterUnitValue.value.toFixed(4);
      var paddingUnitValue = parseNumberInput(s.colGutter);
      paddingUnitValue.convert(rulerUnits);
      paddingUnitValue.value = paddingUnitValue.value.toFixed(4);

      padding.text = paddingUnitValue;
      rows.text = s.rows;
      rowGutter.text = rowGutterUnitValue;
      cols.text = s.cols;
      colGutter.text = colGutterUnitValue;
      pattern.selection = pattern.find(s.pattern);

      // find the correct bounds radio button and click on it
      win.findElement(s.bounds.toLowerCase()).notify("onClick");
      preset.selection = preset.find(k);

      // click fill artboard if set
      if (s.fill && !fill.value) fill.notify("onClick");

      loading = false;

      updatePreview();
    }

    /**
     * Load built-in and user presets into the `preset` dropdown list.
     * @returns {Array} Available presets, sorted by built-in, then all user presets (sorted by name).
     */
    function loadPresetsDropdown() {
      preset.removeAll();

      // setup built-in presets
      var presets = ["[Default]"];
      if (prefs.data.hasOwnProperty("[Last Used]")) presets.push("[Last Used]");

      // load presets from prefs
      var userPresets = [];
      for (var prop in prefs.data) {
        if (prop === "[Default]" || prop === "[Last Used]") continue;
        userPresets.push(prop);
      }
      userPresets.sort();

      // combine built-in and user presets
      presets = presets.concat(userPresets);

      for (var i = 0; i < presets.length; i++) {
        preset.add("item", presets[i]);
      }

      return presets;
    }

    /**
     * Clean up any script template information.
     */
    function cleanup() {
      try {
        templateLayer = doc.layers.getByName(layerName);
        templateLayer.remove();
      } catch (e) {}
    }

    /**
     * Draw preview rectangles for repeat pattern.
     * @returns {Layer} Template layout layer.
     */
    function drawPreview() {
      cleanup();

      // create a temp layer to hold preview items
      templateLayer = doc.layers.add();
      templateLayer.name = layerName;

      // create a temporary item to fix any issues with the appearance panel
      var t = templateLayer.pathItems.rectangle(0, 0, 1, 1);
      app.executeMenuCommand("expandStyle");
      t.remove();

      // draw initial preview outline using `rectangle(top, left, width, height)`
      var rect = templateLayer.pathItems.rectangle(
        top,
        left,
        placementInfo.width,
        placementInfo.height
      );

      rect.filled = false;
      rect.stroked = true;
      rect.strokeColor = outlineColor;
      rect.strokeWidth = strokeWidth;

      // draw all copies
      var dup;
      for (var i = 0; i < positions.length; i++) {
        dup = rect.duplicate();
        dup.translate(positions[i][0], positions[i][1]);
      }

      // hack from Sergey Osokin to not pollute undo stack
      // instead of using `app.redraw()`
      // this hack does cause some screen flicker
      app.executeMenuCommand("artboard");
      app.executeMenuCommand("artboard");
      return templateLayer;
    }

    /**
     * Format the current dialog setting into an a proper object.
     * @returns {Object} Current dialog settings.
     */
    function getCurrentDialogSettings() {
      var boundsType;
      for (var i = 0; i < boundsRadioButtons.length; i++) {
        if (boundsRadioButtons[i].value) {
          boundsType = boundsRadioButtons[i].properties.name;
          break;
        }
      }
      return {
        fill: fill.value,
        padding: UnitValue(padding.text).toString(),
        rows: parseInt(rows.text),
        rowGutter: UnitValue(rowGutter.text).toString(),
        cols: parseInt(cols.text),
        colGutter: UnitValue(colGutter.text).toString(),
        pattern: pattern.selection.text,
        bounds: boundsType,
      };
    }

    /**
     * Calculate translation deltas for each repeat item.
     * @returns {Array} Translation offset values for each repeat as [x, y].
     */
    function calculateRepeatTranslationDeltas() {
      logger.log("calculating translation deltas");

      // convert required values
      var _rows = parseInt(rows.text);
      var _rowGutter = UnitValue(rowGutter.text);
      var _cols = parseInt(cols.text);
      var _colGutter = UnitValue(colGutter.text);
      var _pattern = pattern.selection.text;

      // convert gutter values into points
      _rowGutter.convert("pt");
      _colGutter.convert("pt");

      // if a pattern is selected, determine the proper offset
      var rowPatternOffset = (placementInfo.height + _rowGutter) * 0.5;
      var colPatternOffset = (placementInfo.width + _colGutter) * 0.5;

      // calculate the x and y translation offset values for each repeat
      var positions = [];
      var tx, ty;
      for (var r = 0; r < _rows; r++) {
        for (var c = 0; c < _cols; c++) {
          if (r === 0 && c === 0) continue;
          tx = c * (placementInfo.width + _colGutter);
          ty = r * (placementInfo.height + _rowGutter) * -1;

          // offset tx and ty for selected pattern
          if (r % 2 === 1 && _pattern === "brick by row") {
            tx = tx + colPatternOffset;
          }

          if (c % 2 === 1 && _pattern === "brick by column") {
            ty = ty - rowPatternOffset;
          }

          positions.push([tx, ty]);
        }
      }
      return positions;
    }

    /**
     * Update the repeat preview template.
     */
    function updatePreview() {
      logger.log("updating preview");
      try {
        // calculate all positions
        positions = calculateRepeatTranslationDeltas();

        // calculate top/left values
        var abPadding = UnitValue(padding.text).as("pt");
        if (fill.value) {
          top = ab.artboardRect[0] - abPadding;
          left = ab.artboardRect[1] + abPadding;
        } else {
          top = placementInfo.top;
          left = placementInfo.left;
        }

        // draw preview rectangles
        templateLayer = drawPreview(positions, top, left);

        // update copies
        copies.text = rows.text * cols.text;

        // update overall dimensions
        var overallWidth = new UnitValue(
          Math.abs(placementInfo.width + positions[positions.length - 1][0]),
          "pt"
        );
        var overallHeight = new UnitValue(
          Math.abs(placementInfo.height - positions[positions.length - 1][1]),
          "pt"
        );

        // convert width and height to current ruler unit
        overallWidth.convert(rulerUnits);
        overallHeight.convert(rulerUnits);

        // update the dialog text and truncate to 4 decimal places
        width.text = overallWidth.value.toFixed(4) + " " + overallWidth.type;
        height.text = overallHeight.value.toFixed(4) + " " + overallHeight.type;
      } catch (e) {
        cleanup();
      }
    }

    /**
     * Duplicate the selected artwork.
     */
    function duplicateObjects() {
      for (var i = 0; i < sel.length; i++) {
        // offset original selection if fill artboard
        if (fill.value) {
          var abPadding = UnitValue(padding.text).as("pt");
          sel[i].translate(
            ab.artboardRect[1] + abPadding - placementInfo.left,
            ab.artboardRect[0] - abPadding - placementInfo.top
          );
        }
        // draw all copies
        var dup;
        for (var j = 0; j < positions.length; j++) {
          dup = sel[i].duplicate();
          dup.translate(positions[j][0], positions[j][1]);
        }
      }
    }

    ////////////////////////////////////////////////////
    // INPUT HELPERS, VALIDATORS, AND EVENT LISTENERS //
    ////////////////////////////////////////////////////

    /**
     * Process user input changes.
     * @param {UIEvent} e ScriptUI change event.
     */
    function processChanges() {
      if (loading) return;

      // calculate artboard fill if needed
      if (fill.value) {
        // calculate rows and cols to fill the entire artboard
        var calcRows, calcCols, width, height;

        // get the current padding value as points
        var abPadding = UnitValue(padding.text).as("pt");

        // get the artboard width and height
        width = Math.abs(ab.artboardRect[0] - ab.artboardRect[2]) - abPadding * 2;
        height = Math.abs(ab.artboardRect[1] - ab.artboardRect[3]) - abPadding * 2;

        // if a pattern is selected, determine the proper offset and adjust the available width and height
        var rowPatternOffset =
          (placementInfo.height + UnitValue(rowGutter.text).as("pt")) * 0.5;
        var colPatternOffset =
          (placementInfo.width + UnitValue(colGutter.text).as("pt")) * 0.5;
        if (pattern.selection.text.toLowerCase() === "brick by row")
          width -= colPatternOffset;
        if (pattern.selection.text.toLowerCase() === "brick by column")
          height -= rowPatternOffset;

        // calculate the max rows and cols that will fit on the artboard
        calcCols = Math.floor(
          width / (placementInfo.width + UnitValue(colGutter.text).as("pt"))
        );
        calcRows = Math.floor(
          height / (placementInfo.height + UnitValue(rowGutter.text).as("pt"))
        );

        rows.text = calcRows;
        cols.text = calcCols;

        logger.log("calculated rows:", calcRows);
        logger.log("calculated cols:", calcCols);
      }

      resetPresetUI();
      updatePreview();
    }

    // load initial presets
    win.onShow = function () {
      loadPreset(s);
    };

    /**
     * Reset the preset ui panel when a user makes input changes.
     */
    function resetPresetUI() {
      if (preset.selection != null) {
        logger.log("resetting preset ui");
        preset.selection = null;
        btDelete.enabled = false;
      }
    }

    fill.onClick = function () {
      logger.log("changed:", this.properties.name, "(" + this.value + ")");

      // enable/disable inputs
      padding.enabled = this.value;
      rows.enabled = !this.value;
      cols.enabled = !this.value;

      processChanges();
    };

    integerInputs = [rows, cols]; // int inputs
    for (var i = 0; i < integerInputs.length; i++) {
      integerInputs[i].validate = function () {
        logger.log("validating:", this.properties.name, "(" + this.text + ")");

        var val;
        if (isNaN(this.text)) {
          app.beep();
          val = 1;
        } else {
          val = parseInt(this.text);
        }
        this.text = val;
      };
      // add arrow key listener
      integerInputs[i].addEventListener("keydown", editTextArrowAdjustmentsRowCol);
    }

    // validate `edittext` float inputs on before processing any template changes
    var floatInputs = [rowGutter, colGutter, padding];
    for (var i = 0; i < floatInputs.length; i++) {
      // add validation method
      floatInputs[i].validate = function () {
        var n;
        logger.log("validating:", this.properties.name, "(" + this.text + ")");
        n = parseNumberInput(this.text);

        // convert to ruler units
        n.convert(rulerUnits);

        // trim value
        n.value = n.value.toFixed(4);
        this.text = n;
      };

      // add arrow key listener
      floatInputs[i].addEventListener("keydown", editTextArrowAdjustmentsGutter);
    }

    // validate `edittext` integer inputs on before processing any template changes
    var textInputs = integerInputs.concat(floatInputs);
    for (var i = 0; i < textInputs.length; i++) {
      textInputs[i].onChange = function (e) {
        if (this.hasOwnProperty("validate")) {
          this.validate();
        }
        logger.log("changed:", this.properties.name, "(" + this.text + ")");
        processChanges();
      };
    }

    pattern.onChange = function () {
      logger.log("changed:", this.properties.name, "(" + this.selection.text + ")");
      processChanges();
    };

    var boundsRadioButtons = [geometric, visible, trueVisible];
    for (var i = 0; i < boundsRadioButtons.length; i++) {
      boundsRadioButtons[i].onClick = function () {
        logger.log("changed:", this.properties.name, "(" + this.text + ")");
        selectionBounds = getSelectionBounds(sel, this.properties.name);
        placementInfo = GetObjectPlacementInfo(selectionBounds);
        processChanges();
      };
    }

    // load new setting check a saved setting is picked from the dropdown
    preset.onChange = function (e) {
      // don't update if the selection is null and disable preset delete button
      if (this.selection == null) {
        btDelete.enabled = false;
      } else {
        // don't allow deleting of default presets
        if (
          this.selection.text == "[Default]" ||
          this.selection.text == "[Last Used]"
        ) {
          btDelete.enabled = false;
        } else {
          // enable delete for any user saved presets
          btDelete.enabled = true;
        }
        logger.log("changed:", this.properties.name, "(" + this.selection.text + ")");
        loadPreset(this.selection.text);
      }
    };

    // delete selected preset
    btDelete.onClick = function () {
      if (
        Window.confirm(
          "Delete preset?\n" + preset.selection.text,
          "noAsDflt",
          "Delete Preset"
        )
      ) {
        delete prefs.data[preset.selection.text];
        prefs.save();
        presets;
        presets.splice(preset.selection.index);
        preset.remove(preset.selection.index);
      }
    };

    // save new preset
    btSave.onClick = function () {
      var boundsType;
      for (var i = 0; i < boundsRadioButtons.length; i++) {
        if (boundsRadioButtons[i].value) {
          boundsType = boundsRadioButtons[i].properties.name;
          break;
        }
      }

      var saveName = savePresetDialog(presets);

      if (saveName) {
        // since `dropdownlist.find()` send an onChange event, halt reloading the same preset
        savingPreset = true;

        prefs.data[saveName] = getCurrentDialogSettings();
        prefs.save();
        // reload preset dropdown
        presets = loadPresetsDropdown();
        // reset selection setting to new preset
        preset.selection = preset.find(saveName);

        savingPreset = false;
      }
    };

    stCopyright.addEventListener("click", function (e) {
      if (dev && e.ctrlKey) {
        var actions = {
          "Open Log": function () {
            logger.open();
          },
          "Reveal Prefs": function () {
            prefs.reveal();
          },
        };

        var win = new Window("dialog");
        win.text = "Dev Menu";
        win.orientation = "column";
        win.alignChildren = ["center", "center"];
        win.spacing = 10;
        win.margins = 16;

        var b;
        for (var prop in actions) {
          b = win.add("button", undefined, prop, { name: "prop" });
          b.onClick = actions[prop];
        }

        win.show();
      } else {
        openURL("https://joshbduncan.com");
      }
    });

    // if "ok" button clicked then return inputs
    if (win.show() == 1) {
      cleanup();
      prefs.data["[Last Used]"] = getCurrentDialogSettings();
      prefs.save();
      duplicateObjects();
    } else {
      cleanup();
    }
  }

  ///////////////////////////////
  // EDIT TEXT ARROW FUNCTIONS //
  ///////////////////////////////

  /**
   * Allow user to adjust `edittext` input values using the keyboard.
   * @param {UIEvent} e ScriptUI keyboard event.
   */
  function editTextArrowAdjustmentsRowCol(e) {
    // Attempt mimic the behavior of the built-in Ai text input boxes
    // allowing users to change the value using the "Up" and "Down" arrow
    // key, and adding the "Shift" key modifier to change the value by +/- 10.
    //
    // PLEASE NOTE: These particular inputs are limited on the downside to 1 (instead of 0)
    // and float values are ignored.
    var n, shift;
    if (e.keyName == "Up" || e.keyName == "Down") {
      if (isNaN(this.text)) {
        n = 1;
      } else {
        // if shift key is pressed when "Up" or "Down" key pressed
        // +/- the current value by 10 or round to the next 10th value
        //
        // Examples:
        // - "Up" with "Shift" at 22 increase value to 30
        // - "Down" with "Shift" at 22 decreases value to 20
        shift = e.getModifierState("Shift"); // check for shift key
        n = parseInt(this.text);

        // determine proper increment for arrow key
        var increment = shift ? 10 : 1;

        // reverse the increment when down key is pressed
        if (e.keyName == "Down") increment *= -1;

        // calculate the new value
        n = Math.max(1, Math.floor(n / increment) * increment + increment);
      }

      this.text = n;
      e.preventDefault();
      e.target.notify("onChange");
    }
  }

  /**
   * Allow user to adjust `edittext` input values using the keyboard.
   * @param {UIEvent} e ScriptUI keyboard event.
   */
  function editTextArrowAdjustmentsGutter(e) {
    // Attempt mimic the behavior of the built-in Ai text input boxes
    // allowing users to change the value using the "Up" and "Down" arrow
    // key, and adding the "Shift" key modifier to change the value by +/- 10
    //
    // 0 is increased to 0.25 (without "Shift")
    // 1 is decreased to 0.75 (without "Shift")
    // Float values .25, .50, and .75 are increased/decreased to the next .25 increment
    var n, shift;
    if (e.keyName == "Up" || e.keyName == "Down") {
      // if shift key is pressed when "Up" or "Down" key pressed
      // +/- the current value by 10 or round to the next 10th value
      //
      // Examples:
      // - "Up" with "Shift" at 22 increase value to 30
      // - "Down" with "Shift" at 22 decreases value to 20
      // - "Up" with "Shift" at 2.25 increase value to 10
      // - "Down" with "Shift" at 2.25 decreases value to 0
      shift = e.getModifierState("Shift");
      n = parseNumberInput(this.text);

      // convert value to ruler units and trim result if needed
      n.convert(rulerUnits);

      // trim converted value
      n.value = n.value.toFixed(4);

      // determine proper increment for arrow key
      var increment;
      if (shift) {
        increment = n.type == "in" ? 1 : 10;
      } else {
        increment = n.type == "in" ? 0.125 : 1;
      }

      // reverse the increment when down key is pressed
      if (e.keyName == "Down") increment *= -1;

      // calculate the new value
      n.value = Math.floor((n.value + increment) / increment) * increment;

      this.text = n;
      e.preventDefault();
      e.target.notify("onChange");
    }
  }
})();
