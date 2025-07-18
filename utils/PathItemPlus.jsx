function PathPointPlus(obj) {
  this.self = obj;
  for (prop in obj) {
    try {
      this[prop] = obj[prop];
    } catch (e) {
      this[prop] = e;
    }
  }
  // allow user to specify only an anchor point when creating custom points
  if (!this.hasOwnProperty("leftDirection")) this.leftDirection = this.anchor;
  if (!this.hasOwnProperty("rightDirection")) this.rightDirection = this.anchor;
  if (!this.hasOwnProperty("pointType")) this.pointType = PointType.CORNER;
}

PathPointPlus.prototype = {
  addToPath: function (parentPath, idx) {
    // add to end of path if index not specified
    idx = idx !== "undefined" ? idx : parentPath.pathPoints.length;
    // prompt for index for example purposes
    // idx = prompt("What index?", idx);
    // validate provided index
    if (idx < 0 || idx > parentPath.pathPoints.length) {
      alert(
        "Invalid insertion index (`idx`).\n0 <= idx <= " +
          parentPath.pathPoints.length,
      );
      return;
    }
    // remove all points after idx
    var removedPoints = [];
    if (idx < parentPath.pathPoints.length) {
      for (var i = parentPath.pathPoints.length - 1; i >= idx; i--) {
        removedPoints.push(new PathPointPlus(parentPath.pathPoints[i]));
        if (i == 0) {
          parentPath.pathPoints[i].anchor = this.anchor;
          parentPath.pathPoints[i].leftDirection = this.rightDirection;
          parentPath.pathPoints[i].rightDirection = this.leftDirection;
          parentPath.pathPoints[i].pointType = this.pointType;
        } else {
          parentPath.pathPoints[i].remove();
        }
      }
    }
    // add the points back
    if (idx > 0) removedPoints.push(this);
    // add the new point plus the removed points
    var newPoint;
    for (var i = removedPoints.length - 1; i >= 0; i--) {
      newPoint = parentPath.pathPoints.add();
      newPoint.anchor = removedPoints[i].anchor;
      if (removedPoints[i].hasOwnProperty("leftDirection"))
        newPoint.leftDirection = removedPoints[i].rightDirection;
      if (removedPoints[i].hasOwnProperty("rightDirection"))
        newPoint.rightDirection = removedPoints[i].leftDirection;
      if (removedPoints[i].hasOwnProperty("pointType"))
        newPoint.pointType = removedPoints[i].pointType;
    }
  },
};

function PathItemPlus(obj) {
  this.self = obj;
  for (prop in obj) {
    try {
      this[prop] = obj[prop];
    } catch (e) {
      this[prop] = e;
    }
  }
}

PathItemPlus.prototype = {
  /**
   * The splice() method changes the PathPoints of a PathItem by removing
   * or replacing existing PathPoints and/or adding new PathPoints in place.
   *
   * splice(start, deleteCount, item1, item2, itemN)
   *
   * @param {Number} start Zero-based index at which to start replacing or removing PathPoints.
   * @param {Number} deleteCount An integer indicating the number of PathPoints in the PathItem to remove from start.
   * @param {PathPoint} item... The PathPoints elements to add to the PathItem, beginning from start.
   * @returns {Array} An array containing the deleted PathPoints.
   */
  splice: function (start, deleteCount) {
    var arr = [];
    var resultArr = [];

    start = start !== "undefined" ? Number(start) : 0;

    // delete entire path if start = 0
    if (start === 0 && deleteCount == "undefined") {
      for (var i = 0; i < this.pathPoints.length; i++)
        resultArr.push(new PathPointPlus(this.pathPoints[i]));
      this.self.remove();
      return resultArr;
    }

    // append items to end if start if > pathPoints
    if (start > this.pathPoints.length) {
      start = this.pathPoints.length;
      end = this.pathPoints.length;
      deleteCount = 0;
    }

    // if start is a negative number
    if (start < -this.pathPoints.length) {
      start = 0;
    } else if (start < 0) {
      start = start + this.pathPoints.length;
    }

    deleteCount = deleteCount !== "undefined" ? Number(deleteCount) : 0;
    if (deleteCount >= this.pathPoints.length - start) {
      deleteCount = this.pathPoints.length - start;
    } else if (deleteCount == "undefined") {
      deleteCount = 0;
    }

    // grab all items to splice (if any)
    var items = [];
    for (var i = 2; i < arguments.length; i++) items.push(arguments[i]);

    var stop = this.pathPoints.length;

    // if deleteCount is defined
    if (deleteCount) {
      // we add it to start. This gives us the index we will stop in the data array.
      stop = start + deleteCount;
      // if deleteCount is negative, we splice no array
      if (deleteCount < 0) stop = 0;
    }

    // cut out the deleted points
    for (var i = start; i < stop; i++) {
      resultArr.push(new PathPointPlus(this.pathPoints[i]));
    }

    // if deleteCount is defined but items is empty
    if (deleteCount && items.length <= 0) {
      for (var i = 0; i < this.pathPoints.length; i++) {
        if (i === start) {
          i = stop;
        } else {
          arr.push(new PathPointPlus(this.pathPoints[i]));
        }
      }
    }

    // if there is something in the items array
    if (items.length > 0) {
      for (var i = 0; i < this.pathPoints.length; i++) {
        if (i === start && arr.length < start + items.length) {
          arr = arr.concat(items);
          i = deleteCount > 0 ? stop : i - 1;
        } else {
          arr.push(new PathPointPlus(this.pathPoints[i]));
        }
      }
    }

    // actually delete the points from the path
    if (deleteCount > 0) {
      for (var i = 0; i < resultArr.length; i++) {
        if (resultArr[i].self.hasOwnProperty("remove"))
          resultArr[i].self.remove();
      }
    }

    // remove all points (except first)
    for (var i = 1; i < this.pathPoints.length; i++) {
      this.pathPoints[i].remove();
    }

    // add the updated points
    if (arr) {
      for (var i = start; i < arr.length; i++) {
        if (i === 0) {
          this.pathPoints[i].anchor = arr[i].anchor;
          if (arr[i].hasOwnProperty("leftDirection"))
            this.pathPoints[i].leftDirection = arr[i].leftDirection;
          if (arr[i].hasOwnProperty("rightDirection"))
            this.pathPoints[i].rightDirection = arr[i].rightDirection;
          if (arr[i].hasOwnProperty("pointType"))
            this.pathPoints[i].pointType = arr[i].pointType;
        } else {
          arr[i].addToPath(this, this.pathPoints.length);
        }
      }
    }

    return resultArr;
  },
};
