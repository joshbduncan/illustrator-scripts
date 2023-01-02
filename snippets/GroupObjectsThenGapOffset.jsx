var minGap = 0.0235; //  minimum space between paths (inches)

if (app.documents.length > 0) {
  var doc = app.activeDocument;
  var sel = doc.selection;
  if (sel.length > 0) {
    // group items by line
    groups = groupObjectsByLine(doc.selection);
    if (groups) {
      alert("Groups Created:\n" + groups.length);
      var paths, withins;
      for (var i = 0; i < groups.length; i++) {
        paths = [];
        withins = {};
        for (var j = 0; j < groups[i].pathItems.length; j++) {
          paths.push(groups[i].pathItems[j]);
        }
        adjustOffset(paths, minGap, true);
      }
    }
  }
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

function adjustOffset(arr, minGap, highlight) {
  var overlappers = [];
  // convert inches to points
  minGap *= 72;
  // sort the selected shapes by horizontal position
  arr.sort(function (a, b) {
    return a.left - b.left;
  });
  var prev, cur;
  var cumlMoves = 0;
  var overlappers = [];
  for (var i = 1; i < arr.length; i++) {
    prev = arr[i - 1];
    cur = arr[i];
    cur.left += cumlMoves;
    // check if cur bounds are within bounds of prev
    if (cur.left >= prev.left && cur.left + cur.width <= prev.left + prev.width) {
      arr.splice(i, 1);
      i--;
      continue;
    }
    // adjust the gap
    gap = cur.left - prev.left - prev.width;
    if (gap < minGap && gap >= 0) {
      cur.left += minGap - gap;
      cumlMoves += minGap - gap;
    } else if (gap < 0) {
      overlappers.push(cur);
    }
  }
  // if any shapes overlapped alerts user, highlight if requested
  if (overlappers.length > 0) {
    alert(
      "Overlapping Shapes Warning\nThere were " +
        overlappers.length +
        " overlapping shapes. They have been outlined in MAGENTA."
    );
    if (highlight) {
      addOverlapHighlight(overlappers);
    }
  }
}

function addOverlapHighlight(arr) {
  // setup highlight color
  var hl = new CMYKColor();
  hl.black = 0;
  hl.cyan = 0;
  hl.magenta = 100;
  hl.yellow = 0;
  for (var i = 0; i < arr.length; i++) {
    arr[i].stroked = true;
    arr[i].strokeColor = hl;
  }
}
