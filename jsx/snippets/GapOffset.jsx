var minGap = 0.0235; //  minimum space between paths (inches)
var paths = [];
var withins = {};

if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length > 0) {
        for (var i = 0; i < sel.length; i++) {
            // check to see if current item in selection is a group
            // if so grab each path item from within that group
            if (sel[i].typename == "GroupItem") {
                for (var j = 0; j < sel[i].pathItems.length; j++) {
                    paths.push(sel[i].pathItems[j]);
                }
            } else {
                paths.push(sel[i]);
            }
        }
        adjustOffset(paths, minGap, true);
    }
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
            addStrokeHighlight(overlappers);
        }
    }
}

function addStrokeHighlight(arr) {
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
