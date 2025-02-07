// https://community.adobe.com/t5/illustrator-discussions/printing-specific-separations-with-scripting/m-p/13030779#M326317

var doc = app.activeDocument;

// set print options
// https://ai-scripting.docsforadobe.dev/jsobjref/PrintOptions.html?highlight=printer
var options = new PrintOptions();
options.printerName = "Adobe PostScript File";
options.PPDName = "Roland VersaWorks";

// define vars for specific print settings
var customPaper = new PrintPaperOptions();
var coordinateOptions = new PrintCoordinateOptions();
var sepOptions = new PrintColorSeparationOptions();

options.paperOptions = customPaper;
options.coordinateOptions = coordinateOptions;
options.colorSeparationOptions = sepOptions;

// set paper size
// https://ai-scripting.docsforadobe.dev/jsobjref/PrintPaperOptions.html#jsobjref-printpaperoptions
customPaper.name = "Tabloid";
// i have yet to figure out how to set custom paper sizes like below
// customPaper.name = "Custom";
// customPaper.width = doc.width;
// customPaper.height = doc.height;

// set coordinate options
// https://ai-scripting.docsforadobe.dev/jsobjref/PrintCoordinateOptions.html?highlight=page%20setup
coordinateOptions.position = PrintPosition.TRANSLATECENTER;

// set all separation options
// https://ai-scripting.docsforadobe.dev/jsobjref/PrintColorSeparationOptions.html#jsobjref-printcolorseparationoptions
sepOptions.convertSpotColors = false;
sepOptions.overPrintBlack = false;
sepOptions.colorSeparationMode = PrintColorSeparationMode.HOSTBASEDSEPARATION;

// disable all inks except last
var newInkList = doc.inkList;
for (var i = 0; i < newInkList.length - 1; i++) {
    alert(i);
    newInkList[i].inkInfo.printingStatus = InkPrintStatus.DISABLEINK;
}
sepOptions.inkList = newInkList;

// actually print the file
doc.print(options);
