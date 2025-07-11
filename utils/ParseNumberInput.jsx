/**
 * Parse a ScriptUI `edittext` value into a valid `UnitType` number.
 * @param {Number|String} n - Value to parse.
 * @param {Number} defaultValue - Default value to return if `n` is invalid.
 * @param {String} defaultUnit - Default unit type to return the input as if not included in `n`.
 * @returns {UnitValue}
 */
function parseNumberInput(n, defaultValue, defaultUnit) {
  defaultValue = typeof defaultValue !== "undefined" ? defaultValue : 0;

  var rulerUnits = app.activeDocument.rulerUnits
    .toString()
    .split(".")[1]
    .toLowerCase();
  defaultUnit = typeof defaultUnit !== "undefined" ? defaultUnit : rulerUnits;

  var val = UnitValue(n);
  if (val.type === "?") {
    val = UnitValue(n, defaultUnit);
    if (isNaN(val.value)) {
      app.beep();
      val = UnitValue(defaultValue, defaultUnit);
    }
  }
  return val;
}
