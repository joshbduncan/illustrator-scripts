// https://community.adobe.com/t5/illustrator-discussions/function-not-functioning-wring-to-json-file/m-p/13023351#M326015

//////////////////////////////////////////////////////////////////////////
// SCRIPT SETUP
//////////////////////////////////////////////////////////////////////////

// setup each location and it's path
var locations = {
  "Loc 1": Folder.myDocuments + "/subfolder1/subfolder2/loc1/",
  "Loc 2": Folder.myDocuments + "/subfolder1/subfolder2/loc2/",
  "Loc 3": Folder.myDocuments + "/subfolder1/subfolder2/loc3/",
  "Loc 4": Folder.myDocuments + "/subfolder1/subfolder2/loc4/",
  "Loc 5": Folder.myDocuments + "/subfolder1/subfolder2/loc5/",
};
// setup each product type and it's subfolder
var products = {
  "Prod 1": "prod1/",
  "Prod 2": "prod2/",
  "Prod 3": "prod3/",
  "Prod 4": "prod4/",
};

// define the defaults in case a pref file isn't found
// must be one of the options in the two objects above
var defaults = {
  location: "Loc 2",
  product: "Prod 4",
};

// setup your prefs folder as an Illustrator Folder object
//https://extendscript.docsforadobe.dev/file-system-access/folder-object.html?highlight=folder
var prefFolder = setupFolderObject(Folder.myDocuments + "/" + "Prefs");

// setup your prefs file as an Illustrator File object and load
// the prefs if the file can be found else load defaults from above
// https://extendscript.docsforadobe.dev/file-system-access/file-object.html
var prefsFile = setupFileObject(prefFolder, "prefs.json");
var prefs = prefsFile.exists ? loadJSONData(prefsFile) : defaults;

//////////////////////////////////////////////////////////////////////////
// MAIN SCRIPT
//////////////////////////////////////////////////////////////////////////

var doc = app.activeDocument;

// present the dialog and return the user selected settings in an object
var settings = settingsWin(prefs);
if (settings) {
  var folderLocation = locations[settings.location] + products[settings.product];
  var saveFolder = setupFolderObject(folderLocation);
  alert("Folder " + saveFolder + " created!");
  // do do more stuff here
}

//////////////////////////////////////////////////////////////////////////
// SUPPLEMENTAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////

function setupFolderObject(folderPath) {
  var settingsFolder = new Folder(folderPath);
  if (!settingsFolder.exists) settingsFolder.create();
  return settingsFolder;
}

function setupFileObject(folder, fileName) {
  var settingsFilePath = folder + "/" + fileName;
  return new File(settingsFilePath);
}

function loadJSONData(file) {
  try {
    file.encoding = "UTF-8";
    file.open("r");
    var json = file.read();
    file.close();
    obj = eval(json);
    // alert("Preferences " + file + " loaded successfully!");
    return obj;
  } catch (e) {
    alert("Error loading " + file + " file! Loading defaults instead.");
    return defaults;
  }
}

function writeJSONData(obj, file) {
  try {
    file.encoding = "UTF-8";
    file.open("w");
    var data = obj.toSource();
    file.write(data);
    file.close();
    // alert("Preferences written to file " + file + "!");
  } catch (e) {
    alert("Error saving setting file " + file + "!");
  }
}

function getKeys(obj) {
  keys = [];
  for (var k in obj) {
    keys.push(k);
  }
  return keys;
}

function captureRBSelection(rbs) {
  var selection = null;
  for (var i = 0; i < rbs.length; i++) {
    if (rbs[i].value) selection = rbs[i].text;
  }
  return selection;
}

//////////////////////////////////////////////////////////////////////////
// USER DIALOG
//////////////////////////////////////////////////////////////////////////

function settingsWin(loadedPrefs) {
  // create a new dialog
  var win = new Window("dialog");
  win.text = "Production Art Save Options";

  // create a radio button for each location
  win.add("statictext", undefined, "Please Verify Your Location");
  var locationsKeys = getKeys(locations);
  var gLocation = win.add("group");
  var rb;
  var locationRBs = [];
  for (var i = 0; i < locationsKeys.length; i++) {
    var rb = gLocation.add("radiobutton", undefined, locationsKeys[i]);
    if (loadedPrefs["location"] == locationsKeys[i]) rb.value = true;
    locationRBs.push(rb);
  }

  // create a radio button for each product
  win.add("statictext", undefined, "Select Your Product Type");
  var productsKeys = getKeys(products);
  var gProducts = win.add("group");
  var rb;
  var productRBs = [];
  for (var i = 0; i < productsKeys.length; i++) {
    var rb = gProducts.add("radiobutton", undefined, productsKeys[i]);
    if (loadedPrefs["product"] == productsKeys[i]) rb.value = true;
    productRBs.push(rb);
  }

  // setup window buttons
  var gWindowButtons = win.add("group", undefined);
  var btOK = gWindowButtons.add("button", undefined, "OK");
  var btCancel = gWindowButtons.add("button", undefined, "Cancel");

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    // check to see which location and product was selected
    var selectedLocation = captureRBSelection(locationRBs);
    var selectedProduct = captureRBSelection(productRBs);
    var selectedSettings = { location: selectedLocation, product: selectedProduct };
    // write the user selected setting to JSON
    writeJSONData(selectedSettings, prefsFile);
    return selectedSettings;
  } else {
    return;
  }
}
