(function () {
  //@target illustrator
  //@includepath "helpers"
  //@include "PathItemPlus.jsxinc"

  var doc = app.activeDocument;
  var p = new PathItemPlus(doc.selection[0]);

  var p1 = new PathPointPlus({ anchor: [100, 0] });
  var p2 = new PathPointPlus({ anchor: [200, 0] });
  var p3 = new PathPointPlus({ anchor: [300, 0] });
  var p4 = new PathPointPlus({ anchor: [400, 0] });

  // check start > pathPoints.length
  // p.splice(10, 0, p1, p2, p3, p4);

  // test removing all items (removes entire path) ✅
  // alert(p.splice(0));

  // add points after 0 but before end ✅
  // p.splice(1, 0, p1, p2, p3, p4);

  // add points at 0 ✅
  p.splice(0, 0, p1, p2);
})();
