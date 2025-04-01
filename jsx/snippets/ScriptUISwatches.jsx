var w = new Window("dialog");

// add a group for holding the swatches
var g = w.add("group", undefined);
g.orientation = "row";
g.alignChildren = ["left", "center"];
g.spacing = 10;
g.margins = 0;

// draw each swatch using empty panels with a background color
swatches = [
    [0.5, 0.0, 0.0],
    [0.0, 0.5, 0.0],
    [0.0, 0.0, 0.5],
];
var s, p;
for (var i = 0; i < swatches.length; i++) {
    s = swatches[i];
    p = g.add("panel", undefined, undefined);
    p.graphics.backgroundColor = w.graphics.newBrush(
        w.graphics.BrushType.SOLID_COLOR,
        s
    );
    p.preferredSize.width = 25;
    p.preferredSize.height = 25;
}

w.show();
