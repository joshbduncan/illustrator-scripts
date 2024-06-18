/**
 * Determine the base calling script from the current stack.
 * @returns {String} Initial script name.
 */
function resolveBaseScriptFromStack() {
  var stack = $.stack.split("\n");
  var foo, bar;
  for (var i = 0; i < stack.length; i++) {
    foo = stack[i];
    if (foo[0] == "[" && foo[foo.length - 1] == "]") {
      bar = foo.slice(1, foo.length - 1);
      if (isNaN(bar)) {
        break;
      }
    }
  }
  return bar;
}
