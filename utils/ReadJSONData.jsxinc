/**
 * Read ExtendScript "json-like" data from file.
 * @param {File} f File object to read.
 * @returns {Object} Evaluated JSON data.
 */
function readJSONData(f) {
  var json, obj;
  try {
    f.encoding = "UTF-8";
    f.open("r");
    json = f.read();
  } catch (e) {
    alert("Error loading file:\n" + f);
  } finally {
    f.close();
  }
  obj = eval(json);
  return obj;
}
