/*global document, window, alert, console, require*/
// added to get rid of error "document" was used before it was defined.

//=====================
//       TABS
// ====================
function openLink(evt, tabName) {
  "use strict"; // added to get rid of error Missing "use strict" statement.
  var i;
  x;
  tablinks;
  x = document.getElementsByClassName("myTab");

  for (i = 0; i < x.length; i += 1) {
    //changed due to Expected "+= 1" and instead saw "++".
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");

  document.getElementById(tabName).style.display = "block";
}
// ===== ===== Tabs - End ===== =====

//=====================
//      DT JS BELOW
// ====================
$(document).ready(function() {
  //$(document).ready( function () { //$(document).ready( function () { //
  // from here to var table = $("#fortyNawawi").DataTable({ used to be empty

  $.extend(true, $.fn.dataTable.defaults, {
    //"keys": "true",   /* KeyTable extension, old  */
  });

  if (window.matchMedia("(min-width: 1200px)").matches) {
    /* js media query on desktop, needs to have quotes */
    $.extend(true, $.fn.dataTable.defaults, {
      pageLength: 3, //# rows to display on single page when using pagination
      lengthMenu: [
        [1, 2, 3, 5, 7, 10, 15, 20, -1],
        [1, 2, "3 ޙަދީޘް ދައްކާ", 5, 7, 10, 15, 20, "ހުރިހައި"]
      ], //display range of pages
      keys: { clipboardOrthogonal: "export" } //strip  htmltags off keys copy
    });
  } else {
    /* js media query on mobile, tablet */
    $.extend(true, $.fn.dataTable.defaults, {
      pageLength: 1,
      lengthMenu: [
        [1, 2, 3, 5, 7, 10, 15, 20, -1],
        ["1 ޙަދީޘް ދައްކާ", 2, 3, 5, 7, 10, 15, 20, "ހުރިހައި"]
      ] //display range of pages
    });
  } //==================== end if else

  var table = $("#fortyNawawi").DataTable({
    //var table = $("#fortyNawawi").DataTable({
    // NOT DataTable();

    data: FNdataSet, //https://datatables.net/manual/ajax
    columns: [
      { title: "#" },
      { title: "ވަނަ" },
      { title: "ޢަރަބި ސުރުޚީ" },
      { title: "އިނގިރޭސި ސުރުޚީ" },
      { title: "ދިވެހި ސުރުޚީ" },
      { title: "ޢަރަބި ޙަދީޘް" },
      { title: "ޢަރަބި ފިލިނުޖަހައި" },
      { title: "އިނގިރޭސި" },
      { title: "ދިވެހި ތަރުޖަމާ" },
      { title: "މަސްދަރު ޢަރަބިން." },
      { title: "މަސްދަރު އިނގިރޭސިން." },
      { title: "މަސްދަރު ދިވެހިން." },
      { title: "މަސްދަރު ރިޔާޟުއްޞާލިޙީނުން." }
    ],

    columnDefs: [
      //classes columns for css in nweb view, but not print.
      {
        className: "fnCol1", // #
        targets: [0],
        visible: true,
        searchable: true
      },
      {
        className: "fnCol2", // Ar No
        targets: [1],
        visible: false,
        searchable: false
      },
      {
        className: "fnCol3", // Ar Title
        targets: [2],
        visible: true,
        searchable: false
      },
      {
        className: "fnCol4", // En Title
        targets: [3],
        visible: false,
        searchable: false
      },
      {
        className: "fnCol5", // Dv Title
        targets: [4],
        visible: false,
        searchable: false
      },
      {
        className: "fnCol6", // Ar Text
        targets: [5],
        visible: true,
        searchable: true
      },
      {
        className: "fnCol7", // Ar Plain
        targets: [6],
        visible: false,
        searchable: true
      },
      {
        className: "fnCol8", // En Text
        targets: [7],
        visible: false,
        searchable: true
      },
      {
        className: "fnCol9", // Dv Text
        targets: [8],
        visible: true,
        searchable: true
      },
      {
        className: "fnCol10", // Ar Ref
        targets: [9],
        visible: true,
        searchable: true
      },
      {
        className: "fnCol11", // En Ref
        targets: [10],
        visible: false,
        searchable: false
      },
      {
        className: "fnCol12", // Dv Ref
        targets: [11],
        visible: false,
        searchable: false
      },
      {
        className: "fnCol13", // Rs Ref
        targets: [12],
        visible: false,
        searchable: false
      },

      //below strips html tags off keystable copy, second part with keys on
      {
        targets: "_all",
        render: function(data, type, row, meta) {
          if (type === "export") {
            var div = document.createElement("div");
            div.innerHTML = data;
            return div.innerText;
          }
          return data;
        }
      }
      // needed to make keytable strip html tags off copy
    ], //end of columnDefs, previously without visible and searchable options.

    //=====================
    //  DT CUSTOM SETTINGS
    // ====================

    //Automatic column width calculation.  Default: true
    //can be disabled as an optimisation (takes a finite time to calculate widths)
    autoWidth: false,

    //By default, when data is laoded from an Ajax or Javascript data source
    //will create all HTML elements needed up-front. with large data can take time
    //allows to create the nodes (rows/cells) only when needed for a draw
    //if you load data with 10000 rows, but a paging display length of 10 records
    //rather than create all 10000 rows, deferred rendering will create only 10
    deferRender: true,

    //ordering of columns - by default, allows to click on column head to order table
    ordering: false,

    //stateSave: true // Breaks table, use the one below
    //Restore table state on page reload. When enabled aDataTables will store
    //state info like pagination position, display length, filtering and sorting
    //When user reloads the page the table's state will be altered to match previous
    //DOESNT WORK WITH JSON FETCHED FROM GSHEETS
    bstateSave: true,

    //Duration for which the saved state information is valid. Default Value: 7200
    //After this period has elapsed the state will be returned to the default.
    //Set state duration to 1 day. Use with above.
    //stateDuration: 60*60*24 //currently set to 1 day, -1 is that session only
    stateDuration: "86400",

    //removes written search input upon state reload
    //"stateSaveParams": function (settings, data) { data.search.search = ""; },

    //Highlight columns being ordered in the table.
    //adds a class to the column cells, which has CSS applied
    //can affect performance with many rows, as it manipulates many DOM elements
    orderClasses: false,

    //Pagination button display options.
    //DataTables has six built-in paging button arrangements:
    //numbers - Page number buttons only (1.10.8)
    //simple - "Previous" and "Next" buttons only
    //simple_numbers - "Previous" and "Next" buttons, plus page numbers
    //full - "First", "Previous", "Next" and "Last" buttons
    //full_numbers - "First", "Previous", "Next" and "Last" buttons & page numbers
    //first_last_numbers - "First" and "Last" buttons, plus page numbers
    //Default Value: simple_numbers,
    pagingType: "input",

    //Set a throttle frequency for searching.
    //search will instantly search the table on every keypress in client-side processing mode
    //and reduce the search call frequency to 400mS in server-side processing mode
    //processing load can be reduced by reducing the search frequency
    searchDelay: 1000,

    //Change options in page length select list. allows you to specify the entries in the length drop down select list that DataTables shows when pagination is enabled.
    //It can be either: 1D array of integer values which will be used for both the displayed option and the value to use for the display length,
    //or 2D array which will use the first inner array as the page length values and the second inner array as the displayed options.
    //-1 is used as a value this tells DataTables to disable pagination (i.e. display all rows).
    //Default [ 10, 25, 50, 100 ],
    //lengthMenu: [[1, 2, 3, 5, 7, 10, 15, 20, -1], ["1 ޙަދީޘް ދައްކާ", 2, 3, 5, 7, 10, 15, 20, "ހުރިހައި"]],
    //lengthMenu: [ [5, 10, 20, 30, 40, -1, 1], ["Show 5", 10, 20, 30, 40, "All", 1] ],

    //Tab index control for keyboard navigation. By default DataTables allows keyboard navigation of the table (sorting, paging, and filtering) by adding a tabindex attribute to the required elements. This allows the end user to tab through the controls and press the enter key to activate them, allowing the table controls to be accessible without a mouse. The default tabindex is 0, meaning that the tab follows the flow of the document. You can overrule this using this parameter if you wish. Use a value of -1 to disable built-in keyboard navigation, although this is not recommended for accessibility reasons.
    //Default Value: null
    /*"tabIndex": 0,*/

    //Store the DT conditions within the URL hash every time a condition changes (page/length/search/order) making it possible to copy/paste the URL.
    keepConditions: true,

    //keytable, adds keyboard navigation to DataTables, operating in exactly the same way as traditional spreadsheet applications.
    keys: true,

    //markjs, a keyword highlighter for strings, arrays or regular expressions and works in any context (not just tables).
    mark: true,

    //=====================
    // Internationalisation
    // ====================
    language: {
      paginate: {
        // &nbsp; prevents line breaks
        first: "<<&nbsp;ފުރަތަމަ",
        previous: "<&nbsp;ފަހަތަށް",
        next: "ކުރިއަށް&nbsp;>",
        last: "ފަހަށް&nbsp;>>",

        info: "_INPUT_" //taken from input.ks plugin, changes text from default "Page _INPUT_ of _TOTAL_"
      },
      buttons: {
        copyTitle: "ކޮޕީ",
        copySuccess: {
          1: "ކޮޕީ ވީ 1 ޙަދީޘް",
          _: "ކޮޕީ ވީ  %d ޙަދީޘް"
        }
      },

      info: "_TOTAL_ ޙަދީޘްގެ ތެރެއިން _START_ އަކުން _END_ އަކަށް",
      infoFiltered: "(ޖުމްލަ ބެލެވުނީ _MAX_)",
      infoEmpty: "ނުފެނުނު",
      lengthMenu: "_MENU_",
      search: "", //Originally "Search:" leave this blank in production
      searchPlaceholder: "ހޯއްދަވާ...",
      zeroRecords: "ނުފެނުނު"
    }, //==================== End of Internationalisation

    //=====================
    //      DT CUSTOM DOM
    // ====================
    /*DOM options, https://datatables.net/reference/option/dom, https://datatables.net/forums/discussion/33618/semantic-ui-with-dom-option
         default: lpfrtip
        l - length changing input control
        f - filtering input
        t - The table
        i - Table information summary
        p - pagination control
        r - processing display element
        B - Buttons
        
         "lBpfrtip",
        
< and > - div element
<"class" and > - div with a class
<"#id" and > - div with an ID
<"#id.class" and > - div with an ID and a class */

    dom: "lBpfrtip",

    buttons: [
      //https://datatables.net/extensions/buttons/examples/initialisation/multiple
      //used to use a container before, now 2 buttons
      //{ text: "Button 2", action: function ( e, dt, node, conf ) { alert( "Button 2 clicked on" ); } },
      {
        extend: "copy",
        key: { key: "c", shiftKey: true },
        text: "ކޮޕީ",
        messageTop: "ނަވަވީގެ 40 ޙަދީޘް",
        title: "" /*title: "hadithmv.com",*/,

        //=====================
        // edits clipboard regex, code to manipulate the data string as desired
        // ====================
        customize: function(data) {
          /* https://www.rexegg.com/regex-quickstart.html
                    \t	Tab, \r	Carriage return character, \n	Line feed character, \r\n	Line separator on Windows
                    */
          // data = data.replace( /\b([0-9]|[1-4][0-9]|50)\b/g, "No:" ); //adds string to hadith
          //        data = data.replace( /\t\r\n/g, "\n\n\n" ); //fixes multiple row's lack of line break on desktop
          data = data.replace(/\n#/g, "\n\n#"); //needed to make rnr work
          data = data.replace(/\n\n\n/g, "\n"); //rids empty space after title

          // data = data.replace( /\nNo.\tRef.\tArabic\tEnglish\tDhivehi/g, "" ); //prev normal

          data = data.replace(/\tވަނަ./g, "");
          data = data.replace(/\tޢަރަބި ސުރުޚީ/g, "");
          data = data.replace(/\tއިނގިރޭސި ސުރުޚީ/g, "");
          data = data.replace(/\tދިވެހި ސުރުޚީ/g, "");
          data = data.replace(/\tޢަރަބި ޙަދީޘް/g, "");
          data = data.replace(/\tޢަރަބި ފިލިނުޖަހައި/g, "");
          data = data.replace(/\tއިނގިރޭސި/g, "");
          data = data.replace(/\tދިވެހި ތަރުޖަމާ/g, "");
          data = data.replace(/\tމަސްދަރު ޢަރަބިން./g, "");
          data = data.replace(/\tމަސްދަރު އިނގިރޭސިން./g, "");
          data = data.replace(/\tމަސްދަރު ދިވެހިން./g, "");
          data = data.replace(/\tމަސްދަރު ރިޔާޟުއްޞާލިޙީނުން./g, "");

          /*data = data.replace( /\n#/g, "" );*/
          data = data.replace(/\n#/g, "\n\nޙަދީޘްގެ އަދަދު: ");
          data = data.replace(
            /ނަވަވީގެ 40 ޙަދީޘް\r\n\r\n\n\nޙަދީޘްގެ އަދަދު: \r\n\n/g,
            "ނަވަވީގެ 40 ޙަދީޘް\r\n"
          ); /* add string and fix empty space، make sure to change the red too */

          data = data.replace(/\nވަނަ./g, "");
          data = data.replace(/\nޢަރަބި ސުރުޚީ/g, "");
          data = data.replace(/\nއިނގިރޭސި ސުރުޚީ/g, "");
          data = data.replace(/\nދިވެހި ސުރުޚީ/g, "");
          data = data.replace(/\nޢަރަބި ޙަދީޘް/g, "");
          data = data.replace(/\nޢަރަބި ފިލިނުޖަހައި/g, "");
          data = data.replace(/\nއިނގިރޭސި/g, "");
          data = data.replace(/\nދިވެހި ތަރުޖަމާ/g, "");
          data = data.replace(/\nމަސްދަރު ޢަރަބިން./g, "");
          data = data.replace(/\nމަސްދަރު އިނގިރޭސިން./g, "");
          data = data.replace(/\nމަސްދަރު ދިވެހިން./g, "");
          data = data.replace(/\nމަސްދަރު ރިޔާޟުއްޞާލިޙީނުން./g, "");

          data = data.replace(/\r\n\r\n\r/g, "\r\n\r"); //rids empty space after title
          data = data.replace(/\t/g, "\n\n"); //seperates rows

          /*data = data.replace( /hadithmv.com\n/g, "hadithmv.com\n\n" ); //adds new line on android*/
          /*
                                           data = data.replace( /\r/g, "" ); //rids windows platform newline
                                           data = data.replace( /\t/g, "\n\n" );
           
                                          /**/
          //                    console.log(JSON.stringify(data));    //json stringify to console

          return data;
        },
        //==================== edits clipboard regex end, customize: function(data) {

        exportOptions: { columns: [":visible"], rows: [":visible"] } ////copies currently displayed and rows

        //copies currently displayed columns and rows, "exportOptions: { modifier: { columns: [":visible"], rows: [":visible"]}" doesnt work after cards
        // needs .cards thead { visibility: hidden; } to work
      }, //end of copy customization

      {
        extend: "colvis",
        key: { key: "h", shiftKey: true },
        text: "އިތުރު ކޮލަމްތައް"
      } //end of colvis

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
  }); //$("#fortyNawawi").DataTable( { - END //$("#fortyNawawi").DataTable( { - END //$("#fortyNawawi").DataTable( { - END
  // from here to END OF $(document).ready( function () { used to be empty

  //=====================
  //      HammerJS - Swipe
  // ====================
  delete Hammer.defaults.cssProps.userSelect; //enables text selection, but that conflicts with swipe

  /* Old hammerjs swipe code 
    if (window.matchMedia("(min-width: 1200px)").matches) {  // js media query on desktop 
        // empty 
    } else { // js media query on mobile, tablet 
        Hammer(fortyNawawi).on("swipeleft", function () {
            table.page("next").draw("page");
        });
        Hammer(document.getElementById("fortyNawawi")).on("swiperight", function () {
            table.page("previous").draw("page");
        });
    } // end if else
     ==================== END Old hammerjs code */

  function myFunction(x) {
    if (x.matches) {
      // If media query matches
      // empty // document.body.style.backgroundColor = "pink";
    } else {
      Hammer(fortyNawawi).on("swiperight", function() {
        //changed swipeleft and swiperight for dhivehi
        table.page("next").draw("page");
      });
      Hammer(document.getElementById("fortyNawawi")).on(
        "swipeleft",
        function() {
          table.page("previous").draw("page");
        }
      );
    }
  }
  var x = window.matchMedia("(min-width: 900px)"); // js media query on desktop
  myFunction(x); // Call listener function at run time
  x.addListener(myFunction); // Attach listener function on state changes
  //==================== END HammerJS - Swipe

  // ScrollTop - If the user changes the page, scroll to the top
  $(".dataTable").on("page.dt", function() {
    $("html, body").animate({ scrollTop: 0 }, "fast");
    $("main-content").focus(); // need to set focus at the top so that dataTables bootstrap doesn"t scroll back to the bottom

    var tempScrollTop = $(window).scrollTop();
    console.log("Scroll from Top: " + tempScrollTop.toString());
  });

  //=====================
  // Add cards media quiery class to table ID, as well as row border
  // ====================
  /*
    function myFunction() {
        var element = document.getElementById("fortyNawawi");
        element.classList.add("cards");
      }
*/
  if (window.matchMedia("(min-width: 900px)").matches) {
    // js media query on desktop
    $("#fortyNawawi").addClass("row-border"); //adds row border class, line below every row to table on desktop
  } else {
    // js media query on mobile, tablet
    $("#fortyNawawi").addClass("cards");
  } //  end if else
  //==================== Add cards class to table ID - END

  // changes <input class="paginate_input" type="text"> type to search type, so that delete icon appears
  $(".paginate_input").prop("type", "search");

  // adds a placeholder to above <input class="paginate_input" type="text">
  $(".paginate_input").attr("placeholder", "ސަފުހާ...");
}); // ==================== END OF $(document).ready( function () {
