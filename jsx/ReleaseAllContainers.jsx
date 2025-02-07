/*
ReleaseAllContainers.jsx for Adobe Illustrator
----------------------------------------------

Clean-up junky Ai files by releasing all selected containers (groups, compound paths, and clipping masks).

This works no matter how nested the container objects are and works for better for weird
edge cases than trying to remove each element from each container via the API.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
0.1.0 initial release
*/

(function () {
    var doc = app.activeDocument;

    while (findContainerObjects(doc.selection).length > 0) {
        app.executeMenuCommand("ungroup");
        app.executeMenuCommand("releaseMask");
        app.executeMenuCommand("noCompoundPath");
    }

    /**
     * Find all container objects (groups (including clipping masks), and compound paths) within the array.
     * @param {Array} arr Adobe Illustrator pageItems.
     * @returns {Array} Array of container objects.
     */
    function findContainerObjects(arr) {
        var matches = [];
        for (var i = 0; i < arr.length; i++) {
            if (
                arr[i].typename === "GroupItem" ||
                arr[i].typename === "CompoundPathItem"
            )
                matches.push(arr[i]);
        }
        return matches;
    }
})();
