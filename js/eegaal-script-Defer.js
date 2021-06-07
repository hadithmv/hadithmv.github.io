// global document, window, alert, console, require

// =====================
//      DT JS BELOW
// ====================
$(document).ready(() => {
  // $(document).ready( function () { ===== ===== //
  // from here to var table = $("#fortyNawawi").DataTable({ used to be empty

  $.extend(true, $.fn.dataTable.defaults, {
    // "keys": "true", /* KeyTable extension, old */
  })

  /* js media query on desktop, needs to have quotes */
  if (window.matchMedia('(min-width: 900px)').matches) {
    $.extend(true, $.fn.dataTable.defaults, {
      // desktop, goes rtl --> //'<"dTop"pBfl>rt<"bottom"ip>',
      dom: '<"dTop"pBfl>rtip',
      pageLength: 3, // # rows to display on single page when using pagination
      // lengthMenu: [
      //   [1, 2, 3, 5, 7, 10, 15, 20, -1],
      //   [1, 2, '3 ދައްކާ', 5, 7, 10, 15, 20, 'ހުރިހާ']
      // ], // display range of pages
      keys: { clipboardOrthogonal: 'export' }, // strip htmltags off keys copy
      language: {
        paginate: {
        // &nbsp; prevents line breaks
          first: '<<&nbsp;ފުރަތަމަ',
          previous: '<&nbsp;ފަހަތަށް',
          next: 'ކުރިއަށް&nbsp;>',
          last: 'ފަހު&nbsp;>>',

          info: '_INPUT_' // taken from input plugin, "Page _INPUT_ of _TOTAL_"
        }
      }

    })
  } else {
    /* js media query on mobile, tablet */
    $.extend(true, $.fn.dataTable.defaults, {
      // mobile //'<"mTop"fl> + <"mTop2"p> + <"mTop3"B> rt <"bottom"ip>',
      dom: '<"mTop"fl> + <"mTop2"p> + <"mTop3"B> rtip', // moved to js MQ; dom: '<"dTop"pBfl>rtip',
      pageLength: 1,
      // lengthMenu: [
      //   [1, 2, 3, 5, 7, 10, 15, 20, -1],
      //   ['1 ދައްކާ', 2, 3, 5, 7, 10, 15, 20, 'ހުރިހާ']
      // ], // display range of pages
      language: {
        paginate: {
        // &nbsp; prevents line breaks
          first: '<<',
          previous: '<',
          next: '>',
          last: '>>',

          info: '_INPUT_' // taken from input plugin, "Page _INPUT_ of _TOTAL_"
        }
      }
    })
  } //= =================== end if else

  const table = $('#eegaalTable').DataTable({
    // var table = $("#fortyNawawi").DataTable({
    // NOT DataTable();

    // CHANGE123 JSON
    // data: eegaal_dataSet, // https://datatables.net/manual/ajax
    // "ajax": "data/arrays.txt",
    ajax: '../js/json/eegaal-Defer.js',

    // order: [[0, 'asc']], // CHANGE 123 - FOR RADHEEF ONLY

    columns: [
      {
        data: 0,
        title: 'ޢަރަބި ލަފްޒު'
      },
      // { title: 'ޢަރަބި ފިލިނުޖަހައި' },
      { /* instead of repeating this part of the array within the external json,
         we can strip diacritics using regex within the table itself, this makes
         the array file much smaller in the long run */
        data: 0,
        title: 'ޢަރަބި ފިލިނުޖަހައި',
        render: function (data, type, row) {
          // return data.replace(/َ/g, '').replace(/ِ/g, '')
          // below code is shorter, no replace repeat, uses OR instead
          return data.replace(/ّ|َ|ً|ُ|ٌ|ِ|ٍ|ْ/g, '')
        }
      },
      /* {
        data: 1,
        title: 'ޢަރަބި މާނަ'
      }, */
      {
        data: 1,
        title: 'ދިވެހި ލަފްޒު'
      },

      { /* add sofhaa string to page no */
        data: 2,
        title: 'ސަފުހާ',
        render: function (data, type, row) {
          // return data.replace(/َ/g, '').replace(/ِ/g, '')
          // below code is shorter, no replace repeat, uses OR instead
          return '[ސަފުހާ ' + data + ']'
        }
      }
    ],

    columnDefs: [
      // classes columns for css in nweb view, but not print.
      // CHANGE123 COL CLASSES AND VISIBILITY/SEARCHABLE

      {
        className: 'rCol1', // ar word
        targets: [0],
        visible: true,
        searchable: true
      },
      {
        className: 'rCol2', // ar word w/o fili
        targets: [1],
        visible: false,
        searchable: true
      },
      {
        className: 'rCol3', // dv word
        targets: [2],
        visible: true,
        searchable: true
      },
      {
        className: 'rCol4', // page no
        targets: [3],
        visible: true,
        searchable: true
      },

      // below strips html tags off keystable copy, second part with keys on
      {
        targets: 'all',
        render (data, type, row, meta) {
          if (type === 'export') {
            const div = document.createElement('div')
            div.innerHTML = data
            return div.innerText
          }
          return data
        }
      }
      // needed to make keytable strip html tags off copy
    ], // end of columnDefs, previously without visible and searchable options.

    //= ====================
    //  DT CUSTOM SETTINGS
    // ====================

    // Automatic column width calculation. Default: true
    // can be disabled as an optimisation -takes time to calculate widths
    autoWidth: false,

    // By default, when data is laoded from an Ajax or Javascript data source
    // creates all HTML elements needed up-front. takes time with large data
    // allows to create the nodes (rows/cells) only when needed for a draw
    // if you load data with 10000 rows, but 10 records paging display length
    // rather than create all 10000 rows, deferred rendering will create 10
    deferRender: true,

    // Enable or disable the display of a 'processing' indicator when the table
    // is being processed (e.g. a sort). This is particularly useful for tables with large
    // amounts of data where it can take a noticeable amount of time to sort the entries.
    processing: true,

    // ordering of columns - by default, allows to click on column head to order
    ordering: false, // CHANGE 123 - FOR RADHEEF ONLY

    // stateSave: true // Breaks table, use the one below
    // Restore table state on page reload. When enabled aDataTables will store
    // state info like pagination position, display length, filtering and sorting
    // When user reloads the page the table's state will be altered to before
    // DOESNT WORK WITH JSON FETCHED FROM GSHEETS
    bstateSave: true,

    // Duration for which the saved state information is valid. Default: 7200
    // After this period has elapsed the state will be returned to the default.
    // Set state duration to 1 day. Use with above.
    // stateDuration: 60*60*24 //currently set to 1 day, -1 is that session only
    stateDuration: '86400',

    // removes written search input upon state reload
    // "stateSaveParams": function (settings, data) { data.search.search = ""; }

    // Highlight columns being ordered in the table.
    // adds a class to the column cells, which has CSS applied
    // can affect performance with many rows, as it manipulates many DOM elements
    orderClasses: false,

    // Pagination button display options.
    // DataTables has six built-in paging button arrangements:
    // numbers - Page number buttons only (1.10.8)
    // simple - "Previous" and "Next" buttons only
    // simple_numbers - "Previous" and "Next" buttons, plus page numbers
    // full - "First", "Previous", "Next" and "Last" buttons
    // full_numbers - "First", "Previous", "Next", "Last" buttons & page numbers
    // first_last_numbers - "First" and "Last" buttons, plus page numbers
    // Default Value: simple_numbers,
    pagingType: 'input',

    // Set a throttle frequency for searching.
    // search will instantly search table on every keypress -clientside proc mode
    // and reduce search call frequency to 400mS in serverside processing mode
    // processing load can be reduced by reducing the search frequency
    searchDelay: 1000,

    // Change options in page length select list.
    // It can be either: 1D array for both displayed option/display length value,
    // or 2Darray where 1st inner array=page length values, 2nd displayed options
    // -1 is used as a value this tells DataTables to disable pagination
    // Default [ 10, 25, 50, 100 ],
    lengthMenu: [[10, 1, 2, 3, 5, 10, 20, 30, 50], ['10 ދައްކާ', 1, 2, 3, 5, 10, 20, 30, '50']],
    // lengthMenu: [[1, 2, 3, 5, 10, 20, 30, 50], ['1 ދައްކާ', 2, 3, 5, 10, 20, 30, '50']],
    // lengthMenu: [[1, 2, 3, 5, 7, 10, 15, 20, -1], ['1 ދައްކާ', 2, 3, 5, 7, 10, 15, 20, 'ހުރިހާ']],
    // lengthMenu: [ [5, 10, 20, 30, 40, -1, 1], ["Show 5", 10, 20, 30, 40,
    // "All", 1] ],

    // Tab index control for keyboard navigation. default DT allows keyboard nav
    // sorting, paging, filtering by adding tabindex attr to required elements
    // Default Value: null
    /* "tabIndex": 0, */

    // Store the DT conditions within the URL hash every time a condition changes
    // (page/length/search/order) making it possible to copy/paste the URL.
    keepConditions: true,

    // keytable, adds keyboard navigation, like in traditional spreadsheet
    keys: true,

    // markjs, a keyword highlighter for strings, arrays or regular expressions.
    mark: true,

    //= ====================
    // Internationalisation
    // ====================
    language: {
      /* made these a media query somewhere up
      paginate: {
        first: '<<',
        previous: '<',
        next: '>',
        last: '>>',

        first: '<<&nbsp;ފުރަތަމަ',
        previous: '<&nbsp;ފަހަތަށް',
        next: 'ކުރިއަށް&nbsp;>',
        last: 'ފަހު&nbsp;>>',

        info: '_INPUT_'
},
*/
      buttons: {
        copyTitle: 'ކޮޕީ',
        copySuccess: {
          1: 'ކޮޕީ ވީ 1 ބަސް',
          _: 'ކޮޕީ ވީ %d ބަސް'
        }
      },

      info: '_TOTAL_ ބަހުގެ ތެރެއިން _START_ އަކުން _END_ އަކަށް',
      infoFiltered: '(ޖުމްލަ ބެލެވުނީ _MAX_)',
      infoEmpty: '- ނުފެނުނު -',
      lengthMenu: '_MENU_',
      search: '', // Originally "Search:" leave this blank in production
      searchPlaceholder: 'ހޯއްދަވާ...',
      zeroRecords: '- ނުފެނުނު -'
      processing: 'ތައްޔާރުވަނީ...' // clashes with zeroRecords on serverside/ajax?
    }, //= =================== End of Internationalisation

    //= ====================
    //      DT CUSTOM DOM
    // ====================
    /* DOM options, https://datatables.net/reference/option/dom,
    https://datatables.net/examples/basic_init/dom.html
         default: lpfrtip
        l - length changing input control
        f - filtering input
        t - The table
        i - Table information summary
        p - pagination control
        r - processing display element
        B - Buttons

< and > - div element
<"class" and > - div with a class
<"#id" and > - div with an ID
<"#id.class" and > - div with an ID and a class */
    // "lBpfrtip",

    // desktop, goes rtl -->
    // dom: '<"top"pBfl>rt<"bottom"ip>',
    // mobile
    // dom: '<"top"fl> + <"top2"p> + <"top3"B> rt <"bottom"ip>',
    // MOVED TO if (window.matchMedia("(min-width: 1200px)").matches) {
    // $.extend(true, $.fn.dataTable.defaults, { ABOVE

    buttons: [
      // datatables.net/extensions/buttons/examples/initialisation/multiple
      // used to use a container before, now 2 buttons
      // { text: "Button 2", action: function ( e, dt, node, conf )
      // { alert( "Button 2 clicked on" ); } },
      {
        extend: 'copy',
        key: { key: 'c', shiftKey: true },
        text: 'ކޮޕީ',
        messageTop: 'ޙަދީޘްއެމްވީ - އަލްއީޤާޡް', // CHANGE123 clipboard message
        title: '' /* title: "hadithmv.com", */,

        //= ====================
        // edits clipboard regex, code to manipulate the data string as desired
        // ====================
        customize (data) {
          /* https://www.rexegg.com/regex-quickstart.html
                    \t Tab, \r Carriage return character,
                    \n Line feed character, \r\n Line separator on Windows
                    */
          // adds string to hadith
          // data = data.replace( /\b([0-9]|[1-4][0-9]|50)\b/g, "No:" );

          // fixes multiple row's lack of line break on desktop
          //     data = data.replace( /\t\r\n/g, "\n\n\n" );

          //  \t = literal tab
          //  \n = LF (Line Feed) → Used as a new line character in Unix/Mac OS X
          //  \r\n = CR + LF → Used as a new line character in Windows

          // data = data.replace(/r\n]/g, '') // needed to make rnr work
          // data = data.replace(/\r\n|\n|\t/gm, '')

          // data = data.replace(/\r\n\r\n/g, ' ') //  ONLY FOR 40N, because it has an inserted title
          // data = data.replace(/\n\n/g, ' ') //  ONLY FOR 40N, because it has an inserted title, the two lines below arent needed for 40n i think

          data = data.replace(/\r\n/g, '\t') //  prevents first header showing up unneeded (windows)
          data = data.replace(/\n/g, '\t') //  prevents first header showing up unneeded (linux) this needs to go below windows rn

          data = data.replace(/ޢަރަބި ލަފްޒު\t/g, '') // should be this way instead of /\tފޮތް/
          data = data.replace(/ޢަރަބި ފިލިނުޖަހައި\t/g, '')
          /* data = data.replace(/ޢަރަބި މާނަ\t/g, '') */
          data = data.replace(/ދިވެހި ލަފްޒު\t/g, '')
          /* data = data.replace(/ދިވެހި މާނަ\t/g, '') */
          data = data.replace(/ސަފުހާt/g, '')

          data = data.replace(/\t\t/g, '\t') //  This prevents a double or more line breaks when columns are hidden
          data = data.replace(/\t/g, '\n\n') // creates line breaks between cell data
          data = data.replace(/\s\s/g, '\n\n') // turns two spaces into new lines, for multi line text

          /*
          data = data.replace(/\n\n/g, '\t') // prevents # showing up unneeded (linux)
          data = data.replace(/\r\n\r\n/g, '\t') //  prevents # showing up unneeded (windows)

          data = data.replace(/\t#/g, '')
          data = data.replace(/\tޢަރަބި ސުރުޚީ/g, '')
          data = data.replace(/\tދިވެހި ސުރުޚީ/g, '')
          data = data.replace(/\tޢަރަބި ޙަދީޘް/g, '')
          data = data.replace(/\tޢަރަބި ފިލިނުޖަހައި/g, '')
          data = data.replace(/\tދިވެހި ތަރުޖަމާ/g, '')
          data = data.replace(/\tތަޚްރީޖު/g, '')
          data = data.replace(/\tތަޚްރީޖު ދިވެހިން/g, '')
          data = data.replace(/\tރިޔާޟުއްޞާލިޙީނުން/g, '')

          data = data.replace(/\t/g, '\n\n') // creates line breaks
*/
          // data = data.replace(/\tތަޚްރީޖު\t/g, '')
          /*
          data = data.replace(/#\t/g, '')
          data = data.replace(/ޢަރަބި ސުރުޚީ\t/g, '')
          data = data.replace(/ދިވެހި ސުރުޚީ\t/g, '')
          data = data.replace(/ޢަރަބި ޙަދީޘް\t/g, '')
          data = data.replace(/ޢަރަބި ފިލިނުޖަހައި\t/g, '')
          data = data.replace(/ދިވެހި ތަރުޖަމާ\t/g, '')
          data = data.replace(/ތަޚްރީޖު\t/g, '')
          data = data.replace(/ތަޚްރީޖު ދިވެހިން\t/g, '')
          data = data.replace(/ރިޔާޟުއްޞާލިޙީނުން\t/g, '')

          //          data = data.replace(/\n\n/g, '')
          //         data = data.replace(/\r\n\r\n/g, '')

          data = data.replace(/\t/g, '\n\n') // creates line breaks
*/
          /*
          data = data.replace(/#\n/g, '')
          data = data.replace(/ޢަރަބި ސުރުޚީ\n/g, '')
          data = data.replace(/ދިވެހި ސުރުޚީ\n/g, '')
          data = data.replace(/ޢަރަބި ޙަދީޘް\n/g, '')
          data = data.replace(/ޢަރަބި ފިލިނުޖަހައި\n/g, '')
          data = data.replace(/ދިވެހި ތަރުޖަމާ\n/g, '')
          data = data.replace(/ތަޚްރީޖު\n/g, '')
          data = data.replace(/ތަޚްރީޖު ދިވެހިން\n/g, '')
          data = data.replace(/ރިޔާޟުއްޞާލިޙީނުން\n/g, '')

          data = data.replace(/\t/g, '\n\n') // creates line breaks
*/

          /* data = data.replace( /hadithmv.com\n/g, "hadithmv.com\n\n" );
           //adds new line on android */
          /*
               data = data.replace( /\r/g, "" ); //rids windows platform newline
               data = data.replace( /\t/g, "\n\n" ); */

          //  console.log(JSON.stringify(data)) // json stringify to console

          return data
        },
        //= ============== edits clipboard regex end, customize: function(data) {

        // copies currently displayed and rows
        exportOptions: { columns: [':visible'], rows: [':visible'] }

        // copies currently displayed columns and rows,
        // "exportOptions: { modifier:{columns:[":visible"], rows: [":visible"]}"
        // needs .cards thead { visibility: hidden; } to work
      }, // end of copy customization

      {
        extend: 'colvis',
        key: { key: 's', shiftKey: true },
        text: 'އިތުރު ބަރިތައް',
        background: false /* removes background fade animation for collection */
      } // end of colvis

      // cards code
      /*
              {
                "text": "cards",
                "action": function (e, dt, node) {
                   $(dt.table().node()).toggleClass("cards");
                },
             },
      */
      // cards code END
    ]
  }) // $("#fortyNawawi").DataTable( { - END
  // from here to END OF $(document).ready( function () { used to be empty

  //= ====================
  //      HammerJS - Swipe
  // ====================

  // enables text selection, but conflicts with swipe
  delete Hammer.defaults.cssProps.userSelect

  /* Old hammerjs swipe code
    if (window.matchMedia("(min-width: 1200px)").matches) { // js desktop MQ
        // empty
    } else { // js media query on mobile, tablet
      Hammer(fortyNawawi).on("swipeleft", function () {
            table.page("next").draw("page");
        });
      Hammer(document.getElementById("fortyNawawi")).on("swiperight",function(){
            table.page("previous").draw("page");
        });
    } // end if else
     ==================== END Old hammerjs code */

  function myFunction (x) {
    if (x.matches) {
      // If media query matches
      // empty // document.body.style.backgroundColor = "pink";
    } else { // CHANGE123 HAMMER JS
      Hammer(eegaalTable).on('swiperight', () => {
        // changed swipeleft and swiperight for dhivehi
        table.page('next').draw('page')
      })
      Hammer(document.getElementById('eegaalTable')).on('swipeleft', () => {
        table.page('previous').draw('page')
      })
    }
  }
  const x = window.matchMedia('(min-width: 900px)') // js media query on desktop
  myFunction(x) // Call listener function at run time
  x.addListener(myFunction) // Attach listener function on state changes
  //= =================== END HammerJS - Swipe

  // ScrollTop - If the user changes the page, scroll to the top
  $('.dataTable').on('page.dt', () => {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      'fast'
    ) // smoothen or ease this later ??
    $('main-content').focus()
    // need to set focus at top so DTBS doesn't scroll back to bottom

    const tempScrollTop = $(window).scrollTop()
    // console.log(`Scroll from Top: ${tempScrollTop.toString()}`);
  })

  //= ====================
  // Add cards media quiery class to table ID, as well as row border
  // ====================
  /*
    function myFunction() {
        var element = document.getElementById("fortyNawawi");
        element.classList.add("cards");
      }
*/
  if (window.matchMedia('(min-width: 900px)').matches) {
    // js media query on desktop
    /* previously $('fnClass').addClass('row-border')
    $('fnClass').addClass('cards') */
    $('.dataTable').addClass('row-border') // adds rowborder class
  } else {
    // js media query on mobile, tablet
    $('.dataTable').addClass('cards')
  } // end if else
  //= =================== Add cards class to table ID - END

  // changes <input class="paginate_input" type="text"> type to search type,
  // so that delete icon appears
  $('.paginate_input').prop('type', 'search')

  // adds a placeholder to above <input class="paginate_input" type="text">
  $('.paginate_input').attr('placeholder', 'ސަފުހާ...')
}) // ==================== END OF $(document).ready( function () {
