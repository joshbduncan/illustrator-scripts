/*
AiCopyToClipboardViaPhotoshop.jsx for Adobe Illustrator
-------------------------------------------------------

Run a Mac system command from Illustrator via the `app.system()` Photoshop method
using Bridge Talk (https://extendscript.docsforadobe.dev/interapplication-communication/)

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/copy-a-string-to-clipboard-at-launch-via-javascript/td-p/13616550

Notes:
1. Photoshop must be installed and open on your system
2. This file needs to be placed in your Ai start up scripts folder
(https://extendscript.docsforadobe.dev/introduction/scripting-for-specific-applications.html?highlight=startup#startup-scripts)
*/

// item to be copied to clipboard
var SWTY = "bGE-PJk";

// use Bridge Talk to run a system command in Photoshop (must be installed)
var bt = new BridgeTalk();
bt.target = "photoshop";
bt.body = 'app.system("echo ' + SWTY + ' | pbcopy")';

// send the message
bt.send();
