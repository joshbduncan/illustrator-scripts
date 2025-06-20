/**
 * Draw "visible" bounds around an array of Illustrator PageItems.
 * @param {PageItem[]} objects - An array of PageItems to process.
 * @param {Number} lineLength - Length og bound mark line in points (pt). Defaults to 10 points.
 * @param {Number} lineWeight - Stroke weight for bound lines in points (pt). Defaults to 1 point.
 * @param {Color} lineColor - Bound lines color. Defaults to RGB Red.
 * @returns {GroupItem[]} - A group containing the drawn bounds.
 */
function drawVisibleBounds(objects, lineLength, lineWeight, lineColor) {
  /*
      Changelog
      ---------
      2021-09-13
        - updated getVisibleBounds() to catch lots of weird edge cases
      2021-10-13
        - updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
      2021-10-15
        - fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
        - error catch for selected guides (William Dowling @ github.com/wdjsdev)
        - error catch for empty objects or item with no bounds
        - error catch for clipping masks inside of an empty group
    */

  /**
   * Determine the actual "visible" bounds for an object if clipping mask or compound path items are found.
   * @param {PageItem} o A single Adobe Illustrator pageItem.
   * @returns {Array} Object bounds [left, top, right, bottom].
   */
  function getVisibleBounds(o) {
    var bounds, clippedItem, sandboxItem, sandboxLayer;
    var curItem;

    // skip guides (via william dowling @ github.com/wdjsdev)
    if (o.guides) {
      return undefined;
    }

    if (o.typename == "GroupItem") {
      // if the group has no pageItems, return undefined
      if (!o.pageItems || o.pageItems.length == 0) {
        return undefined;
      }
      // if the object is clipped
      if (o.clipped) {
        // check all sub objects to find the clipping path
        for (var i = 0; i < o.pageItems.length; i++) {
          curItem = o.pageItems[i];
          if (curItem.clipping) {
            clippedItem = curItem;
            break;
          } else if (curItem.typename == "CompoundPathItem") {
            if (!curItem.pathItems.length) {
              // catch compound path items with no pathItems (via William Dowling @ github.com/wdjsdev)
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
          }
        }
        if (!clippedItem) {
          clippedItem = o.pageItems[0];
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
        for (var i = 0; i < o.pageItems.length; i++) {
          curItem = o.pageItems[i];
          subObjectBounds = getVisibleBounds(curItem);
          for (var j = 0; j < subObjectBounds.length; j++) {
            allBoundPoints[j].push(subObjectBounds[j]);
          }
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
      bounds = o.geometricBounds;
    }
    return bounds;
  }

  /**
   *
   * @param {GroupItem} boundsGroup - Group for bound mark.
   * @param {PageItem[]} pathCoordinates - Bound mark path coordinates.
   * @param {Color} strokeColor - Bound mark stroke color.
   */
  function drawBoundMark(boundsGroup, pathCoordinates, strokeColor) {
    var bound = boundsGroup.pathItems.add();
    bound.setEntirePath(pathCoordinates);
    bound.filled = false;
    bound.strokeColor = strokeColor;
    bound.stroked = true;
    bound.strokeWidth = 1;
  }

  var defaultColor = new RGBColor();
  defaultColor.red = 255;
  defaultColor.green = 0;
  defaultColor.blue = 0;

  lineLength = typeof lineLength !== "undefined" ? lineLength : 10;
  lineWeight = typeof lineWeight !== "undefined" ? lineWeight : 1;
  lineColor = typeof lineColor !== "undefined" ? lineColor : defaultColor;

  var drawnBounds = [];

  var object, doc, visibleBounds, boundsGroup;
  for (var i = 0; i < objects.length; i++) {
    object = objects[i];
    doc = object.layer.parent;

    visibleBounds = getVisibleBounds(object);
    if (!visibleBounds) {
      $.writeln("Error: " + object.name + " has no visible bounds.");
      continue;
    }

    boundsGroup = doc.groupItems.add();
    boundsGroup.name = "VISIBLE BOUNDS";

    // top left
    drawBoundMark(
      boundsGroup,
      [
        [visibleBounds[0], visibleBounds[1] - lineLength],
        [visibleBounds[0], visibleBounds[1]],
        [visibleBounds[0] + lineLength, visibleBounds[1]],
      ],
      lineColor,
    );

    // top right
    drawBoundMark(
      boundsGroup,
      [
        [visibleBounds[2], visibleBounds[1] - lineLength],
        [visibleBounds[2], visibleBounds[1]],
        [visibleBounds[2] - lineLength, visibleBounds[1]],
      ],
      lineColor,
    );

    // bottom left
    drawBoundMark(
      boundsGroup,
      [
        [visibleBounds[0], visibleBounds[3] + lineLength],
        [visibleBounds[0], visibleBounds[3]],
        [visibleBounds[0] + lineLength, visibleBounds[3]],
      ],
      lineColor,
    );

    // bottom right
    drawBoundMark(
      boundsGroup,
      [
        [visibleBounds[2], visibleBounds[3] + lineLength],
        [visibleBounds[2], visibleBounds[3]],
        [visibleBounds[2] - lineLength, visibleBounds[3]],
      ],
      lineColor,
    );

    boundsGroup.move(object, ElementPlacement.PLACEBEFORE);
  }

  return drawnBounds;
}
