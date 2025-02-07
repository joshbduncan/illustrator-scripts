(function () {
    //@target illustrator

    // no need to continue if there is no active document
    if (!app.documents.length) {
        alert("No active document.");
        return;
    }

    // grab document and selection info
    var doc = app.activeDocument;

    var alphabet = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];

    // iterate over artboards and rename them
    for (var i = 0; i < doc.artboards.length; i++) {
        doc.artboards[i].name = alphabet[i % alphabet.length];
    }
})();
