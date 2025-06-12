/*
OffsetObjects.jsx for Adobe Illustrator
--------------------------------------
Offset selected objects vertically or horizontally by stacking order or artboard placement.

Author
------
Josh Duncan
joshbduncan@gmail.com
https://joshbduncan.com
https://github.com/joshbduncan/

Wanna Support Me?
-----------------
Most of the things I make are free to download but if you would like
to support me that would be awesome and greatly appreciated!
https://joshbduncan.com/software.html

License
-------
This script is distributed under the MIT License.
See the LICENSE file for details.

Changelog
---------
1.0.0 initial release
1.0.1 fixed bug where if no translation was needed the stroke would scale for some reason
1.2.0 added ordering by artboard placement
1.3.0 added limits for vertical and horizontal
1.3.1 removed limit option, bug fixes
*/

(function () {
    //@target illustrator

    var _title = "Offset Objects";
    var _version = "1.3.0";
    var _copyright = "Copyright 2025 Josh Duncan";
    var _website = "joshbduncan.com";

    //////////////
    // INCLUDES //
    //////////////


    /**
     * Get geometric info from Illustrator object bounds.
     * @param {Array} bounds - Illustrator object bounds (e.g. [left, top, right, bottom]).
     * @returns {Object} Geometry info with left, top, right, bottom, width, height, centerX, centerY.
     */
    function getObjectPlacementInfo(bounds) {
        if (!bounds || bounds.length !== 4) {
            throw new Error("Invalid bounds: Expected [left, top, right, bottom]");
        }

        var left = bounds[0];
        var top = bounds[1];
        var right = bounds[2];
        var bottom = bounds[3];
        var width = right - left;
        var height = top - bottom;
        var centerX = left + width / 2;
        var centerY = top - height / 2;

        return {
            left: left,
            top: top,
            right: right,
            bottom: bottom,
            width: width,
            height: height,
            centerX: centerX,
            centerY: centerY,
        };
    }
    /*
      Changelog
      ---------
      2021-09-13
        - updated getVisibleBounds() to catch lots of weird edge cases
      2021-10-13
        - updated getVisibleBounds() again for more edge cases (William Dowling @ github.com/wdjsdev)
      2021-10-15
        - fix for clipping masks not at top of clipping group stack (issue #7 Sergey Osokin @ https://github.com/creold)
        - error catch for selected guides (William Dowling @ github.com/wdjsdev)
        - error catch for empty objects or item with no bounds
        - error catch for clipping masks inside of an empty group
    */

    /**
     * Determine the actual "visible" bounds for an object if clipping mask or compound path items are found.
     * @param {PageItem} o A single Adobe Illustrator pageItem.
     * @returns {Array} Object bounds [left, top, right, bottom].
     */
    function getVisibleBounds(o) {
        var bounds, clippedItem, sandboxItem, sandboxLayer;
        var curItem;

        // skip guides (via william dowling @ github.com/wdjsdev)
        if (o.guides) {
            return undefined;
        }

        if (o.typename == "GroupItem") {
            // if the group has no pageItems, return undefined
            if (!o.pageItems || o.pageItems.length == 0) {
                return undefined;
            }
            // if the object is clipped
            if (o.clipped) {
                // check all sub objects to find the clipping path
                for (var i = 0; i < o.pageItems.length; i++) {
                    curItem = o.pageItems[i];
                    if (curItem.clipping) {
                        clippedItem = curItem;
                        break;
                    } else if (curItem.typename == "CompoundPathItem") {
                        if (!curItem.pathItems.length) {
                            // catch compound path items with no pathItems (via William Dowling @ github.com/wdjsdev)
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
                    }
                }
                if (!clippedItem) {
                    clippedItem = o.pageItems[0];
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
                for (var i = 0; i < o.pageItems.length; i++) {
                    curItem = o.pageItems[i];
                    subObjectBounds = getVisibleBounds(curItem);
                    for (var j = 0; j < subObjectBounds.length; j++) {
                        allBoundPoints[j].push(subObjectBounds[j]);
                    }
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
            bounds = o.geometricBounds;
        }
        return bounds;
    }
    /**
     * Open a url in the system browser.
     * @param {String} url URL to open.
     */
    function openURL(url) {
        var html = new File(Folder.temp.absoluteURI + "/aisLink.html");
        html.open("w");
        var htmlBody =
            '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' +
            url +
            '"></head><body><p></p></body></html>';
        html.write(htmlBody);
        html.close();
        html.execute();
    }
    /**
     * Parse a ScriptUI `edittext` value into a valid `UnitType` number.
     * @param {Number|String} n Value to parse.
     * @param {Number} defaultValue Default value to return if `n` is invalid.
     * @param {String} defaultUnit Default unit type to return the input as if not included in `n`.
     * @returns {UnitValue}
     */
    function parseNumberInput(n, defaultValue, defaultUnit) {
        defaultValue = typeof defaultValue !== "undefined" ? defaultValue : 0;

        var rulerUnits = app.activeDocument.rulerUnits
            .toString()
            .split(".")[1]
            .toLowerCase();
        defaultUnit = typeof defaultUnit !== "undefined" ? defaultUnit : rulerUnits;

        var val = UnitValue(n);
        if (val.type === "?") {
            val = UnitValue(n, defaultUnit);
            if (isNaN(val.value)) {
                app.beep();
                val = UnitValue(defaultValue, defaultUnit);
            }
        }
        return val;
    }

    /////////////////
    // MAIN SCRIPT //
    /////////////////

    // run script
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        var sel = doc.selection;
        if (sel.length > 1) {
            if (sel instanceof Array) {
                var settings = settingsWin();
                if (settings) {
                    offsetObjects(
                        settings.direction,
                        settings.ordering,
                        settings.gutter,
                        settings.reverse
                    );
                }
            }
        } else {
            alert("Not enough objects selected!\nSelect at least two objects first.");
        }
    } else {
        alert("No documents open!\nCreate or open a document first.");
    }

    /**
     * offset selected objects
     */
    function offsetObjects(direction, ordering, gutter, reverse) {
        // sort selected objects if ordering is not default stacking order
        if (ordering == "Horizontal Placement") {
            sel.sort(function (a, b) {
                return a.left - b.left;
            });
        } else if (ordering == "Vertical Placement") {
            sel.sort(function (a, b) {
                return a.top - b.top;
            });
        }

        // reverse stacking order if requested
        if (reverse == true) {
            sel.reverse();
        }

        // iterate over the target objects
        var source, sourceBounds;
        var target, targetBounds;
        for (var i = 0; i < sel.length - 1; i++) {
            source = sel[i];
            sourceBounds = getVisibleBounds(source);
            target = sel[i + 1];
            targetBounds = getVisibleBounds(target);
            var noTranslationNeeded = app.getTranslationMatrix(0, 0);
            var moveMatrix = calculateMoveMatrix(
                sourceBounds,
                targetBounds,
                direction,
                gutter
            );
            // move the target object
            if (moveMatrix != false) {
                target.transform(moveMatrix, true, true, true);
            }
        }
    }

    //////////////////////
    // HELPER FUNCTIONS //
    //////////////////////

    /**
     * calculate the correct move matrix to match the user
     * requested offset direction and gutter size
     */
    function calculateMoveMatrix(sourceBounds, targetBounds, direction, gutter) {
        var sourceInfo = getObjectPlacementInfo(sourceBounds);
        var targetInfo = getObjectPlacementInfo(targetBounds);
        if (direction == "Vertical" && sourceInfo.bottom != targetInfo.top) {
            return app.getTranslationMatrix(
                0,
                sourceInfo.bottom - targetInfo.bottom - targetInfo.height - gutter
            );
        } else if (direction == "Horizontal" && sourceInfo.right != targetInfo.left) {
            return app.getTranslationMatrix(
                sourceInfo.right - targetInfo.right + targetInfo.width + gutter,
                0
            );
        }
        return false;
    }

    ////////////////////////
    // MAIN SCRIPT DIALOG //
    ////////////////////////

    function settingsWin() {
        // settings window
        var win = new Window("dialog");
        win.text = _title + " " + _version;
        win.orientation = "column";
        win.alignChildren = "fill";

        // panel - offset direction
        var pDirection = win.add("panel", undefined, "Direction");
        pDirection.alignChildren = "fill";
        pDirection.orientation = "column";
        pDirection.margins = 18;

        // group - offset direction
        var gDirection = pDirection.add("group", undefined);
        gDirection.alignChildren = "fill";
        gDirection.orientation = "column";
        var rbHorizontal = gDirection.add(
            "radiobutton",
            undefined,
            "Horizontal Offset"
        );
        rbHorizontal.value = true;
        var rbVertical = gDirection.add("radiobutton", undefined, "Vertical Offset");

        // panel - order by
        var pOrderBy = win.add("panel", undefined, "Order");
        pOrderBy.alignChildren = "fill";
        pOrderBy.orientation = "column";
        pOrderBy.margins = 18;

        // group - order by
        var gOrderBy = pOrderBy.add("group", undefined);
        gOrderBy.alignChildren = "fill";
        gOrderBy.orientation = "column";
        var rbStackingOrder = gOrderBy.add("radiobutton", undefined, "Stacking Order");
        rbStackingOrder.value = true;
        var rbHorizontalOrder = gOrderBy.add(
            "radiobutton",
            undefined,
            "Horizontal Placement"
        );
        var rbVerticalOrder = gOrderBy.add(
            "radiobutton",
            undefined,
            "Vertical Placement"
        );

        // group - reverse  order
        var gReverse = pOrderBy.add("group", undefined);
        gReverse.alignChildren = "fill";
        gReverse.orientation = "row";
        var cbReverseStackingOrder = gReverse.add(
            "checkbox",
            undefined,
            "Reverse Order"
        );

        // panel - gutter
        var pGutter = win.add("panel", undefined, "Gutter Setup");
        pGutter.orientation = "row";
        var stSize = pGutter.add("statictext", undefined, "Size:");
        var gutter = pGutter.add('edittext {justify: "center"}');
        gutter.preferredSize.width = 60;
        gutter.text = "0";
        gutter.preferredSize.width = 60;
        gutter.text = 0;
        var ddSizeUnit = pGutter.add("dropdownlist", undefined, ["in", "pt", "mm"]);
        ddSizeUnit.preferredSize.width = 70;
        ddSizeUnit.selection = 0;

        // group - window buttons
        var gWindowButtons = win.add("group", undefined);
        gWindowButtons.orientation = "row";
        gWindowButtons.alignChildren = ["Leftwards", "center"];
        gWindowButtons.alignment = ["center", "top"];
        var btOK = gWindowButtons.add("button", undefined, "OK");
        var btCancel = gWindowButtons.add("button", undefined, "Cancel");

        // panel - info
        var pInfo = win.add("panel", undefined);
        pInfo.orientation = "column";
        pInfo.alignChildren = ["center", "top"];
        var stCopyright = pInfo.add("statictext", undefined);
        stCopyright.text = _copyright + " @ " + _website;

        stCopyright.addEventListener("click", function (e) {
            openURL("https://joshbduncan.com");
        });

        function getSelectedRbFromGroup(group) {
            for (var i = 0; i < group.children.length; i++) {
                if (group.children[i].value == true) {
                    return group.children[i].text;
                }
            }
        }

        // if "ok" button clicked then return inputs
        if (win.show() == 1) {
            var gutterSize = parseNumberInput(
                gutter.text,
                0,
                ddSizeUnit.selection.text
            );
            currentSettings = {
                direction: rbVertical.value ? "Vertical" : "Horizontal",
                ordering: getSelectedRbFromGroup(gOrderBy),
                reverse: cbReverseStackingOrder.value,
                gutter: gutterSize.as("pt"),
            };
            return currentSettings;
        } else {
            return;
        }
    }
})();
