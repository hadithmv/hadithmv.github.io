// havent tried this yet

async
src = 'https://www.googletagmanager.com/gtag/js?id=UA-112777351-1'

window.dataLayer = window.dataLayer || []
function gtag () {
  dataLayer.push(arguments)
}
gtag('js', new Date())

gtag('config', 'UA-112777351-1')

/* Desktop only keyboard nav help Alert */
function myHelp () {
  alert('Keyboard Controls: \n\n [Tab] =Tab Navigation \n [Arrow Keys] = Keyboard Navigation \n [Shift + s] = Show columns \n [Shift + c] = Copy')
} /* \n [Shift + x] = Excel \n [Shift + v] = Csv \n [Shift + p] = Print' */
