/**
 * Extract the Adobe Illustrator version that created a document from the document XMP Data.
 * @param {Document} doc Document to get Ai version number from
 * @returns {Number}
 */
function documentIllustratorVersion(doc) {
  var aiVersion = -1;

  // Load the XMP library as an ExtendScript ExternalObject via the docs
  // https://extendscript.docsforadobe.dev/scripting-xmp/index.html
  if (ExternalObject.AdobeXMPScript == "undefined")
    ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");

  //Read XMP string - You can see document XMP info in Illustrator @ File > File Info > Raw Data
  var xmp = new XMPMeta(doc.XMPString);

  // Grab the CreatorTool property
  var xmpString, splitString;
  try {
    xmpString = xmp.getProperty(XMPConst.NS_XMP, "xmp:CreatorTool").value;
    // Should give you something like 'Adobe Illustrator 27.2 (Windows)'
    // or `Adobe Illustrator CC 22.0 (Macintosh)`
  } catch (e) {
    alert("Creator Tool Not Found!\n" + e.message);
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
  $.writeln(
    "Ai Version Info\nXMP String: " +
      xmpString +
      "\nParsed Version: " +
      aiVersion,
  );
  // alert(
  //     "Ai Version Info\nXMP String: " + xmpString + "\nParsed Version: " + aiVersion
  // );

  return aiVersion;
}
