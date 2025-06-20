var doc = app.activeDocument;

var p = doc.selection[0];
var p1 = p.pathPoints[0];
var p2 = p.pathPoints[1];
var points = [p1.anchor, p1.rightDirection, p2.leftDirection, p2.anchor];

var newPoints = [p1.anchor];
var n = 6;
var t;
for (var i = 1; i < n + 1; i++) {
  t = (1 / n) * i;
  newPoints.push(nextPoint(points, t));
}
newPoints.push(p2.anchor);

var newPath = doc.pathItems.add();
newPath.setEntirePath(newPoints);
newPath.filled = false;
newPath.stroked = true;

function nextPoint(points, t) {
  var p0 = points[0];
  var p1 = points[1];
  var p2 = points[2];
  var p3 = points[3];

  // calculate the coefficients based on current point
  var cx = 3 * (p1[0] - p0[0]);
  var bx = 3 * (p2[0] - p1[0]) - cx;
  var ax = p3[0] - p0[0] - cx - bx;

  var cy = 3 * (p1[1] - p0[1]);
  var by = 3 * (p2[1] - p1[1]) - cy;
  var ay = p3[1] - p0[1] - cy - by;

  // calculate new position
  var xt = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0[0];
  var yt = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0[1];

  return [xt, yt];
}
