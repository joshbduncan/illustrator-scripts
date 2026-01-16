/*
DXFCustomExport.jsx for Adobe Illustrator
-----------------------------------------

Export a custom AutoCAD DXF file.

Created in response to this question on the Adobe forum:
https://community.adobe.com/t5/illustrator-discussions/need-help-with-script-to-export-dxf-with-specific-settings/td-p/15609619
*/

(function () {
  //@target illustrator

  // No need to continue if there is no active document.
  if (!app.documents.length) {
    alert("No active document.");
    return;
  }

  // Get the current document and it's path (if saved).
  var doc = app.activeDocument;
  var docFolder = doc.path == "" ? Folder.desktop : new Folder(doc.path);

  // Strip off any extensions from the document name and change the spaces to hyphens.
  var exportName = doc.name.replace(/\.pdf|\.ai|\.eps$/i, "");

  // Set export files.
  var exportFile = new File(docFolder + "/" + exportName);

  // Set DXF/DWG Export Options.
  var opts = new ExportOptionsAutoCAD();
  // see docs https://ai-scripting.docsforadobe.dev/jsobjref/ExportOptionsAutoCAD/

  // VERSION
  opts.version = AutoCADCompatibility.AutoCADRelease24;
  // not sure which version equals 2000/LT2000 for more info
  // see docs https://ai-scripting.docsforadobe.dev/jsobjref/scripting-constants/#autocadcompatibility

  // ARTWORK SCALE
  opts.unit = AutoCADUnit.Inches;
  opts.unitScaleRatio = 25.4;
  opts.scaleLineweights = false;

  // COLOR & FILE FORMAT
  opts.colors = AutoCADColors.Max256Colors;
  opts.rasterFormat = AutoCADRasterFormat.JPEG;
  opts.exportFileFormat = AutoCADExportFileFormat.DXF;

  // OPTIONS
  opts.exportOption.PreserveAppearance = false;
  opts.exportOption.MaximizeEditability = true;
  opts.exportSelectedArtOnly = true;
  opts.alterPathsForAppearance = false;
  opts.convertTextToOutlines = false;

  // Set export type.
  var type = ExportType.AUTOCAD;

  // Export DXF file. docs:https://ai-scripting.docsforadobe.dev/jsobjref/Document/?h=exportfile#documentexportfile
  doc.exportFile(exportFile, type, opts);
})();
