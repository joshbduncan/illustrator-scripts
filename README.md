# Adobe Illustrator Scripts

JSX Scripts for Adobe Products

**Getting Started**

1. Download the [repository ZIP archive](https://github.com/joshbduncan/illustrator-scripts/archive/refs/heads/main.zip) to your computer.
2. Install script files from the `jsx` directory into your Presets folder ([learn how](https://www.marspremedia.com/software/how-to-adobe-cc)).
3. Restart Illustrator.

**Script Categories**

- [Alignment Scripts](#alignment-scripts)
- [Production Scripts](#production-scripts)
- [Text Scripts](#text-scripts)
- [Utility Scripts](#utility-scripts)

## Alignment Scripts

- [OffsetObjects](#offsetobjects)

### OffsetObjects

[![Download](https://img.shields.io/badge/Download-OffsetObjects.jsxinc-blue.svg)](/jsx/utils/OffsetObjects.jsxinc)

Offset selected objects vertically or horizontally by stacking order or artboard placement.

![OffsetObjects](https://github.com/user-attachments/assets/69961345-e261-4f04-b592-800a6c762c74)

## Production Scripts

- [ScreenSepMarks](#screensepmarks)

### ScreenSepMarks

[![Download](https://img.shields.io/badge/Download-ScreenSepMarks.jsx-blue.svg)](/jsx/ScreenSepMarks.jsx)

Easily add screen printing registration marks and spot color info to a document for printing separations.

Includes:

- Customize registration mark size, placement(s), color, and inset
- Label film separations with spot color name
- Output can also include file name and timestamp
- Can be re-run at any time to update data
- Ability to save custom presets

![ScreenSepMarks](https://github.com/user-attachments/assets/efffb8cd-b303-4abe-bc7b-805c32415f3b)

## Text Scripts

- [FontVisualizer](#fontvisualizer)

### FontVisualizer

[![Download](https://img.shields.io/badge/Download-FontVisualizer.jsx-blue.svg)](/jsx/FontVisualizer.jsx)

Visualize every font on your system with customizable text.

> [!NOTE]
> Depending on the number of fonts on your system, this script can take a while to complete. If you want to speed things up, you can change the setting `updateScreen = false`. For example, to process all 2500 fonts on my system, it takes 2 minutes with the default settings. With `updateScreen` set to `false`, the processing time reduces to 20 seconds (83% time decrease).

![FontVisualizer](https://github.com/user-attachments/assets/b73046e9-9270-4331-a461-6d48ed3643c5)

## Utility Scripts

- [GetObjectPlacementInfo](#getobjectplacementinfo)
- [GetVisibleBounds](#getvisiblebounds)
- [Logger](#logger)

### GetObjectPlacementInfo

[![Download](https://img.shields.io/badge/Download-GetObjectPlacementInfo.jsxinc-blue.svg)](/jsx/utils/GetObjectPlacementInfo.jsxinc)

Provide the bounds of a `PageItem` and get all of its placement information. Includes `left`, `top`, `right`, `bottom`, `width`, `height`, `centerX`, and `centerY`.

```javascript
var myObject = app.activeDocument.pageItems[0]
var myObjectPlacementInfo = getObjectPlacementInfo(myObject.visibleBounds)
```

### GetVisibleBounds

[![Download](https://img.shields.io/badge/Download-GetVisibleBounds.jsxinc-blue.svg)](/jsx/utils/GetVisibleBounds.jsxinc)

Determine the actual "visible" bounds for an object accounting for clipping mask and compound paths.

```javascript
var clippedObject = app.activeDocument.pageItems[0]
var bounds = getVisibleBounds(clippedObject)
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
