/**
 * If a file already exists, prompt for permission to overwrite it.
 * @param {File} file ExtendScript file constructor.
 * @returns {Boolean} Is it okay to overwrite the file.
 */
function overwriteFileProtection(file) {
  if (
    file.exists &&
    !Window.confirm(
      "File already exists!\nOverwrite " + decodeURI(file.name) + "?",
      "noAsDflt",
      "File Already Exists",
    )
  )
    return false;
  return true;
}
