// savePrefsFromDialog.jsx

(function () {
  // setup locations and products for the dialog
  var locations = ["Location 1", "Location 2", "Location 3"];
  var products = ["Product 1", "Product 2", "Product 3"];
  // define the defaults in case a preferences file isn't found
  // must be one of the options in the two objects above
  var defaults = { location: "Location 1", product: "Product 3" };

  // make sure there is an open Illustrator document
  if (!app.documents.length) {
    alert("No documents open!\nCreate or open a document first.");
    return;
  }

  // run the script
  var doc = app.activeDocument;

  /*
  setup your prefs file as an Illustrator file object and load
  the prefs if the file can be found else load defaults from above
  https://extendscript.docsforadobe.dev/file-system-access/folder-object.html?highlight=folder
  https://extendscript.docsforadobe.dev/file-system-access/file-object.html
  */
  var prefsFile = new File(Folder.myDocuments + "/prefs.json");
  var prefsData = prefsFile.exists ? readJSONData(prefsFile) : defaults;

  // present the dialog and return the user selected settings as an object
  var settings = settingsWin(prefsData);
  if (settings) {
    alert(
      "User Settings Saved!\nSelected Location: " +
        settings.location +
        "\nSelected Product: " +
        settings.product,
    );
  }

  // read json "type" data from a file
  function readJSONData(file) {
    var obj, json;
    try {
      file.encoding = "UTF-8";
      file.open("r");
      json = file.read();
      file.close();
    } catch (e) {
      alert("Error loading " + file + " file!");
    }
    obj = eval(json);
    return obj;
  }

  // write json "type" date to a file
  function writeJSONData(obj, file) {
    var data = obj.toSource();
    try {
      file.encoding = "UTF-8";
      file.open("w");
      file.write(data);
      file.close();
    } catch (e) {
      alert("Error writing file " + file + "!");
    }
  }

  // get selected radio button from array
  function captureRBSelection(rbs) {
    for (var i = 0; i < rbs.length; i++) {
      if (rbs[i].value) return rbs[i].text;
    }
    return null;
  }

  function settingsWin(prefsData) {
    // create a new dialog
    var win = new Window("dialog");
    win.text = "Save Preferences From Dialog Example";

    // create a radio button for each location
    win.add("statictext", undefined, "Select Your Location");
    var gLocation = win.add("group");
    var locationRBs = [];
    var rb;
    for (var i = 0; i < locations.length; i++) {
      rb = gLocation.add("radiobutton", undefined, locations[i]);
      if (prefsData["location"] == locations[i]) rb.value = true;
      locationRBs.push(rb);
    }

    // create a radio button for each product
    win.add("statictext", undefined, "Select Your Product Type");
    var gProducts = win.add("group");
    var productRBs = [];
    var rb;
    for (var i = 0; i < products.length; i++) {
      rb = gProducts.add("radiobutton", undefined, products[i]);
      if (prefsData["product"] == products[i]) rb.value = true;
      productRBs.push(rb);
    }

    // setup window buttons
    var gWindowButtons = win.add("group", undefined);
    var btOK = gWindowButtons.add("button", undefined, "OK");
    var btCancel = gWindowButtons.add("button", undefined, "Cancel");

    // if "ok" button clicked then return inputs
    if (win.show() == 1) {
      // check to see which location and product was selected
      var selectedSettings = {
        location: captureRBSelection(locationRBs),
        product: captureRBSelection(productRBs),
      };
      // save the selected settings
      writeJSONData(selectedSettings, prefsFile);
      // return the setting for use later in the script
      return selectedSettings;
    } else {
      return;
    }
  }
})();
