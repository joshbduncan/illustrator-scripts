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
  0.7.0 2024-06-18
    added:
      - auto centering when fill artboard is selected
      - preview checkbox to enable/disable preview
    fixed:
      - fixed lookup for pattern
      - loading padding value
*/

(function () {
  //@target illustrator

  var _title = "RepeatAfterMe";
  var _version = "0.7.0";
  var _copyright = "Copyright 2024 Josh Duncan";
  var _website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////


  /**
   * Module for easy file logging from within Adobe ExtendScript.
   * @param {String} fp File path for the log file. Defaults to `Folder.userData/{base_script_file_name}.log`.
   * @param {String} mode Optional log file write mode. Write `w` mode or append `a` mode. If write mode 'w', the log file will be overwritten on each script run. Defaults to `w`.
   * @param {Number} sizeLimit Log file size limit (in bytes) for rotation. Defaults to 5,000,000.
   * @param {Boolean} console Forward calls to `Logger.log()` to the JavaScript Console via `$.writeln()`. Defaults to `false`.
   */
  function Logger(fp, mode, sizeLimit, console) {
    if (typeof fp == "undefined")
      fp = Folder.userData + "/" + resolveBaseScriptFromStack() + ".log";

    this.mode = typeof mode !== "undefined" ? mode.toLowerCase() : "w";
    this.console = typeof console !== "undefined" ? console : false;
    this.file = new File(fp);
    this.badPath = false;

    // rotate log if too big
    sizeLimit = typeof sizeLimit !== "undefined" ? Number(sizeLimit) : 5000000;
    if (this.file.length > sizeLimit) {
      var ts = Date.now();
      var rotatedFile = new File(this.file + ts + ".bak");
      this.file.copy(rotatedFile);
      this.file.remove();
      alert(this.file);
    }
  }

  Logger.prototype = {
    /**
     * Backup the log file.
     * @returns {FileObject} Backup file object.
     */
    backup: function () {
      var backupFile = new File(this.file + ".bak");
      this.file.copy(backupFile);
      return backupFile;
    },
    /**
     * Write data to the log file.
     * @param {String} text One or more strings to write, which are concatenated to form a single string.
     * @returns {Boolean} Returns true if log file is successfully written, false if unsuccessful.
     */
    log: function (text) {
      // no need to keep alerting when the log path is bad
      if (this.badPath) return false;

      var f = this.file;
      var m = this.mode;
      var ts = new Date().toLocaleString();

      // ensure parent folder exists
      if (!f.parent.exists) {
        if (!f.parent.parent.exists) {
          alert("Bad log file path!\n'" + this.file + "'");
          this.badPath = true;
          return false;
        }
        f.parent.create();
      }

      // grab all arguments
      var args = ["[" + ts + "]"];
      for (var i = 0; i < arguments.length; ++i) args.push(arguments[i]);

      // write the data
      try {
        f.encoding = "UTF-8";
        f.open(m);
        f.writeln(args.join(" "));
        f.close();
      } catch (e) {
        $.writeln("Error writing file:\n" + f);
        return false;
      }

      // write `text` to the console if requested
      if (this.console) $.writeln(args.slice(1, args.length).join(" "));

      return true;
    },
    /**
     * Open the log file.
     */
    open: function () {
      this.file.execute();
    },
    /**
     * Reveal the log file in the platform-specific file browser.
     */
    reveal: function () {
      this.file.parent.execute();
    },
  };
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
    Changelog
    ---------
    2021-09-13
      - updated getVisibleBounds() to catch lots of weird edge cases
    2021-10-13
      - updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
    2021-10-15
      - fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
      - error catch for selected guides (William Dowling @ github.com/wdjsdev)
      - error catch for empty objects or item with no bounds
      - error catch for clipping masks inside of an empty group
  */

  /**
   * Determine the actual "visible" bounds for an object if clipping mask or compound path items are found.
   * @param {PageItem} o A single Adobe Illustrator pageItem.
   * @returns {Array} Object bounds [left, top, right, bottom].
   */
  function getVisibleBounds(o) {
    var bounds, clippedItem, sandboxItem, sandboxLayer;
    var curItem;

    // skip guides (via william dowling @ github.com/wdjsdev)
    if (o.guides) {
      return undefined;
    }

    if (o.typename == "GroupItem") {
      // if the group has no pageItems, return undefined
      if (!o.pageItems || o.pageItems.length == 0) {
        return undefined;
      }
      // if the object is clipped
      if (o.clipped) {
        // check all sub objects to find the clipping path
        for (var i = 0; i < o.pageItems.length; i++) {
          curItem = o.pageItems[i];
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
          clippedItem = o.pageItems[0];
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
        for (var i = 0; i < o.pageItems.length; i++) {
          curItem = o.pageItems[i];
          subObjectBounds = getVisibleBounds(curItem);
          for (var j = 0; j < subObjectBounds.length; j++) {
            allBoundPoints[j].push(subObjectBounds[j]);
          }
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
      bounds = o.geometricBounds;
    }
    return bounds;
  }

  /**
   * Determine the overall bounds of an Adobe Illustrator selection.
   * @param {Array} sel Adobe Illustrator selection. Defaults to the selection of the active document.
   * @param {string} type Type of bounds to return (control, geometric, visible, clipped). Defaults to geometric.
   * @returns {Array} Selection bounds [left, top, right, bottom].
   */
  function getSelectionBounds(sel, type) {
    sel = typeof sel !== "undefined" ? sel : app.activeDocument.selection;
    type = typeof type !== "undefined" ? type.toLowerCase() : "geometric";

    var bounds = [[], [], [], []];
    var cur;
    for (var i = 0; i < sel.length; i++) {
      switch (type) {
        case "control":
          cur = sel[i].geometricBounds;
          break;
        case "visible":
          cur = sel[i].visibleBounds;
          break;
        case "clipped":
          cur = getVisibleBounds(sel[i]);
          break;
        default:
          cur = sel[i].geometricBounds;
          break;
      }
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

    var rulerUnits = doc.rulerUnits.toString().split(".")[1].toLowerCase();
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
   * Determine the base calling script from the current stack.
   * @returns {String} Initial script name.
   */
  function resolveBaseScriptFromStack() {
    var stack = $.stack.split("\n");
    var foo, bar;
    for (var i = 0; i < stack.length; i++) {
      foo = stack[i];
      if (foo[0] == "[" && foo[foo.length - 1] == "]") {
        bar = foo.slice(1, foo.length - 1);
        if (isNaN(bar)) {
          break;
        }
      }
    }
    return bar;
  }

  /**
   * Module for easily storing script preferences.
   * @param {String} fp File path for the for the saved preferences "JSON-like" file. Defaults to `Folder.userData/{base_script_file_name}.json`.
   * @param {String} version Optional script version number to include in the preferences file. Helps with debugging.
   * @param {Object} mode Optional logger for debugging. Defaults to `$.writeln()`.
   */
  function Prefs(fp, version) {
    if (typeof fp == "undefined")
      fp = Folder.userData + "/" + resolveBaseScriptFromStack() + ".json";

    this.version = typeof version !== "undefined" ? version : null;
    this.file = new File(fp);
    this.data = {};

    if (typeof logger == "undefined") {
      logger = {};
      logger.log = function (text) {
        $.writeln(text);
      };
    }
  }

  Prefs.prototype = {
    /**
     * Backup the prefs file.
     * @returns {FileObject} Backup file object.
     */
    backup: function () {
      var f = this.file;
      var backupFile = new File(f + ".bak");

      logger.log("backing up prefs file:", backupFile);

      f.copy(backupFile);
      return backupFile;
    },
    /**
     * Load preferences file data into the `prefs.data` object.
     * @param {Object} defaultData Default data to load if the data file does not exist.
     * @returns {Boolean} Load success.
     */
    load: function (defaultData) {
      defaultData = typeof defaultData !== "undefined" ? defaultData : {};
      var f = this.file;
      var json;

      logger.log("loading prefs file:", f);

      if (f.exists) {
        try {
          json = readJSONData(f);
        } catch (e) {
          f.rename(f.name + ".bak");
          this.reveal();
          Error.runtimeError(1, "Error!\nPreferences file error. Backup created.");
          return false;
        }
      } else {
        json = {};
        json.data = defaultData;
      }

      this.data = json.data;
      return true;
    },
    /**
     * Open the log file.
     */
    open: function () {
      this.file.execute();
    },
    /**
     * Reveal the preferences file in the platform-specific file browser.
     */
    reveal: function () {
      this.file.parent.execute();
    },
    /**
     * Write preferences to disk. Only `prefs.data` will be saved.
     * @returns {Boolean} Save success.
     */
    save: function () {
      var f = this.file;

      logger.log("writing prefs file:", f);

      // ensure parent folder exists
      if (!f.parent.exists) {
        if (!f.parent.parent.exists) {
          Error.runtimeError(1, "Bad preferences file path!\n" + this.file + "'");
          return false;
        }
        f.parent.create();
      }

      // setup the data object
      var d = {
        data: this.data,
        version: this.version,
        timestamp: Date.now(),
      };
      return writeJSONData(d, f);
    },
  };
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
  /**
   * Write ExtendScript "json-like" data to disk.
   * @param {Object} data Data to be written.
   * @param {File} f File object to write to.
   * @returns {Boolean} Write success.
   */
  function writeJSONData(data, f) {
    try {
      f.encoding = "UTF-8";
      f.open("w");
      f.write(data.toSource());
      f.close();
    } catch (e) {
      alert("Error writing file:\n" + f);
      return false;
    }
    return true;
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
    center: true,
    rows: 3,
    rowGutter: ".25 in",
    cols: 2,
    colGutter: ".25 in",
    pattern: "Grid",
    bounds: "clipped",
    preview: true,
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
  var prefs;
  prefs = new Prefs(Folder.userData + "/JBD/" + _title + ".json", _version);
  prefs.load(defaults);

  // get the current artboard
  var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
  var abInfo = GetObjectPlacementInfo(ab.artboardRect);

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
    var s = "[Default]";

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
    gPattern.alignment = ["left", "center"];

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

    var divider1 = pLayout.add("panel", undefined, undefined, { name: "divider1" });
    divider1.alignment = "fill";

    // Group - Artboard
    var gArtboard = pLayout.add("group", undefined, { name: "gArtboard" });
    gArtboard.orientation = "column";
    gArtboard.alignChildren = ["left", "bottom"];
    gArtboard.spacing = 10;
    gArtboard.margins = 0;
    gArtboard.alignment = ["fill", "center"];

    // Group - Fill Artboard
    var gFill = gArtboard.add("group", undefined, { name: "gFill" });
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

    var center = gArtboard.add("checkbox", undefined, "Center on Artboard", {
      name: "fill",
    });
    center.enabled = false;

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
    btDelete.preferredSize.width = 80;
    btDelete.enabled = false;

    var btSave = gPresetButtons.add("button", undefined, "Save", { name: "btSave" });
    btSave.preferredSize.width = 80;

    // Group - Preview
    var gPreview = win.add("group", undefined, { name: "gPreview" });
    gPreview.orientation = "row";
    gPreview.alignChildren = ["left", "center"];
    gPreview.spacing = 10;
    gPreview.margins = [10, 5, 0, 0];
    gPreview.alignment = ["left", "center"];

    var preview = gPreview.add("checkbox", undefined, "Preview", {
      name: "preview",
    });

    // Group - Buttons
    var gButtons = win.add("group", undefined, { name: "gButtons" });
    gButtons.orientation = "row";
    gButtons.alignChildren = ["right", "center"];
    gButtons.spacing = 10;
    gButtons.margins = 10;

    var btOK = gButtons.add("button", undefined, "OK", { name: "btOK" });
    btOK.preferredSize.width = 100;

    var btCancel = gButtons.add("button", undefined, "Cancel", { name: "btCancel" });
    btCancel.preferredSize.width = 100;

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
      var paddingUnitValue = parseNumberInput(s.padding);
      paddingUnitValue.convert(rulerUnits);
      paddingUnitValue.value = paddingUnitValue.value.toFixed(4);

      padding.text = paddingUnitValue;
      center.value = s.center;
      rows.text = s.rows;
      rowGutter.text = rowGutterUnitValue;
      cols.text = s.cols;
      colGutter.text = colGutterUnitValue;
      pattern.selection = pattern.find(s.pattern);
      preview.value = s.preview;

      // find the correct bounds radio button and click on it
      win.findElement(s.bounds.toLowerCase()).notify("onClick");

      // set the preset dropdown
      preset.selection = preset.find(k);

      // click fill artboard if set
      if (s.fill && !fill.value) fill.notify("onClick");

      loading = false;

      update();
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

      if (preview.value) {
        // create a temp layer to hold preview items
        templateLayer = doc.layers.add();
        templateLayer.name = layerName;

        // create a temporary item to fix any issues with the appearance panel
        var t = templateLayer.pathItems.rectangle(0, 0, 1, 1);
        app.executeMenuCommand("expandStyle");
        t.remove();

        // draw initial preview rectangle.
        var rect = templateLayer.pathItems.rectangle(
          placementInfo.top,
          placementInfo.left,
          placementInfo.width,
          placementInfo.height
        );

        rect.filled = false;
        rect.stroked = true;
        rect.strokeColor = outlineColor;
        rect.strokeWidth = strokeWidth;

        // offset original base rectangle if artboard fill
        if (fill.value) {
          // determine correct offset for artboard
          var abOffsets = calculateArtboardOffsets(center.value);
          var topOffset = abOffsets[0];
          var leftOffset = abOffsets[1];

          rect.translate(leftOffset, topOffset);
        }

        // draw all copies
        var dup;
        for (var i = 1; i < positions.length; i++) {
          dup = rect.duplicate();
          dup.translate(positions[i][0], positions[i][1]);
        }
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
        center: center.value,
        rows: parseInt(rows.text),
        rowGutter: UnitValue(rowGutter.text).toString(),
        cols: parseInt(cols.text),
        colGutter: UnitValue(colGutter.text).toString(),
        pattern: pattern.selection.text,
        bounds: boundsType,
        preview: preview.value,
      };
    }

    /**
     * Calculate translation deltas for each repeat item.
     * @returns {Array} Translation offset values for each repeat as [x, y].
     */
    function calculateTranslationDeltas() {
      logger.log("calculating translation deltas");

      // convert required values
      var _rows = parseInt(rows.text);
      var _rowGutter = UnitValue(rowGutter.text).as("pt");
      var _cols = parseInt(cols.text);
      var _colGutter = UnitValue(colGutter.text).as("pt");
      var _pattern = pattern.selection.text.toLowerCase();

      // calculate the x and y translation offset values for each repeat
      var positions = [];
      var tx, ty, rowOffset, colOffset;
      for (var r = 0; r < _rows; r++) {
        // offset every other row when pattern is "brick by row"
        rowOffset =
          r % 2 === 1 && _pattern === "brick by row" ? placementInfo.width / 2 : 0;
        for (var c = 0; c < _cols; c++) {
          // offset every other column when pattern is "brick by column"
          colOffset =
            c % 2 === 1 && _pattern === "brick by column"
              ? placementInfo.height / 2
              : 0;

          tx = c * (placementInfo.width + _colGutter);
          ty = r * (placementInfo.height + _rowGutter) * -1;

          positions.push([tx + rowOffset, ty - colOffset]);
        }
      }
      return positions;
    }

    /**
     * Calculate the offset for filling the artboard with the current repeat pattern.
     * @param {Boolean} center Should the pattern be centered? Defaults to false.
     * @returns {Array} Offset `[topOffset, leftOffset]` as points.
     */
    function calculateArtboardOffsets(center) {
      center = typeof center !== "undefined" ? center : false;

      // get pattern dimensions
      var patternDimensions = calculateRepeatDimensions();
      var patternWidth = patternDimensions[0].as("pt");
      var patternHeight = patternDimensions[1].as("pt");

      // zero out to artboard origin
      var topOffset = abInfo.top - placementInfo.top;
      var leftOffset = abInfo.left - placementInfo.left;

      // adjust offset to center repeat pattern on current artboard
      if (center) {
        topOffset = topOffset - (abInfo.height - patternHeight) / 2;
        leftOffset = leftOffset + (abInfo.width - patternWidth) / 2;
      }

      return [topOffset, leftOffset];
    }

    /**
     * Calculate the overall dimension of the repeat pattern.
     * @returns {Array} Pattern dimensions `[width, height]` in document ruler units.
     */
    function calculateRepeatDimensions() {
      // convert required values
      var _rows = parseInt(rows.text);
      var _rowGutter = UnitValue(rowGutter.text);
      _rowGutter.convert("pt");
      var _cols = parseInt(cols.text);
      var _colGutter = UnitValue(colGutter.text);
      _colGutter.convert("pt");
      var _pattern = pattern.selection.text.toLowerCase();

      var width =
        _cols * placementInfo.width +
        (_cols - 1) * _colGutter +
        (_pattern === "brick by row" ? placementInfo.width / 2 : 0);
      var height =
        _rows * placementInfo.height +
        (_rows - 1) * _rowGutter +
        (_pattern === "brick by column" ? placementInfo.height / 2 : 0);

      // convert to current ruler unit
      width.convert(rulerUnits);
      height.convert(rulerUnits);

      return [width, height];
    }

    /**
     * Update the repeat preview template.
     */
    function update() {
      try {
        // calculate all positions
        positions = calculateTranslationDeltas();

        logger.log("updating preview");

        // update info
        var patternDimensions = calculateRepeatDimensions();
        var _width = patternDimensions[0];
        var _height = patternDimensions[1];
        width.text = _width.value.toFixed(4) + " " + _width.type;
        height.text = _height.value.toFixed(4) + " " + _height.type;

        copies.text = (parseInt(rows.text) * parseInt(cols.text)).toString();

        // draw preview rectangles
        templateLayer = drawPreview(positions);
      } catch (e) {
        logger.log("ERROR!", $.fileName + ":" + $.line, e.message);
        cleanup();
      }
    }

    /**
     * Duplicate the selected artwork.
     */
    function duplicateObjects() {
      try {
        var repeats = [];
        for (var i = 0; i < sel.length; i++) {
          // offset original selection if fill artboard
          if (fill.value) {
            // determine correct offset for artboard
            var abOffsets = calculateArtboardOffsets(center.value);
            var topOffset = abOffsets[0];
            var leftOffset = abOffsets[1];

            sel[i].translate(leftOffset, topOffset);
          }
          // draw all copies
          var dup;
          for (var j = 1; j < positions.length; j++) {
            dup = sel[i].duplicate();
            dup.translate(positions[j][0], positions[j][1]);
            repeats.push(dup);
          }
        }
      } catch (e) {
        logger.log("ERROR!", $.fileName + ":" + $.line, e);
        alert("ERROR!\n" + e.message);
        // clean up newly created objects
        for (var i = 0; i < repeats.length; i++) {
          repeats[i].remove();
        }
      }
    }

    ////////////////////////////////////////////////////
    // INPUT HELPERS, VALIDATORS, AND EVENT LISTENERS //
    ////////////////////////////////////////////////////

    /**
     * Process user input changes.
     */
    function processChanges() {
      logger.log("processing changes...", "(loading: " + loading + ")");

      if (loading) return;

      // calculate artboard fill if needed
      if (fill.value) {
        // calculate rows and cols to fill the entire artboard
        var availableWidth, availableHeight, calcRows, calcCols, width, height;

        var _rows = parseInt(rows.text);
        var _rowGutter = UnitValue(rowGutter.text).as("pt");
        var _cols = parseInt(cols.text);
        var _colGutter = UnitValue(colGutter.text).as("pt");
        var _padding = UnitValue(padding.text).as("pt");
        var _pattern = pattern.selection.text.toLowerCase();

        // get the artboard width and height
        availableWidth = abInfo.width - _padding * 2;
        availableHeight = abInfo.height - _padding * 2;

        // account for pattern
        if (pattern.selection.text.toLowerCase() == "brick by row") {
          availableWidth -= placementInfo.width / 2;
        }
        if (pattern.selection.text.toLowerCase() == "brick by column") {
          availableHeight -= placementInfo.height / 2;
        }

        // calculate the max rows and cols that will fit on the artboard
        calcCols = Math.floor(
          (availableWidth + _colGutter) / (placementInfo.width + _colGutter)
        );
        calcRows = Math.floor(
          (availableHeight + _rowGutter) / (placementInfo.height + _rowGutter)
        );

        rows.text = Math.max(1, calcRows);
        cols.text = Math.max(1, calcCols);
      }

      resetPresetUI();
      update();
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
      center.enabled = this.value;
      rows.enabled = !this.value;
      cols.enabled = !this.value;

      processChanges();
    };

    center.onClick = function () {
      logger.log("changed:", this.properties.name, "(" + this.value + ")");

      processChanges();
    };

    integerInputs = [rows, cols]; // int inputs
    for (var i = 0; i < integerInputs.length; i++) {
      integerInputs[i].validate = function () {
        logger.log("validating:", this.properties.name, "(" + this.text + ")");

        var n;
        if (isNaN(this.text)) {
          app.beep();
          n = 1;
        } else {
          n = parseInt(this.text);
        }
        this.text = Math.max(1, n);
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

        // limit downside
        if (n.value < 0) n.value = 0;
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

    preview.onClick = function () {
      logger.log("changed:", this.properties.name, "(" + this.value + ")");
      processChanges();
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
