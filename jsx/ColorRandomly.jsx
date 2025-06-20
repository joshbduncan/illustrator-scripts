/*
ColorRandomly.jsx for Adobe Illustrator
---------------------------------------
Randomly color selected objects.

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
0.1.0 2023-11-08 initial release
0.1.1 2025-06-19 fixed recoloring of text objects
*/

// FIXME: not coloring compound paths

(function () {
  //@target illustrator

  var scriptTitle = "Color Randomly";
  var scriptVersion = "1.0.0";
  var scriptCopyright = "Copyright 2025 Josh Duncan";
  var website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////

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

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;
  var sel = doc.selection;
  var objects = [];

  var scheme, min, max, recolorChars;
  if (sel instanceof Array && sel.length > 0) {
    var settings = settingsWin();

    if (!settings) return;

    scheme = settings.scheme;
    min = parseFloat(settings.rangeMin);
    max = parseFloat(settings.rangeMax);
    recolorChars = settings.recolorChars;

    // grab all path objects in the selection
    getObjects(sel, recolorChars);

    // recolor the objects
    recolorObjects(scheme, min, max);
  } else {
    alert("Please select at least one object!");
  }

  function getObjects(s, chars) {
    for (var i = 0; i < s.length; i++) {
      if (s[i].typename == "GroupItem") {
        getObjects(s[i].pageItems, chars);
      } else if (s[i].typename == "TextFrame") {
        for (var w = 0; w < s[i].words.length; w++) {
          if (!chars) {
            objects.push(s[i].words[w]);
          } else {
            for (var c = 0; c < s[i].words[w].characters.length; c++) {
              objects.push(s[i].words[w].characters[c]);
            }
          }
        }
      } else if (s[i].typename == "PathItem" && s[i].filled) {
        objects.push(s[i]);
      }
    }
  }

  function recolorObjects(scheme, min, max) {
    // if 1-color scheme option make a single color
    if (scheme.singleColor == true) {
      var spotColor = newSpotColor("Single-color");
    }

    for (var i = 0; i < objects.length; i++) {
      var color;
      if (scheme.fullColor == true) {
        color = new RGBColor();
        // generate random values for R, G, and B
        // using multiplier of 256 to get values including 255
        color.red = Math.floor(Math.random() * 256);
        color.green = Math.floor(Math.random() * 256);
        color.blue = Math.floor(Math.random() * 256);
      } else if (scheme.singleColor == true) {
        // make random single color
        color = randomSpotTint(spotColor, min, max);
      } else {
        // make random grayscale color
        color = new GrayColor();
        color.gray = Math.floor(Math.random() * (max - min) + min);
      }
      // fill the object
      if (objects[i].typename == "TextFrame") {
        objects[i].words.fillColor = color;
      } else {
        objects[i].fillColor = color;
      }
    }
  }

  function newSpotColor(spotColorName) {
    var doc = app.activeDocument;

    try {
      newSpot = doc.spots.getByName(spotColorName);
    } catch (e) {
      $.writeln(e.message);

      // Create the new spot
      var newSpot = doc.spots.add();

      // Define the new color value
      var newColor = new RGBColor();
      newColor.red = Math.floor(Math.random() * 256);
      newColor.green = Math.floor(Math.random() * 256);
      newColor.blue = Math.floor(Math.random() * 256);

      // Define a new SpotColor with an 80% tint
      // of the new Spot's color. The spot color can then
      // be applied to an art item like any other color.
      newSpot.name = spotColorName;
      newSpot.colorType = ColorModel.SPOT;
      newSpot.color = newColor;
    }
    return newSpot;
  }

  function randomSpotTint(spotColor, min, max) {
    var newSpotColor = new SpotColor();
    newSpotColor.spot = spotColor;
    var randomNum = Math.floor(Math.random() * (max - min) + min);
    newSpotColor.tint = randomNum;
    return newSpotColor;
  }

  function settingsWin() {
    // create a new dialog box for user input
    var win = new Window("dialog");
    win.text = scriptTitle + " " + scriptVersion;
    win.orientation = "column";
    win.alignChildren = "fill";

    // create a radio button panel for color scheme
    var pColor = win.add("panel", undefined, "Recolor Settings");
    pColor.alignChildren = ["left", "center"];
    pColor.orientation = "row";
    pColor.margins = 18;

    var rbRGB = pColor.add("radiobutton", undefined, "Full RGB");
    rbRGB.value = true;
    var rbSingle = pColor.add("radiobutton", undefined, "Single-Color");
    var rbGray = pColor.add("radiobutton", undefined, "Grayscale");
    rbRGB.onClick = function () {
      pRange.enabled = false;
    };
    rbSingle.onClick = function () {
      pRange.enabled = true;
    };
    rbGray.onClick = function () {
      pRange.enabled = true;
    };

    // create a panel for color range
    var pRange = win.add("panel", undefined, "Color Range");
    pRange.alignChildren = ["left", "center"];
    pRange.margins = 18;
    pRange.enabled = false;

    // min range group
    var gRangeMin = pRange.add("group", undefined);
    gRangeMin.alignChildren = ["right", "center"];
    gRangeMin.alignment = ["fill", "center"];
    gRangeMin.orientation = "row";
    gRangeMin.add("statictext", undefined, "Min Tint %:");

    // min range sliders group
    var gRangeSliderMin = gRangeMin.add("group", undefined);
    gRangeSliderMin.orientation = "row";
    var valMin = gRangeSliderMin.add(
      'edittext{text:5, characters:3, justify:"center", active:true}',
    );
    var sldMin = gRangeSliderMin.add(
      "slider{minvalue:0, maxvalue:50, value:5}",
    );
    sldMin.preferredSize.width = 125;
    sldMin.onChanging = function () {
      valMin.text = Math.floor(sldMin.value);
    };
    valMin.onChanging = function () {
      sldMin.value = Number(valMin.text);
    };

    // max range group
    var gRangeMax = pRange.add("group", undefined);
    gRangeMax.alignChildren = ["right", "center"];
    gRangeMax.alignment = ["fill", "center"];
    gRangeMax.orientation = "row";
    gRangeMax.add("statictext", undefined, "Max Tint %:");

    // max range sliders group
    var gRangeSliderMax = gRangeMax.add("group", undefined);
    gRangeSliderMax.orientation = "row";
    var valMax = gRangeSliderMax.add(
      'edittext{text:95, characters:3, justify:"center", active:true}',
    );
    var sldMax = gRangeSliderMax.add(
      "slider{minvalue:50, maxvalue:100, value:95}",
    );
    sldMax.preferredSize.width = 125;
    sldMax.onChanging = function () {
      valMax.text = Math.floor(sldMax.value);
    };
    valMax.onChanging = function () {
      sldMax.value = Number(valMax.text);
    };

    // create a radio button panel for text settings
    var pText = win.add("panel", undefined, "Text Settings");
    pText.alignChildren = ["left", "center"];
    pText.orientation = "row";
    pText.margins = 18;

    var rbWords = pText.add("radiobutton", undefined, "Recolor Words");
    rbWords.value = true;
    var rbChars = pText.add("radiobutton", undefined, "Recolor Characters");

    // window control buttons
    var gButtons = win.add("group");
    gButtons.alignment = "center";
    gButtons.add("button", undefined, "OK");
    gButtons.add("button", undefined, "Cancel");

    // Copyright
    var stCopyright = win.add(
      "statictext",
      undefined,
      scriptCopyright + " @ " + website,
      {
        name: "stCopyright",
      },
    );

    stCopyright.addEventListener("click", function () {
      openURL("https://joshbduncan.com");
    });

    // if "OK" button clicked then return inputs
    if (win.show() == 1) {
      return {
        scheme: {
          fullColor: rbRGB.value,
          singleColor: rbSingle.value,
          grayscale: rbGray.value,
        },
        recolorChars: rbChars.value,
        rangeMin: valMin.text,
        rangeMax: valMax.text,
      };
    } else {
      return false;
    }
  }
})();
