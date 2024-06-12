// https://community.adobe.com/t5/illustrator-discussions/app-doscript-myapplescript-scriptlanguage-applescriptlanguage-is-not-working-in-illustrator/td-p/13170103

var myFolder = new Folder(Folder.desktop + "/myMacFolder/");
var myFile = new File(Folder.desktop + "/myMacFile.ai");
var myFileCopy = new File(myFolder + "/myMacFile.ai");
myFile.copy(myFileCopy);
