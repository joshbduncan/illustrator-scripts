/*
ReleaseAllContainers.jsx for Adobe Illustrator
----------------------------------------------
Clean-up junky Ai files by releasing all selected containers (groups, compound paths, and clipping masks).

This works no matter how nested the container objects are and works for better for weird
edge cases than trying to remove each element from each container via the API.

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
0.1.0 2023-11-08 initial release
0.1.1 2025-06-19 refactor
*/

(function () {
  //@target illustrator

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document
  var doc = app.activeDocument;

  var n = 0;

  while (doc.groupItems.length + doc.compoundPathItems.length > 0) {
    n++;
    $.writeln(n);
    app.executeMenuCommand("selectall");
    app.executeMenuCommand("ungroup");
    app.executeMenuCommand("selectall");
    app.executeMenuCommand("releaseMask");
    app.executeMenuCommand("selectall");
    app.executeMenuCommand("noCompoundPath");
  }
})();
