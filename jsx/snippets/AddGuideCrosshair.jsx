/**
 * Place a crosshair made from guides at `pos`.
 * @param {PageItem} parent PageItem guides should be added to.
 * @param {Array} pos Coordinate position [x, y] crosshair should be placed.
 * @param {Number} size Size in points of crosshair.
 */
function guideCrosshair(parent, pos, size) {
    var crosshairGroup = parent.groupItems.add();
    var lineVertical = crosshairGroup.pathItems.add();
    lineVertical.setEntirePath([
        [pos[0], pos[1] + size / 2],
        [pos[0], pos[1] - size / 2],
    ]);
    lineVertical.guides = true;
    var lineHorizontal = crosshairGroup.pathItems.add();
    lineHorizontal.setEntirePath([
        [pos[0] - size / 2, pos[1]],
        [pos[0] + size / 2, pos[1]],
    ]);
    lineHorizontal.guides = true;
}
