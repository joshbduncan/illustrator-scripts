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
  } catch (e) {
    alert("Error loading file:\n" + f);
  } finally {
    f.close();
  }
  obj = eval(json);
  return obj;
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
  } catch (e) {
    alert("Error writing file:\n" + f);
    return false;
  } finally {
    f.close();
  }
  return true;
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
        Error.runtimeError(
          1,
          "Error!\nPreferences file error. Backup created.",
        );
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
