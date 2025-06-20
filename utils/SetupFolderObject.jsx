/**
 * Setup folder object or create if doesn't exist.
 * @param {String} path System folder path.
 * @returns {FolderObject} Folder object.
 */
function setupFolderObject(path) {
  var folder = new Folder(path);
  if (!folder.exists) folder.create();
  return folder;
}
