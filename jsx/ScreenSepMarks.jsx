/*
  ScreenSepMarks.jsx for Adobe Illustrator
  ---------------------------------------
  Easily add screen printing registration marks
  and spot color info to the current document.

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
  1.0.1 updated placement from dropdown to anchor checkboxes
  1.0.2 added unit specifier to size, stroke, and inset along with converter function
  1.0.3 added custom color selector
  1.0.4 added file info, date, and time output options
  1.0.5 rebuilt entire setting dialog
  1.0.6 last used settings now save to preferences and auto-load on next run
  1.1.0 added save/delete presets feature with a new save/replace dialog
  1.1.1 setup defaults `[Default]` that save to preferences and load on first run, can be updated by user
  1.1.2 took previous last used setting and added them to dropdown selection as [Last Used]
  1.1.3 any changes to settings now empties preset dropdown selection to clear confusion
  1.1.4 cleaned up a bug when no spot colors were found or no info was requested
  1.1.5 all new save settings function that uses a separate instead of clogging up app.preferences
  1.2.0 works with any spot color names, updated file info, updated saved settings/preferences
*/

(function () {
  //@target illustrator

  var _title = "Screen Print Separation Marks";
  var _version = "1.2.0";
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

    var rulerUnits = app.activeDocument.rulerUnits.toString().split(".")[1].toLowerCase();
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
   * @param {Object} logger Optional logger for debugging. Defaults to `$.writeln()`.
   */
  function Prefs(fp, version, logger) {
    if (typeof fp == "undefined")
      fp = Folder.userData + "/" + resolveBaseScriptFromStack() + ".json";

    this.version = typeof version !== "undefined" ? version : null;
    this.file = new File(fp);
    this.data = {};
    this.logger = logger;

    if (typeof this.logger == "undefined") {
      this.logger = {};
      this.logger.log = function (text) {
        args = [];
        for (var i = 0; i < arguments.length; ++i) args.push(arguments[i]);
        $.writeln(args.join(" "));
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

      this.logger.log("backing up prefs file:", backupFile);

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

      this.logger.log("loading prefs file:", f);

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

      this.logger.log("writing prefs file:", f);

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
          "No name provided!\nMake sure to provide a save name or pick a current present to replace.",
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

  // setup script defaults
  var defaults = {};
  defaults["[Default]"] = {
    tl: false,
    tc: true,
    tr: false,
    cl: false,
    cc: false,
    cr: false,
    bl: false,
    bc: true,
    br: false,
    size: "0.5 in",
    stroke: "1.0 pt",
    inset: "0.25 in",
    color: "[Registration]",
    spots: true,
    file: false,
    timestamp: false,
    position: "Top",
    alignment: "Left",
  };

  // grab document and swatch info
  var doc = app.activeDocument;
  var swatches = doc.swatches;
  var spotColors = doc.spots;

  // set development mode
  var dev = $.getenv("USER") === "jbd" ? true : false;

  // setup development logging
  var logger;
  if (dev) {
    var currentFile = new File($.fileName);
    var logFilePath = Folder.desktop + "/" + currentFile.name + ".log";
    logger = new Logger(logFilePath, "a", undefined, true);
    logger.log("**DEV MODE**", $.fileName);
  } else {
    logger = {};
    logger.log = function (text) {
      args = [];
      for (var i = 0; i < arguments.length; ++i) args.push(arguments[i]);
      $.writeln(args.join(" "));
    };
  }

  // load user prefs
  var prefs;
  prefs = new Prefs(undefined, _version);
  prefs.load(defaults);

  // get doc base ruler unit
  var rulerUnits = doc.rulerUnits.toString().split(".")[1].toLowerCase();

  // show the dialog
  var settings = dialog();
  if (!settings) return;

  // reset ruler so math works
  doc.rulerOrigin = [0, doc.height];

  // create a layer to hold information
  var layer = createWorkLayer("SEPMARKS");

  try {
    drawMarks(layer, settings);
    writeInfo(layer, settings);
  } catch (e) {
    logger.log("ERROR!", $.fileName + ":" + $.line, e);
    alert("ERROR!\n" + e.message);
    layer.remove();
    return;
  }

  // place layer in correct position and lock it
  layer.zOrderPosition = -1;
  layer.locked = true;

  //////////////////////////////
  // SCRIPT DRAWING FUNCTIONS //
  //////////////////////////////

  function createWorkLayer(name) {
    var layer;
    try {
      layer = doc.layers.getByName(name);
      logger.log("previous work layer found, removing all page items, unlocking layer");
      layer.locked = false;
      layer.pageItems.removeAll();
    } catch (e) {
      layer = doc.layers.add();
      layer.name = "SEPMARKS";
    }
    return layer;
  }

  function getSpotColor(name) {
    var color, spot;
    try {
      spot = spotColors.getByName(name);
      color = name;
    } catch (e) {
      logger.log(
        "spot color swatch '" + name + "' not found, defaulting to [Registration]",
      );
      color = "[Registration]";
    }
    return swatches.getByName(color);
  }

  function drawMarks(layer, settings) {
    // convert provided inputs to points
    var size = UnitValue(settings.size).as("pt");
    var stroke = UnitValue(settings.stroke).as("pt");
    var inset = UnitValue(settings.inset).as("pt");

    // make sure spot color is available
    var color = getSpotColor(settings.color);

    // calculate artboard edges
    var top = inset + size / 2;
    var bottom = doc.height - inset - size / 2;
    var left = inset + size / 2;
    var right = doc.width - inset - size / 2;
    var centerX = doc.width / 2;
    var centerY = doc.height / 2;
    var marks = {
      tl: { x: left, y: top },
      tc: { x: centerX, y: inset + size / 2 },
      tr: { x: right, y: inset + size / 2 },
      cl: { x: inset + size / 2, y: centerY },
      cr: { x: right, y: centerY },
      bl: { x: inset + size / 2, y: bottom },
      bc: { x: centerX, y: bottom },
      br: { x: right, y: bottom },
    };

    for (prop in marks) {
      if (!settings[prop]) continue;
      logger.log(
        "drawing mark",
        prop,
        "at (" + marks[prop].x + ", " + marks[prop].y + ")",
      );
      makeReg(layer, marks[prop].x, marks[prop].y, size, color, stroke);
    }
  }

  function makeReg(layer, x, y, size, color, strokeWeight) {
    // make a group to hold reg mark parts
    var regGroup = layer.groupItems.add();
    // draw circle part
    var circle = regGroup.pathItems.ellipse(
      -y + size / 2 / 2,
      x - size / 2 / 2,
      size / 2,
      size / 2,
    );
    circle.strokeColor = color.color;
    circle.stroked = true;
    circle.strokeWidth = strokeWeight;
    circle.filled = false;
    // draw x-line part
    var xLine = regGroup.pathItems.add();
    xLine.setEntirePath([
      [x - size / 2, -y],
      [x + size / 2, -y],
    ]);
    xLine.strokeColor = color.color;
    xLine.stroked = true;
    xLine.strokeWidth = strokeWeight;
    xLine.filled = false;
    // draw y-line part
    var yLine = regGroup.pathItems.add();
    yLine.setEntirePath([
      [x, -y + size / 2],
      [x, -y - size / 2],
    ]);
    yLine.strokeColor = color.color;
    yLine.stroked = true;
    yLine.strokeWidth = strokeWeight;
    yLine.filled = false;
  }

  function writeInfo(layer, settings) {
    var registrationColor = swatches.getByName("[Registration]");

    // insert spot color info first
    if (settings.spots) {
      // create a text frame
      var spotColorTextFrame = layer.textFrames.add();
      spotColorTextFrame.textRange.characterAttributes.size = 9;
      spotColorTextFrame.textRange.fillColor = registrationColor.color;
      spotColorTextFrame.top =
        settings.position == "Top" ? 0 : -doc.height + spotColorTextFrame.height;

      // add each spot color (and color characters)
      var spotColor, tr;
      for (var i = 0; i < spotColors.length; i++) {
        spotColor = doc.swatches.getByName(spotColors[i].name);

        // skip registration color
        if (spotColor.name == "[Registration]") continue;

        // add spot color name to text frame
        tr = spotColorTextFrame.words.add(spotColor.name);

        // color each character with the current spot color
        for (var j = 0; j < tr.characters.length; j++) {
          tr.characters[j].filled = true;
          tr.characters[j].fillColor = spotColor.color;
        }
      }

      // move text horizontally
      spotColorTextFrame.textRange.justification =
        settings.alignment == "Right" ? Justification.RIGHT : Justification.LEFT;
      spotColorTextFrame.left =
        settings.alignment == "Right" ? doc.width - spotColorTextFrame.width : 0;
    }

    var infoItems = [];
    if (settings.file) infoItems.push(doc.name);
    if (settings.timestamp) {
      var timestamp = new Date();
      infoItems.push(timestamp.toLocaleString());
    }

    if (infoItems.length > 0) {
      var infoTextFrame = layer.textFrames.add();
      infoTextFrame.textRange.characterAttributes.size = 9;
      infoTextFrame.textRange.fillColor = registrationColor.color;
      infoTextFrame.contents = infoItems.join(" | ");
      infoTextFrame.textRange.justification =
        settings.alignment == "Left" ? Justification.RIGHT : Justification.LEFT;
      infoTextFrame.top =
        settings.position == "Top" ? 0 : -doc.height + infoTextFrame.height;
      infoTextFrame.left =
        settings.alignment == "Left" ? doc.width - infoTextFrame.width : 0;
    }
  }

  ////////////////////////
  // MAIN SCRIPT DIALOG //
  ////////////////////////

  function dialog() {
    var s = "[Default]";

    // helpers to prevent multiple events from firing when loading presets
    var loading = false;
    var savingPreset = false;

    // dropdown options
    var arrSpotColors = [];
    for (var i = 0; i < spotColors.length; i++) {
      arrSpotColors.push(spotColors[i].name);
    }
    var arrPosition = ["Top", "Bottom"];
    var arrAlignment = ["Left", "Right"];

    var win = new Window("dialog");
    win.text = _title + " " + _version;
    win.orientation = "column";
    win.alignChildren = ["fill", "center"];
    win.margins = 16;

    // Panel - Registration
    var pRegistration = win.add("panel", undefined, "Registration Marks");
    pRegistration.orientation = "row";
    pRegistration.alignChildren = ["center", "top"];
    pRegistration.margins = 18;

    // Panel - Placement
    var pPlacement = pRegistration.add("panel", undefined, "Placement");
    pPlacement.orientation = "column";
    pPlacement.alignChildren = ["center", "center"];
    pPlacement.margins = 18;
    pPlacement.alignment = ["left", "fill"];

    // Group - Top
    var gTop = pPlacement.add("group", undefined);
    gTop.orientation = "row";
    var tl = gTop.add("checkbox", undefined);
    var tc = gTop.add("checkbox", undefined);
    var tr = gTop.add("checkbox", undefined);

    // Group - Center
    var gCenter = pPlacement.add("group", undefined);
    gCenter.orientation = "row";
    var cl = gCenter.add("checkbox", undefined);
    var cc = gCenter.add("checkbox", undefined);
    cc.enabled = false;
    var cr = gCenter.add("checkbox", undefined);

    // Group - Bottom
    var gBottom = pPlacement.add("group", undefined);
    gBottom.orientation = "row";
    var bl = gBottom.add("checkbox", undefined);
    var bc = gBottom.add("checkbox", undefined);
    var br = gBottom.add("checkbox", undefined);

    // Panel - Specs
    var pSpecs = pRegistration.add("panel", undefined, "Specs");
    pSpecs.orientation = "column";
    pSpecs.alignChildren = ["left", "top"];
    pSpecs.margins = 18;
    pSpecs.alignment = ["left", "fill"];

    // Group - Size
    var gSize = pSpecs.add("group", undefined, { name: "gSize" });
    gSize.orientation = "row";
    gSize.alignChildren = ["left", "center"];
    gSize.alignment = ["fill", "fill"];

    var stSize = gSize.add("statictext", undefined, "Size:", {
      name: "stSize",
    });
    stSize.justify = "right";
    stSize.preferredSize.width = 60;

    var size = gSize.add('edittext {justify: "center", properties: {name: "size"}}');
    size.text = "";
    size.preferredSize.width = 100;

    // Group - Stroke
    var gStroke = pSpecs.add("group", undefined, { name: "gStroke" });
    gStroke.orientation = "row";
    gStroke.alignChildren = ["left", "center"];
    gStroke.alignment = ["fill", "center"];

    var stStroke = gStroke.add("statictext", undefined, "Stroke:", {
      name: "stStroke",
    });
    stStroke.justify = "right";
    stStroke.preferredSize.width = 60;

    var stroke = gStroke.add(
      'edittext {justify: "center", properties: {name: "stroke"}}',
    );
    stroke.text = "";
    stroke.preferredSize.width = 100;

    // Group - Inset
    var gInset = pSpecs.add("group", undefined, { name: "gInset" });
    gInset.orientation = "row";
    gInset.alignChildren = ["left", "center"];
    gInset.alignment = ["fill", "center"];

    var stInset = gInset.add("statictext", undefined, "Inset:", {
      name: "stInset",
    });
    stInset.justify = "right";
    stInset.preferredSize.width = 60;

    var inset = gInset.add('edittext {justify: "center", properties: {name: "inset"}}');
    inset.text = "";
    inset.preferredSize.width = 100;

    // Group - Color
    var gColor = pSpecs.add("group", undefined);
    gColor.orientation = "row";
    gColor.alignChildren = ["left", "center"];
    gColor.alignment = ["fill", "center"];

    var stColor = gColor.add("statictext", undefined, "Color:", {
      name: "stColor",
    });
    stColor.justify = "right";
    stColor.preferredSize.width = 60;

    var color = gColor.add("dropdownlist", undefined, undefined, {
      name: "color",
      items: arrSpotColors,
    });
    // color.preferredSize.width = 100;

    // Panel - Output
    var pOutput = win.add("panel", undefined, "Output Information");
    pOutput.orientation = "column";
    pOutput.alignChildren = ["fill", "top"];
    pOutput.margins = 18;

    // Group - Output Options
    var gOutputOptions = pOutput.add("group", undefined);
    gOutputOptions.orientation = "row";
    gOutputOptions.alignChildren = ["left", "center"];

    var spots = gOutputOptions.add("checkbox", undefined, "Spot Colors");
    var file = gOutputOptions.add("checkbox", undefined, "File Info");
    var timestamp = gOutputOptions.add("checkbox", undefined, "Timestamp");

    // Group - Output position
    var gOutputPosition = pOutput.add("group", undefined);

    // Group - Position
    var gPosition = gOutputPosition.add("group", undefined);
    var stPosition = gPosition.add("statictext", undefined, "Position:");
    var position = gPosition.add("dropdownlist", undefined, arrPosition);
    position.preferredSize.width = 100;

    // Group - Alignment
    var gAlignment = gOutputPosition.add("group", undefined);
    var stAlignment = gAlignment.add("statictext", undefined, "Alignment:");
    var alignment = gAlignment.add("dropdownlist", undefined, arrAlignment);
    alignment.preferredSize.width = 100;

    // Panel - Presets
    var pPresets = win.add("panel", undefined, "Presets", { name: "pPresets" });
    pPresets.orientation = "row";
    pPresets.alignChildren = ["left", "center"];
    pPresets.margins = 18;
    pPresets.alignment = ["fill", "center"];

    // Group - Preset
    var gPreset = pPresets.add("group", undefined, { name: "gPreset" });
    gPreset.orientation = "row";
    gPreset.alignChildren = ["left", "center"];
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
    gPresetButtons.alignment = ["right", "center"];

    var btDelete = gPresetButtons.add("button", undefined, "Delete", {
      name: "btDelete",
    });
    btDelete.preferredSize.width = 80;
    btDelete.enabled = false;

    var btSave = gPresetButtons.add("button", undefined, "Save", { name: "btSave" });
    btSave.preferredSize.width = 80;

    // Group - Buttons
    var gButtons = win.add("group", undefined, { name: "gButtons" });
    gButtons.orientation = "row";
    gButtons.alignChildren = ["center", "center"];
    gButtons.margins = 10;

    var btOK = gButtons.add("button", undefined, "OK", { name: "btOK" });
    btOK.preferredSize.width = 100;

    var btCancel = gButtons.add("button", undefined, "Cancel", { name: "btCancel" });
    btCancel.preferredSize.width = 100;

    // Copyright
    var stCopyright = win.add("statictext", undefined, _copyright + " @ " + _website, {
      name: "stCopyright",
    });
    stCopyright.justify = "center";

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

      // check position boxes
      tl.value = s.tl;
      tc.value = s.tc;
      tr.value = s.tr;
      cl.value = s.cl;
      cc.value = s.cc;
      cr.value = s.cr;
      bl.value = s.bl;
      bc.value = s.bc;
      br.value = s.br;

      // convert size, inset units to match the document ruler units
      var sizeUnitValue = parseNumberInput(s.size);
      // sizeUnitValue.convert(rulerUnits);
      sizeUnitValue.value = sizeUnitValue.value.toFixed(4);
      size.text = sizeUnitValue;

      var insetUnitValue = parseNumberInput(s.inset);
      // insetUnitValue.convert(rulerUnits);
      insetUnitValue.value = insetUnitValue.value.toFixed(4);
      inset.text = insetUnitValue;

      var strokeUnitValue = parseNumberInput(s.stroke);
      stroke.text = strokeUnitValue;

      // set output information
      spots.value = s.spots;
      file.value = s.file;
      timestamp.value = s.timestamp;

      // set dropdowns
      color.selection = color.find(s.color);
      if (color.selection == null) {
        alert(
          "Spot Color Not Found\n" +
            s.color +
            " not found. Defaulting to [Registration].",
        );
        color.selection = color.find("[Registration]");
      }
      position.selection = position.find(s.position);
      alignment.selection = alignment.find(s.alignment);

      // set the preset dropdown
      preset.selection = preset.find(k);

      loading = false;
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
     * Format the current dialog setting into an a proper object.
     * @returns {Object} Current dialog settings.
     */
    function getCurrentDialogSettings() {
      return {
        tl: tl.value,
        tc: tc.value,
        tr: tr.value,
        cl: cl.value,
        cc: cc.value,
        cr: cr.value,
        bl: bl.value,
        bc: bc.value,
        br: br.value,
        size: UnitValue(size.text).toString(),
        stroke: UnitValue(stroke.text).toString(),
        inset: UnitValue(inset.text).toString(),
        color: color.selection.text,
        spots: spots.value,
        file: file.value,
        timestamp: timestamp.value,
        position: position.selection.text,
        alignment: alignment.selection.text,
      };
    }

    ////////////////////////////////////////////////////
    // INPUT HELPERS, VALIDATORS, AND EVENT LISTENERS //
    ////////////////////////////////////////////////////

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

    // validate `edittext` float inputs on before processing any template changes
    var floatInputs = [size, stroke, inset];
    for (var i = 0; i < floatInputs.length; i++) {
      // add validation method
      floatInputs[i].validate = function () {
        var n;
        logger.log("validating:", this.properties.name, "(" + this.text + ")");

        var defaultUnit = this.properties.name == "stroke" ? "pt" : undefined;
        n = parseNumberInput(this.text, undefined, defaultUnit);

        // keep stroke in pt
        if (this.properties.name == "stroke") n.convert("pt");

        // trim value
        n.value = n.value.toFixed(4);

        // limit downside
        if (n.value < 0) n.value = 0;
        this.text = n;
      };

      floatInputs[i].onChange = function (e) {
        if (this.hasOwnProperty("validate")) {
          this.validate();
        }
        logger.log("changed:", this.properties.name, "(" + this.text + ")");
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
          "Delete Preset",
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
      var saveName = savePresetDialog(presets);

      if (!saveName) {
        return;
      }

      // since `dropdownlist.find()` send an onChange event, halt reloading the same preset
      savingPreset = true;

      prefs.data[saveName] = getCurrentDialogSettings();
      prefs.save();
      // reload preset dropdown
      presets = loadPresetsDropdown();
      // reset selection setting to new preset
      preset.selection = preset.find(saveName);

      savingPreset = false;
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

    var onChangeResets = [size, stroke, inset, color, position, alignment];
    for (var i = 0; i < onChangeResets.length; i++) {
      onChangeResets[i].onChange = function () {
        preset.selection = null;
        btDelete.enabled = false;
      };
    }

    var onClickResets = [tl, tc, tr, cl, cc, cr, bl, bc, br, spots, file, timestamp];
    for (var i = 0; i < onClickResets.length; i++) {
      onClickResets[i].onClick = function () {
        preset.selection = null;
        btDelete.enabled = false;
      };
    }

    // if "ok" button clicked then return inputs
    if (win.show() == 1) {
      var currentSettings = getCurrentDialogSettings();
      prefs.data["[Last Used]"] = currentSettings;
      prefs.save();
      return currentSettings;
    }
  }
})();
