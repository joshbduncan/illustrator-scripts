/**
 * Convert 'Inches', 'mm', and 'Points' to points.
 * @param {String|Number} val Value to convert.
 * @param {String} unit Unit to convert to ("Inches" or "mm").
 * @returns {Number} Converted unit.
 */
function convertToPoints(val, unit) {
  if (typeof val == "string") val = Number(val);
  if (unit == "Inches") {
    return val * 72;
  } else if (unit == "mm") {
    return (val / 25.4) * 72;
  } else {
    return val;
  }
}
