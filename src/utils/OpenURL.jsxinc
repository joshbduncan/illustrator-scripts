/**
 * Open a url in the system browser.
 * @param {String} url URL to open.
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + "/aisLink.html");
  html.open("w");
  var htmlBody =
    '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' +
    url +
    '"></head><body><p></p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}
