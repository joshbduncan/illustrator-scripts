// https://community.adobe.com/t5/illustrator-discussions/need-help-with-a-conditional-when-clicking-a-button/m-p/13010671#M325441

var clickedProductType = showDialog();
if (clickedProductType) alert(clickedProductType);

function showDialog() {
  // window setup
  var win = new Window("dialog");
  win.text = "Forced Selection Example";
  win.orientation = "column";

  // window info
  var infoText = win.add(
    "statictext",
    undefined,
    "Please Select Your Product Type",
  );

  // radio buttons
  var gProductTypes = win.add("group");
  gProductTypes.orientation = "row";
  var rbTooled = gProductTypes.add("radiobutton", undefined, "Tooled");
  var rbCast = gProductTypes.add("radiobutton", undefined, "Cast");
  var rbEtched = gProductTypes.add("radiobutton", undefined, "Etched");
  var rbUV = gProductTypes.add("radiobutton", undefined, "UV");

  // window control buttons
  var gButtons = win.add("group");
  gButtons.alignment = "center";
  var buttonOK = gButtons.add("button", undefined, "OK");
  buttonOK.enabled = false;
  var buttonCancel = gButtons.add("button", undefined, "Cancel");

  // enable OK button if a tool is selected
  var radioButtonsToCheck = [rbTooled, rbCast, rbEtched, rbUV];
  var clickedButton = null;
  for (var i = 0; i < radioButtonsToCheck.length; i++) {
    radioButtonsToCheck[i].onClick = function () {
      clickedButton = this.text;
      buttonOK.enabled = true;
    };
  }

  // if "ok" button clicked then return inputs
  if (win.show() == 1) {
    return clickedButton;
  } else {
    return;
  }
}
