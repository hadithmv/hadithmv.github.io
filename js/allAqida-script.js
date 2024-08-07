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

  // PART 0
  // DFK BARBARI ONLY TEXT MERGE
  // Ensure both arrays have the same number of rows
  const numRows = Math.max(barbahari_DB.length, barbahariDFK_DB.length);
  //const resultbarbahariDFK = [];
  resultbarbahariDFK = [];
  for (let i = 0; i < numRows; i++) {
    const row1 = barbahari_DB[i] || [];
    const row2 = barbahariDFK_DB[i] || [];
    const col1 = row1[0] || "";
    const col5 = row1[4] || "";
    const col7 = row1[6] || "";
    const combinedRow = [col1, col5, col7, ...row2];
    resultbarbahariDFK.push(combinedRow);
  }
  // end barbahari text merge

  //

  // PART 1
  // cgpt code, this part removes the specified columns entirely
  // In this modified code, you can specify the columnsToRemove array at the end of the code, allowing you to easily change which columns you want to remove without modifying the function itself. This provides more flexibility when working with different 2D arrays and column selections.

  function removeColumns(arr, columnIndices) {
    return arr.map((row) => {
      return row.filter((_, index) => !columnIndices.includes(index));
    });
  }

  // THESE REMOVE COLUMNS, NOT ADD!!
  //const result = removeColumns(twoDArray, columnsToRemove); // [1, 3];

  resultusooluSunnah = removeColumns(usooluSunnah_DB, [4, 5]);
  resultbarbahari = removeColumns(barbahari_DB, [1, 2, 3, 7, 8]);
  //resultbarbahariDFK = removeColumns(barbahariDFK_DB, []);

  resultaqidatuRaziyain = removeColumns(aqidatuRaziyain_DB, [3]);
  resultkitabulEman = removeColumns(kitabulEman_DB, [3, 6, 7]);
  /* this actually has 8 columns, yet it forces me to choose 4 and subtract 4 of them for some reason
  0 no, 1 ar baab, 2 ar, 3 ar foot, 4 dv bab, 5 dv, 6 dv foot, 7 page no
  currently subtracted: ar baab, ar foot, dv foot, page no
  so i added an extra data input, and a columnName, for harawi. this should let me get 5 columns in now */
  resultnawaqidulislam = removeColumns(nawaqidulislam_DB, [2, 6, 7, 8]);
  resultqawaidulArbau = removeColumns(qawaidulArbau_DB, [2, 6, 7, 8]);
  resultusooluSiththa = removeColumns(usooluSiththa_DB, [2, 6, 7, 8]);
  resultusooluThalaatha = removeColumns(usooluThalaatha_DB, [2, 6, 7, 8]);

  //console.log(result);

  //

  // PART 2
  // cgpt code, this part inserts a specific value into the first column
  // In this code, the insertValueInFirstColumn function uses the map method to iterate through each row of the 2D array. For each row, it adds the specified valueToInsert ('hey') to the beginning of the row, effectively inserting a new column with the same value in the first column position of each row.

  function insertValueInFirstColumn(arr, valueToInsert) {
    return arr.map((row) => [valueToInsert, ...row]);
  }
  resultusooluSunnah = insertValueInFirstColumn(
    resultusooluSunnah,
    "أصول السنة لأحمد"
  );
  resultbarbahari = insertValueInFirstColumn(
    resultbarbahari,
    "شرح السنة للبربهاري"
  );

  resultbarbahariDFK = insertValueInFirstColumn(
    resultbarbahariDFK,
    "شرح السنة للبربهاري DFK"
  );
  resultaqidatuRaziyain = insertValueInFirstColumn(
    resultaqidatuRaziyain,
    "عقيدة الرازيين"
  );
  resultkitabulEman = insertValueInFirstColumn(
    resultkitabulEman,
    "كتاب الإيمان لأبي عبيد"
  );
  resultnawaqidulislam = insertValueInFirstColumn(
    resultnawaqidulislam,
    "نواقض الإسلام"
  );
  resultqawaidulArbau = insertValueInFirstColumn(
    resultqawaidulArbau,
    "القواعد الأربع"
  );
  resultusooluSiththa = insertValueInFirstColumn(
    resultusooluSiththa,
    "الأصول الستة"
  );
  resultusooluThalaatha = insertValueInFirstColumn(
    resultusooluThalaatha,
    "الأصول الثلاثة"
  );
  //console.log(result);
  // END BOOK

  //

  // PART 3
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

  // improved code for below
  const resultSets = [
    resultusooluSunnah,
    resultbarbahari,
    resultaqidatuRaziyain,
    resultkitabulEman,
    resultnawaqidulislam,
    resultqawaidulArbau,
    resultusooluSiththa,
    resultusooluThalaatha,
    // below should always be last
    resultbarbahariDFK,
  ];

  // ADDED a json object with 6 rows to make this part work for allAqida as it did for allAthar. I dont think 6 is a necessity for it to work, as increasing in doesnt change the data entry.
  const allAthar_DB = [
    [
      "شرح السنة للبربهاري",
      "1",
      "اعْلَمُوا أَنَّ الْإِسْلَامَ هُوَ السُّنَّةُ، وَالسُّنَةَ هِيَ الْإِسْلَامُ، وَلَا يَقُومُ أَحَدُهُمَا إِلَّا بِالْآخَرِ.",
      "ތިޔަބައިމީހުން ދަންނާށެވެ. އިސްލާމް ދީނަކީ ސުންނަތެވެ. އަދި ސުންނަތަކީ އިސްލާމް ދީނެވެ. އަދި އެ ދޭތިން ކުރެ އެއް ކަމެއް، އަނެއް ކަމަކާ ލައިގެން މެނުވީ ގާއިމު ނުވާހުއްޓެވެ.",
      "",
      "",
    ],
  ];

  let combResult = allAthar_DB;

  resultSets.forEach((resultSet) => {
    combResult = appendRowsWithEmptyValues(combResult, resultSet);
  });

  // initially taken from radheef
  /*combResult = appendRowsWithEmptyValues(allAthar_DB, resultNawawi);
    combResult = appendRowsWithEmptyValues(combResult, resultUmdah);
    combResult = appendRowsWithEmptyValues(combResult, resultBulugh);*/
  //console.log(result);
  // end merge

  const table = $("#allAqidaTable").DataTable({
    // var table = $("#allAthar").DataTable({
    // NOT DataTable();

    // CHANGE123 JSON
    data: combResult, // https://datatables.net/manual/ajax

    columns: [
      {
        data: 0,
        title: "ފޮތް އަރަބިން",
      },
      {
        data: 0,
        title: "ފޮތް ދިވެހިން",
        render: function (data, type, row) {
          // return data.replace(/َ/g, '').replace(/ِ/g, '') below code is shorter, no replace repeat, uses OR instead
          data = data.replace(
            "أصول السنة لأحمد",
            "އަޙްމަދު ލިޔުނު ސުންނަތުގެ އުސޫލުތައް"
          );
          data = data.replace(
            "شرح السنة للبربهاري",
            "ބަރްބަހާރީ ލިޔުނު ސުންނަތުގެ ޝަރަހަ"
          );
          data = data.replace("عقيدة الرازيين", "ދެ ރާޒީންގެ އަގީދާ");
          data = data.replace(
            "كتاب الإيمان لأبي عبيد",
            "އަބޫ ޢުބައިދުގެ އީމާންކަމުގެ ފޮތް"
          );
          data = data.replace("نواقض الإسلام", "އިސްލާމްކަން ގެއްލޭ ކަންތައް");
          data = data.replace("القواعد الأربع", "ހަތަރު ގަވާއިދު");
          data = data.replace("الأصول الستة", "ހަ އުސޫލު");
          data = data.replace("الأصول الثلاثة", "ތިން އުސޫލު");
          return data;
        },
      },
      /* add # string to hadith no */
      {
        data: 1,
        title: "#",
        render: function (data, type, row) {
          // return data.replace(/َ/g, '').replace(/ِ/g, '') below code is shorter, no replace repeat, uses OR instead
          return "#" + data;
        },
      },
      {
        data: 2,
        title: "އަރަބި ލިޔުން",
      },
      {
        data: 2,
        title: "އަރަބި ފިލިނުޖަހައި",
        render: function (data, type, row) {
          return data
            .replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "")
            .replace(/(\n)/g, '<br class="br">'); // prev just "<br>", but that eliminated the custom space i gave to the br class
        },
      },
      {
        data: 3,
        title: "ދިވެހި ތަރުޖަމާ",
      },
      {
        data: 4,
        title: "ތަޚްރީޖު",
      },
      {
        data: 5,
        title: "އިތުރު ބަރި", // extra column i need for harawi, dv footnotes?
      },
    ],

    /* https://datatables.net/reference/option/columnDefs */
    columnDefs: [
      // adds footnote line for shurooh
      // if (data !== "") { } else { return data; } ONLY applies if string is not empty
      {
        // havent quite figured out how to get this right yet, so many different books have different layouts now
        targets: [], // 6, but non takhrij texts are there in this, unlike allAthar
        render: function (data, type, row) {
          if (data !== "") {
            data = "‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾<br>" + data;
            return data.replace(/\r\n|\n|\r/g, '\t<br class="br">'); // without this line breaks not preserved
          } else {
            return data; // return empty string if data is empty
          }
        },
      },

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
        className: "ColKitab", // book
        targets: [0],
        visible: true,
        searchable: true,
        searchPanes: {
          show: true,
        },
      },
      {
        className: "ColKitab2", // book dv
        targets: [1],
        visible: false,
        searchable: true,
        searchPanes: {
          show: true,
        },
      },
      {
        className: "Col1", // #
        targets: [2],
        visible: true,
        searchable: true,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "allHCol4", // Ar Text
        targets: [3],
        visible: false,
        searchable: false,
      },
      {
        className: "allHCol5", // Ar Text Plain
        targets: [4],
        visible: true,
        searchable: true,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "allHCol6", // Dv Text
        targets: [5],
        visible: true,
        searchable: true,
        searchPanes: {
          show: false,
        },
      },
      {
        //className: "ColTakhrij", // takhrij
        className: "allHCol7", // because non takhrij texts are there too, unlik allAthar
        targets: [6],
        visible: true,
        searchable: true, //false previously, as it was for actually only takhrij in allAthar
        searchPanes: {
          show: false,
        },
      },
      {
        // extra column for harawi
        className: "allHCol8",
        targets: [6],
        visible: true,
        searchable: true,
        searchPanes: {
          show: false,
        },
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
    ordering: false,

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
      [1, 2, 3, 5],
      ["1 ދައްކާ", 2, 3, 5],
    ],
    //lengthMenu: [[1, 2, 3, 5, 10, 20, 30, 50], ['1 ދައްކާ', 2, 3, 5, 10, 20, 30, '50']],
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
        emptyMessage: "— ވަކި އެއްޗެއް ނުޖަހާ —",
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
        messageTop: "ޙަދީޘްއެމްވީ - އެއްކުރަމުންދާ އަޘަރުތައް", // CHANGE123 clipboard message
        title: "" /* title: "hadithmv.com", */,

        //= ====================
        // edits clipboard regex, code to manipulate the data string as desired
        // ====================
        customize(data) {
          data = data.replace(/\r\n|\n/g, "\t");
          // \r\n prevents first header showing up unneeded (windows)
          // \n prevents first header showing up unneeded (linux) this needs come after windows rn

          data = data.replace(/ފޮތް އަރަބިން\t/g, ""); // should be this way instead of /\tފޮތް/
          data = data.replace(/ފޮތް ދިވެހިން\t/g, "");
          data = data.replace(/#\t/g, ""); // should be this way instead of /\tފޮތް/
          data = data.replace(/އަރަބި ލިޔުން\t/g, "");
          data = data.replace(/އަރަބި ފިލިނުޖަހައި\t/g, "");
          data = data.replace(/ދިވެހި ތަރުޖަމާ\t/g, "");
          data = data.replace(/ތަޚްރީޖު\t/g, "");
          data = data.replace(/އިތުރު ބަރި\t/g, ""); // extra for harawi
          data = data.replace(
            /\t‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾/g,
            "\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n"
          ); // adds a line break after takhrij line, use two for a new line

          data = data.replace(/\t\t/g, "\t");
          // This prevents a double or more line breaks when columns are hidden

          data = data.replace(/\n\n\n\n|\n\n\n|\t|\s\s/g, "\n\n");

          // console.log(JSON.stringify(data)) // json stringify to console

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
        extend: "searchPanes",
        key: { key: "f", shiftKey: true },
        /* Multiselect on clicking only works with Pfrtip Dom not for Bfrtip Dom how can we use it with bfrtip Dom ?
          need to put the SearchPanes configuration into the buttons config option.
          https://datatables.net/extensions/searchpanes/examples/customisation/buttonConfig.html */
        config: {
          collapse: false,
          orderable: false,
          //order: ['صحيح البخاري', 'صحيح مسلم', 'سنن أبي داود', 'سنن الترمذي', 'سنن النسائي', 'سنن ابن ماجه', 'موطأ مالك', 'مسند الدارمي', 'مسند أحمد', ]
          columns: [0, 1],
          cascadePanes: true,
          dtOpts: {
            select: {
              style: "multi",
            },
            ordering: false,
            /* order: [[1, 'desc']] */
          },
        },
      },

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
          scrollTop: 195, //prev 0 / 148
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
