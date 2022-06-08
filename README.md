# Adobe Scripts

JSX Scripts for Adobe Products

**Getting Started**

1. Download ZIP archive to you computer.
2. Install .jsx files into the Presets folder. **[How To Guide](https://www.marspremedia.com/software/how-to-adobe-cc)**
3. Restart

## Adobe Illustrator Scripts

### ArtboardExporter.jsx

Quickly export all artboards to individual files.

### DrawVisibleBounds.jsx

Draw "visible" bounds for selected objects. Accurately shows clipped objects, compounds paths, and even compound objects inside of a clipping mask that's inside of other clipping masks.

### EditPointsOnly.jsx

Select only path points and not path segments for editing.

### MatchObjects.jsx

![Match Objects](https://raw.githubusercontent.com/joshbduncan/adobe-scripts/main/files/match-objects.png)

Match one or more objects to another by size, layer, and or position (or alignment).

**My most used script by far!**

Script Usage:

1. Select two or more objects that you would like to match to each other.
2. Choose a `SOURCE` object from your selection that all other `TARGET` objects in your selection should be matched to.
    - If you are not sure where your preferred `SOURCE` object is within your selection stack, you can click the "Preview Source Selection checkbox and Illustrator will select only the current `SOURCE` object.
3. Choose which attributes of the `SOURCE` object should be matched 
    - Position: Match the artboard position of all `TARGET` objects to the `SOURCE` object.
    - Size: Match the dimensional size of all `TARGET` objects to the `SOURCE` object. *Accounts for compound paths and clipping masks.*
    - Layer: Insert all `TARGET` objects into the same layer as the `SOURCE` object.
    - Alignment: Align your `TARGET` objects to your `SOURCE` object (just like Illustrators built-in Align panel).
4. Set the specifics for each attribute you have chosen to match.
    - Position Match: Choose the `SOURCE` object anchor point that all `TARGET` objects should be positioned at.
    - Size Match: Choose which dimension all `TARGET` objects should match of the `SOURCE` object. *When matching "Both", your targets may scale disproportionately.*
    - Also Scale: Pick which attributes (if any) of the `TARGET` objects should also be scaled during the "Size Match".

### OffsetObjects.jsx

![Offset Objects](https://raw.githubusercontent.com/joshbduncan/adobe-scripts/main/files/offset-objects.png)

Offset (stack) selected objects edge-to-edge by their layer palette stacking order. You can offset them either vertically (bottom-edge to top-edge) or horizontally (right-edge to left-edge).

Need some space between objects? Specify a gutter size and all objects will be spaced apart by that amount.

Need to go the opposite direction? Click Reverse Stacking Order and you're set.

> This works very similar to the Distribute Spacing function of the Align palette, except that it uses the objects place in the layer palette stack to determine the order in which the object is stacked in relation to the rest.

### Rename Layers.jsx

![Rename Layers](https://raw.githubusercontent.com/joshbduncan/adobe-scripts/main/files/rename-layers.png)

Rename layers in Adobe Illustrator using find and replace (regex enabled). Make changes on all matched layers or only matched layers with selected artwork.

### ScreenSepMarks.jsx

![Screen Print Separation Marks](https://raw.githubusercontent.com/joshbduncan/adobe-scripts/main/files/screen-sep-marks.png)

Easily add screen printing registration marks and spot color info to the current document. Lots of options, highly configurable, saved presets, & more!

### ScriptUtils.jsx

Utilities for developing and debugging Adobe scripts.

### ShowHideLayers.jsx

![Show/Hide Layers](https://raw.githubusercontent.com/joshbduncan/adobe-scripts/main/files/show-hide-layers.png)

Show/Hide layers in Adobe Illustrator using find (regex enabled). Make changes on all matched layers or only matched layers with selected artwork.