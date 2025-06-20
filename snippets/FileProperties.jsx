/*
  Display all properties for a chosen File.
*/

(function () {
  //@target illustrator

  var f = File.openDialog("Select a file.");

  if (f === null) return;

  var props = [
    "absoluteURI",
    "alias",
    "created",
    "creator",
    "displayName",
    "encoding",
    "eof",
    "error",
    "exists",
    "fsName",
    "fullName",
    "hidden",
    "length",
    "lineFeed",
    "localizedName",
    "modified",
    "name",
    "parent",
    "path",
    "readonly",
    "relativeURI",
    "type",
  ];

  var arr = ["File Properties"];
  for (var i = 0; i < props.length; i++) {
    arr.push(props[i] + ": " + f[props[i]]);
  }
  alert(arr.join("\n"));
})();
