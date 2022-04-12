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
  dummy.value = dummy.value.replace(
    /^.+hadithmv.github.io/,
    "https://hadithmv.github.io"
  );
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}
