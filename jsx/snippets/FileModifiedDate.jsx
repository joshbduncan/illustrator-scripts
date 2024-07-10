// var file = new File("~/Desktop/123456.ai");
var file = File.openDialog("Pick a file to test...");
$.writeln("Exist? " + file.exists);
$.writeln("Created: " + file.created);
$.writeln("Modified: " + file.modified);
