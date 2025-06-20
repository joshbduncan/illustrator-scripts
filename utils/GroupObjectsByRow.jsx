/**
 * Take an array of Adobe Illustrator pageItems and group them by vertical separation.
 *
 * Note: This script was designed to group text characters but works just fine for most types of pageItems.
 *
 * @param {PageItem[]} objects Adobe Illustrator pageItems
 * @returns {GroupItem[]} Array of Adobe Illustrator groupItems
 */
function groupObjectsByRow(objects) {
  var groups = [];

  // sort the objects by their height (tallest to shortest)
  objects.sort(function (a, b) {
    var aHeight = a.geometricBounds[3] - a.geometricBounds[1];
    var bHeight = b.geometricBounds[3] - b.geometricBounds[1];
    return bHeight - aHeight;
  });

  // check if each object shares bounds with others
  var item, placed, group, newGroup;
  while (objects.length > 0) {
    item = objects.pop();
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
      newGroup = app.activeDocument.groupItems.add();
      groups.push(newGroup);
      item.move(newGroup, ElementPlacement.PLACEATEND);
    }
  }

  return groups;
}
