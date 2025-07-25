/**
 * Write ExtendScript "json-like" data to disk.
 * @param {Object} data Data to be written.
 * @param {File} f File object to write to.
 * @returns {Boolean} Write success.
 */
function writeJSONData(data, f) {
  try {
    f.encoding = "UTF-8";
    f.open("w");
    f.write(data.toSource());
  } catch (e) {
    alert("Error writing file:\n" + f);
    return false;
  } finally {
    f.close();
  }
  return true;
}
