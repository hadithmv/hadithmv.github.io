//
/* === === ===
 PAGE JS CODE
=== === === */
//

/* google-closure-compiler --charset=UTF-8 --js=hmv-script.js --js_output_file=hmv-script.min.js */

/* copyURL BUTTON */
// https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard/48542290#48542290
// https://stackoverflow.com/questions/10568815/replace-all-text-before-a-certain-point
function copyURLToClipButton() {
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

//

// SCROLL TO TOP

function scrollUpTop() {
  // scroll to top
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// SHOW OR HIDE AYAT FILI

function toggleQuranFili() {
  // https://datatables.net/forums/discussion/61291/how-to-implement-the-data-table-column-visibility-and-order-dynamically

  var isVisible = $(".dataTable").DataTable().column(4).visible();
  $(".dataTable").DataTable().column(4).visible(!isVisible);

  var isVisible = $(".dataTable").DataTable().column(5).visible();
  $(".dataTable").DataTable().column(5).visible(!isVisible);
}

// SWITCH BETWEEN IMLAI AND UTHMANI TEXT FOR AYAT

function uthmaniImlai() {
  // https://datatables.net/forums/discussion/61291/how-to-implement-the-data-table-column-visibility-and-order-dynamically

  var isVisible = $(".dataTable").DataTable().column(4).visible();
  $(".dataTable").DataTable().column(4).visible(!isVisible);

  var isVisible = $(".dataTable").DataTable().column(6).visible();
  $(".dataTable").DataTable().column(6).visible(!isVisible);
}

// CHANGE FILI BUTTON STRING

function filiString() {
  var button = document.getElementById("toggleFiliButton");
  if (button.innerHTML.trim() === "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;") {
    button.innerHTML = "&nbsp; ފިލިތައް ދައްކާ &nbsp;";
  } else {
    button.innerHTML = "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;";
  }
}

// CHANGE RASM UTHMANI IMLAI STRING

function rasmString() {
  var button = document.getElementById("toggleUthmaniImlai");
  if (button.innerHTML.trim() === "&nbsp; ރަސްމު އުޘްމާނީ &nbsp;") {
    button.innerHTML = "&nbsp; ރަސްމު އިމްލާއީ &nbsp;";
  } else {
    button.innerHTML = "&nbsp; ރަސްމު އުޘްމާނީ &nbsp;";
  }
}

// LOAD UTHMANI FONT FOR QURAN ONLY ON BUTTON CLICK

// Dynamically Load And Apply Fonts With JavaScript
// https://awik.io/dynamically-load-apply-fonts-javascript/
// Your font goes here
const bangersFont = new FontFace("mergedFont", "url(../font/hafs-400.woff)");
// Function which loads the font and applies it
function loadFont() {
  //console.log("Loading font...");
  bangersFont
    .load()
    .then(function (loadedFont) {
      document.fonts.add(loadedFont);
      //html.style.fontFamily = '"mergedFont"';
    })
    .catch(function (error) {
      console.log("Failed to load font: " + error);
    });
}

// QURAN CHANGE BOOK

function changeBookQuran(newBook) {
  window.location = window.location
    .toString()
    .replace(
      /quranUshru|quranHmv|quranBakurube|quranJaufar|quranSoabuni|quranRasmee|quranMuyassarGhareeb|quranMukhtasar|quranMuyassar|quranSadi|quranBetaqat|quranQiraaath/g,
      newBook
    )
    .replace(/\:v.*$/, "");
}

//

// Radheef CHANGE BOOK

// change url to change to another book while preserving query terms
function changeBookRadheef(newBook) {
  window.location = window.location
    .toString()
    .replace(
      /radheefAll|radheefRasmee|radheefEegaal|radheefManiku|radheefNanfoiy/g,
      newBook
    )
    .replace(/\:v.*$/, "");
}

//

// dont really need this in books right now, it was only meant for editor or notes content that didnt go back a page after having scrolled down or something
/* https://stackoverflow.com/questions/3664381/force-page-scroll-position-to-top-at-page-refresh-in-html/60994204#60994204
  function scrollToTopFully() {
    history.scrollRestoration = "manual";
    window.addEventListener("beforeunload", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
  
  // scrapped below this in favor of inline onclick function, prompt:
  // write an inline js onclick function, to reload the window, upto and including ".html" in the url, removing the rest of the url that comes after that
  
  // HARD RELOAD BUTTON - doesnt work for some reason
  /*function reloadUpToHtml() {
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
  }-*
  
  
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

//////////////////////////////////////

//////////////////////////////////////

//
/* === === ===
 DT CUSTOM JS BELOW
=== === === */
//

//
var table; // Variable to store the DataTable instance
var isMobile = window.innerWidth <= 800; // Boolean to check if the current view is mobile
//

// CUSTOM DT CONFIGURATION
var DTconfig = {
  data: data,

  // keytable option is set to !isMobile, which means that it will be true if the user is not on a mobile device (i.e., isMobile is false), and false if the user is on a mobile device (i.e., isMobile is true).
  keys: !isMobile,

  // https://www.gyrocode.com/articles/jquery-datatables-save-and-restore-table-state-using-unique-url/
  keepConditions: true,

  // https://datatables.net/reference/option/columns
  // columns: [null, null, null, null, null, null, null],
  columns: [
    { title: "#" },
    { title: "އަރަބި ނަމްބަރ" },
    { title: "އަރަބި ސުރުހީ" },
    { title: "ދިވެހި ސުރުހީ" },
    { title: "އަރަބި ލިޔުން" },
    {
      title: "އަރަބި ފިލިނުޖަހާ",
      // without tashkeel
      data: 4,
      visible: false,
      render: (data) => data.replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, ""),
    },
    {
      title: "ދިވެހި ލިޔުން",
      data: 5,
    },
    { title: "ތަޚްރީޖު", data: 6, searchable: false },
    { title: "ދިވެހި ތަޚްރީޖު", data: 7, searchable: false },
  ],

  // https://datatables.net/reference/option/columnDefs
  //
  columnDefs: [
    {
      // https://datatables.net/examples/advanced_init/column_render.html
      targets: [0],
      render: (data) => "#" + data,
    },
    {
      // check if data is not empty string and append a line of kashidas and a line break if true; otherwise, return unchanged data, empty string.
      targets: [7, 8],
      render: (data) =>
        //data !== "" ? "ـــــــــــــــــــــــــــ<br>" + data : data,
        // above does not preserve the \n new lines in the data, below does
        data !== ""
          ? "ـــــــــــــــــــــــــــ\t<br>" + data.replace(/\n/g, "\t<br>")
          : data,
    },
    {
      // turns \n new line from the data, into breaks in the html
      // this has to come after footnote line above
      targets: "_all",
      //render: (data) => data.replace(/\n/g, "\t<br>"),
      //render: (data) => data.replace(/\t/g, "\n\n<br>"),
      // for some reason, unless the above \n is replaced with a \t, there is no way see any separation of a single new line between same text paragraphs.
      // the footnote separater code above the above code also needed a \t added before the break (data.replace(/\n/g, "\t<br>")) in order for the clipboard to get it right
      // same with the line itself (ـــــــــــــــــــــــــــ\t<br>), \t had to be added
    },
    /*{
                      // turns \n new line from the data, into breaks in the html
                      // this has to come after footnote line above
                      targets: "_all",
                      render: (data) => data.replace(/(\r\n|\n|\r)/g, "\t<br>"),
                      // for some reason, unless the above \n is replaced with a \t, there is no way see any separation of a single new line between same text paragraphs.
                      // the footnote separater code above the above code also needed a \t added before the break (data.replace(/\n/g, "\t<br>")) in order for the clipboard to get it right
                      // same with the line itself (ـــــــــــــــــــــــــــ\t<br>), \t had to be added
                    },*/
    {
      // https://datatables.net/reference/option/columns.searchPanes.show
      // force all cols to show searchpanes by default
      searchPanes: {
        show: true,
        //controls: false,
      },
      targets: [0, 1, 2, 3],
    },
    {
      // hides panes for all other columns
      searchPanes: {
        show: false,
      },
      targets: "_all",
    },
    {
      targets: "_all",
      render: function (data) {
        return data.replace(/\r\n|\n|\r/g, "\t<br>");
      }, // for some reason, without the \n replaced above, the single new lines in between same language paragraphs show in console as a single space, and therefore clipboard cannot be customized to show it
      // added space before br, otherwise clipboard copy export has no space
    },
  ],

  layout: {
    top: [
      "search",
      "inputPaging",
      "search",

      {
        buttons: [
          {
            extend: "copy",

            titleAttr: "copy",
            text: "⧉ ކޮޕީ",

            messageBottom: "- ޙަދީޘްއެމްވީ -",

            footer: false,
            header: false,

            fieldSeparator: "\n\n",
            exportOptions: {
              columns: ":visible",

              modifier: {
                page: "current",
              },

              key: {
                shiftKey: true,
                key: "c",
              },
            },
            customize: function (data) {
              data = data.replace(/\t/g, "\n");
              console.log(JSON.stringify(data));
              return data;
            },
          },

          {
            extend: "collection",
            text: "⌥ އިތުރު",
            background: false,

            buttons: [
              {
                extend: "colvis",

                text: "☰ ބަރިތައް",
                background: false,
                postfixButtons: [
                  {
                    extend: "colvisRestore",
                    text: "↺ ރީސެޓްކުރޭ",
                    titleAttr: "reset toggle",
                  },
                ],
              },
              {
                extend: "searchBuilder",
                titleAttr: "custom search",
              },
              {
                extend: "searchPanes",

                config: {
                  cascadePanes: true,

                  viewTotal: true,

                  collapse: false,
                  dtOpts: {
                    select: {
                      style: "multi+shift",
                    },
                  },
                },
              },
            ],
          },

          {
            extend: "pageLength",

            background: false,
          },
        ],
      },
    ],

    bottom: ["inputPaging", "info"],
  },
}; // var DTconfig = { END

// Remove the defaults
DataTable.defaults.layout = {
  topStart: null,
  topEnd: null,
  bottomStart: null,
  bottomEnd: null,
};
//

// DataTable.defaults.layout = { };
// DataTable.defaults.language = { };

//
Object.assign(DataTable.defaults, {
  // https://datatables.net/reference/option/layout

  // cant have input paging here as default config, otherwise shows up inside searchpanes for some reason

  /*
          layout: {
            top: [
             "search",
              "inputPaging",
        ] }        */

  // https://datatables.net/reference/option/language
  // LANGUAGE SET DEFAULTS
  language: {
    info: "_TOTAL_ ގެ ތެރެއިން _START_ އިން _END_ އަށް",
    infoFiltered: "(ޖުމްލަ ބެލުނީ _MAX_)",
    infoEmpty: "— ނުފެނުނު —",
    lengthMenu: "ދައްކާ _MENU_",
    loadingRecords: "ތައްޔާރުވަނީ...",
    search: "",
    searchPlaceholder: 'ސީދާ ލަފްޒު "މިހެން ހޯދާ"، !މިލަފްޒު ނުލާ ހޯދާ',
    zeroRecords: "— ނުފެނުނު —",
    paginate: {
      first: "<< ",
      last: " >>",
      next: " >",
      previous: "< ",
    },
    /*
            paginate: {
              first: "<< ފުރަތަމަ",
              last: "ފަހު >>",
              next: "ކުރިއަށް >",
              previous: "< ފަހަތަށް",
            }, */

    entries: {
      _: "",
      1: "",
    },

    // https://datatables.net/reference/option/buttons.buttons.text
    buttons: {
      // https://datatables.net/reference/button/pageLength
      pageLength: {
        _: "%d ދައްކާ",
        "-1": "ހުރިހާ",
      },
      //colvis: "ބަރިތައް",
      // https://datatables.net/reference/button/copyHtml5
      copyTitle: "ކޮޕީ",
      copySuccess: {
        1: "1 ކޮޕީވެއްޖެ",
        _: "%d ކޮޕީވެއްޖެ",
      },
    },
    searchBuilder: {
      button: "ކަސްޓަމް 🔍",
      add: "+ އިތުރުކުރޭ",
      condition: "ޝަރުތު",
      clearAll: "ރީސެޓް",
      //delete: "Delete",
      data: "ބަރި",
      //right: "Right",
      //left: "Left",
      logicAnd: "އަދި &",
      logicOr: "ނޫނީ |",
      title: {
        0: "ސާޗު ޝަރުތުތައް",
        _: "ސާޗު ޝަރުތުތައް (%d)",
      },
      value: "ލިޔުން",
      valueJoiner: "އަދި",
    },
    searchPanes: {
      // https://datatables.net/reference/option/language.searchPanes.collapse
      // looks like i wont need text: "⧩ ފިލްޓާ" with this
      collapse: { 0: "⧩ ފިލްޓާ", _: "⧩ ފިލްޓާ (%d)" },
      title: {
        _: "%d ފިލްޓަރ ކުރެވިފާ",
        0: "0 ފިލްޓަރ ކުރެވިފާ",
        1: "1 ފިލްޓަރ ކުރެވިފާ",
      },
      count: "{total}",
      countFiltered: "{shown} ({total})",
      emptyMessage: "— ވަކި އެއްޗެއް ނުޖަހާ —",
      clearMessage: "ފިލްޓާތައް ދުއްވާލާ",
    },
  }, // language END
  //

  //
  // https://datatables.net/examples/basic_init/state_save.html
  stateSave: true,
  // currently" above works
  // above seems to break table, use the one below
  //bstateSave: true,
  //
  // https://datatables.net/reference/option/stateDuration
  // default is 2 hours, now set to 1 day
  stateDuration: 86400,
  //
  // https://datatables.net/reference/option/ordering
  ordering: false,
  //
  // https://datatables.net/reference/option/orderClasses
  orderClasses: false,
  //
  // https://datatables.net/reference/option/searchDelay
  searchDelay: 350,
  //
  // https://datatables.net/reference/option/autoWidth
  autoWidth: false,
  //
  //
  // https://datatables.net/blog/2014/search-highlighting#:~:text=DataTables'%20built%20in%20search%20features,what%20they%20are%20looking%20for
  searchHighlight: true,
  // https://datatables.net/blog/2017/search-highlighting-with-markjs
  // mark: true,
  //

  // https://datatables.net/blog/2019/scroll-to-top
  // instead of getting the external file, just have the code directly in here
  // scrollToTop: true,

  //

  //
  lengthMenu: [
    [1, 3, 5, 10, 25, 50, -1],
    [1, 3, 5, 10, 25, 50, "ހުރިހާ"],
  ],
  //
  buttons: [
    {
      // https://datatables.net/reference/button/copy
      extend: "copy",
      // https://datatables.net/reference/option/buttons.buttons.titleAttr
      titleAttr: "copy",
      text: "⧉ &nbsp; ކޮޕީ",
      //https://datatables.net/reference/api/buttons.exportInfo()
      messageBottom: "- ޙަދީޘްއެމްވީ -", //messageTop: "- ޙަދީޘްއެމްވީ -",
      //title: "" /* default: html page title, prev was: "hadithmv.com", */,
      // https://datatables.net/reference/button/copy
      footer: false, // if not set to false, leaves an empty blank line
      header: false,
      //newline: "\n",
      // fieldBoundary: "\n", // this creates extra blank lines even where footer and header are set to false
      fieldSeparator: "\n\n", // \t
      exportOptions: {
        // https://datatables.net/extensions/buttons/examples/html5/columns.html this on its own selects all data on all pages
        columns: ":visible",
        // https://datatables.net/reference/button/copy this on its own selects even column hidden data
        modifier: {
          page: "current",
        },
        // FOR DESKTOP - https://datatables.net/extensions/buttons/examples/initialisation/keys.html
        key: {
          shiftKey: true,
          key: "c",
        },
      },
      customize: function (data) {
        // <br>
        data = data.replace(/\t/g, "\n"); // \n\n
        console.log(JSON.stringify(data));
        return data; // without this, custom data wont be in clipboard
      },
    },
    // https://datatables.net/reference/button/colvis
    {
      extend: "colvis",
      titleAttr: "toggle columns",
      text: "☰ ބަރިތައް",
      // https://datatables.net/reference/button/collection
      background: false,
      key: {
        shiftKey: true,
        key: "s",
      },
      // https://datatables.net/extensions/buttons/examples/column_visibility/restore.html
      postfixButtons: [
        {
          extend: "colvisRestore",
          text: "↺ ރީސެޓްކުރޭ",
          titleAttr: "reset toggle",
        },
      ],
    },
    // https://datatables.net/extensions/searchbuilder/
    // will not work with dates without another plugin
    {
      extend: "searchBuilder",
      titleAttr: "custom search",
      // wont work here, need to set in language it seems
      //text: "🔍 ކަސްޓަމް ސާރޗް",
      key: {
        shiftKey: true,
        key: "b",
      },
    },
    // https://datatables.net/reference/feature/searchPanes
    {
      extend: "searchPanes",
      //text: "⧩ ފިލްޓާ",
      titleAttr: "filter",
      key: {
        shiftKey: true,
        key: "p",
      },
      config: {
        // https://datatables.net/reference/feature/searchPanes.cascadePanes
        cascadePanes: true,
        // https://datatables.net/reference/feature/searchPanes.viewTotal
        viewTotal: true,
        // https://datatables.net/reference/feature/searchPanes.collapse
        collapse: false,
        //orderable: false,
        // https://datatables.net/extensions/searchpanes/examples/initialisation/speedTest.html
        //columns: [0, 1],
        //controls: false,
        // https://datatables.net/reference/feature/searchPanes.initCollapsed
        //initCollapsed: true,
        // https://datatables.net/reference/feature/searchPanes.order
        // order: [[1, 'desc']]
        //searching: false,
        //paging: true,
        dtOpts: {
          // https://datatables.net/extensions/select/examples/initialisation/multi.html
          select: {
            //style: "multi",
            style: "multi+shift",
          },
        },
      },
    },
  ], // buttons: [ END
  /*columnDefs: [
                  {
                    // https://datatables.net/reference/option/columns.searchPanes.show
                    // force all cols to show searchpanes by default
                    searchPanes: {
                      show: true,
                      //controls: false,
                    },
                    //targets: [0]
                    targets: "_all",
                  },
                ],*/
  //
  // https://datatables.net/examples/basic_init/scroll_y_dynamic.html
  /*paging: false,
                     scrollCollapse: true,
                     scrollY: "50vh",*/
  // also consider https://datatables.net/extensions/scroller/

  // https://datatables.net/examples/basic_init/hidden_columns.html
  /*columnDefs: [
                     {
                         target: 2,
                         visible: false,
                         searchable: false
                     },
                     {
                         target: 3,
                         visible: false
                     }
                 ]*/

  // https://datatables.net/examples/advanced_init/column_render.html
}); // Object.assign(DataTable.defaults, { END
//

// Desktop configuration
/*var desktopConfig = {
          // DESKTOP LAYOUT
          // https://datatables.net/extensions/keytable/
          keys: true,
        }; // const desktopConfig  = { END
        //*/

// Function to initialize or reinitialize the DataTable
// function initializeDataTable() {
// Initialize DataTable with chosen config
//new DataTable("#example", {
table = new DataTable("#tableID", {
  //
  //...config
  ...DTconfig,

  // Add any additional options here

  // Data source for the table //data: dataSet,
  //data: data,
  //

  //
}); // new DataTable("#example", { END

// This ensures that the code runs after the entire DOM has been fully loaded.
document.addEventListener("DOMContentLoaded", function () {
  //
  //
  // Focus on search input for desktop view
  // IF DESKTOP, NOT MOBILE
  if (!isMobile) {
    // https://datatables.net/forums/discussion/comment/124081/#Comment_124081
    $("div.dt-search .dt-input").focus();

    // scrollToTop scroll to top on desktop https://datatables.net/blog/2019/scroll-to-top
    // instead of using the plugin externally, place the code here directly
    // it seems this does the same thing as the mobile version of the scroll
    table.on("page", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
        /*window.scrollTo({
           top: $(table.table().container()).offset().top,
           behavior: "smooth",*/
      });
      /*setTimeout(function () {
                  $(document).scrollTop($(table.table().container()).offset().top);
                }, 10);*/
    }); // table.on("page", function () { END
    //
    // IF MOBILE
  } else {
    // scroll to top of table row on mobile
    table.on("page", function () {
      //setTimeout(function () {
      // https://datatables.net/forums/discussion/comment/175697/#Comment_175697
      // other code works, but navbar hides the top of tr
      const trElement = document.querySelector("tbody tr");
      const navbarHeight = document.querySelector(".navbar").offsetHeight;

      const trPosition =
        trElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = trPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      //document
      //    .querySelector("tbody tr")
      //    .scrollIntoView({ behavior: "smooth" });
      //$(document).scrollTop($(table.table().container()).offset().top);
      //$(table.querySelector("tbody tr")).offset().top; // not quite working as is, but the selecters with scrollintoview does work
      //}, 10);
      // OLD SWIPE CODE PART 1
      // moved this swipe enable up here, and disabled it where it was originally from
      //enableSwipe(); // Enable swipe for mobile view
      //
    }); // table.on("page", function () { END

    // NEW SWIPE CODE
    //
    // Set touch-action: auto for tableID https://hammerjs.github.io/touch-action/
    //document.getElementById("tableID").style.touchAction = "auto";
    // “I can’t select my text anymore!” https://hammerjs.github.io/tips/
    delete Hammer.defaults.cssProps.userSelect;
    //
    // Hammer(tableID).on("swipeleft", function () {
    Hammer(document.querySelector(".dataTable")).on("swipeleft", function () {
      //event.preventDefault(); // Prevent default behavior
      table.page("previous").draw("page");
    });
    //  Hammer(document.getElementById("tableID")).on("swiperight", function () {
    Hammer(document.querySelector(".dataTable")).on("swiperight", function () {
      //event.preventDefault(); // Prevent default behavior
      table.page("next").draw("page");
    });

    //
  } // if (!isMobile) { } else { END

  //
  // changes <input type="text"> type to search type, so that delete icon appears
  // adds a placeholder to the input
  $(".dt-paging-input input")
    .prop("type", "search")
    .attr("placeholder", "ސަފުހާ");
  // add more width, or make text smaller later?
  //

  // upon double click, jump to the page the double clicked entry was on and select it, with rowshowjs
  $("tbody").on("dblclick", "tr", function () {
    if (table.search() !== "") {
      table.search("").draw();
    }
    table.row(this).draw().show().select().draw(false);
  });
  //

  // https://datatables.net/reference/api/search()
  // removes diacritics and punctuation on key up for search
  $(".dt-search .dt-input").on("keyup click", function () {
    var str = $(this).val();
    str = str.replace(
      /[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|.|،|؟|-|ـ|’|”|:|؛|/{|/}|/(|/)|/[|/]|«|»|]/g,
      ""
    );
    $(this).val(str);
    //table.search(str).draw();
    // commenting above out allows searchdelay to work with stringreplace
  });
  //
  //
  //
}); // document.addEventListener("DOMContentLoaded", function () { END

//
//} // function initializeDataTable() { END

// Function to add swipe event listeners
/*function enableSwipe() {
       var tableElement = document.querySelector("#example");
       tableElement.addEventListener("touchstart", handleTouchStart, false);
       tableElement.addEventListener("touchend", handleTouchEnd, false);
     }
     // Function to remove swipe event listeners
     /*function disableSwipe() {
          var tableElement = document.querySelector("#example");
          tableElement.removeEventListener("touchstart", handleTouchStart, false);
          tableElement.removeEventListener("touchend", handleTouchEnd, false);
        }
     // Handle the start of a touch event
     function handleTouchStart(e) {
       touchStartX = e.changedTouches[0].screenX;
     }
     // Handle the end of a touch event
     function handleTouchEnd(e) {
       touchEndX = e.changedTouches[0].screenX;
       handleSwipe();
     }
   
     // Process the swipe gesture
     function handleSwipe() {
       var swipeThreshold = 40; // 50 - Minimum distance traveled to be considered a swipe
       var swipeDistance = touchEndX - touchStartX;
   
       if (swipeDistance > swipeThreshold) {
         table.page("next").draw("page");
       } else if (swipeDistance < -swipeThreshold) {
         // Swipe right: go to previous page
         table.page("previous").draw("page");
         // Swipe left: go to next page
       }
     }*/

// Debounce function to limit the rate at which a function can fire
/*function debounce(func, wait) {
          let timeout;
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        }*/

// Handle window resize events
/*function handleResize() {
          var newIsMobile = window.innerWidth <= 800;
          if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            if (isMobile) {
              enableSwipe(); // Enable swipe for mobile view
            } else {
              disableSwipe(); // Disable swipe for desktop view
            }
            //table.destroy(); // Destroy existing table
            //initializeDataTable(); // Reinitialize table with new configuration
          }
        }*/

// Add event listener for window resize, using debounce for performance
//window.addEventListener("resize", debounce(handleResize, 250));

// Initialize the DataTable
//initializeDataTable();
//

//
// BOTTOM
