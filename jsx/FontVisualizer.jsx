/*
  FontVisualizer.jsx for Adobe Illustrator
  ----------------------------------------
  Visualize every font on your system with customizable text.

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
  2024-11-22 initial release
*/

(function () {
  //@target illustrator

  //////////////////////////
  // SCRIPT CONFIGURATION //
  //////////////////////////

  // Depending on the amount of fonts you have loaded into your system, this script can take a little while to finish.
  // To process all 2500 fonts on my system, it takes 2 minutes with `updateScreen` set to `true`.
  // If you don't need to see the script writing each font to the screen, set `updateScreen = false`.
  // This reduces the processing time on my system to 20 seconds (83% time decrease).
  var updateScreen = true; // update the screen when drawing each font
  var confirmNewLayer = true; // ask before continuing to a new layer
  var inset = 6; // page margin
  var gap = 3; // gap between rows and columns
  var units = "in"; // document units (ci, cm, ft, in, km, m, mi, mm, pc, pt, px, tpc, tpt, yd)
  var colorSpace = DocumentColorSpace.RGB; // DocumentColorSpace.RGB or DocumentColorSpace.CMYK
  var docName = "FontVisualizer";
  var docWidth = 11;
  var docHeight = 8.5;

  //////////////////////
  // PROGRESS PALETTE //
  //////////////////////

  var progress = new Window("palette");
  progress.text = "Progress";

  progress.msg = progress.add("statictext");
  progress.msg.preferredSize.width = 500;

  progress.bar = progress.add("progressbar");
  progress.bar.preferredSize.width = 500;

  progress.count = progress.add("statictext", undefined, "DONKEY BUTTS");
  progress.count.preferredSize.width = 500;
  progress.count.justify = "center";

  progress.display = function (message, ct) {
    message && (this.msg.text = message);
    this.count.text = this.bar.value + " of " + this.bar.maxvalue;
    this.update();
  };

  progress.increment = function () {
    this.bar.value++;
  };

  progress.set = function (steps) {
    this.bar.value = 0;
    this.bar.minvalue = 0;
    this.bar.maxvalue = steps;
  };

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // setup document unit
  var _docWidth = new UnitValue(docWidth, units);
  var _docHeight = new UnitValue(docHeight, units);

  // setup new document
  var docPreset = new DocumentPreset();
  docPreset.title = docName;
  docPreset.width = _docWidth.as("px");
  docPreset.height = _docHeight.as("px");
  var doc = documents.addDocument(colorSpace, docPreset);

  // set layer
  var layer = doc.layers[0];

  // set text placement
  var x = inset;
  var y = doc.height - inset;

  // request text from user
  var text = prompt(
    "What text would you like to preview?",
    "The quick brown fox jumps over the lazy dog.",
  );
  if (!text) return;

  // get all fonts loaded into Illustrator
  progress.show();
  progress.display("Loading fonts...");
  var fontCount = textFonts.length;
  progress.set(fontCount);

  try {
    var tf;
    var colWidth = 0;
    var maxWidth = 0;
    var maxHeight = 0;
    var padding = "        ";
    for (var i = 0; i < fontCount; i++) {
      progress.display("Loading font: " + textFonts[i].name);
      progress.increment();
      tf = layer.textFrames.add();
      tf.textRange.characterAttributes.size = 12;
      tf.contents = text;
      tf.left = x;
      tf.top = y;
      tf.textRange.characterAttributes.textFont = textFonts.getByName(
        textFonts[i].name,
      );

      y -= tf.height + gap;
      colWidth = tf.width > colWidth ? tf.width : colWidth;
      maxWidth = tf.width > maxWidth ? tf.width : maxWidth;
      maxHeight = tf.height > maxHeight ? tf.height : maxHeight;

      updateScreen && app.redraw();

      // start a new column when the bottom of the page is reached
      if (y <= maxHeight + inset) {
        y = doc.height - inset;
        x += colWidth + gap;
        colWidth = 0;
      }

      // start a new layer when the side of the page is reached
      if (x >= doc.width - gap || x + maxWidth + gap >= doc.width) {
        if (confirmNewLayer && updateScreen && !confirm("Continue?")) break;
        layer.visible = false;
        layer = doc.layers.add();
        x = inset;
        maxWidth = 0;
      }
    }
  } finally {
    progress.close();
  }
})();
