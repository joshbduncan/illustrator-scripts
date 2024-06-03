/*
DocumentAiVersion.jsx for Adobe Illustrator
-------------------------------------------

Get the version of Adobe Illustrator that created the document.

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
0.1.0 initial release
*/

(function () {
  var ver = getIllustratorVersion();

  /**
   * Extract the Adobe Illustrator version from a documents XMP Data.
   */
  function getIllustratorVersion() {
    // Set up some variables
    var xmp, xmpString, aiVersion, splitString;

    // Load the XMP library as an ExtendScript ExternalObject via the docs
    // https://extendscript.docsforadobe.dev/scripting-xmp/index.html
    if (ExternalObject.AdobeXMPScript == "undefined")
      ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");

    //Read XMP string - You can see document XMP info in Illustrator @ File > File Info > Raw Data
    var xmp = new XMPMeta(app.activeDocument.XMPString);

    // Grab the CreatorTool property
    try {
      var xmpString = xmp.getProperty(XMPConst.NS_XMP, "xmp:CreatorTool").value;
      // Should give you something like 'Adobe Illustrator 27.2 (Windows)'
      // or `Adobe Illustrator CC 22.0 (Macintosh)`
    } catch (e) {
      alert("Creator Tool Not Found!\n" + e);
      return -1;
    }

    // If file was created by an app other than Illustrator
    if (xmpString.toLowerCase().indexOf("illustrator") < 0) {
      alert("File not created by Adobe Illustrator.");
      return -1;
    }

    // Parse out the actual version number in the string
    // It's more work than it should be because of inconsistent version naming
    splitString = xmpString.split(" ");
    for (var i = 0; i < splitString.length; i++) {
      aiVersion = Number(splitString[i]);
      if (aiVersion) break;
    }

    // Show the results for debugging
    alert(
      "Ai Version Info\nXMP String: " + xmpString + "\nParsed Version: " + aiVersion
    );

    return aiVersion;
  }
})();
