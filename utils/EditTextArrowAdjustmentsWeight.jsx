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

/**
 * Allow user to adjust `edittext` input values using the keyboard.
 * @param {UIEvent} e ScriptUI keyboard event.
 */
function editTextArrowAdjustmentsWeight(e) {
  // Attempt mimic the behavior of the built-in Ai text input boxes
  // allowing users to change the value using the "Up" and "Down" arrow
  // key, and adding the "Shift" key modifier to change the value by +/- 10
  //
  // 0 is increased to 0.25 (without "Shift")
  // 1 is decreased to 0.75 (without "Shift")
  // Float values .25, .50, and .75 are increased/decreased to the next .25 increment
  var val, shift;
  if (e.keyName == "Up" || e.keyName == "Down") {
    // if shift key is pressed when "Up" or "Down" key pressed
    // +/- the current value by 10 or round to the next 10th value
    //
    // Examples:
    // - "Up" with "Shift" at 22 increase value to 30
    // - "Down" with "Shift" at 22 decreases value to 20
    // - "Up" with "Shift" at 2.25 increase value to 10
    // - "Down" with "Shift" at 2.25 decreases value to 0
    shift = e.getModifierState("Shift");
    val = parseNumberInput(this.text);

    // ensure 'weight' is always in points
    if (e.target.properties.name == "weight") val.convert("pt");

    if (e.keyName == "Up") {
      if (shift) {
        val = UnitValue(
          Math.max(1, parseInt(val.value / 10) * 10 + 10),
          val.type,
        );
      } else {
        if (
          val.value === 0 ||
          val.value === 0.25 ||
          val.value === 0.5 ||
          val.value === 0.75
        ) {
          val = val + 0.25;
        } else {
          val = val + 1;
        }
      }
    } else {
      if (shift) {
        val = UnitValue(
          Math.max(0, parseInt((val.value - 1) / 10) * 10),
          val.type,
        );
      } else {
        if (
          val.value === 0.25 ||
          val.value === 0.5 ||
          val.value === 0.75 ||
          val.value === 1
        ) {
          val = UnitValue(Math.max(0, val.value - 0.25), val.type);
        } else {
          val = UnitValue(Math.max(0, val.value - 1), val.type);
        }
      }
    }
    this.text = val;
    e.preventDefault();
    e.target.notify("onChange");
  }
}
