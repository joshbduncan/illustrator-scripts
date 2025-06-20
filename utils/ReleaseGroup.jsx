/**
 * Ungroup a groupItem within Adobe Illustrator. Similar to `Object > Ungroup` but also works recursively.
 * @param {GroupItem} group An Adobe Illustrator groupItem
 * @param {Boolean} recursive Should nested groupItems also be ungrouped
 */
function releaseGroup(group, recursive) {
  recursive = typeof recursive !== "undefined" ? recursive : true;

  if (group.typename != "GroupItem") {
    return;
  }

  var subObject;
  while (group.pageItems.length > 0) {
    if (
      group.pageItems[0].typename == "GroupItem" &&
      !group.pageItems[0].clipped
    ) {
      subObject = group.pageItems[0];
      subObject.move(group, ElementPlacement.PLACEBEFORE);
      if (recursive) {
        releaseGroup(subObject, recursive);
      }
    } else {
      group.pageItems[0].move(group, ElementPlacement.PLACEBEFORE);
    }
  }
}
