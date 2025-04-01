/*
ReleaseGroup.jsx for Adobe Illustrator
--------------------------------------
Release object from within a group container similar to
`Object > Ungroup` but also works recursively.

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
0.1.0 initial release
*/

var doc = app.activeDocument;
var sel = doc.selection;

if (sel.length > 0) {
    for (var i = 0; i < sel.length; i++) {
        ungroup(sel[i]);
    }
}

/**
 * Ungroup a groupItem within Adobe Illustrator. Similar to `Object > Ungroup`
 * @param {GroupItem} object An Adobe Illustrator groupItem
 * @param {Boolean} recursive Should nested groupItems also be ungrouped
 */
function ungroup(object, recursive) {
    // if a non group item is passed just return
    if (object.typename != "GroupItem") {
        return;
    }
    recursive = typeof recursive !== "undefined" ? recursive : true;
    var subObject;
    while (object.pageItems.length > 0) {
        if (
            object.pageItems[0].typename == "GroupItem" &&
            !object.pageItems[0].clipped
        ) {
            subObject = object.pageItems[0];
            subObject.move(object, ElementPlacement.PLACEBEFORE);
            if (recursive) {
                ungroup(subObject, recursive);
            }
        } else {
            object.pageItems[0].move(object, ElementPlacement.PLACEBEFORE);
        }
    }
}
