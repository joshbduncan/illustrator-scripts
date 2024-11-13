/*
  FolderProperties.jsx for Adobe Illustrator
  ------------------------------------------
  Display all properties for a chosen folder.

  Author
  ------
  Josh Duncan
  joshbduncan@gmail.com
  https://joshbduncan.com
  https://github.com/joshbduncan/

  Wanna Support Me?
  -----------------
  Most of the things I make are free to download but if you would like
  to support me that would be awesome and greatly appreciated!
  https://joshbduncan.com/software.html

  License
  -------
  This script is distributed under the MIT License.
  See the LICENSE file for details.

  Changelog
  ---------
  2024-11-11 initial release
*/

(function () {
  //@target illustrator

  var f = Folder.selectDialog("Select a folder.");

  if (f === null) return;

  var props = [
    "absoluteURI",
    "alias",
    "created",
    "displayName",
    "error",
    "exists",
    "fsName",
    "fullName",
    "localizedName",
    "modified",
    "name",
    "parent",
    "path",
    "relativeURI",
  ];

  var arr = ["Folder Properties"];
  for (var i = 0; i < props.length; i++) {
    arr.push(props[i] + ": " + f[props[i]]);
  }
  alert(arr.join("\n"));
})();
