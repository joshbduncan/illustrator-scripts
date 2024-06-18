/**
 * Write text to the document for debugging.
 * @param {String} text Text to write.
 * @param {Array} position Position to locate the textArea [top, left] in the document.
 * @param {Number} fontSize Font size of text.
 * @param {String} align Text alignment (l, c, or r).
 * @returns {TextFrame} Adobe Illustrator TextFrame.
 */
function writeText(text, position, fontSize, align) {
  if (typeof position == "undefined") position = [0, 0];
  if (typeof fontSize == "undefined") fontSize = 12;
  if (typeof align == "undefined") align = "c";
  var doc = app.activeDocument;
  var textObject = doc.textFrames.pointText([position[0], position[1]]);
  textObject.contents = text;
  textObject.textRange.characterAttributes.size = fontSize;
  if (align == "l") {
    textObject.textRange.justification = Justification.LEFT;
  } else if (align == "r") {
    textObject.textRange.justification = Justification.RIGHT;
  } else {
    textObject.textRange.justification = Justification.CENTER;
  }
  return textObject;
}
