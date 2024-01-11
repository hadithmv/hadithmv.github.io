/* copyURL BUTTON */
// https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard/48542290#48542290
// https://stackoverflow.com/questions/10568815/replace-all-text-before-a-certain-point
function copyURLToClipButton2() {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = window.location.href;

  // Replace text preceding "/books/"
  dummy.value = dummy.value
    .replace(/^.*\/books\//, "https://hadithmv.github.io/books/")
    .replace(/^.*\/uc\//, "https://hadithmv.github.io/books/");

  // Replace text preceding "/uc/"

  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

/* not using below code anymore, and changed above code using cgpt cuz it didnt work
// same code above is below triggered on keypress

// http://gcctech.org/csc/javascript/javascript_keycodes.htm
// https://melwinalm.medium.com/crcreating-keyboard-shortcuts-in-javascripteating-keyboard-shortcuts-in-javascript-763ca19beb9e
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
*/

// HARD RELOAD BUTTON

function reloadUpToHtml() {
  // Get the current URL
  var currentUrl = window.location.href;

  // Find the index of ".html" in the URL
  var htmlIndex = currentUrl.indexOf(".html");

  // If ".html" is found, reload the page up to that point
  //if (htmlIndex !== -1) {
  var newUrl = currentUrl.substring(0, htmlIndex + 5); // Add 5 to include ".html"
  window.location.href = newUrl;
  //} else {
  // ".html" not found, simply reload the page
  //location.reload();
  //}
}

// DATE UPDATE SCRIPT?

/*<script>
window.ga =
  window.ga ||
  function () {
    (ga.q = ga.q || []).push(arguments);
  };
ga.l = +new Date();
ga("create", "UA-112777351-1", "auto");
ga("send", "pageview");
</script>*/

//

// DESKTOP ONLY KEYBOARD NAV HELP ALERT

/*function myHelp() {
  alert(
    "Keyboard Controls: \n\n [Tab] =Tab Navigation \n [Arrow Keys] = Keyboard Navigation \n [Shift + s] = Show columns \n [Shift + c] = Copy"
  );
} */
/* \n [Shift + x] = Excel \n [Shift + v] = Csv \n [Shift + p] = Print' */
