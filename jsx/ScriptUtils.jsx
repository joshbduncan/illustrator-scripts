/**
 * write text to the document for debugging
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

/**
 * figure out the actual "visible" bounds for an object
 * if clipping mask or compound path items are found
 */
function getVisibleBounds(object) {
  var bounds, clippedItem, sandboxItem, sandboxLayer;
  var curItem;
  if (object.typename == "GroupItem") {
    // if the object is clipped
    if (object.clipped) {
      // check all sub objects to find the clipping path
      for (var i = 0; i < object.pageItems.length; i++) {
        curItem = object.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename == "CompoundPathItem") {
          if (!curItem.pathItems.length) {
            // catch compound path items with no pathItems via william dowling @ github.com/wdjsdev
            sandboxLayer = app.activeDocument.layers.add();
            sandboxItem = curItem.duplicate(sandboxLayer);
            app.activeDocument.selection = null;
            sandboxItem.selected = true;
            app.executeMenuCommand("noCompoundPath");
            sandboxLayer.hasSelectedArtwork = true;
            app.executeMenuCommand("group");
            clippedItem = app.activeDocument.selection[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        } else {
          clippedItem = curItem;
          break;
        }
      }
      bounds = clippedItem.geometricBounds;
      if (sandboxLayer) {
        // eliminate the sandbox layer since it's no longer needed
        sandboxLayer.remove();
        sandboxLayer = undefined;
      }
    } else {
      // if the object is not clipped
      var subObjectBounds;
      var allBoundPoints = [[], [], [], []];
      // get the bounds of every object in the group
      for (var i = 0; i < object.pageItems.length; i++) {
        curItem = object.pageItems[i];
        subObjectBounds = getVisibleBounds(curItem);
        allBoundPoints[0].push(subObjectBounds[0]);
        allBoundPoints[1].push(subObjectBounds[1]);
        allBoundPoints[2].push(subObjectBounds[2]);
        allBoundPoints[3].push(subObjectBounds[3]);
      }
      // determine the groups bounds from it sub object bound points
      bounds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bounds = object.geometricBounds;
  }
  return bounds;
}
