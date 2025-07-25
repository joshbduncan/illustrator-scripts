/**
 * Write text to a file.
 * @param {String} data Data to write.
 * @param {FileObject} file File object to write the data to.
 * @param {String} mode File operation mode. Defaults to "w".
 * @param {Boolean} timestamp Add a timestamp to the file name. Defaults to false.
 * @param {Boolean} open Open the file after write.
 * @returns {Boolean} Was the write successful.
 */
function writeTextToFile(data, file, mode, timestamp, open) {
  mode = mode !== "undefined" ? mode : "w";
  timestamp = timestamp !== "undefined" ? timestamp : false;
  if (timestamp) {
    var date = new Date().toString();
    data = date + "\n" + data;
  }
  if (mode === "a" && file.exists) data = "\n\n" + data;
  try {
    file.encoding = "UTF-8";
    file.open(mode);
    file.write(data);
    if (open) file.execute();
  } catch (e) {
    alert("Error writing file " + file + "!");
    return false;
  } finally {
    f.close();
  }
  return true;
}
