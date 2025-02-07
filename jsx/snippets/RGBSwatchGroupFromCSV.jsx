/*
RGBSwatchGroupFromCSV.jsx for Adobe Illustrator
-----------------------------------------------

Generate an Ai Swatch Group from RGB values in a CSV file (in the following format).

name,RED,GREEN,BLUE
color 1,1,1,160
two,2,92,2
three,253,3,3

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/create-an-ase-file-starting-from-a-csv-file/td-p/14568361

Notes:
1. Photoshop must be installed and open on your system
2. This file needs to be placed in your Ai start up scripts folder
(https://extendscript.docsforadobe.dev/introduction/scripting-for-specific-applications.html?highlight=startup#startup-scripts)
*/

(function () {
    function parseCSV(data) {
        var lines = data.split("\n");
        var rows = [];
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] == "") continue;
            rows.push(lines[i]);
        }
        return rows;
    }

    function readFile(file) {
        try {
            file.encoding = "UTF-8";
            file.open("r");
            var data = file.read();
            return data;
        } catch (e) {
            "Error!\nFile could not be read.\n" + e;
        } finally {
            file.close();
        }
    }

    var doc = app.activeDocument;
    var swatches = app.activeDocument.swatches;

    // choose the csv file
    var file = File.openDialog("Select CSV File");

    // parse the csv data
    var rows = parseCSV(readFile(file), true);

    // check for actual csv data
    if (rows.length < 1) {
        alert("Error!\nNo CSV data.");
    }

    // setup the swatch group
    var swatchGroup = doc.swatchGroups.add();
    swatchGroup.name = decodeURI(file.name);

    // make a swatch for each row (skip header row (pos 0))
    var row, name, r, g, b, color, swatch;
    for (var i = 1; i < rows.length; i++) {
        row = rows[i].split(",");
        name = row[0].toString();
        r = parseFloat(row[1]);
        g = parseFloat(row[2]);
        b = parseFloat(row[3]);

        // check for proper RGB values
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            alert(
                "Error!\nColor '" +
                    name +
                    "' has out of range values and will be skipped."
            );
            continue;
        }

        //
        color = new RGBColor();
        color.red = r;
        color.green = g;
        color.blue = b;
        swatch = swatches.add();
        swatch.name = name;
        swatch.color = color;
        swatchGroup.addSwatch(swatch);
    }
})();
