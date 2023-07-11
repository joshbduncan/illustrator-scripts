addPoint = function (pt, idx) {
  // add to end of path if index not specified
  idx = idx !== undefined ? idx : this.pathPoints.length;
  // prompt for index for example purposes
  idx = prompt("What index?", idx);
  // validate provided index
  if (idx < 0 || idx > this.pathPoints.length) {
    alert("Invalid insertion index (`idx`).\n0 <= idx <= " + this.pathPoints.length);
    return;
  }
  // remove all points after idx
  var removedPoints = [];
  for (var i = this.pathPoints.length - 1; i >= idx; i--) {
    removedPoints.push(new PathPointPlus(this.pathPoints[i]));
    if (i == 0) {
      this.pathPoints[i].anchor = Array(pt.anchor.x, pt.anchor.y);
      this.pathPoints[i].leftDirection = Array(
        pt.rightDirection.x,
        pt.rightDirection.y
      );
      this.pathPoints[i].rightDirection = Array(pt.leftDirection.x, pt.leftDirection.y);
      this.pathPoints[i].pointType = pt.pointType;
    } else {
      this.pathPoints[i].remove();
    }
  }
  // add the points back
  if (idx > 0) removedPoints.push(pt);
  // add the new point plus the removed points
  var newPoint;
  for (var i = removedPoints.length - 1; i >= 0; i--) {
    newPoint = parentPath.pathPoints.add();
    newPoint.anchor = Array(removedPoints[i].anchor.x, removedPoints[i].anchor.y);
    newPoint.leftDirection = Array(
      removedPoints[i].rightDirection.x,
      removedPoints[i].rightDirection.y
    );
    newPoint.rightDirection = Array(
      removedPoints[i].leftDirection.x,
      removedPoints[i].leftDirection.y
    );
    newPoint.pointType = removedPoints[i].pointType;
  }
};

function PathPointPlus(obj) {
  this.anchor = { x: obj.anchor[0], y: obj.anchor[1] };
  this.leftDirection = { x: obj.leftDirection[0], y: obj.leftDirection[1] };
  this.rightDirection = { x: obj.rightDirection[0], y: obj.rightDirection[1] };
  this.parent = obj.hasOwnProperty("parent") ? obj.parent : null;
  this.pointType = obj.pointType;
}

PathPointPlus.prototype = {
  addToPath: function (parentPath, idx) {
    // add to end of path if index not specified
    idx = idx !== undefined ? idx : parentPath.pathPoints.length;
    // prompt for index for example purposes
    idx = prompt("What index?", idx);
    // validate provided index
    if (idx < 0 || idx > parentPath.pathPoints.length) {
      alert(
        "Invalid insertion index (`idx`).\n0 <= idx <= " + parentPath.pathPoints.length
      );
      return;
    }
    // remove all points after idx
    var removedPoints = [];
    for (var i = parentPath.pathPoints.length - 1; i >= idx; i--) {
      removedPoints.push(new PathPointPlus(parentPath.pathPoints[i]));
      if (i == 0) {
        parentPath.pathPoints[i].anchor = Array(this.anchor.x, this.anchor.y);
        parentPath.pathPoints[i].leftDirection = Array(
          this.rightDirection.x,
          this.rightDirection.y
        );
        parentPath.pathPoints[i].rightDirection = Array(
          this.leftDirection.x,
          this.leftDirection.y
        );
        parentPath.pathPoints[i].pointType = this.pointType;
      } else {
        parentPath.pathPoints[i].remove();
      }
    }
    // add the points back
    if (idx > 0) removedPoints.push(this);
    // add the new point plus the removed points
    var newPoint;
    for (var i = removedPoints.length - 1; i >= 0; i--) {
      newPoint = parentPath.pathPoints.add();
      newPoint.anchor = Array(removedPoints[i].anchor.x, removedPoints[i].anchor.y);
      newPoint.leftDirection = Array(
        removedPoints[i].rightDirection.x,
        removedPoints[i].rightDirection.y
      );
      newPoint.rightDirection = Array(
        removedPoints[i].leftDirection.x,
        removedPoints[i].leftDirection.y
      );
      newPoint.pointType = removedPoints[i].pointType;
    }
  },
};

var doc = app.activeDocument;
var parentPath = doc.selection[0];

var p1 = new PathPointPlus({
  anchor: [78.1766, -78.1766],
  rightDirection: [52.1177, -104.2355],
  leftDirection: [104.2355, -52.1177],
  pointType: PointType.SMOOTH,
});

parentPath.addPoint = addPoint;
parentPath.addPoint(p1);

// var p1 = new PathPoint(
//   { x: 500, y: 500 },
//   { x: 400, y: 400 },
//   { x: 600, y: 600 },
//   PointType.SMOOTH
// );

// parentPath.addPoint(p1);
