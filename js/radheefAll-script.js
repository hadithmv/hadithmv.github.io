// global document, window, alert, console, require

// =====================
//      DT JS BELOW
// ====================
$(document).ready(() => {
  // $(document).ready( function () { ===== ===== //
  // from here to var table = $("#fortyNawawi").DataTable({ used to be empty

  $.extend(true, $.fn.dataTable.defaults, {
    // "keys": "true", /* KeyTable extension, old */
  });

  /* js media query on desktop, needs to have quotes */
  if (window.matchMedia("(min-width: 900px)").matches) {
    $.extend(true, $.fn.dataTable.defaults, {
      // desktop, goes rtl --> //'<"dTop"pBfl>rt<"bottom"ip>',
      dom: '<"dTop"pBfl>rtip',
      pageLength: 3, // # rows to display on single page when using pagination
      // lengthMenu: [
      //   [1, 2, 3, 5, 7, 10, 15, 20, -1],
      //   [1, 2, '3 ދައްކާ', 5, 7, 10, 15, 20, 'ހުރިހާ']
      // ], // display range of pages
      keys: { clipboardOrthogonal: "export" }, // strip htmltags off keys copy
      language: {
        paginate: {
          // &nbsp; prevents line breaks
          first: "<<&nbsp;ފުރަތަމަ",
          previous: "<&nbsp;ފަހަތަށް",
          next: "ކުރިއަށް&nbsp;>",
          last: "ފަހު&nbsp;>>",

          info: "_INPUT_", // taken from input plugin, "Page _INPUT_ of _TOTAL_"
        },
      },
    });
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
          first: "<<",
          previous: "<",
          next: ">",
          last: ">>",

          info: "_INPUT_", // taken from input plugin, "Page _INPUT_ of _TOTAL_"
        },
      },
    });
  } //= =================== end if else

  //
  // INCLUDING VARIOUS PARTS OF OTHER DICTIONARIES
  //

  // PART 1 RASMEE

  /* write js code for
there is a 2d json array object with 13 columns, the name of the object is a variable called radheefRasmee_DB
remove all other columns completely except for columns 1, 3 and 4
now there should be only 3 columns
at this point, create a column with empty strings before the first column at this point,
create another column with empty strings between the last two columns
there should be 5 columns 
now create one last column with empty strings at the end of those columns
the result should be put into a variable called resultradheefRasmee
//
"create another column with empty strings between the last two columns"
this is not there
*/

  // Remove all columns except for 1, 3, and 4
  let trimmedArray = radheefRasmee_DB.map((row) => [row[0], row[2], row[3]]);

  // Add empty strings before the first column
  let resultArray = trimmedArray.map((row) => ["", ...row]);

  // Add empty strings between the last two columns
  resultArray = resultArray.map((row) => [
    ...row.slice(0, 3),
    "",
    ...row.slice(3),
  ]);

  // Add one last column with empty strings at the end
  resultArray = resultArray.map((row) => [...row, ""]);

  // Store the result in a variable called resultradheefRasmee
  let resultradheefRasmee = resultArray;

  // Log the result to the console for testing
  //console.log(resultradheefRasmee);

  //

  // PART 1 MANIKU - remove cols
  // cgpt code, this part removes the specified columns entirely
  // In this modified code, you can specify the columnsToRemove array at the end of the code, allowing you to easily change which columns you want to remove without modifying the function itself. This provides more flexibility when working with different 2D arrays and column selections.

  function removeColumns(arr, columnIndices) {
    return arr.map((row) => {
      return row.filter((_, index) => !columnIndices.includes(index));
    });
  }

  //const result = removeColumns(twoDArray, columnsToRemove); // [1, 3];
  resultradheefManiku = removeColumns(radheefManiku_DB, [0, 2]);

  // PART 2 move second column to the sixth column
  // Step 1: Add an empty column before the first column
  // jsonArray.forEach
  resultradheefManiku.forEach(function (row) {
    row.unshift("");
  });

  // Step 2: Add 3 more columns after the third column
  resultradheefManiku.forEach(function (row) {
    for (var i = 0; i < 3; i++) {
      row.push("");
    }
  });

  // Step 3: Switch the places of the third and last columns
  resultradheefManiku.forEach(function (row) {
    var thirdColumnValue = row[2];
    var lastColumnValue = row[row.length - 1];

    row[2] = lastColumnValue;
    row[row.length - 1] = thirdColumnValue;
  });

  // ...

  // PART 1 EEGAL
  // cgpt code, this takes a split 2 2d nested arrays and joins them together rowwise, then generates empty values where needed, then flattens them, so now the db can be broken down and reused

  // remove rows from begining
  function removeFirstRows(array, numRowsToRemove) {
    if (numRowsToRemove >= array.length) {
      // If you want to remove more rows than the array has, return an empty array.
      return [];
    }

    return array.slice(numRowsToRemove);
  }

  //const result = removeFirstRows(radheefEegaal_DB, 4);
  var resultradheefEegaal = removeFirstRows(radheefEegaal_DB, 4);
  //console.log(result);
  //

  // remove rows from end (take into account what you removed before this)
  function removeLastRows(array, numRowsToRemove) {
    if (numRowsToRemove >= array.length) {
      // If you want to remove more rows than the array has, return an empty array.
      return [];
    }

    array.splice(-numRowsToRemove, numRowsToRemove);
    return array;
  }

  //const result = removeLastRows(radheefEegaal_DB, 34);
  resultradheefEegaal = removeLastRows(resultradheefEegaal, 34);
  //console.log(result);

  /* old method
  // remove last column from 2d array, by replacing with empty values, not null
  function replaceLastColumnWithEmptyValues(array) {
    for (let i = 0; i < array.length; i++) {
      if (Array.isArray(array[i]) && array[i].length > 0) {
        array[i][array[i].length - 1] = ""; // Set the last element (column) to an empty value.
      }
    }
    return array;
  }
  //const result = replaceLastColumnWithEmptyValues(twoDNestedArray);
  resultradheefEegaal = replaceLastColumnWithEmptyValues(resultradheefEegaal);*/

  // NEW method, that specifically chooses which columns to remove using the map method
  function replaceColumnsWithEmptyValues(arr, columnIndices) {
    return arr.map((row) => {
      return row.map((value, index) => {
        return columnIndices.includes(index) ? "" : value;
      });
    });
  }
  //const result = replaceColumnsWithEmptyValues(twoDArray, [0, 3]);
  resultradheefEegaal = replaceColumnsWithEmptyValues(resultradheefEegaal, [2]);
  //console.log(result);

  //
  //
  //

  // PART 2 EEGAAL
  // cgpt code, appends a 2d array to the end of another 2d array, even if their columns/rows differ, and generates empty values
  // In this code, the appendRowsWithEmptyValues function calculates the maximum number of columns from both arrays and pads each row in arr2 with empty values (empty strings) as needed to match the number of columns in the merged array. This ensures that the resulting array has consistent dimensions with empty values where needed.
  function appendRowsWithEmptyValues(arr1, arr2) {
    // Find the maximum number of columns from both arrays.
    const maxColumns = Math.max(arr1[0]?.length || 0, arr2[0]?.length || 0);

    // Iterate through the rows of arr2 and append them to arr1, padding with empty values.
    for (let i = 0; i < arr2.length; i++) {
      const newRow = arr2[i].concat(
        Array(maxColumns - arr2[i].length).fill("")
      );
      arr1.push(newRow);
    }

    return arr1;
  }

  // const result = appendRowsWithEmptyValues(radheef_DB, radheefEegaal_DB);
  combResult = appendRowsWithEmptyValues(radheefAll_DB, resultradheefRasmee);
  combResult = appendRowsWithEmptyValues(combResult, resultradheefEegaal);
  combResult = appendRowsWithEmptyValues(combResult, resultradheefManiku);
  combResult = appendRowsWithEmptyValues(combResult, nanfoiy_DB);
  //console.log(result);
  // end merge

  const table = $("#radheefAllTable").DataTable({
    // var table = $("#fortyNawawi").DataTable({
    // NOT DataTable();

    // CHANGE123 JSON
    data: combResult, // https://datatables.net/manual/ajax

    //order: [[0, 'asc']], // CHANGE 123 - FOR RADHEEF ONLY

    columns: [
      {
        data: 0,
        title: "އަރަބި ލަފްޒު",
      },
      {
        data: 0,
        title: "އަރަބި ފިލިނުޖަހައި",
        render: function (data, type, row) {
          return data
            .replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "")
            .replace(/(\n)/g, '<br class="br">'); // prev just "<br>", but that eliminated the custom space i gave to the br class
        },
      },
      {
        data: 1,
        title: "ދިވެހި ލަފްޒު",
      },
      {
        data: 2,
        title: "އިނގިރޭސި ލަފްޒު",
      },
      {
        data: 3,
        title: "އަރަބި މާނަ",
      },
      {
        data: 4,
        title: "ދިވެހި މާނަ",
      },
      {
        data: 5,
        title: "އިނގިރޭސި މާނަ",
      },
    ],

    /* https://datatables.net/reference/option/columnDefs */
    columnDefs: [
      /* replace \n newlines from json to <br> in table
      https://datatables.net/forums/discussion/44399/how-can-i-show-multiple-lines-in-cell */
      {
        targets: "_all",
        render: function (data, type, row) {
          return data.replace(/\r\n|\n|\r/g, '\t<br class="br">');
        }, // added space before br, otherwise clipboard copy export has no space
      }, // later changed that blank space into a \t, so that single new lines could work on clipboard copy
      // previously just \n. added \r\n and \r to make lines break on mobile

      // classes columns for css in nweb view, but not print.
      // CHANGE123 COL CLASSES AND VISIBILITY/SEARCHABLE

      {
        className: "rCol1", // Ar Text
        targets: [0],
        visible: true,
        searchable: false,
      },
      {
        className: "rCol2", // Ar Text Plain
        targets: [1],
        visible: false,
        searchable: true,
      },
      {
        className: "rCol3", // dv word
        targets: [2],
        visible: true,
        searchable: true,
      },
      {
        className: "ColEng", // en word
        targets: [3],
        visible: true,
        searchable: true,
      },
      {
        className: "rCol5", // ar meaning
        targets: [4],
        visible: true,
        searchable: true,
      },
      {
        className: "rCol6", // dv meaning
        targets: [5],
        visible: true,
        searchable: true,
      },
      {
        className: "ColEng", // en meaning
        targets: [6],
        visible: true,
        searchable: true,
      },

      // below strips html tags off keystable copy, second part with keys on
      {
        targets: "all",
        render(data, type, row, meta) {
          if (type === "export") {
            const div = document.createElement("div");
            div.innerHTML = data;
            return div.innerText;
          }
          return data;
        },
      },
      // needed to make keytable strip html tags off copy
    ], // end of columnDefs, previously without visible and searchable options.

    //= ====================
    // DT CUSTOM SETTINGS
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
    ordering: true, // CHANGE 123 - FOR RADHEEF ONLY (previously true)

    // If ordering is enabled (ordering), then DataTables will perform a first pass order during initialisation. Using this parameter you can define which column(s) the order is performed upon, and the ordering direction. The order can be defined in a number of different ways as defined by DataTables.Order.
    order: [],
    // No ordering applied by DataTables during initialisation. The rows are shown in the order they are read by DataTables (i.e. the original order from the DOM if DOM sourced, or the array of data if Ajax / data sourced):

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
    stateDuration: "86400",

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
    pagingType: "input",

    // Set a throttle frequency for searching.
    // search will instantly search table on every keypress -clientside proc mode
    // and reduce search call frequency to 400mS in serverside processing mode
    // processing load can be reduced by reducing the search frequency
    searchDelay: 1300,

    // Change options in page length select list.
    // It can be either: 1D array for both displayed option/display length value,
    // or 2Darray where 1st inner array=page length values, 2nd displayed options
    // -1 is used as a value this tells DataTables to disable pagination
    // Default [ 10, 25, 50, 100 ],
    lengthMenu: [
      [10, 1, 2, 3, 5, 10, 20, 30, 50],
      ["10 ދައްކާ", 1, 2, 3, 5, 10, 20, 30, "50"],
    ],
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

    // default "smart" filtering breaks input into individual words and then matches those words in any position and in any order in the table (rather than simple doing a simple string compare).
    search: {
      smart: true,
    },

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
        copyTitle: "ކޮޕީ",
        copySuccess: {
          1: "ކޮޕީ ވީ 1",
          _: "ކޮޕީ ވީ %d",
        },
      },

      info: "_TOTAL_ ގެ ތެރެއިން _START_ އިން _END_ އަށް",
      infoFiltered: "(ޖުމްލަ ބެލެވުނީ _MAX_)",
      infoEmpty: "— ނުފެނުނު —",
      lengthMenu: "_MENU_",
      search: "", // Originally "Search:" leave this blank in production
      searchPlaceholder: 'ސީދާ ލަފްޒު "މިހެން ހޯދާ"',
      zeroRecords: "<br><br><br><br>— ނުފެނުނު —<br><br><br><br><br>",
      searchPanes: {
        emptyMessage: "— ވަކި ނަމެއް ނެތް —",
        clearMessage: "ފިލްޓަރތައް ދުއްވާލާ",
        collapse: { 0: "ފިލްޓަރ", _: "ފިލްޓަރ (%d)" },
        title: {
          _: "%d ފިލްޓަރ ކުރެވިފާ",
          0: "0 ފިލްޓަރ ކުރެވިފާ",
          1: "1 ފިލްޓަރ ކުރެވިފާ",
        },
        /* i18n: {
          emptyMessage: '</i></b>ހުސްކޮށް</b></i>'
        } */
      },
      /* processing: '- ތައްޔާރުވަނީ -' */ // clashes with zeroRecords on serverside/ajax?
    }, //= =================== End of Internationalisation

    buttons: [
      // datatables.net/extensions/buttons/examples/initialisation/multiple
      // used to use a container before, now 2 buttons
      // { text: "Button 2", action: function ( e, dt, node, conf )
      // { alert( "Button 2 clicked on" ); } },
      {
        extend: "copy",
        key: { key: "c", shiftKey: true },
        text: "ކޮޕީ",
        messageTop: "ޙަދީޘްއެމްވީ – އަރަބި ދިވެހި އިނގިރޭސި ރަދީފު", // CHANGE123 clipboard message
        title: "" /* title: "hadithmv.com", */,

        //= ====================
        // edits clipboard regex, code to manipulate the data string as desired
        // ====================
        customize(data) {
          data = data.replace(/\r\n|\n/g, "\t");
          // \r\n prevents first header showing up unneeded (windows)
          // \n prevents first header showing up unneeded (linux) this needs come after windows rn

          data = data.replace(/އަރަބި ލަފްޒު\t/g, ""); // should be this way instead of /\tފޮތް/
          data = data.replace(/އަރަބި ފިލިނުޖަހައި\t/g, "");
          /* data = data.replace(/އަރަބި މާނަ\t/g, '') */
          data = data.replace(/ދިވެހި ލަފްޒު\t/g, "");
          /* data = data.replace(/ދިވެހި މާނަ\t/g, '') */
          data = data.replace(/އިނގިރޭސި ލަފްޒު\t/g, "");

          data = data.replace(/އަރަބި މާނަ\t/g, "");
          data = data.replace(/ދިވެހި މާނަ\t/g, "");
          data = data.replace(/އިނގިރޭސި މާނަ\t/g, "");

          data = data.replace(/\t\t/g, "\t");
          // This prevents a double or more line breaks when columns are hidden

          data = data.replace(/\n\n\n\n|\n\n\n|\t|\s\s/g, "\n\n");

          //  console.log(JSON.stringify(data)) // json stringify to console

          return data;
        },
        //= ============== edits clipboard regex end, customize: function(data) {

        // copies currently displayed and rows
        exportOptions: { columns: [":visible"], rows: [":visible"] },

        // copies currently displayed columns and rows,
        // "exportOptions: { modifier:{columns:[":visible"], rows: [":visible"]}"
        // needs .cards thead { visibility: hidden; } to work
      }, // end of copy customization

      {
        extend: "colvis",
        key: { key: "s", shiftKey: true },
        text: "އިތުރު ބަރިތައް",
        background: false /* removes background fade animation for collection */,
      }, // end of colvis

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
    ],
  }); // $("#fortyNawawi").DataTable( { - END
  // from here to END OF $(document).ready( function () { used to be empty

  // ====================
  //        SWIPE
  // ====================

  // https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
  // that was with jquery, then converted with: https://properprogramming.com/tools/jquery-to-javascript-converter/

  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);

  let xDown = null;
  let yDown = null;

  function getTouches(evt) {
    return (
      evt.touches || // browser API
      evt.originalEvent.touches
    ); // jQuery
  }

  function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /* most significant */
      if (xDiff > 0) {
        // left swipe
        table.page("previous").draw("page");
      } else {
        // right swipe */
        table.page("next").draw("page");
      }
    } /* else { // commented out otherwise detected as useless suspicious code
      if (yDiff > 0) {
        // up swipe
      } else {
        // down swipe
      }
    } */
    /* reset values */
    xDown = null;
    yDown = null;
  }
  // ==================== swipe - END

  // ScrollTop - If the user changes the page, scroll to the top
  // js media query on desktop
  if (window.matchMedia("(min-width: 900px)").matches) {
    $(".dataTable").on("page.dt", () => {
      $("html, body").animate(
        {
          scrollTop: 0,
        },
        "fast"
      ); // smoothen or ease this later ??
      $("main-content").focus();
      // need to set focus at top so DTBS doesn't scroll back to bottom

      const tempScrollTop = $(window).scrollTop();
      // console.log(`Scroll from Top: ${tempScrollTop.toString()}`);
    });
    // js media query on mobile, tablet
  } else {
    $(".dataTable").on("page.dt", () => {
      $("html, body").animate(
        {
          scrollTop: 195, //prev 0
        },
        "fast"
      );
      $("main-content").focus();
      const tempScrollTop = $(window).scrollTop();
    });
  } // end if else

  //= ====================
  // Add cards media query class to table ID, as well as row border
  // ====================

  if (window.matchMedia("(min-width: 900px)").matches) {
    // js media query on desktop
    /* previously $('fnClass').addClass('row-border')
    $('fnClass').addClass('cards') */
    $(".dataTable").addClass("row-border"), // adds rowborder class
      $("div.dataTables_filter input", table.table().container()).focus(); // autofocus search input on page load
  } else {
    // js media query on mobile, tablet
    $(".dataTable").addClass("cards");
  } // end if else
  //= =================== Add cards class to table ID - END

  // changes <input class="paginate_input" type="text"> type to search type,
  // so that delete icon appears
  $(".paginate_input").prop("type", "search");

  // adds a placeholder to above <input class="paginate_input" type="text">
  $(".paginate_input").attr("placeholder", "ސަފުހާ...");

  // makes footer visible after script finishes rendering
  $(document).ready(function () {
    $("#footer").removeClass("hidden");
  });

  // adds doubleclick select go to page search was on, with rowshowjs

  // * The code below now works, previously some update to searchpanes js broke it, and the code below the code below was a workaround, but now we can use the initial one
  // no longer old code

  $("tbody").on("dblclick", "tr", function () {
    if (table.search() !== "") {
      table.search("").draw();
    }
    table.row(this).draw().show().select().draw(false);
  });

  // removes diacritics and punctuation on key up for search
  $(".dataTables_filter input").on("keyup click", function () {
    var str = $(this).val();
    str = str.replace(
      /[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|.|،|!|؟|-|ـ|’|”|:|؛|/{|/}|/(|/)|/[|/]|«|»|]/g,
      ""
    );
    $(this).val(str);
    //table.search(str).draw();
    // commenting above out allows searchdelay to work with stringreplace
  });

  //
}); // ==================== END OF $(document).ready( function () {
