# Adobe Illustrator Scripts

Welcome to my playground for Adobe Illustrator scripting. Along with the scripts and utilities detailed below, you can also find some fun tests and example scripts in the [snippets](/snippets/) directory. Have fun! ✌️

**Getting Started**

1. Download the [repository ZIP archive](https://github.com/joshbduncan/illustrator-scripts/archive/refs/heads/main.zip) to your computer.
2. Install script files from the `jsx` directory into your Presets folder ([learn how](https://www.marspremedia.com/software/how-to-adobe-cc)).
3. Restart Illustrator.

**Script Categories**

- [Alignment Scripts](#alignment-scripts)
- [Artboard Scripts](#artboard-scripts)
- [Color Scripts](#color-scripts)
- [Layer Scripts](#layer-scripts)
- [Path Scripts](#path-scripts)
- [Production Scripts](#production-scripts)
- [Selection Scripts](#selection-scripts)
- [Text Scripts](#text-scripts)
- [Utility Scripts](#utility-scripts)

## Alignment Scripts

- [MatchObjects](#matchobjects)
- [OffsetObjects](#offsetobjects)

### MatchObjects

[![Download](https://img.shields.io/badge/Download-MatchObjects.jsx-blue.svg)](/jsx/MatchObjects.jsx)

Match one or more objects to another by size, position, rotation, and more.

![MatchObjects](https://github.com/user-attachments/assets/901dcd4d-f203-4f10-8e5a-e40133606c62)

### OffsetObjects

[![Download](https://img.shields.io/badge/Download-OffsetObjects.jsx-blue.svg)](/jsx/OffsetObjects.jsx)

Offset selected objects vertically or horizontally by stacking order or artboard placement.

![OffsetObjects](https://github.com/user-attachments/assets/69961345-e261-4f04-b592-800a6c762c74)

## Artboard Scripts

- [ArtboardFloodFill](#artboardfloodfill)
- [ArtboardRectGuides](#artboardrectguides)
- [ArtboardsToAi](#artboardstoai)
- [ArtboardsToPDF](#artboardstopdf)
- [ArtboardToAi](#artboardtoai)
- [ArtboardToPDF](#artboardtopdf)

### ArtboardFloodFill

[![Download](https://img.shields.io/badge/Download-ArtboardFloodFill.jsx-blue.svg)](/jsx/ArtboardFloodFill.jsx)

Flood fill the active artboard with the current fill color.

![ArtboardFloodFill](https://github.com/user-attachments/assets/b9aeba2c-f1a3-4705-a19d-815a81529c75)

### ArtboardRectGuides

[![Download](https://img.shields.io/badge/Download-ArtboardRectGuides.jsx-blue.svg)](/jsx/ArtboardRectGuides.jsx)

Easily add a rectangle guide offset +/- from your current artboard.

![ArtboardRectGuides](https://github.com/user-attachments/assets/df0982be-5f16-41a0-95f8-54bbc5f2c6a3)

### ArtboardsToAi

[![Download](https://img.shields.io/badge/Download-ArtboardsToAi.jsx-blue.svg)](/jsx/ArtboardsToAi.jsx)

Export all artboards to individual Ai files.

### ArtboardsToPDF

[![Download](https://img.shields.io/badge/Download-ArtboardsToPDF.jsx-blue.svg)](/jsx/ArtboardsToPDF.jsx)

Export all artboards to individual PDF files.

### ArtboardToAi

[![Download](https://img.shields.io/badge/Download-ArtboardToAi.jsx-blue.svg)](/jsx/ArtboardToAi.jsx)

Export the current artboard to an Ai file.

### ArtboardToPDF

[![Download](https://img.shields.io/badge/Download-ArtboardToPDF.jsx-blue.svg)](/jsx/ArtboardToPDF.jsx)

Export the current artboard to a PDF file.

## Color Scripts

- [ColorRandomly](#colorrandomly)

### ColorRandomly

[![Download](https://img.shields.io/badge/Download-ColorRandomly.jsx-blue.svg)](/jsx/ColorRandomly.jsx)

Randomly color selected objects.

Features:
- choose between Full RGB, a single color (adjustable tints), or grayscale values
- works with text words or individual characters

![ColorRandomly](https://github.com/user-attachments/assets/b3013b8f-db50-4c91-a46a-2915dd097c7f)

## Layer Scripts

- [RenameLayers](#renamelayers)
- [ShowHideLayers](#showhidelayers)

### RenameLayers

[![Download](https://img.shields.io/badge/Download-RenameLayers.jsx-blue.svg)](/jsx/RenameLayers.jsx)

Rename layers using find and replace (regex enabled).

![RenameLayers](https://github.com/user-attachments/assets/d7b8a3c7-d59a-4c53-b448-aab59dd629aa)

### ShowHideLayers

[![Download](https://img.shields.io/badge/Download-ShowHideLayers.jsx-blue.svg)](/jsx/ShowHideLayers.jsx)

Show or Hide layers in Adobe Illustrator using find (regex enabled).

![ShowHideLayers](https://github.com/user-attachments/assets/3e63b0a3-2606-4bff-a9b3-095d5b908343)

## Path Scripts

- [EditPointsOnly](#editpointsonly)
- [RemoveBezierHandles](#removebezierhandles)

### EditPointsOnly

[![Download](https://img.shields.io/badge/Download-EditPointsOnly.jsx-blue.svg)](/jsx/EditPointsOnly.jsx)

Sometimes when selecting path points using the Direct Selection Tool or Lasso Tool, path segments also get selected making anchor point manipulation difficult. This script selects only the path points (not path segments) from your current selection.

### RemoveBezierHandles

[![Download](https://img.shields.io/badge/Download-RemoveBezierHandles.jsx-blue.svg)](/jsx/RemoveBezierHandles.jsx)

Remove bezier handles from selected anchor points.

## Production Scripts

- [ExportPrintCutPDFs](#exportprintcutpdfs)
- [RepeatAfterMe](#repeatafterme)
- [ScreenSepMarks](#screensepmarks)

### ExportPrintCutPDFs

[![Download](https://img.shields.io/badge/Download-ExportPrintCutPDFs.jsx-blue.svg)](/jsx/ExportPrintCutPDFs.jsx)

Export proper print and cut PDFs for decal and signage production.

> [!NOTE]
> This script was created specifically for a decal vendor I work with and is not currently customizable so it may not fit your exact requirement but can easily be adjusted. Let me know if you need any help?

![ExportPrintCutPDFs](https://github.com/user-attachments/assets/bf0295d0-5d14-47cf-b10a-32d8353ff754)

### RepeatAfterMe

[![Download](https://img.shields.io/badge/Download-RepeatAfterMe.jsx-blue.svg)](/jsx/RepeatAfterMe.jsx)

Easily repeat Illustrator objects across row and columns (with visual preview). Useful for production layout, grid/pattern generation, and step-and-repeat operations.

Includes:

- Customize rows, columns, and gutters
- Repeat pattern options grid, brick-by-row, brick-by-column
- Ability to save presets, with customizable default and last used settings
- Pick different object bounds to base layout from
- Option to fill active artboard with repeats (with padding)

![RepeatAfterMe](https://github.com/user-attachments/assets/7a4281d0-3619-460f-b9ce-6cbd0bcfe060)

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

![ScreenSepMarks](https://github.com/user-attachments/assets/e1eaaa23-b1e3-4723-84ac-b2362b7201e1)

## Selection Scripts

- [SelectObjectsByName.jsx](#selectobjectsbyname)

### SelectObjectsByName

[![Download](https://img.shields.io/badge/Download-SelectObjectsByName.jsx-blue.svg)](/jsx/SelectObjectsByName.jsx)

Easily find and select objects in your Adobe Illustrator document by name. Supports both simple string searches and powerful regular expression matching. Ideal for quickly filtering and managing complex artwork layers and groups.

## Text Scripts

- [FontVisualizer](#fontvisualizer)

### FontVisualizer

[![Download](https://img.shields.io/badge/Download-FontVisualizer.jsx-blue.svg)](/jsx/FontVisualizer.jsx)

Visualize every font on your system with customizable text.

![FontVisualizer](https://github.com/user-attachments/assets/b73046e9-9270-4331-a461-6d48ed3643c5)

> [!NOTE]
> Depending on the number of fonts on your system, this script can take a while to complete. If you want to speed things up, you can change the setting `updateScreen = false`. For example, to process all 2500 fonts on my system, it takes 2 minutes with the default settings. With `updateScreen` set to `false`, the processing time reduces to 20 seconds (83% time decrease).

## Utility Scripts

- [DrawVisibleBounds](#drawvisiblebounds)
- [GetObjectPlacementInfo](#getobjectplacementinfo)
- [GetVisibleBounds](#getvisiblebounds)
- [GroupObjectByRow](#groupobjectsbyrow)
- [Logger](#logger)
- [ReleaseAllContainers](#releaseallcontainers)
- [ReleaseGroup](#releasegroup)

### DrawVisibleBounds

[![Download](https://img.shields.io/badge/Download-DrawVisibleBounds.jsx-blue.svg)](/utils/DrawVisibleBounds.jsx)

Draw "visible" bounds marks around Illustrator PageItems. A PageItem's visible bounds are determined using the [GetVisibleBounds](#getvisiblebounds) utility function.

```javascript
// usage example
var doc = app.activeDocument;
var sel = doc.selection;

var boundMarkLength = 12; // points
var boundMarkStrokeWeight = 1.5; // points

var customBoundMarkColor = new RGBColor();
customBoundMarkColor.red = 0;
customBoundMarkColor.green = 0;
customBoundMarkColor.blue = 255;

drawVisibleBounds(sel, boundMarkLength, boundMarkStrokeWeight, customBoundMarkColor);
```

### GetObjectPlacementInfo

[![Download](https://img.shields.io/badge/Download-GetObjectPlacementInfo.jsx-blue.svg)](/utils/GetObjectPlacementInfo.jsx)

Provide the bounds of a `PageItem` and get all of its placement information. Includes `left`, `top`, `right`, `bottom`, `width`, `height`, `centerX`, and `centerY`.

```javascript
var myObject = app.activeDocument.pageItems[0]
var myObjectPlacementInfo = getObjectPlacementInfo(myObject.visibleBounds)
```

### GetVisibleBounds

[![Download](https://img.shields.io/badge/Download-GetVisibleBounds.jsx-blue.svg)](/utils/GetVisibleBounds.jsx)

Determine the actual "visible" bounds for an object accounting for clipping mask and compound paths.

```javascript
var clippedObject = app.activeDocument.pageItems[0]
var bounds = getVisibleBounds(clippedObject)
```

### GroupObjectsByRow

[![Download](https://img.shields.io/badge/Download-GroupObjectByRow.jsx-blue.svg)](/utils/GroupObjectByRow.jsx)

 Take an array of Adobe Illustrator pageItems and group them by vertical separation.

 > [!NOTE]
> This script was designed to group text characters but works just fine for most types of pageItems.

### Logger

[![Download](https://img.shields.io/badge/Download-Logger.jsx-blue.svg)](/utils/Logger.jsx)

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
### ReleaseAllContainers

[![Download](https://img.shields.io/badge/Download-ReleaseAllContainers.jsx-blue.svg)](/jsx/ReleaseAllContainers.jsx)

Clean-up junky files by releasing all selected containers (groups, compound paths, and clipping masks).

> [!NOTE]
> This script isn't rocket science, it just recursively runs Ungroup, Clipping Mask Release, and Compound Path Release until no more container objects exist. I found this method works no matter how nested the container objects are and performs far better for weird edge cases than trying to remove each element from withing each container via the API.

### ReleaseGroup

[![Download](https://img.shields.io/badge/Download-ReleaseGroup.jsx-blue.svg)](/utils/ReleaseGroup.jsx)

Release objects from within a group container similar to `Object > Ungroup` but can also works recursively.
