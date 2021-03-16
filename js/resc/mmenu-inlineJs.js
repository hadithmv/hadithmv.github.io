const menu = new MmenuLight(document.querySelector('#menu'), 'all')

let navigator = menu.navigation({
  // selectedClass: 'Selected',
  // slidingSubmenus: true,
  // theme: 'dark',
  // title: 'Menu',
  title: 'ޙަދީޘްއެމްވީ'
  // background-color:	#f3f3f3, // Background-color for the menu
  // color:	#444,	// Color for the text and borders in the menu.
  // VARIABLES
  // --mm-spn-item-height:	50px,	// Height for menu items.
  // --mm-spn-item-indent:	20px,	// Indent for menu items.
  // --mm-spn-line-height: 24px,	// Line-height for text in the menu.
})

let drawer = menu.offcanvas({
  // position: 'left'
  position: 'right' // change123

  // top:	0,	// Position relative to the top of the page.
  // bottom: 0, // Position relative to the bottom of the page.
  // --mm-ocd-width: 80%, // Width for the menu.
  // --mm-ocd-min-width	: 200px, // Minimal width for the menu.
  // --mm-ocd-max-width	440px, // Maximum width for the menu.
})

//	Open the menu.
document
  .querySelector('a[href="#menu"]')
  .addEventListener('click', (evnt) => {
    evnt.preventDefault()
    drawer.open()
  })
