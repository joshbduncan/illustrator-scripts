# Adobe Illustrator Scripts

JSX Scripts for Adobe Products

**Getting Started**

1. Download the [repository ZIP archive](https://github.com/joshbduncan/illustrator-scripts/archive/refs/heads/main.zip) to your computer.
2. Install script files from the `jsx` directory into your Presets folder ([learn how](https://www.marspremedia.com/software/how-to-adobe-cc)).
3. Restart Illustrator.

## Utility Scripts

- [GetObjectPlacementInfo](#getobjectplacementinfo)
- [Logger](#logger)

### GetObjectPlacementInfo

[![Download](https://img.shields.io/badge/Download-GetObjectPlacementInfo.jsxinc-blue.svg)](/jsx/utils/GetObjectPlacementInfo.jsxinc)

Provide the bounds of a `PageItem` and get all of its placement information. Includes `left`, `top`, `right`, `bottom`, `width`, `height`, `centerX`, and `centerY`.

```javascript
var myObject = app.activeDocument.pageItems[0]
var myObjectPlacementInfo = getObjectPlacementInfo(myObject.visibleBounds)
```


### Logger

[![Download](https://img.shields.io/badge/Download-Logger.jsxinc-blue.svg)](/jsx/utils/Logger.jsxinc)

Module for easy file logging from within Adobe ExtendScript.

Features:
- timestamps
- "append" or "write" modes
- file size rotation
- optional forwarding of any writes to the console via `$.writeln()`
- multiple argument concatenation `logger.log("arg1", "arg2", "arg3")`

```javascript
var logFile = Folder.userData + "example.log";
logger = new Logger(logFilePath);
logger.log("hello, world!");
```