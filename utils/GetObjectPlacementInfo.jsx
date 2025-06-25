/**
 * Get geometric info from Illustrator object bounds.
 * @param {Array} bounds - Illustrator object bounds: [left, top, right, bottom].
 * @returns {Object} - Geometry info with left, top, right, bottom, width, height, centerX, centerY.
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
