/*
MatchTopObjectToBottom.jsx for Adobe Illustrator
------------------------------------------------

Scale the top object proportionally to match the largest dimension (width or height) of the
bottom object of the selection, then move the top object to match the position of the bottom object.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/resize-layer-to-match-key-object-height-or-width-whichever-is-greater/td-p/15386148
*/

(function () {
  //@target illustrator

  // script settings

  // where should to top object align to the bottom object when moved
  // options (default is center-center): top-left, top-center, top-right, center-left, center-right, bottom-left, bottom-center, bottom-right, top-edge, bottom-edge, left-edge, right-edge, horizontal-center, vertical-center
  var alignObjectsAt = "center-center";

  // sanity checks

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and selection info
  var doc = app.activeDocument;
  var sel = doc.selection;

  // no need to continue if there is no active selection (or less than 2 objects are selected)
  if (sel.length < 2) {
    alert("No active selection.\nSelect at least two objects.");
    return;
  }

  // 1. first we grab reference to the "top" and "bottom" objects

  // grab the top (0th index) and bottom (1st index) objects (all else ignored)
  var topObject = sel[0];
  var bottomObject = sel[1];

  // 2. next we scale the object to match the bottom object

  // determine greater of width vs. height of bottom object
  // then calculate proportional scale matrix for top object
  var ratio = 100;
  if (bottomObject.width >= bottomObject.height) {
    ratio = (bottomObject.width / (topObject.width || 1)) * 100;
  } else {
    ratio = (bottomObject.height / (topObject.height || 1)) * 100;
  }
  var scaleMatrix = app.getScaleMatrix(ratio, ratio);
  topObject.transform(scaleMatrix, true, false, false, false, false, undefined);

  // 3. finally, we move the top object to match the location of the bottom object
  var moveMatrix = getMoveMatrix(
    bottomObject.geometricBounds,
    topObject.geometricBounds,
    alignObjectsAt,
  );
  topObject.transform(
    moveMatrix,
    true, // objects
    true, // patterns
    true, // gradients
    true, // stroke patterns
  );

  // helper functions

  /**
   * Extracts geometric information from Illustrator object bounds.
   *
   * @param {Array<number>} bounds - Illustrator object bounds: [left, top, right, bottom].
   * @returns {{left: number, top: number, right: number, bottom: number, width: number, height: number, centerX: number, centerY: number}} - An object containing geometric details of the bounds.
   */
  function getObjectPlacementInfo(bounds) {
    if (!bounds || typeof bounds !== "object" || bounds.length !== 4) {
      throw new Error("Invalid bounds: Expected [left, top, right, bottom]");
    }

    // Normalize for safety since occasionally Illustrator can return
    // inverted bounds (e.g., top < bottom due to transformations).
    var left = Math.min(bounds[0], bounds[2]);
    var right = Math.max(bounds[0], bounds[2]);
    var top = Math.max(bounds[1], bounds[3]);
    var bottom = Math.min(bounds[1], bounds[3]);

    var width = right - left;
    var height = top - bottom;
    var centerX = left + width / 2;
    var centerY = top - height / 2;

    return {
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      width: width,
      height: height,
      centerX: centerX,
      centerY: centerY,
    };
  }

  /**
   * Creates a translation matrix to align the target object relative to the source object.
   *
   * @param {Array<number>} sourceBounds - Bounds of source object to move to.
   * @param {Array<number>} targetBounds - Bounds of target object to be moved.
   * @param {string} anchor - Alignment of target object in relation to the source object.
   * @returns {Matrix} - A translation matrix for aligning the target object to the source object.
   */
  function getMoveMatrix(sourceBounds, targetBounds, anchor) {
    anchor = typeof anchor !== "undefined" ? anchor : "center-center";
    var sourceInfo = getObjectPlacementInfo(sourceBounds);
    var targetInfo = getObjectPlacementInfo(targetBounds);

    switch (anchor.toLowerCase()) {
      case "top-left":
        return app.getTranslationMatrix(
          sourceInfo.left - targetInfo.left,
          sourceInfo.top - targetInfo.top,
        );
      case "top-center":
        return app.getTranslationMatrix(
          sourceInfo.centerX - targetInfo.centerX,
          sourceInfo.top - targetInfo.top,
        );
      case "top-right":
        return app.getTranslationMatrix(
          sourceInfo.right - targetInfo.right,
          sourceInfo.top - targetInfo.top,
        );
      case "center-left":
        return app.getTranslationMatrix(
          sourceInfo.left - targetInfo.left,
          sourceInfo.centerY - targetInfo.centerY,
        );
      case "center-right":
        return app.getTranslationMatrix(
          sourceInfo.right - targetInfo.right,
          sourceInfo.centerY - targetInfo.centerY,
        );
      case "bottom-left":
        return app.getTranslationMatrix(
          sourceInfo.left - targetInfo.left,
          sourceInfo.bottom - targetInfo.bottom,
        );
      case "bottom-center":
        return app.getTranslationMatrix(
          sourceInfo.centerX - targetInfo.centerX,
          sourceInfo.bottom - targetInfo.bottom,
        );
      case "bottom-right":
        return app.getTranslationMatrix(
          sourceInfo.right - targetInfo.right,
          sourceInfo.bottom - targetInfo.bottom,
        );
      case "top-edge":
        return app.getTranslationMatrix(0, sourceInfo.top - targetInfo.top);
      case "bottom-edge":
        return app.getTranslationMatrix(
          0,
          sourceInfo.bottom - targetInfo.bottom,
        );
      case "left-edge":
        return app.getTranslationMatrix(sourceInfo.left - targetInfo.left, 0);
      case "right-edge":
        return app.getTranslationMatrix(sourceInfo.right - targetInfo.right, 0);
      case "horizontal-center":
        return app.getTranslationMatrix(
          sourceInfo.centerX - targetInfo.centerX,
          0,
        );
      case "vertical-center":
        return app.getTranslationMatrix(
          0,
          sourceInfo.centerY - targetInfo.centerY,
        );
      default:
        // fallback to center alignment
        return app.getTranslationMatrix(
          sourceInfo.centerX - targetInfo.centerX,
          sourceInfo.centerY - targetInfo.centerY,
        );
    }
  }
})();
