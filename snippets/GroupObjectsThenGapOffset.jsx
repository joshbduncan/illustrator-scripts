// Take a selection of objects/characters within Adobe Illustrator (multi-line or not)
// and adjust the object/characters from left to right, ensuring the gap between each
// is >= `minGap` unless the gap is already <= 0.

var minGap = 0.0235; //  minimum space between paths (inches)

if (app.documents.length > 0) {
  if (app.activeDocument.selection.length > 0) {
    // group items by vertical separation (line)
    groups = groupObjectsByLine(app.activeDocument.selection);
    if (groups) {
      var overlappers = [];
      var paths;
      // iterate over each group of objects
      for (var i = 0; i < groups.length; i++) {
        paths = [];
        // capture all pageItems within the group
        // so that a standard array can be passed to adjustOffset
        for (var j = 0; j < groups[i].pageItems.length; j++) {
          paths.push(groups[i].pageItems[j]);
        }
        // adjust the offset for each pageItem with the group
        adjustOffset(paths, minGap, true);
      }
      // if any of the pageItems overlapped, highlight the offenders
      if (overlappers) {
        for (var i = 0; i < overlappers.length; i++) {
          addStrokeHighlight(overlappers[i], 0, 100, 0, 0);
        }
      }
    }
  }
}

/**
 * Take an array of Adobe Illustrator pageItems and group them by vertical separation.
 * @param   {Array} sel Adobe Illustrator pageItems
 * @returns {Array}     Array of Adobe Illustrator groupItems
 */
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
      g = app.activeDocument.groupItems.add();
      groups.push(g);
      item.move(g, ElementPlacement.PLACEATEND);
    }
  }
  return groups;
}

/**
 * Check if a pageItem overlaps with a groupItem.
 * @param {pageItem}  item  Adobe Illustrator pageItem
 * @param {groupItem} group Adobe Illustrator groupItem
 * @returns {Boolean}
 */
function overlappingBounds(item, group) {
  return !(
    item.geometricBounds[3] > group.geometricBounds[1] ||
    item.geometricBounds[1] < group.geometricBounds[3]
  );
}

/**
 * Adjust an array of pageItems from left to right, ensuring the gap
 * between each is >= `minGap` unless the gap is already <= 0.
 * @param {Array} arr         Array of pageItems to offset
 * @param {Number} minGap     Minimum distance between pageItems
 * @param {Boolean} highlight Should overlapping pageItems be highlighted
 */
function adjustOffset(arr, minGap, highlight) {
  // convert inches to points
  minGap *= 72;
  // sort the selected shapes by horizontal position
  arr.sort(function (a, b) {
    return a.left - b.left;
  });
  var prev, cur;
  var cumlMoves = 0;
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
    } else if (gap < 0 && highlight) {
      overlappers.push(cur);
    }
  }
}

/**
 * Add a CMYK color stroke highlight to a pageItem.
 * @param {*} item Adobe Illustrator pageItem
 * @param {*} c    Cyan value
 * @param {*} m    Magenta value
 * @param {*} y    Yellow value
 * @param {*} k    Black value
 */
function addStrokeHighlight(item, c, m, y, k) {
  // setup highlight color
  var hl = new CMYKColor();
  hl.cyan = c;
  hl.magenta = m;
  hl.yellow = y;
  hl.black = k;
  item.stroked = true;
  item.strokeColor = hl;
}
