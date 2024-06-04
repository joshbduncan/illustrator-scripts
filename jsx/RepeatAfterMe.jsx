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
*/

(function () {
  //@target illustrator

  var _title = "RepeatAfterMe";
  var _version = "0.3.0";
  var _copyright = "Copyright 2024 Josh Duncan";
  var _website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////


  /**
   * Setup folder object or create if doesn't exist.
   * @param {String} path System folder path.
   * @returns {Folder} Folder object.
   */
  function setupFolderObject(path) {
    var folder = new Folder(path);
    if (!folder.exists) folder.create();
    return folder;
  }

  /**
   * Setup file object.
   * @param {Object} path Folder object where file should exist,
   * @param {String} name File name.
   * @returns {File} File object.
   */
  function setupFileObject(path, name) {
    return new File(path + "/" + name);
  }

  /**
   * Read ExtendScript "json-like" data from file.
   * @param {File} f File object to read.
   * @returns {Object} Evaluated JSON data.
   */
  function readJSONData(f) {
    var json, obj;
    try {
      f.encoding = "UTF-8";
      f.open("r");
      json = f.read();
      f.close();
    } catch (e) {
      alert("Error loading file:\n" + f);
    }
    obj = eval(json);
    return obj;
  }

  /**
   * Write ExtendScript "json-like" data to disk.
   * @param {Object} data Data to be written.
   * @param {File} f File object to write to.
   */
  function writeJSONData(data, f) {
    try {
      f.encoding = "UTF-8";
      f.open("w");
      f.write(data.toSource());
      f.close();
    } catch (e) {
      alert("Error writing file:\n" + f);
    }
  }
  /**
   * Provide easy access page item placement information.
   * @param {Array} bounds Illustrator object bounds (e.g. [left, top, right, bottom]).
   * @returns {Object} Object information (left, top, right, bottom, width, height, centerX, centerY)
   */
  function GetObjectPlacementInfo(bounds) {
    var left = bounds[0];
    var top = bounds[1];
    var right = bounds[2];
    var bottom = bounds[3];
    var width = right - left;
    var height = top - bottom;
    var centerX = left + width / 2;
    var centerY = top - height / 2;
    return {
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      width: width,
      height: height,
      centerX: centerX,
      centerY: centerY,
    };
  }
  /*
    Updates:
    2021-09-13 updated getVisibleBounds() to catch lots of weird edge cases
    2021-10-13 updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
    2021-10-15 fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
              error catch for selected guides (William Dowling @ github.com/wdjsdev)
              error catch for empty objects or item with no bounds
              error catch for clipping masks inside of an empty group
  */

  /**
   * Determine the actual "visible" bounds for an object if clipping mask or compound path items are found.
   * @param {PageItem} object A single Adobe Illustrator pageItem.
   * @returns {Array}         Object bounds [left, top, right, bottom].
   */
  function getVisibleBounds(object) {
    /*
      Changelog
      ---------
      2021-09-13 updated getVisibleBounds() to catch lots of weird edge cases
      2021-10-13 updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
      2021-10-15 fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
                error catch for selected guides (William Dowling @ github.com/wdjsdev)
                error catch for empty objects or item with no bounds
                error catch for clipping masks inside of an empty group
    */

    var bounds, clippedItem, sandboxItem, sandboxLayer;
    var curItem;

    // skip guides (via william dowling @ github.com/wdjsdev)
    if (object.guides) {
      return undefined;
    }

    if (object.typename == "GroupItem") {
      // if the group has no pageItems, return undefined
      if (!object.pageItems || object.pageItems.length == 0) {
        return undefined;
      }
      // if the object is clipped
      if (object.clipped) {
        // check all sub objects to find the clipping path
        for (var i = 0; i < object.pageItems.length; i++) {
          curItem = object.pageItems[i];
          if (curItem.clipping) {
            clippedItem = curItem;
            break;
          } else if (curItem.typename == "CompoundPathItem") {
            if (!curItem.pathItems.length) {
              // catch compound path items with no pathItems (via William Dowling @ github.com/wdjsdev)
              sandboxLayer = app.activeDocument.layers.add();
              sandboxItem = curItem.duplicate(sandboxLayer);
              app.activeDocument.selection = null;
              sandboxItem.selected = true;
              app.executeMenuCommand("noCompoundPath");
              sandboxLayer.hasSelectedArtwork = true;
              app.executeMenuCommand("group");
              clippedItem = app.activeDocument.selection[0];
              break;
            } else if (curItem.pathItems[0].clipping) {
              clippedItem = curItem;
              break;
            }
          }
        }
        if (!clippedItem) {
          clippedItem = object.pageItems[0];
        }
        bounds = clippedItem.geometricBounds;
        if (sandboxLayer) {
          // eliminate the sandbox layer since it's no longer needed
          sandboxLayer.remove();
          sandboxLayer = undefined;
        }
      } else {
        // if the object is not clipped
        var subObjectBounds;
        var allBoundPoints = [[], [], [], []];
        // get the bounds of every object in the group
        for (var i = 0; i < object.pageItems.length; i++) {
          curItem = object.pageItems[i];
          subObjectBounds = getVisibleBounds(curItem);
          allBoundPoints[0].push(subObjectBounds[0]);
          allBoundPoints[1].push(subObjectBounds[1]);
          allBoundPoints[2].push(subObjectBounds[2]);
          allBoundPoints[3].push(subObjectBounds[3]);
        }
        // determine the groups bounds from it sub object bound points
        bounds = [
          Math.min.apply(Math, allBoundPoints[0]),
          Math.max.apply(Math, allBoundPoints[1]),
          Math.max.apply(Math, allBoundPoints[2]),
          Math.min.apply(Math, allBoundPoints[3]),
        ];
      }
    } else {
      bounds = object.geometricBounds;
    }
    return bounds;
  }

  /**
   * Determine the overall current document selection bounds.
   * @param {Object} doc Open Adobe Illustrator document.
   * @param {Boolean} visible Return true visible bounds (as opposed to geometric bounds). Defaults to false.
   * @returns {Array} Object bounds [left, top, right, bottom].
   */
  function getSelectionBounds(doc, visible) {
    visible = typeof visible !== "undefined" ? visible : false;
    var bounds = [[], [], [], []];
    var cur;
    for (var i = 0; i < doc.selection.length; i++) {
      cur = visible
        ? getVisibleBounds(doc.selection[i])
        : doc.selection[i].geometricBounds;
      for (var j = 0; j < cur.length; j++) {
        bounds[j].push(cur[j]);
      }
    }
    return [
      Math.min.apply(Math, bounds[0]),
      Math.max.apply(Math, bounds[1]),
      Math.max.apply(Math, bounds[2]),
      Math.min.apply(Math, bounds[3]),
    ];
  }
  /**
   * Open a url in the system browser.
   * @param {String} url URL to open.
   */
  function openURL(url) {
    var html = new File(Folder.temp.absoluteURI + "/aisLink.html");
    html.open("w");
    var htmlBody =
      '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' +
      url +
      '"></head><body><p></p></body></html>';
    html.write(htmlBody);
    html.close();
    html.execute();
  }
  /**
   * Parse a ScriptUI `edittext` value into a valid `UnitType` number.
   * @param {Number|String} n Value to parse.
   * @param {Number} defaultValue Default value to return if `n` is invalid.
   * @param {String} defaultUnit Default unit type to return the input as if not included in `n`.
   * @returns {UnitValue}
   */
  function parseNumberInput(n, defaultValue, defaultUnit) {
    defaultValue = typeof defaultValue !== "undefined" ? defaultValue : 0;
    defaultUnit = typeof defaultUnit !== "undefined" ? defaultUnit : rulerUnits;
    var val = UnitValue(n);
    if (val.type === "?") {
      val = UnitValue(n, defaultUnit);
      if (isNaN(val.value)) {
        app.beep();
        val = UnitValue(defaultValue, defaultUnit);
      }
    }
    return val;
  }
  /**
   * Module for easily storing script preferences.
   * @param fname File name for the saved preferences "JSON-like" file.
   * @param location Optional folder location to save the preferences file. Defaults to `Folder.userData`.
   * @param version Optional script version number to include in the preferences file. Helps with debugging.
   */
  function Prefs(fname, location, version) {
    // if `fname` is not specified, pull the base script name from the stack
    if (fname == "undefined") {
      var stack = $.stack.split("\n");
      var foo, bar;
      for (var i = 0; i < stack.length; i++) {
        foo = stack[i];
        if (foo[0] == "[" && foo[foo.length - 1] == "]") {
          bar = foo.slice(1, foo.length - 1);
          if (isNaN(bar)) {
            fname = bar + ".json";
            break;
          }
        }
      }
    }
    this.fname = fname;
    this.location = typeof location !== "undefined" ? location : Folder.userData;
    this.version = typeof version !== "undefined" ? version : null;
    this.data = {};
  }

  Prefs.prototype = {
    /**
     * Preferences folder object.
     */
    folder: function () {
      return new Folder(this.location);
    },
    /**
     * Preferences file object.
     */
    file: function () {
      var folder = this.folder();
      return new File(folder + "/" + this.fname + ".json");
    },
    /**
     * Load preferences file data into the `prefs.data` object.
     * @param defaultData Default data to load if the data file does not exist.
     */
    load: function (defaultData) {
      defaultData = typeof defaultData !== "undefined" ? defaultData : {};
      var file = this.file();
      var json;

      if (file.exists) {
        try {
          json = readJSONData(file);
        } catch (e) {
          file.rename(file.name + ".bak");
          this.reveal();
          Error.runtimeError(1, "Error!\nPreferences file error. Backup created.");
        }
      } else {
        json = {};
        json.data = defaultData;
      }

      this.data = json.data;
    },
    /**
     * Write preferences to disk. Only `prefs.data` will be saved.
     */
    save: function () {
      var folder = this.folder();
      var file = this.file();
      var d = {
        data: this.data,
        version: this.version,
        timestamp: Date.now(),
      };
      if (!folder.exists) folder.create();
      writeJSONData(d, file);
    },
    /**
     * Backup the prefs file.
     */
    backup: function () {
      var file = this.file();
      var backupFile = new File(file + ".bak");
      file.copy(backupFile);
    },
    /**
     * Reveal the preferences file in the platform-specific file browser.
     */
    reveal: function () {
      var folder = this.folder();
      folder.execute();
    },
  };
  /**
   * Dialog for saving/overwriting presets.
   * @param {Array} currentOptions Current presets (can be overwritten).
   * @returns {String|Boolean} Preset name on OK, false on Cancel.
   */
  function savePresetDialog(currentOptions) {
    var win = new Window("dialog");
    win.text = "Save Settings";
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.margins = 18;

    win.add("statictext", undefined, "Save current settings as:");
    var name = win.add("edittext");
    name.preferredSize.width = 250;
    name.active = true;

    var cbReplace = win.add("checkbox", undefined, "Replace settings:");
    var replace = win.add("dropdownlist", undefined, currentOptions);
    replace.enabled = false;
    replace.preferredSize.width = 250;

    // remove [last used] since it shouldn't be overwritten
    replace.remove(replace.find("[Last Used]"));

    cbReplace.onClick = function () {
      replace.enabled = cbReplace.value ? true : false;
      name.enabled = cbReplace.value ? false : true;
    };

    // window buttons
    var gWindowButtons = win.add("group", undefined);
    gWindowButtons.orientation = "row";
    gWindowButtons.alignChildren = ["left", "center"];
    gWindowButtons.alignment = ["center", "top"];

    var btOK = gWindowButtons.add("button", undefined, "OK");
    var btCancel = gWindowButtons.add("button", undefined, "Cancel");

    // if "ok" button clicked then return savename
    if (win.show() == 1) {
      var saveName;
      if (cbReplace.value && replace.selection) {
        saveName = replace.selection.text;
      } else if (!cbReplace.value && name.text) {
        saveName = name.text;
      } else {
        alert(
          "No name provided!\nMake sure to provide a save name or pick a current present to replace."
        );
        return false;
      }
      return saveName;
    } else {
      return false;
    }
  }

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

  // no need to continue if there is no active selection
  if (!doc.selection.length) {
    alert("No active selection.");
    return;
  }

  // setup script defaults
  var defaults = {};
  defaults["[Default]"] = {
    rows: 3,
    rowGutter: ".25 in",
    cols: 2,
    colGutter: ".25 in",
    pattern: "Grid",
    color: "Red",
    filled: false,
  };
  var patterns = ["Grid", "Brick by Row", "Brick by Column"];
  var colors = ["Black", "Red", "White", "Yellow"];
  var layerName = "REPEAT-AFTER-ME TEMPLATE";

  // load user prefs
  prefs = new Prefs(_title, Folder.userData + "/JBD", _version);
  prefs.load(defaults);

  // get doc base ruler unit
  var rulerUnits = doc.rulerUnits.toString().split(".")[1].toLowerCase();

  // calculate sensible stroke width for preview
  var strokeWidth = UnitValue(Math.min(4.5, 1 / doc.views[0].visibleZoom), "pt");

  // get info about the selected objects
  var selectionBounds = getSelectionBounds(doc, true);
  var placementInfo = GetObjectPlacementInfo(selectionBounds);

  // show the settings dialog
  var positions = settingsWin();

  // act upon the user settings
  if (!positions) return;

  // step and repeat the selected objects
  duplicateObjects(positions);

  //////////////////////
  // HELPER FUNCTIONS //
  //////////////////////

  /**
   *
   * @param {String} k Key for color name lookup.
   * @returns {RGBColor}
   */
  function loadPreviewColor(k) {
    var color = new RGBColor();
    switch (k) {
      case "Black":
        color.red = color.green = color.blue = 0;
        break;
      case "White":
        color.red = color.green = color.blue = 255;
        break;
      case "Yellow":
        color.red = color.green = 255;
        color.blue = 0;
        break;
      default:
        color.red = 255;
        color.green = color.blue = 0;
        break;
    }
    return color;
  }

  /**
   * Calculate translation deltas for each repeat item.
   * @param {Number} rows Rows to repeat.
   * @param {Number} rowGutter Space between rows.
   * @param {Number} cols Columns to repeat.
   * @param {Number} colGutter Space between columns.
   * @param {String} pattern Repeat pattern (grid or brick).
   * @returns {Array} Translation offset values for each repeat as [x, y].
   */
  function calculateRepeatTranslationDeltas(rows, rowGutter, cols, colGutter, pattern) {
    pattern = typeof pattern !== "undefined" ? pattern.toLowerCase() : "grid";

    $.writeln("calculating translation deltas");

    // convert user input to points
    rowGutter = UnitValue(rowGutter).as("pt");
    colGutter = UnitValue(colGutter).as("pt");

    // determine which pattern of grid should be drawn
    var rowPatternOffset = (placementInfo.width + colGutter) * 0.5;
    var colPatternOffset = (placementInfo.height + rowGutter) * 0.5;

    // calculate the x and y translation offset values for each repeat
    var positions = [];
    var tx, ty;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (r === 0 && c === 0) continue;
        tx = c * (placementInfo.width + colGutter);
        ty = r * (placementInfo.height + rowGutter) * -1;

        // offset tx and ty for selected pattern
        if (r % 2 === 1 && pattern === "brick by row") {
          tx = tx + colPatternOffset;
        }

        if (c % 2 === 1 && pattern === "brick by column") {
          ty = ty - rowPatternOffset;
        }

        positions.push([tx, ty]);
      }
    }
    return positions;
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
   *
   * @param {Array} positions Translation deltas for each repeat item.
   * @param {RGBColor} color Template preview shape color.
   * @param {Boolean} filled Fill template preview rectangles (as opposed to stroked).
   * @returns {Layer} Template layout layer.
   */
  function drawPreview(positions, color, filled) {
    cleanup();

    // create a temp layer to hold preview items
    templateLayer = doc.layers.add();
    templateLayer.name = layerName;

    // draw initial preview outline using `rectangle(top, left, width, height)`
    var rect = templateLayer.pathItems.rectangle(
      placementInfo.top,
      placementInfo.left,
      placementInfo.width,
      placementInfo.height
    );

    if (filled) {
      rect.filled = true;
      rect.fillColor = color;
      rect.stroked = false;
    } else {
      rect.stroked = true;
      rect.strokeColor = color;
      rect.strokeWidth = strokeWidth;
      rect.filled = false;
    }

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
   * Repeat the selected artwork at the specified positions.
   * @param {Array} positions Translation deltas for each repeat item.
   */
  function duplicateObjects(positions) {
    var selectedObjects = doc.selection;
    for (var i = 0; i < selectedObjects.length; i++) {
      // draw all copies
      var dup;
      for (var j = 0; j < positions.length; j++) {
        dup = selectedObjects[i].duplicate();
        dup.translate(positions[j][0], positions[j][1]);
      }
    }
  }

  ////////////////////////
  // MAIN SCRIPT DIALOG //
  ////////////////////////

  /**
   *
   * @param {String} s Key for preset lookup. Defaults to '[Default]'.
   * @returns {Array} Translation offset values for each repeat as [x, y].
   */
  function settingsWin(s) {
    s = typeof s !== "undefined" ? s : "[Default]";

    var outlineColor, positions;

    // helper to prevent multiple event from firing when loading presets
    var loading = false;

    var win = new Window("dialog");
    win.text = _title + " " + _version;
    win.orientation = "column";
    win.alignChildren = ["center", "center"];
    win.spacing = 10;
    win.margins = 16;

    // Panel - Layout
    var pLayout = win.add("panel", undefined, undefined, { name: "pLayout" });
    pLayout.text = "Layout";
    pLayout.orientation = "column";
    pLayout.alignChildren = ["left", "center"];
    pLayout.spacing = 10;
    pLayout.margins = 18;
    pLayout.alignment = ["fill", "center"];

    // Group - Row
    var gRow = pLayout.add("group", undefined, { name: "gRow" });
    gRow.orientation = "row";
    gRow.alignChildren = ["left", "center"];
    gRow.spacing = 10;
    gRow.margins = 0;

    var stRows = gRow.add("statictext", undefined, undefined, { name: "stRows" });
    stRows.text = "Rows:";
    stRows.preferredSize.width = 60;
    stRows.justify = "right";

    var rows = gRow.add('edittext {justify: "center", properties: {name: "rows"}}');
    rows.text = "";
    rows.preferredSize.width = 60;

    var stRowGutter = gRow.add("statictext", undefined, undefined, {
      name: "stRowGutter",
    });
    stRowGutter.text = "Gutter:";
    stRowGutter.justify = "right";

    var rowGutter = gRow.add(
      'edittext {justify: "center", properties: {name: "rowGutter"}}'
    );
    rowGutter.text = "";
    rowGutter.preferredSize.width = 100;

    // Group - Col
    var gCol = pLayout.add("group", undefined, { name: "gCol" });
    gCol.orientation = "row";
    gCol.alignChildren = ["left", "center"];
    gCol.spacing = 10;
    gCol.margins = 0;

    var stCols = gCol.add("statictext", undefined, undefined, { name: "stCols" });
    stCols.text = "Columns:";
    stCols.preferredSize.width = 60;
    stCols.justify = "right";

    var cols = gCol.add('edittext {justify: "center", properties: {name: "cols"}}');
    cols.text = "";
    cols.preferredSize.width = 60;

    var stColGutter = gCol.add("statictext", undefined, undefined, {
      name: "stColGutter",
    });
    stColGutter.text = "Gutter:";
    stColGutter.justify = "right";

    var colGutter = gCol.add(
      'edittext {justify: "center", properties: {name: "colGutter"}}'
    );
    colGutter.text = "";
    colGutter.preferredSize.width = 100;

    // Group - Repeat Type
    var gType = pLayout.add("group", undefined, { name: "gType" });
    gType.orientation = "row";
    gType.alignChildren = ["left", "center"];
    gType.spacing = 10;
    gType.margins = 0;

    var stType = gType.add("statictext", undefined, undefined, {
      name: "stType",
    });
    stType.text = "Pattern:";
    stType.preferredSize.width = 60;
    stType.justify = "right";

    var pattern = gType.add("dropdownlist", undefined, undefined, {
      name: "pattern",
      items: patterns,
    });
    pattern.alignment = ["fill", "center"];
    pattern.selection = 0;

    var divider1 = pLayout.add("panel", undefined, undefined, { name: "divider1" });
    divider1.alignment = "fill";

    // Group - Info
    var gInfo = pLayout.add("group", undefined, { name: "gInfo" });
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

    var stCopies = gCopies.add("statictext", undefined, undefined, {
      name: "stCopies",
    });
    stCopies.text = "Total Copies:";

    var copies = gCopies.add("statictext", undefined, undefined, { name: "copies" });
    copies.text = "123";

    // Group Size
    var gSize = gInfo.add("group", undefined, { name: "gSize" });
    gSize.orientation = "row";
    gSize.alignChildren = ["left", "center"];
    gSize.spacing = 10;
    gSize.margins = 0;

    // Group - Width
    var gWidth = gSize.add("group", undefined, { name: "gWidth" });
    gWidth.orientation = "row";
    gWidth.alignChildren = ["left", "center"];
    gWidth.spacing = 10;
    gWidth.margins = 0;

    var stWidth = gWidth.add("statictext", undefined, undefined, { name: "stWidth" });
    stWidth.text = "Width:";

    var width = gWidth.add("statictext", undefined, undefined, { name: "width" });
    width.preferredSize.width = 75;
    width.text = "";

    // Group - Height
    var gHeight = gSize.add("group", undefined, { name: "gHeight" });
    gHeight.orientation = "row";
    gHeight.alignChildren = ["left", "center"];
    gHeight.spacing = 10;
    gHeight.margins = 0;

    var stHeight = gHeight.add("statictext", undefined, undefined, {
      name: "stHeight",
    });
    stHeight.text = "Height:";

    var height = gHeight.add("statictext", undefined, undefined, { name: "height" });
    height.preferredSize.width = 75;
    height.text = "";

    // Panel - Preview
    var pPreview = win.add("panel", undefined, undefined, { name: "pPreview" });
    pPreview.text = "Preview";
    pPreview.orientation = "row";
    pPreview.alignChildren = ["fill", "center"];
    pPreview.spacing = 10;
    pPreview.margins = 18;
    pPreview.alignment = ["fill", "center"];

    // Group - Color
    var gColor = pPreview.add("group", undefined, { name: "gColor" });
    gColor.orientation = "row";
    gColor.alignChildren = ["left", "center"];
    gColor.spacing = 10;
    gColor.margins = 0;

    var stColor = gColor.add("statictext", undefined, undefined, { name: "stColor" });
    stColor.text = "Color:";

    var color = gColor.add("dropdownlist", undefined, undefined, {
      name: "color",
      items: colors,
    });
    color.selection = 0;

    // Group - Filled
    var gFilled = pPreview.add("group", undefined, { name: "gFilled" });
    gFilled.orientation = "row";
    gFilled.alignChildren = ["fill", "center"];
    gFilled.spacing = 10;
    gFilled.margins = 0;
    pLayout.alignment = ["fill", "center"];

    var filled = gFilled.add("radiobutton", undefined, "Filled", { name: "filled" });
    var stroked = gFilled.add("radiobutton", undefined, "Stroked", { name: "stroked" });

    // Panel - Presets
    var pPresets = win.add("panel", undefined, undefined, { name: "pPresets" });
    pPresets.text = "Presets";
    pPresets.orientation = "column";
    pPresets.alignChildren = ["left", "center"];
    pPresets.spacing = 10;
    pPresets.margins = 18;
    pLayout.alignment = ["fill", "center"];

    // Group - Presets
    var gPresets = pPresets.add("group", undefined, { name: "gPresets" });
    gPresets.orientation = "row";
    gPresets.alignChildren = ["left", "center"];
    gPresets.spacing = 10;
    gPresets.margins = 0;

    var stLoad = gPresets.add("statictext", undefined, undefined, { name: "stLoad" });
    stLoad.text = "Load:";

    var preset = gPresets.add("dropdownlist", undefined, undefined, {
      name: "preset",
      items: undefined,
    });
    var presets = loadPresetsDropdown();
    preset.selection = 0;

    var btDelete = gPresets.add("button", undefined, undefined, { name: "btDelete" });
    btDelete.text = "Delete";
    btDelete.preferredSize.width = 70;
    btDelete.enabled = false;

    var btSave = gPresets.add("button", undefined, undefined, { name: "btSave" });
    btSave.text = "Save";
    btSave.preferredSize.width = 70;

    // Group - Buttons
    var gButtons = win.add("group", undefined, { name: "gButtons" });
    gButtons.orientation = "row";
    gButtons.alignChildren = ["left", "center"];
    gButtons.spacing = 10;
    gButtons.margins = 0;

    var btOK = gButtons.add("button", undefined, undefined, { name: "btOK" });
    btOK.text = "OK";
    btOK.preferredSize.width = 70;

    var btCancel = gButtons.add("button", undefined, undefined, { name: "btCancel" });
    btCancel.text = "Cancel";
    btCancel.preferredSize.width = 70;

    // Copyright
    var stCopyright = win.add("statictext", undefined, undefined, {
      name: "stCopyright",
    });
    stCopyright.text = _copyright + " @ " + _website;

    /////////////////////////////
    // WINDOW HELPER FUNCTIONS //
    /////////////////////////////

    /**
     * Load preset data into.
     * @param {String} k Key for preset lookup. Defaults to '[Default]'.
     */
    function loadPreset(k) {
      loading = true;

      k = prefs.data.hasOwnProperty(k) ? k : "[Default]";

      $.writeln("loading preset: " + k);

      var s = prefs.data[k];
      for (prop in s) {
        $.writeln("  " + prop + ": " + s[prop]);
      }

      rows.text = s.rows;
      rowGutter.text = UnitValue(s.rowGutter);
      cols.text = s.cols;
      colGutter.text = UnitValue(s.colGutter);
      color.selection = color.find(s.color);
      pattern.selection = pattern.find(s.pattern);
      filled.value = s.filled;
      stroked.value = !s.filled;
      preset.selection = preset.find(k);

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
     * Update the repeat preview template.
     */
    function updatePreview() {
      $.writeln("updating preview");
      try {
        // setup preview outline color
        outlineColor = loadPreviewColor(color.selection.text);

        // calculate all positions
        positions = calculateRepeatTranslationDeltas(
          parseInt(rows.text),
          rowGutter.text,
          parseInt(cols.text),
          colGutter.text,
          pattern.selection.text
        );

        // draw preview rectangles
        templateLayer = drawPreview(positions, outlineColor, filled.value);

        // update copies
        copies.text = rows.text * cols.text;

        // update overall dimensions
        var overallWidth = new UnitValue(
          placementInfo.width + positions[positions.length - 1][0],
          "pt"
        );
        var overallHeight = new UnitValue(
          placementInfo.height - positions[positions.length - 1][1],
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

    ////////////////////////////////////////////////////
    // INPUT HELPERS, VALIDATORS, AND EVENT LISTENERS //
    ////////////////////////////////////////////////////

    /**
     * Process user input changes.
     * @param {UIEvent} e ScriptUI change event.
     */
    function processChanges() {
      if (loading == false) {
        resetPresetUI();
        updatePreview();
      }
    }

    integerInputs = [rows, cols]; // int inputs
    for (var i = 0; i < integerInputs.length; i++) {
      integerInputs[i].validate = function () {
        $.writeln("validating " + this.properties.name);
        $.writeln("  input: " + this.text);

        var val;
        if (isNaN(this.text)) {
          app.beep();
          val = 1;
        } else {
          val = parseInt(this.text);
        }
        this.text = val;
        $.writeln("  result: " + val);
      };
      // add arrow key listener
      integerInputs[i].addEventListener("keydown", editTextArrowAdjustmentsRowCol);
    }

    var floatInputs = [rowGutter, colGutter];
    for (var i = 0; i < floatInputs.length; i++) {
      // add validation method
      floatInputs[i].validate = function () {
        var n;
        $.writeln("validating " + this.properties.name + ": " + this.text);
        n = parseNumberInput(this.text);
        // trim value
        n.value = n.value.toFixed(4);
        this.text = n;
      };
      // add arrow key listener
      floatInputs[i].addEventListener("keydown", editTextArrowAdjustmentsGutter);
    }

    // validate `edittext` inputs on before processing any template changes
    var textInputs = integerInputs.concat(floatInputs);
    for (var i = 0; i < textInputs.length; i++) {
      textInputs[i].onChange = function (e) {
        if (this.hasOwnProperty("validate")) {
          this.validate();
        }
        $.writeln(this.properties.name + " changed to " + this.text);
        processChanges();
      };
    }

    pattern.onChange = function () {
      $.writeln(this.properties.name + " changed to " + this.selection.text);
      processChanges();
    };

    color.onChange = function () {
      $.writeln(this.properties.name + " changed to " + this.selection.text);
      processChanges();
    };

    var radioButtons = [filled, stroked];
    for (var i = 0; i < radioButtons.length; i++) {
      radioButtons[i].onClick = function () {
        $.writeln(this.properties.name + " changed to " + this.value);
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
        $.writeln(this.properties.name + " changed to " + this.selection.text);
        loadPreset(this.selection.text);
      }
    };

    ////////////////////////////
    // WINDOW EVENT LISTENERS //
    ////////////////////////////

    // load initial presets
    win.onShow = function () {
      loadPreset(s);
    };

    /**
     * Reset the preset ui panel when a user makes input changes.
     */
    function resetPresetUI() {
      if (preset.selection != null) {
        $.writeln("resetting preset ui");
        preset.selection = null;
        btDelete.enabled = false;
      }
    }

    // delete selected preset
    btDelete.onClick = function () {
      if (
        Window.confirm(
          "Delete preset " + preset.selection.text + "?",
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
      var currentSettings = {
        rows: parseInt(rows.text),
        rowGutter: UnitValue(rowGutter.text).toString(),
        cols: parseInt(cols.text),
        colGutter: UnitValue(colGutter.text).toString(),
        pattern: pattern.selection.text,
        color: color.selection.text,
        filled: filled.value,
      };

      var saveName = savePresetDialog(presets);

      if (saveName) {
        prefs.data[saveName] = currentSettings;
        prefs.save();
        // reload preset dropdown
        presets = loadPresetsDropdown();
        // reset selection setting to new preset
        preset.selection = preset.find(saveName);
      }
    };

    stCopyright.addEventListener("mousedown", function () {
      openURL("https://joshbduncan.com");
    });

    // if "ok" button clicked then return inputs
    if (win.show() == 1) {
      cleanup();
      prefs.data["[Last Used]"] = {
        rows: parseInt(rows.text),
        rowGutter: UnitValue(rowGutter.text).toString(),
        cols: parseInt(cols.text),
        colGutter: UnitValue(colGutter.text).toString(),
        pattern: pattern.selection.text,
        color: color.selection.text,
        filled: filled.value,
      };
      prefs.save();
      return positions;
    } else {
      cleanup();
      return;
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
    var val, shift;
    if (e.keyName == "Up" || e.keyName == "Down") {
      if (isNaN(this.text)) {
        val = 1;
      } else {
        // if shift key is pressed when "Up" or "Down" key pressed
        // +/- the current value by 10 or round to the next 10th value
        //
        // Examples:
        // - "Up" with "Shift" at 22 increase value to 30
        // - "Down" with "Shift" at 22 decreases value to 20
        shift = e.getModifierState("Shift"); // check for shift key
        val = parseInt(this.text);
        if (e.keyName == "Up") {
          if (shift) {
            val = Math.max(1, parseInt(val / 10) * 10 + 10);
          } else {
            val = val + 1;
          }
        } else {
          if (shift) {
            val = Math.max(1, parseInt((val - 1) / 10) * 10);
          } else {
            val = Math.max(1, val - 1);
          }
        }
      }
      this.text = val;
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
    var val, shift;
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
      val = parseNumberInput(this.text);

      // determine proper increments for arrow key
      var increment = val.type === "in" ? 0.125 : 1;
      var shiftIncrement = val.type === "in" ? 1 : 10;

      if (e.keyName == "Up") {
        if (shift) {
          val = UnitValue(
            parseInt(val.value / shiftIncrement) * shiftIncrement + shiftIncrement,
            val.type
          );
        } else {
          val = val + increment;
        }
      } else {
        if (shift) {
          val = UnitValue(
            parseInt((val.value - 1) / shiftIncrement) * shiftIncrement,
            val.type
          );
        } else {
          val = UnitValue(val.value - increment, val.type);
        }
      }
      this.text = val;
      e.preventDefault();
      e.target.notify("onChange");
    }
  }
})();
