// https://community.adobe.com/t5/illustrator-discussions/ccreating-files-with-different-name-and-size-with-an-excel-file/m-p/13039437#M326695

// put the path to your exported csv here
var file = new File("MakeTheseDocs.csv");
// read in the csv data
var fileData = loadFileData(file).split("\n");
// set the print preset you want to use `Print` in this case
var printPreset = app.startupPresetsList[0];
// iterate over the lines in the csv file and make the docs
var docPreset, doc, parts, name, size;
for (var n in fileData) {
  // split out data for specific line in csv file
  parts = fileData[n].split(",");
  name = parts[0];
  width = parts[1].split("x")[0];
  height = parts[1].split("x")[1];
  // set up a doc preset so we can change name
  var customPreset = new DocumentPreset();
  customPreset.colorMode = DocumentColorSpace.CMYK;
  customPreset.title = name;
  customPreset.width = width * 72;
  customPreset.height = height * 72;
  // create the document
  app.documents.addDocument(printPreset, customPreset);
}

// load file data if available
function loadFileData(file) {
  if (file.exists) {
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var data = file.read();
      return data;
    } catch (e) {
      alert("Sorry, error loading file " + file + "!");
    } finally {
      f.close();
    }
  }
}
