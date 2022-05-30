// <script>
/*
window.ga =
  window.ga ||
  function () {
    (ga.q = ga.q || []).push(arguments);
  };
ga.l = +new Date();
ga("create", "UA-112777351-1", "auto");
ga("send", "pageview");
*/
//</script>

/* Desktop only keyboard nav help Alert */
/*
function myHelp() {
  alert(
    "Keyboard Controls: \n\n [Tab] =Tab Navigation \n [Arrow Keys] = Keyboard Navigation \n [Shift + s] = Show columns \n [Shift + c] = Copy"
  );
} */
/* \n [Shift + x] = Excel \n [Shift + v] = Csv \n [Shift + p] = Print' */

/* copyURL button */
// https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard/48542290#48542290
// https://stackoverflow.com/questions/10568815/replace-all-text-before-a-certain-point
function copyURLToClipB() {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = window.location;
  // added line below
  dummy.value = dummy.value.replace(/^.+hadithmv\./, "https://hadithmv.");
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

// same code above is below triggered on keypress

// https://melwinalm.medium.com/crcreating-keyboard-shortcuts-in-javascripteating-keyboard-shortcuts-in-javascript-763ca19beb9e
// http://gcctech.org/csc/javascript/javascript_keycodes.htm
// https://stackoverflow.com/questions/31392863/load-external-javascript-on-desktop-only/31392945#31392945
if (window.innerWidth > 600) {
  //
  document.onkeyup = function (e) {
    if (e.shiftKey && e.which == 76) {
      // 76 is letter L
      //alert("Ctrl + Alt + Shift + U shortcut combination was pressed");
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = window.location;
      // added line below
      dummy.value = dummy.value.replace(/^.+hadithmv\./, "https://hadithmv.");
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    }
  };
  //
}
