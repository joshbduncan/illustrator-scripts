// https://community.adobe.com/t5/illustrator-discussions/cycle-through-layers-comparing-current-layer-object-against-every-other-layer-object/m-p/12997328#M324776

// option 1: doing excess work
// var doc = app.activeDocument;
// var layers = doc.layers;

// for (var i = 0; i < layers.length; i++) {
//   for (var n = 0; n < layers.length; n++) {
//     if (i != n) {
//       // do you comparison here
//       alert("Comparing Layer " + i + " to Layer " + n);
//     }
//   }
// }

// option 1 comparisions
// Layer 0 vs Layer 1
// Layer 0 vs Layer 2
// ---
// Layer 1 vs Layer 0 (already compared above)
// Layer 1 vs Layer 2
// ---
// Layer 2 vs Layer 0 (already compared above)
// Layer 2 vs Layer 1 (already compared above)

// option 2: only compare layers once
var doc = app.activeDocument;
var layers = doc.layers;

for (var i = 0; i < layers.length; i++) {
  for (var n = i + 1; n < layers.length; n++) {
    alert("Comparing Layer " + i + " to Layer " + n);
  }
}

// comparsions
// Layer 0 vs Layer 1
// Layer 0 vs Layer 2
// ---
// Layer 1 vs Layer 2
