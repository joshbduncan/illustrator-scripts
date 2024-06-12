// var doc = app.activeDocument;
// replaceWord("2021", "2022");

// function replaceWord(strFind, strReplace) {
//   var frame, words, word;
//   var ct = 0;
//   for (var i = 0; i < doc.textFrames.length; i++) {
//     frame = doc.textFrames[i].textRange;
//     words = frame.words;
//     for (var j = 0; j < words.length; j++) {
//       word = words[j];
//       if (word.contents.replace(" ", "") == strFind) {
//         ct += 1;
//         word.contents = strReplace;
//       }
//     }
//   }
//   alert("Replacements Made\n" + ct);
// }

// regex_changeContentsOfWordOrString_RemainFormatting.jsx

// regards pixxxel schubser

var s = /arguments/gi;

var replacer = "other string",
  result;

var atf = activeDocument.textFrames[0];

while ((result = s.exec(atf.contents))) {
  try {
    aCon = atf.characters[result.index];

    aCon.length = result[0].length;

    aCon.contents = replacer;
  } catch (e) {}
}
