// =====================
//       TABS
// ====================
function openLink (evt, tabName) {
  // added to get rid of error Missing "use strict" statement.
  let i
  x
  tablinks
  x = document.getElementsByClassName('myTab')

  for (i = 0; i < x.length; i += 1) {
    // changed due to Expected "+= 1" and instead saw "++".
    x[i].style.display = 'none'
  }
  tablinks = document.getElementsByClassName('tablink')

  document.getElementById(tabName).style.display = 'block'
}
// ===== ===== Tabs - End ===== =====
