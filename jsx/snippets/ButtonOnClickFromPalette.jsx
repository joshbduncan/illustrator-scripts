/*
ButtonOnClickFromPalette.jsx for Adobe Illustrator
--------------------------------------------------

Execute a palette button onClick function via BridgeTalk.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/copy-a-string-to-clipboard-at-launch-via-javascript/td-p/13616550

This script is distributed under the MIT License.
See the LICENSE file for details.

Versions:
0.1.0 initial release
*/

var SWD = "SOME TEXT TO COPY";
var URL = "https://adobe.com/";

// the BridgeTalk Object
var bt = new BridgeTalk();

// the communication target
bt.target = "illustrator";

// The script to be executed as a String
var codeAsString =
    "app.activeDocument.selection = null;" +
    "\n" +
    "var tempObj = app.activeDocument.pathItems.add();" +
    "\n" +
    "var myText = app.activeDocument.textFrames.add();" +
    "\n" +
    'myText.contents = "' +
    SWD +
    '";' +
    "\n" +
    "tempObj.selected = true;" +
    "\n" +
    "myText.selected = true;" +
    "\n" +
    "app.copy();" +
    "\n" +
    "tempObj.remove();" +
    "\n" +
    "myText.remove();" +
    "\n" +
    'var html = new File(Folder.temp.absoluteURI + "/aisLink.html");' +
    "\n" +
    'html.open("w");' +
    "\n" +
    "var htmlBody = " +
    "\"<html><head><META HTTP-EQUIV=Refresh CONTENT='0; URL=" +
    URL +
    "'></head><body><p></body></html>\";" +
    "\n" +
    "html.write(htmlBody);" +
    "\n" +
    "html.close();" +
    "\n" +
    "html.execute();";

// assign to the object's body the message
bt.body = codeAsString;

// make your dialog (not palette)
var win = new Window("palette");
win.text = "DC TOOLS";
// make your button
var button = win.add("button", undefined, "PACK");
// add all the things you want done when button is clicked
button.onClick = function () {
    // send the message to the target app
    bt.send();
};
// show the dialog
win.show();
