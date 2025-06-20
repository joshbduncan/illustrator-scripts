/*
MatchObjects.jsx for Adobe Illustrator
--------------------------------------
Match one or more objects to another by size and/or position.

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
1.0.0            initial release
1.0.1            added move to anchor point of source (not just center)
1.0.2            changed ui dialog
1.0.3            removed main function so main vars are global
1.0.4            updated settings dialog box
1.0.5            added fancy source object previewing
1.0.6            changed position anchor selection from drop-down to radio buttons
1.0.7            added ability to move targets to source object layer
1.0.8            added align to source edge option (similar to align panel in Illustrator)
1.0.9            updated getVisibleBounds() to catch lots of weird edge cases
1.1.0            updated getVisibleBounds() again for more edge cases: william dowling @ github.com/wdjsdev
1.1.1            added rotation matching suggested by Sergey Osokin @ github.com/creold
1.1.2 2023-11-08 fixed center/center position matching
1.1.3 2025-06-19 refactor, bug fixes
*/

(function () {
  //@target illustrator

  var scriptTitle = "Match Objects";
  var scriptVersion = "1.1.3";
  var scriptCopyright = "Copyright 2025 Josh Duncan";
  var website = "joshbduncan.com";

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

  ////////////////////////////
  // MAIN SCRIPT OPERATIONS //
  ////////////////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document
  var doc = app.activeDocument;

  // get the current selection
  var sel = doc.selection;

  // no need to continue if there is no active selection
  if (!sel.length) {
    alert("No active selection. Select at least two objects.");
    return;
  }

  // at least two objects must be selected
  if (sel.length < 2) {
    alert("Not enough objects to compare. Select at least two objects.");
    return;
  }

  if (sel instanceof Array) {
    // prompt for settings user input
    var settings = settingsWin();
    if (!settings) return;

    if (
      !settings.position &&
      !settings.size &&
      !settings.rotation &&
      !settings.layer &&
      !settings.alignment
    ) {
      alert("No changes were made!");
    } else {
      matchObjects();
    }
  }

  //////////////////////
  // HELPER FUNCTIONS //
  //////////////////////

  function previewSourceObject(object) {
    app.activeDocument.selection = null;
    object.selected = true;
    app.redraw();
  }

  function getRotationRadians(object) {
    for (var i = 0; i < object.tags.length; i++) {
      var tag = object.tags[i];
      if (tag.name == "BBAccumRotation") {
        var rads = parseFloat(object.tags.BBAccumRotation.value);
        return rads;
      }
    }
    var newTag = object.tags.add();
    newTag.name = "BBAccumRotation";
    newTag.value = 0;
    return 0;
  }

  function radians2Degrees(r) {
    return r * (180 / Math.PI);
  }

  function matchObjects() {
    // set user selected object as source
    var source, sourceBounds;
    if (settings["source"] == "top") {
      source = sel.shift();
    } else {
      source = sel.pop();
    }
    sourceBounds = getVisibleBounds(source);

    // iterate over the target objects
    var target, targetBounds;
    for (var i = 0; i < sel.length; i++) {
      target = sel[i];
      // if target should be rotated
      if (settings.rotation) {
        // after the addition of the match rotation function I found
        // it now best to rotate the target first then gets it's updated
        // bounds and then resize or reposition
        var sourceRotationRadians = getRotationRadians(source);
        var sourceRotationDegrees = radians2Degrees(sourceRotationRadians);
        var targetRotationRadians = getRotationRadians(target);
        var targetRotationDegrees = radians2Degrees(targetRotationRadians);
        // "unrotate" target if already rotated
        if (targetRotationRadians != 0) {
          target.rotate(-targetRotationDegrees);
        }
        target.rotate(sourceRotationDegrees);
        target.tags["BBAccumRotation"].value = sourceRotationRadians;
      }
      // get bounds after rotation so updated size is correct
      targetBounds = getVisibleBounds(target);
      // if target should be resized
      if (settings.size) {
        // (see above) found it worked best to first scale the target object and
        // then move the target object since scaling clipped objects can shift
        // the object making previous move calculations incorrect
        var scaleMatrix = getTrueScaleMatrix(
          sourceBounds,
          targetBounds,
          settings.scale,
        );
        // work out any adjustment on art with strokes
        var strokeScale = getStrokeScale(
          sourceBounds,
          targetBounds,
          settings.scale,
        );
        // scale the target object
        target.transform(
          scaleMatrix,
          true,
          settings.patterns,
          settings.gradients,
          settings.strokePatterns,
          settings.strokeWidth ? strokeScale : false,
          Transformation.CENTER,
        );
      }
      // if target should be repositioned
      var moveMatrix;
      if (settings.position) {
        // get updated target bounds and info since scaling
        // clipped objects can shift the object on the artboard
        targetBounds = getVisibleBounds(target);
        moveMatrix = getMoveMatrix(sourceBounds, targetBounds, settings.anchor);
        // move the target object
        target.transform(moveMatrix, true, true, true);
      }
      // if target should be aligned
      if (settings.alignment) {
        // get updated target bounds and info since scaling
        // clipped objects can shift the object on the artboard
        targetBounds = getVisibleBounds(target);
        moveMatrix = getMoveMatrix(
          sourceBounds,
          targetBounds,
          settings.alignTo,
        );
        // move the target object
        target.transform(moveMatrix, true, true, true);
      }
      // if target should be moved to same layer
      if (settings.layer) {
        target.move(source, ElementPlacement.PLACEBEFORE);
      }
    }
  }

  function getTrueScaleMatrix(sourceBounds, targetBounds, scale) {
    var sourceInfo = getObjectPlacementInfo(sourceBounds);
    var targetInfo = getObjectPlacementInfo(targetBounds);
    var widthProp, heightProp;
    if (scale == "both") {
      widthProp = (sourceInfo.width / targetInfo.width) * 100;
      heightProp = (sourceInfo.height / targetInfo.height) * 100;
    } else if (scale == "height") {
      widthProp = (sourceInfo.height / targetInfo.height) * 100;
      heightProp = (sourceInfo.height / targetInfo.height) * 100;
    } else {
      widthProp = (sourceInfo.width / targetInfo.width) * 100;
      heightProp = (sourceInfo.width / targetInfo.width) * 100;
    }
    return app.getScaleMatrix(widthProp, heightProp);
  }

  function getMoveMatrix(sourceBounds, targetBounds, anchor) {
    var sourceInfo = getObjectPlacementInfo(sourceBounds);
    var targetInfo = getObjectPlacementInfo(targetBounds);
    if (anchor == "tl") {
      return app.getTranslationMatrix(
        sourceInfo.left - targetInfo.left,
        sourceInfo.top - targetInfo.top,
      );
    } else if (anchor == "tc") {
      return app.getTranslationMatrix(
        sourceInfo.centerX - targetInfo.centerX,
        sourceInfo.top - targetInfo.top,
      );
    } else if (anchor == "tr") {
      return app.getTranslationMatrix(
        sourceInfo.right - targetInfo.right,
        sourceInfo.top - targetInfo.top,
      );
    } else if (anchor == "cl") {
      return app.getTranslationMatrix(
        sourceInfo.left - targetInfo.left,
        sourceInfo.centerY - targetInfo.centerY,
      );
    } else if (anchor == "cc") {
      return app.getTranslationMatrix(
        sourceInfo.centerX - targetInfo.centerX,
        sourceInfo.centerY - targetInfo.centerY,
      );
    } else if (anchor == "cr") {
      return app.getTranslationMatrix(
        sourceInfo.right - targetInfo.right,
        sourceInfo.centerY - targetInfo.centerY,
      );
    } else if (anchor == "bl") {
      return app.getTranslationMatrix(
        sourceInfo.left - targetInfo.left,
        sourceInfo.bottom - targetInfo.bottom,
      );
    } else if (anchor == "bc") {
      return app.getTranslationMatrix(
        sourceInfo.centerX - targetInfo.centerX,
        sourceInfo.bottom - targetInfo.bottom,
      );
    } else if (anchor == "br") {
      return app.getTranslationMatrix(
        sourceInfo.right - targetInfo.right,
        sourceInfo.bottom - targetInfo.bottom,
      );
    } else if (anchor == "Top Edge") {
      return app.getTranslationMatrix(0, sourceInfo.top - targetInfo.top);
    } else if (anchor == "Left Edge") {
      return app.getTranslationMatrix(sourceInfo.left - targetInfo.left, 0);
    } else if (anchor == "Horizontal Center") {
      return app.getTranslationMatrix(
        sourceInfo.centerX - targetInfo.centerX,
        0,
      );
    } else if (anchor == "Vertical Center") {
      return app.getTranslationMatrix(
        0,
        sourceInfo.centerY - targetInfo.centerY,
      );
    } else if (anchor == "Right Edge") {
      return app.getTranslationMatrix(sourceInfo.right - targetInfo.right, 0);
    } else if (anchor == "Bottom Edge") {
      return app.getTranslationMatrix(0, sourceInfo.bottom - targetInfo.bottom);
    }
  }

  function getStrokeScale(sourceBounds, targetBounds, scale) {
    var sourceInfo = getObjectPlacementInfo(sourceBounds);
    var targetInfo = getObjectPlacementInfo(targetBounds);
    var strokeScale;
    if (scale == "width") {
      strokeScale = sourceInfo.width / targetInfo.width;
    } else if (scale == "height") {
      strokeScale = sourceInfo.height / targetInfo.height;
    } else {
      strokeScale =
        ((sourceInfo.width / targetInfo.width) * 100 +
          (sourceInfo.height / targetInfo.height) * 100) /
        2 /
        100;
    }
    return strokeScale;
  }

  // ------------
  // user dialogs
  // ------------

  function settingsWin() {
    // settings window
    var win = new Window("dialog");
    win.text = scriptTitle + " " + scriptVersion;
    win.orientation = "column";
    win.alignChildren = "fill";

    // panel - source object
    var pSource = win.add("panel", undefined, "Source Object");
    pSource.alignChildren = "fill";
    pSource.orientation = "column";
    pSource.margins = 18;
    var rbTop = pSource.add(
      "radiobutton",
      undefined,
      "Top Object (of selection)",
    );
    var rbBottom = pSource.add(
      "radiobutton",
      undefined,
      "Bottom Object (of selection)",
    );
    rbBottom.value = true;
    var cbPreview = pSource.add(
      "checkbox",
      undefined,
      "Preview Source Selection",
    );

    // panel - match what
    var pWhat = win.add("panel", undefined, "Match To Source");
    pWhat.alignChildren = "fill";
    pWhat.orientation = "column";
    pWhat.margins = 18;

    // group - 1
    var group1 = pWhat.add("group", undefined);
    group1.alignChildren = "fill";
    group1.orientation = "row";
    var cbPosition = group1.add("checkbox", undefined, "Position");
    var cbSize = group1.add("checkbox", undefined, "Size");
    var cbRotation = group1.add("checkbox", undefined, "Rotation");
    var cbLayer = group1.add("checkbox", undefined, "Layer");

    // group - 2
    var group2 = pWhat.add("group", undefined);
    group2.alignChildren = "fill";
    group2.orientation = "row";
    var cbAlignment = group2.add("checkbox", undefined, "Or Align To Source:");
    var arrAlignment = [
      "Top Edge",
      "Left Edge",
      "Horizontal Center",
      "Vertical Center",
      "Right Edge",
      "Bottom Edge",
    ];
    var ddAlignment = group2.add("dropdownlist", undefined, arrAlignment);
    ddAlignment.selection = 0;
    ddAlignment.enabled = false;

    // group - 3
    var group3 = win.add("group", undefined);
    group3.alignChildren = "fill";
    group3.orientation = "row";

    // create a radio button panel for position
    var pPosition = group3.add("panel", undefined, "Position Match");
    pPosition.alignChildren = ["left", "top"];
    pPosition.orientation = "column";
    pPosition.margins = 18;
    pPosition.enabled = false;

    // group - anchors
    var gAnchors = pPosition.add("group", undefined);
    gAnchors.alignChildren = ["left", "top"];
    gAnchors.orientation = "column";

    // group - top anchors
    var gAnchorsTop = gAnchors.add("group", undefined);
    gAnchorsTop.alignChildren = ["left", "top"];
    gAnchorsTop.orientation = "row";
    var tl = gAnchorsTop.add("radiobutton", undefined);
    var tc = gAnchorsTop.add("radiobutton", undefined);
    var tr = gAnchorsTop.add("radiobutton", undefined);

    // group - center anchors
    var gAnchorsCenter = gAnchors.add("group", undefined);
    gAnchorsCenter.alignChildren = ["left", "top"];
    gAnchorsCenter.orientation = "row";
    var cl = gAnchorsCenter.add("radiobutton", undefined);
    var cc = gAnchorsCenter.add("radiobutton", undefined);
    cc.value = true;
    var cr = gAnchorsCenter.add("radiobutton", undefined);

    // group - bottom anchors
    var gAnchorsBottom = gAnchors.add("group", undefined);
    gAnchorsBottom.alignChildren = ["left", "top"];
    gAnchorsBottom.orientation = "row";
    var bl = gAnchorsBottom.add("radiobutton", undefined);
    var bc = gAnchorsBottom.add("radiobutton", undefined);
    var br = gAnchorsBottom.add("radiobutton", undefined);

    // panel - size
    var pSize = group3.add("panel", undefined, "Size Match");
    pSize.alignChildren = ["left", "top"];
    pSize.orientation = "column";
    pSize.margins = 18;
    pSize.enabled = false;
    var rbScaleWidth = pSize.add("radiobutton", undefined, "Width");
    rbScaleWidth.value = true;
    var rbScaleHeight = pSize.add("radiobutton", undefined, "Height");
    pSize.add("radiobutton", undefined, "Both");

    // panel - also scale
    var pAlsoScale = group3.add("panel", undefined, "Also Scale");
    pAlsoScale.alignChildren = ["left", "top"];
    pAlsoScale.orientation = "column";
    pAlsoScale.margins = 18;
    pAlsoScale.enabled = false;
    var cbPatterns = pAlsoScale.add("checkbox", undefined, "Patterns");
    var cbGradients = pAlsoScale.add("checkbox", undefined, "Gradients");
    cbGradients.value = true;
    var cbStrokePatterns = pAlsoScale.add(
      "checkbox",
      undefined,
      "Stroke Patterns",
    );
    var cbStrokeWidth = pAlsoScale.add("checkbox", undefined, "Stroke Weight");
    cbStrokeWidth.value = true;

    // window control buttons
    var gButtons = win.add("group");
    gButtons.alignment = "center";
    gButtons.add("button", undefined, "OK");
    gButtons.add("button", undefined, "Cancel");

    // copyright info
    var stCopyright = win.add(
      "statictext",
      undefined,
      scriptCopyright + " @ " + website,
      {
        name: "stCopyright",
      },
    );
    stCopyright.alignment = "center";

    // onclick/onchange operations

    stCopyright.addEventListener("click", function () {
      openURL("https://joshbduncan.com");
    });

    // enable/disable source selection preview
    rbTop.onClick = function () {
      if (cbPreview.value) {
        previewSourceObject(sel[0]);
      }
    };
    rbBottom.onClick = function () {
      if (cbPreview.value) {
        previewSourceObject(sel[sel.length - 1]);
      }
    };
    cbPreview.onClick = function () {
      if (cbPreview.value) {
        previewSourceObject(rbTop.value ? sel[0] : sel[sel.length - 1]);
      } else {
        app.activeDocument.selection = sel;
        app.redraw();
      }
    };

    // enable/disable position, size, and alignment options
    cbPosition.onClick = function () {
      if (cbPosition.value) {
        pPosition.enabled = true;
        group2.enabled = false;
      } else {
        pPosition.enabled = false;
        group2.enabled = true;
      }
    };
    cbSize.onClick = function () {
      if (cbSize.value) {
        pSize.enabled = true;
        pAlsoScale.enabled = true;
      } else {
        pSize.enabled = false;
        pAlsoScale.enabled = false;
      }
    };
    cbAlignment.onClick = function () {
      if (cbAlignment.value) {
        ddAlignment.enabled = true;
        cbPosition.enabled = false;
      } else {
        ddAlignment.enabled = false;
        cbPosition.enabled = true;
      }
    };

    // since I'm using radio buttons in different groups
    // for the anchor point selection, I had reset them
    // all each time a different one is selected so that
    // there are never two anchors selected at the same time
    var anchors = [tl, tc, tr, cl, cc, cr, bl, bc, br];
    for (var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      anchor.onClick = function () {
        for (var n = 0; n < anchors.length; n++) {
          if (this != anchors[n]) {
            anchors[n].value = false;
          }
        }
      };
    }

    // if "OK" button clicked then return inputs
    if (win.show() == 1) {
      // reset selection back to original user selection
      app.activeDocument.selection = sel;

      // figure out which dimensions to scale
      var scale;
      if (rbScaleWidth.value) {
        scale = "width";
      } else if (rbScaleHeight.value) {
        scale = "height";
      } else {
        scale = "both";
      }

      // figure out which dimensions to scale
      var anchorNames = ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"];
      var anchorTo = "cc";
      for (var j = 0; j < anchors.length; j++) {
        if (anchors[j].value == true) {
          anchorTo = anchorNames[j];
        }
      }

      return {
        source: rbTop.value ? "top" : "bottom",
        size: cbSize.value,
        scale: scale,
        rotation: cbRotation.value,
        layer: cbLayer.value,
        patterns: cbPatterns.value,
        gradients: cbGradients.value,
        strokePatterns: cbStrokePatterns.value,
        strokeWidth: cbStrokeWidth.value,
        position: cbPosition.value,
        anchor: anchorTo,
        alignment: cbAlignment.value,
        alignTo: cbAlignment.value ? ddAlignment.selection.text : false,
      };
    } else {
      // reset selection from preview if cancel is clicked
      app.activeDocument.selection = sel;
      return;
    }
  }
})();
