/**
 * Get geometric info from Illustrator object bounds.
 * @param {Array} bounds - Illustrator object bounds (e.g. [left, top, right, bottom]).
 * @returns {Object} Geometry info with left, top, right, bottom, width, height, centerX, centerY.
 */
function getObjectPlacementInfo(bounds) {
  if (!bounds || bounds.length !== 4) {
    throw new Error("Invalid bounds: Expected [left, top, right, bottom]");
  }

  var left = bounds[0];
  var top = bounds[1];
  var right = bounds[2];
  var bottom = bounds[3];
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
