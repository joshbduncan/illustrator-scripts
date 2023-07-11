function PageItemPlus(pageItem) {
  this.self = pageItem;
  this.getVisibleProperties();
}

PageItemPlus.prototype = {
  getVisibleProperties: function () {
    this.visibleBounds = this.getVisibleBounds();
    this.visibleLeft = this.visibleBounds[0];
    this.visibleTop = this.visibleBounds[1];
    this.visibleRight = this.visibleBounds[2];
    this.visibleBottom = this.visibleBounds[3];
    this.visibleWidth = this.right - this.left;
    this.visibleHeight = this.top - this.bottom;
    this.visibleCenterX = this.left + this.width / 2;
    this.visibleCenterY = this.top - this.height / 2;
  },
  move: function (x, y) {
    var m = app.getTranslationMatrix(x, y);
    this.self.transform(m, true, true, true);
    this.getVisibleProperties();
  },
  rotate: function (r) {
    var m = app.getRotationMatrix(r);
    this.self.transform(m, true, true, true);
    this.getVisibleProperties();
  },
  scale: function (xs, ys) {
    var m = app.getScaleMatrix(xs, ys);
    this.self.transform(m, true, true, true);
    this.getVisibleProperties();
  },
  /**
   * Determine the actual "visible" bounds for an object
   * if clipping mask or compound path items are found
   * @returns Visible item rectangular bounds as [left, top, right, bottom].
   */
  getVisibleBounds: function () {
    $.writeln("calculating...");
    var bounds, clippedItem, sandboxItem, sandboxLayer;
    var curItem;
    if (this.self.typename == "GroupItem") {
      // if the object is clipped
      if (this.self.clipped) {
        // check all sub objects to find the clipping path
        for (var i = 0; i < this.self.pageItems.length; i++) {
          curItem = this.self.pageItems[i];
          if (curItem.clipping) {
            clippedItem = curItem;
            break;
          } else if (curItem.typename == "CompoundPathItem") {
            if (!curItem.pathItems.length) {
              // catch compound path items with no pathItems via william dowling @ github.com/wdjsdev
              sandboxLayer = app.activeDocument.layers.add();
              sandboxItem = curItem.duplicate(sandboxLayer);
              app.activeDocument.selection = null;
              sandboxItem.selected = true;
              app.executeMenuCommand("noCompoundPath");
              sandboxLayer.hasSelectedArtwork = true;
              app.executeMenuCommand("group");
              clippedItem = app.activeDocument.selection[0];
              break;
            } else if (curItem.pathItems[0].clipping) {
              clippedItem = curItem;
              break;
            }
          } else {
            clippedItem = curItem;
            break;
          }
        }
        bounds = clippedItem.geometricBounds;
        if (sandboxLayer) {
          // eliminate the sandbox layer since it's no longer needed
          sandboxLayer.remove();
          sandboxLayer = undefined;
        }
      } else {
        // if the object is not clipped
        var subObjectBounds;
        var allBoundPoints = [[], [], [], []];
        // get the bounds of every object in the group
        for (var i = 0; i < this.self.pageItems.length; i++) {
          curItem = this.self.pageItems[i];
          subObjectBounds = getVisibleBounds(curItem);
          allBoundPoints[0].push(subObjectBounds[0]);
          allBoundPoints[1].push(subObjectBounds[1]);
          allBoundPoints[2].push(subObjectBounds[2]);
          allBoundPoints[3].push(subObjectBounds[3]);
        }
        // determine the groups bounds from it sub object bound points
        bounds = [
          Math.min.apply(Math, allBoundPoints[0]),
          Math.max.apply(Math, allBoundPoints[1]),
          Math.max.apply(Math, allBoundPoints[2]),
          Math.min.apply(Math, allBoundPoints[3]),
        ];
      }
    } else {
      bounds = this.self.geometricBounds;
    }
    return bounds;
  },
};

var doc = app.activeDocument;
var sel = app.selection;

var obj = new PageItemPlus(sel[0]);
alert("hey");
