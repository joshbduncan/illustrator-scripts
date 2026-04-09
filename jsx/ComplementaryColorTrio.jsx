/*
ComplementaryColorTrio.jsx for Adobe Illustrator
------------------------------------------------
Create a swatch group of complementary color based off of the fill color of the first selected object.

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
0.1.0 2025-12-19 initial release
0.1.1 2026-04-09 fix nested target directive
*/

//@target illustrator

(function () {
  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;
  var sel = doc.selection;

  // require a selection for base color
  if (!sel.length) {
    alert("Select at least one object for the base color.");
    return;
  }

  var baseColor = sel[0].fillColor;
  var r = baseColor.red;
  var g = baseColor.green;
  var b = baseColor.blue;

  var baseColorHSL = rgbToHsl(r, g, b);
  var h = baseColorHSL[0];
  var s = baseColorHSL[1];
  var l = baseColorHSL[2];

  var contrastColorRGB = hslToRgb(h + 120 / 360, s, l);
  var contrastColor = new RGBColor();
  contrastColor.red = contrastColorRGB[0];
  contrastColor.green = contrastColorRGB[1];
  contrastColor.blue = contrastColorRGB[2];

  var accentColorRGB = hslToRgb(wrappedAngle(h * 360), s, l);
  var accentColor = new RGBColor();
  accentColor.red = accentColorRGB[0];
  accentColor.green = accentColorRGB[1];
  accentColor.blue = accentColorRGB[2];

  var swatchGroup = doc.swatchGroups.add();
  swatchGroup.name = "Complementary Color Trio";

  addSwatch(baseColor, "Base Color", swatchGroup);
  addSwatch(contrastColor, "Contrast Color", swatchGroup);
  addSwatch(accentColor, "Accent Color", swatchGroup);

  //////////////////////
  // HELPER FUNCTIONS //
  //////////////////////

  /**
   * Offset a hue angle value on a 0–360° circular scale, returning a normalized 0–1 value.
   * @param {number} x A normalized value in the range [0, 1], representing 0–100 degrees.
   * @returns {number} A normalized value in the range [0, 1], representing the wrapped angle as a fraction of 360 degrees.
   */
  function wrappedAngle(a) {
    var wrapped = (a - 45 + 360) % 360;
    return wrapped / 360;
  }

  /**
   * Create a swatch in the active document.
   * @param {RGBColor} color RGB Color to create swatch from.
   * @param {string} name Swatch name.
   * @param {SwatchGroup} name Swatch name.
   * @returns {Swatch}
   */
  function addSwatch(color, name, group) {
    group = typeof group !== "undefined" ? group : "center-center";
    var swatch = doc.swatches.add();
    swatch.name = name;
    swatch.color = color;
    if (typeof group !== "undefined") group.addSwatch(swatch);
    return swatch;
  }

  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @returns {Array} The HSL representation
   */
  function rgbToHsl(r, g, b) {
    ((r /= 255), (g /= 255), (b /= 255));
    var vmax = Math.max(r, g, b),
      vmin = Math.min(r, g, b);
    var h,
      s,
      l = (vmax + vmin) / 2;

    if (vmax === vmin) {
      return [0, 0, l]; // achromatic
    }

    var d = vmax - vmin;
    s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
    if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (vmax === g) h = (b - r) / d + 2;
    if (vmax === b) h = (r - g) / d + 4;
    h /= 6;

    return [h, s, l];
  }

  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   * @param {number} h The hue
   * @param {number} s The saturation
   * @param {number} l The lightness
   * @return {Array} The RGB representation
   */
  function hslToRgb(h, s, l) {
    var r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
})();
