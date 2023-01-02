// https://community.adobe.com/t5/illustrator-discussions/group-shapes-by-row/td-p/13437506

// Take a selection of objects that are separated by a unknown vertical gap
// and group the shapes that are in the same "line" together

var doc = app.activeDocument;
groups = groupObjectsByLine(doc.selection);
if (groups) {
  alert("Groups Created:\n" + groups.length);
}

function groupObjectsByLine(sel) {
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
      if (overlappingBounds(item, group)) {
        item.move(group, ElementPlacement.PLACEATEND);
        placed = true;
      }
    }
    // if an item didn't fit into any current groups make a new group
    if (!placed) {
      g = doc.groupItems.add();
      groups.push(g);
      item.move(g, ElementPlacement.PLACEATEND);
    }
  }
  return groups;
}

function overlappingBounds(item, group) {
  var top = item.geometricBounds[1];
  var bottom = item.geometricBounds[3];
  var gTop = group.geometricBounds[1];
  var gBottom = group.geometricBounds[3];
  if (bottom > gTop || top < gBottom) {
    return false;
  }
  return true;
}
