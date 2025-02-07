/*
GroupObjectsByRow.jsx for Adobe Illustrator
-------------------------------------------

Take a selection of objects that are separated by a unknown
vertical gap and group all that vertically overlap.

Note: This script was designed to group text characters but
works just fine for most types of pageItems.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
0.1.0 initial release
*/

(function () {
    var doc = app.activeDocument;
    groups = groupObjectsByRow(doc.selection);
    if (groups) {
        alert("Groups Created:\n" + groups.length);
    }

    /**
     * Take an array of Adobe Illustrator pageItems and group them by vertical separation.
     * @param {Array} sel Adobe Illustrator pageItems
     * @returns {Array} Array of Adobe Illustrator groupItems
     */
    function groupObjectsByRow(sel) {
        var groups = [];
        // sort the selected page items by their height (tallest to shortest)
        sel.sort(function (a, b) {
            var aHeight = a.geometricBounds[3] - a.geometricBounds[1];
            var bHeight = b.geometricBounds[3] - b.geometricBounds[1];
            return bHeight - aHeight;
        });
        // check if each page item shares bounds with others
        var item, placed;
        while (sel.length > 0) {
            item = sel.pop();
            placed = false;
            for (var i = 0; i < groups.length; i++) {
                group = groups[i];
                // check if item bounds overlaps a groups bounds
                if (
                    item.geometricBounds[3] <= group.geometricBounds[1] &&
                    item.geometricBounds[1] >= group.geometricBounds[3]
                ) {
                    item.move(group, ElementPlacement.PLACEATEND);
                    placed = true;
                }
            }
            // if an item didn't fit into any current groups make a new group
            if (!placed) {
                g = app.activeDocument.groupItems.add();
                groups.push(g);
                item.move(g, ElementPlacement.PLACEATEND);
            }
        }
        return groups;
    }
})();
