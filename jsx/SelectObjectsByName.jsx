/*
SelectObjectsByName.jsx for Adobe Illustrator
---------------------------------------------
Select page items by name in Adobe Illustrator (regex enabled).

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
0.1.0 2025-07-14 initial release
*/

(function () {
  //@target illustrator

  var scriptTitle = "Select Objects by Name";
  var scriptVersion = "0.1.0";
  var scriptCopyright = "Copyright 2025 Josh Duncan";
  var website = "joshbduncan.com";

  //////////////
  // INCLUDES //
  //////////////

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

  /////////////////
  // MAIN SCRIPT //
  /////////////////

  // no need to continue if there is no active document
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // grab document and selection info
  var doc = app.activeDocument;
  var previousSelection = doc.selection;
  doc.selection = null;

  /////////////////
  // DIALOG //
  /////////////////
  var dialog = new Window("dialog");
  dialog.text = scriptTitle + " " + scriptVersion;
  dialog.orientation = "column";
  dialog.alignChildren = ["center", "center"];
  dialog.spacing = 15;
  dialog.margins = 18;

  // main panel
  var panel = dialog.add("panel", undefined, undefined);
  panel.orientation = "column";
  panel.alignment = ["fill", "center"];
  panel.alignChildren = ["center", "top"];
  panel.spacing = 15;
  panel.margins = 18;

  var findGroup = panel.add("group", undefined);
  findGroup.orientation = "row";
  findGroup.alignment = ["fill", "center"];
  findGroup.alignChildren = ["left", "center"];

  findGroup.add("statictext", undefined, "Find:");

  var pattern = findGroup.add('edittext {justify: "center"}');
  pattern.helpTip = "Enter a plain string or a regular expression like /text/i";
  pattern.preferredSize.width = 200;
  pattern.active = true;

  var regexCheckbox = findGroup.add("checkbox", undefined, "RegEx");

  var previewButton = panel.add("button", undefined, "Find Matches");
  previewButton.alignment = ["fill", "center"];
  previewButton.enabled = false;

  // buttons
  var group = dialog.add("group", undefined);
  group.orientation = "row";
  group.alignChildren = ["center", "top"];
  group.alignment = ["fill", "top"];
  group.spacing = 15;

  var cancelButton = group.add("button", undefined, "Cancel", {
    name: "cancel",
  });
  cancelButton.preferredSize.width = 100;

  var okButton = group.add("button", undefined, "OK", { name: "ok" });
  okButton.preferredSize.width = 100;
  okButton.enabled = false;

  // copyright
  var copyright = dialog.add(
    "statictext",
    undefined,
    scriptCopyright + " @ " + website,
  );
  copyright.alignment = "center";

  ////////////////////////////////////////////////////
  // INPUT HELPERS, VALIDATORS, AND EVENT LISTENERS //
  ////////////////////////////////////////////////////

  pattern.onChanging = function () {
    if (pattern.text.length > 0) {
      previewButton.enabled = true;
      previewButton.text = "Find Matches";
      doc.selection = null;
    } else {
      previewButton.enabled = false;
      okButton.enabled = false;
      doc.selection = null;
    }
  };

  pattern.addEventListener("keydown", function (e) {
    if (e.keyName == "Enter") {
      if (previewButton.enabled) {
        previewButton.notify("onClick");
        e.preventDefault();
      }
    }
  });

  regexCheckbox.onClick = function () {
    previewButton.text = "Find Matches";
    previewButton.enabled = true;
    okButton.enabled = false;
    doc.selection = null;
  };

  previewButton.onClick = function () {
    processChanges();
  };

  copyright.addEventListener("click", function () {
    openURL("https://joshbduncan.com");
  });

  // if "ok" button clicked then return inputs
  if (dialog.show() != 1) {
    doc.selection = previousSelection;
    return;
  }

  function processChanges() {
    var items = getObjectsByName(pattern.text, regexCheckbox.value);

    if (!items.length) {
      previewButton.text = "Find Matches";
      okButton.enabled = false;
      doc.selection = null;
      return;
    }

    previewButton.text = "Found " + items.length + " Matches";
    previewButton.enabled = false;

    // enable select button
    okButton.enabled = true;

    // select matches items
    doc.selection = items;

    app.redraw();
  }

  function parseRegexLiteral(str) {
    // match things like "/pattern/flags"
    var match = str.match(/^\/((?:\\\/|[^\/])+)\/([gimuy]*)$/);

    if (match) {
      return {
        pattern: match[1],
        flags: match[2],
      };
    }

    // not a valid regex literal string
    return null;
  }

  /**
   * Get all page items whose name matched `pattern`.
   * @param {string} pattern - Simple text or RegEx string.
   * @returns {PageItem[]}
   */
  function getObjectsByName(pattern, regex) {
    regex = typeof regex !== "undefined" ? regex : false;
    if (regex) {
      var parsed = parseRegexLiteral(pattern);
      if (parsed) {
        pattern = new RegExp(parsed.pattern, parsed.flags.replace("g", ""));
      } else {
        alert("Invalid RegEx!");
        return [];
      }
    }

    var matches = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
      if (!doc.pageItems[i].name) continue;

      if (
        (regex && pattern.test(doc.pageItems[i].name)) ||
        doc.pageItems[i].name.indexOf(pattern) > -1
      ) {
        matches.push(doc.pageItems[i]);
      }
    }
    return matches;
  }
})();
