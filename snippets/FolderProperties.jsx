/*
  Display all properties for a chosen folder.
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
