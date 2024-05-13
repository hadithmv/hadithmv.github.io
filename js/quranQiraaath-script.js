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

  // cgpt code, this takes a split 2 2d nested arrays and joins them together rowwise, then generates empty values where needed, not null, then flattens them, so now the db can be broken down and reused
  // This code will create empty values when merging, ensuring that the resulting 2D array has consistent dimensions, and it will then flatten the result into a single flat array.

  function fullJoinRowWise2DFlattenWithEmptyValues(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);

    return Array.from({ length: maxLength }, (_, index) =>
      [].concat(
        Array.isArray(arr1[index])
          ? arr1[index]
          : Array(arr2[index].length).fill(""),
        Array.isArray(arr2[index])
          ? arr2[index]
          : Array(arr1[index].length).fill("")
      )
    );
  }

  const mergedData = fullJoinRowWise2DFlattenWithEmptyValues(
    surah_juz_basmalah_ayah_uthmani_DB,
    quran_DB
  );
  //console.log(mergedData);
  // merge ends here

  const table = $("#quranTable").DataTable({
    // var table = $("#fortyNawawi").DataTable({
    // NOT DataTable();

    // CHANGE123 JSON
    //data: quranHmv_DB, // https://datatables.net/manual/ajax
    data: mergedData,

    columns: [
      {
        data: 0,
        title: "ސޫރަތުގެ ނަން",
        render: function (data, type, row) {
          // makes surah numbers into names
          data = data
            // without preceding digits here, and in the db, it would keep overriding itself
            .replace("001", "𝟣 سُورَةُ الفَاتِحَة")
            .replace("002", "𝟤 سُورَةُ البَقَرَة")
            .replace("003", "𝟥 سُورَةُ آل عِمرَان")
            .replace("004", "𝟦 سُورَةُ النِّسَاء")
            .replace("005", "𝟧 سُورَةُ المَائِدَة")
            .replace("006", "𝟨 سُورَةُ الأَنعَام")
            .replace("007", "𝟩 سُورَةُ الأَعرَاف")
            .replace("008", "𝟪 سُورَةُ الأَنفَال")
            .replace("009", "𝟫 سُورَةُ التَّوبَة")
            .replace("010", "𝟣𝟢 سُورَةُ يُونُس")
            .replace("011", "𝟣𝟣 سُورَةُ هُود")
            .replace("012", "𝟣𝟤 سُورَةُ يُوسُف")
            .replace("013", "𝟣𝟥 سُورَةُ الرَّعد")
            .replace("014", "𝟣𝟦 سُورَةُ إِبرَاهِيم")
            .replace("015", "𝟣𝟧 سُورَةُ الحِجر")
            .replace("016", "𝟣𝟨 سُورَةُ النَّحل")
            .replace("017", "𝟣𝟩 سُورَةُ الإِسرَاء")
            .replace("018", "𝟣𝟪 سُورَةُ الكَهف")
            .replace("019", "𝟣𝟫 سُورَةُ مَريَم")
            .replace("020", "𝟤𝟢 سُورَةُ طه")
            .replace("021", "𝟤𝟣 سُورَةُ الأَنبِيَاء")
            .replace("022", "𝟤𝟤 سُورَةُ الحَجّ")
            .replace("023", "𝟤𝟥 سُورَةُ المُؤمِنُون")
            .replace("024", "𝟤𝟦 سُورَةُ النُّور")
            .replace("025", "𝟤𝟧 سُورَةُ الفُرقَان")
            .replace("026", "𝟤𝟨 سُورَةُ الشُّعَرَاء")
            .replace("027", "𝟤𝟩 سُورَةُ النَّمل")
            .replace("028", "𝟤𝟪 سُورَةُ القَصَص")
            .replace("029", "𝟤𝟫 سُورَةُ العَنكَبُوت")
            .replace("030", "𝟥𝟢 سُورَةُ الرُّوم")
            .replace("031", "𝟥𝟣 سُورَةُ لُقمَان")
            .replace("032", "𝟥𝟤 سُورَةُ السَّجدَة")
            .replace("033", "𝟥𝟥 سُورَةُ الأَحزَاب")
            .replace("034", "𝟥𝟦 سُورَةُ سَبَإ")
            .replace("035", "𝟥𝟧 سُورَةُ فَاطِر")
            .replace("036", "𝟥𝟨 سُورَةُ يسٓ")
            .replace("037", "𝟥𝟩 سُورَةُ الصَّافَّات")
            .replace("038", "𝟥𝟪 سُورَةُ صٓ")
            .replace("039", "𝟥𝟫 سُورَةُ الزُّمَر")
            .replace("040", "𝟦𝟢 سُورَةُ غَافِر")
            .replace("041", "𝟦𝟣 سُورَةُ فُصِّلَت")
            .replace("042", "𝟦𝟤 سُورَةُ الشُّورَى")
            .replace("043", "𝟦𝟥 سُورَةُ الزُّخرُف")
            .replace("044", "𝟦𝟦 سُورَةُ الدُّخَان")
            .replace("045", "𝟦𝟧 سُورَةُ الجَاثِيَة")
            .replace("046", "𝟦𝟨 سُورَةُ الأَحقَاف")
            .replace("047", "𝟦𝟩 سُورَةُ مُحَمَّد")
            .replace("048", "𝟦𝟪 سُورَةُ الفَتح")
            .replace("049", "𝟦𝟫 سُورَةُ الحُجُرَات")
            .replace("050", "𝟧𝟢 سُورَةُ قٓ")
            .replace("051", "𝟧𝟣 سُورَةُ الذَّارِيَات")
            .replace("052", "𝟧𝟤 سُورَةُ الطُّور")
            .replace("053", "𝟧𝟥 سُورَةُ النَّجم")
            .replace("054", "𝟧𝟦 سُورَةُ القَمَر")
            .replace("055", "𝟧𝟧 سُورَةُ الرَّحمٰن")
            .replace("056", "𝟧𝟨 سُورَةُ الوَاقِعَة")
            .replace("057", "𝟧𝟩 سُورَةُ الحَدِيد")
            .replace("058", "𝟧𝟪 سُورَةُ المُجَادِلَة")
            .replace("059", "𝟧𝟫 سُورَةُ الحَشر")
            .replace("060", "𝟨𝟢 سُورَةُ المُمتَحَنَة")
            .replace("061", "𝟨𝟣 سُورَةُ الصَّفّ")
            .replace("062", "𝟨𝟤 سُورَةُ الجُمعَة")
            .replace("063", "𝟨𝟥 سُورَةُ المُنَافِقُون")
            .replace("064", "𝟨𝟦 سُورَةُ التَّغَابُن")
            .replace("065", "𝟨𝟧 سُورَةُ الطَّلَاق")
            .replace("066", "𝟨𝟨 سُورَةُ التَّحرِيم")
            .replace("067", "𝟨𝟩 سُورَةُ المُلك")
            .replace("068", "𝟨𝟪 سُورَةُ القَلَم")
            .replace("069", "𝟨𝟫 سُورَةُ الحَاقَّة")
            .replace("070", "𝟩𝟢 سُورَةُ المَعَارِج")
            .replace("071", "𝟩𝟣 سُورَةُ نُوح")
            .replace("072", "𝟩𝟤 سُورَةُ الجِنّ")
            .replace("073", "𝟩𝟥 سُورَةُ المُزَّمِّل")
            .replace("074", "𝟩𝟦 سُورَةُ المُدَّثِّر")
            .replace("075", "𝟩𝟧 سُورَةُ القِيَامَة")
            .replace("076", "𝟩𝟨 سُورَةُ الإِنسَان")
            .replace("077", "𝟩𝟩 سُورَةُ المُرسَلَات")
            .replace("078", "𝟩𝟪 سُورَةُ النَّبَإ")
            .replace("079", "𝟩𝟫 سُورَةُ النَّازِعَات")
            .replace("080", "𝟪𝟢 سُورَةُ عَبَس")
            .replace("081", "𝟪𝟣 سُورَةُ التَّكوِير")
            .replace("082", "𝟪𝟤 سُورَةُ الانفِطَار")
            .replace("083", "𝟪𝟥 سُورَةُ المُطَفِّفِين")
            .replace("084", "𝟪𝟦 سُورَةُ الانشِقَاق")
            .replace("085", "𝟪𝟧 سُورَةُ البُرُوج")
            .replace("086", "𝟪𝟨 سُورَةُ الطَّارِق")
            .replace("087", "𝟪𝟩 سُورَةُ الأَعلَى")
            .replace("088", "𝟪𝟪 سُورَةُ الغَاشِيَة")
            .replace("089", "𝟪𝟫 سُورَةُ الفَجر")
            .replace("090", "𝟫𝟢 سُورَةُ البَلَد")
            .replace("091", "𝟫𝟣 سُورَةُ الشَّمس")
            .replace("092", "𝟫𝟤 سُورَةُ اللَّيل")
            .replace("093", "𝟫𝟥 سُورَةُ الضُّحَى")
            .replace("094", "𝟫𝟦 سُورَةُ الشَّرح")
            .replace("095", "𝟫𝟧 سُورَةُ التِّين")
            .replace("096", "𝟫𝟨 سُورَةُ العَلَق")
            .replace("097", "𝟫𝟩 سُورَةُ القَدر")
            .replace("098", "𝟫𝟪 سُورَةُ البَيِّنَة")
            .replace("099", "𝟫𝟫 سُورَةُ الزَّلزَلَة")
            .replace("100", "𝟣𝟢𝟢 سُورَةُ العَادِيَات")
            .replace("101", "𝟣𝟢𝟣 سُورَةُ القَارِعَة")
            .replace("102", "𝟣𝟢𝟤 سُورَةُ التَّكَاثُر")
            .replace("103", "𝟣𝟢𝟥 سُورَةُ العَصر")
            .replace("104", "𝟣𝟢𝟦 سُورَةُ الهُمَزَة")
            .replace("105", "𝟣𝟢𝟧 سُورَةُ الفِيل")
            .replace("106", "𝟣𝟢𝟨 سُورَةُ قُرَيش")
            .replace("107", "𝟣𝟢𝟩 سُورَةُ المَاعُون")
            .replace("108", "𝟣𝟢𝟪 سُورَةُ الكَوثَر")
            .replace("109", "𝟣𝟢𝟫 سُورَةُ الكَافِرُون")
            .replace("110", "𝟣𝟣𝟢 سُورَةُ النَّصر")
            .replace("111", "𝟣𝟣𝟣 سُورَةُ المَسَد")
            .replace("112", "𝟣𝟣𝟤 سُورَةُ الإِخلَاص")
            .replace("113", "𝟣𝟣𝟥 سُورَةُ الفَلَق")
            .replace("114", "𝟣𝟣𝟦 سُورَةُ النَّاس");
          return data;
        },
      },
      {
        data: 1,
        title: "ޖުޒް #",
        render: function (data, type, row) {
          // makes juz numbers into MATHEMATICAL SANS-SERIF BOLD DIGIT
          data = data
            .replaceAll("1", "𝟭")
            .replaceAll("2", "𝟮")
            .replaceAll("3", "𝟯")
            .replaceAll("4", "𝟰")
            .replaceAll("5", "𝟱")
            .replaceAll("6", "𝟲")
            .replaceAll("7", "𝟳")
            .replaceAll("8", "𝟴")
            .replaceAll("9", "𝟵")
            .replaceAll("0", "𝟬");
          return data;
        },
      },
      {
        data: 2,
        title: "އާޔަތް #",
      },
      {
        data: 3,
        title: "ބިސްމި",
      },
      {
        data: 4,
        title: "ގުރްއާން އަރަބިން",
        render: function (data, type, row) {
          data = data.replace(/\s([\u0660-\u0669]+)/, "\u00a0$1");
          /* add brackets to ayah */
          //data = "﴿" + data + "﴾";
          // combines ayah and number columns together
          data = "﴿" + data + " " + row[2] + "﴾";
          // makes ayah numbers arabic
          // previously used just .replace and where the number was double of the same digit like 66, it would only replace the first time
          data = data
            .replaceAll("1", "١")
            .replaceAll("2", "٢")
            .replaceAll("3", "٣")
            .replaceAll("4", "٤")
            .replaceAll("5", "٥")
            .replaceAll("6", "٦")
            .replaceAll("7", "٧")
            .replaceAll("8", "٨")
            .replaceAll("9", "٩")
            .replaceAll("0", "٠");
          return data;
        },
      },
      {
        data: 4,
        title: "ގުރްއާން ފިލިނުޖަހާ",
        render: function (data, type, row) {
          data = data.replace(/\s([\u0660-\u0669]+)/, "\u00a0$1");
          //data = "﴿" + data + "﴾";
          // replaces basmalas opening closing brackets non breaks, then kashida, then arabic numbers, then space, then br tag, then makes two spaces into one
          return data
            .replace(/ـ/g, "")
            .replace(/[^\u0621-\u064A|\s|<br class="br">]/g, "")
            .replace(/\s\s/g, " ");
        },
      },
      {
        data: 5,
        title: "ރަސްމު އުޘްމާނީ",
        render: function (data, type, row) {
          data = data.replace(/\s([\u0660-\u0669]+)/, "\u00a0$1");
          data = "﴿" + data + " " + row[2] + "﴾";
          data = data
            .replace("1", "١")
            .replace("2", "٢")
            .replace("3", "٣")
            .replace("4", "٤")
            .replace("5", "٥")
            .replace("6", "٦")
            .replace("7", "٧")
            .replace("8", "٨")
            .replace("9", "٩")
            .replace("0", "٠");
          return data;
        },
      },
      {
        data: 6,
        title: "ތަފުސީރު", // ubufili on faafu, otherwise interferes with clipboard tite copy
      },
    ],

    /* https://datatables.net/reference/option/columnDefs */
    columnDefs: [
      // footnote line after tharujama
      /*{
          targets: 7,
          render: function (data, type, row) {
            data = data + '<br class="Qbr">‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾<br class="LQbr">';
            return data.replace(/\r\n|\n|\r/g, '\t<br class="br">'); // without this line breaks not preserved
          },
        },*/

      /* replace \n newlines from json to <br> in table
        https://datatables.net/forums/discussion/44399/how-can-i-show-multiple-lines-in-cell */
      {
        targets: "_all",
        render: function (data, type, row) {
          return data.replace(/\n/g, '\t<br class="br">');
        }, // added space before br, otherwise clipboard copy export has no space
      }, // later changed that blank space into a \t, so that single new lines could work on clipboard copy
      // previously just \n. added \r\n and \r to make lines break on mobile

      // classes columns for css in nweb view, but not print.
      // CHANGE123 COL CLASSES AND VISIBILITY/SEARCHABLE

      {
        className: "qCol1", // surah name
        targets: [0],
        visible: true,
        searchable: true,
        searchPanes: {
          show: true,
        },
      },
      {
        className: "qCol2", // juz #
        targets: [1],
        visible: false,
        searchable: true,
        searchPanes: {
          show: true,
        },
      },
      {
        className: "qCol3", // ayah #
        targets: [2],
        visible: false,
        searchable: true,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "qCol4", // basmala
        targets: [3],
        visible: true,
        searchable: true,
        searchPanes: {
          show: true,
        },
      },
      {
        className: "qCol5", // quran tanzil
        targets: [4],
        visible: true,
        searchable: false,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "qCol6", // quran plain
        targets: [5],
        visible: false,
        searchable: true,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "qCol7", // quran uthmani
        targets: [6],
        visible: false,
        searchable: false,
        searchPanes: {
          show: false,
        },
      },
      {
        className: "qCol8", // tafsir
        targets: [7],
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
      [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300],
      ["1 ދައްކާ", 2, 3, 5, 10, 20, 30, 50, 100, 200, "300"],
    ],
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
      zeroRecords: "<br><br><br><br>— ނުފެނުނު —<br><br><br><br>",
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
        messageTop: "التفسير الميسر للقرآن الكريم", // CHANGE123 clipboard message
        title: "" /* title: "hadithmv.com", */,

        //= ====================
        // edits clipboard regex, code to manipulate the data string as desired
        // ====================
        customize(data) {
          data = data.replace(/\r\n|\n/g, "\t");
          // \r\n prevents first header showing up unneeded (windows)
          // \n prevents first header showing up unneeded (linux) this needs come after windows rn

          data = data.replace(/ސޫރަތުގެ ނަން\t/g, ""); // should be this way instead of /\tފޮތް/
          data = data.replace(/ޖުޒް #\t/g, "");
          data = data.replace(/އާޔަތް #\t/g, "");
          data = data.replace(/ބިސްމި\t/g, "");
          data = data.replace(/ގުރްއާން އަރަބިން\t/g, "");
          data = data.replace(/ގުރްއާން ފިލިނުޖަހާ\t/g, "");
          data = data.replace(/ރަސްމު އުޘްމާނީ\t/g, "");
          data = data.replace(/ތަފުސީރު\t/g, "");
          //data = data.replace(/\t‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾/g, '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n') // adds a line break after takhrij line, use two for a new line
          data = data.replace(
            /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\t/g,
            "\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n"
          );

          data = data.replace(/\t\t/g, "\t");
          // This prevents a double or more line breaks when columns are hidden

          data = data.replace(/\n\n\n\n|\n\n\n|\t|\s\s/g, "\n\n");

          data = data.replace(/𝟢 |𝟣 |𝟤 |𝟥 |𝟦 |𝟧 |𝟨 |𝟩 |𝟪 |𝟫 /g, ""); // removes these alt numbers from surah name
          data = data.replace(/𝟢|𝟣|𝟤|𝟥|𝟦|𝟧|𝟨|𝟩|𝟪|𝟫/g, ""); // removes these alt numbers from surah name

          //console.log(JSON.stringify(data)) // json stringify to console

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
          scrollTop: 245, //prev 0 // 148 // 178
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
    // CUT FOR QURAN $('.dataTable').addClass('row-border'), // adds rowborder class
    $("div.dataTables_filter input", table.table().container()).focus(); // autofocus search input on page load
    // $('.dataTable').addClass('cards') // ADDED FOR QURAN
    // } else {
    // js media query on mobile, tablet
    // $('.dataTable').addClass('cards')
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

  /* $("tbody").on("dblclick", "tr", function () {
      if (table.search() !== "") {
        table.search("").draw();
      }
      table.row(this).draw().show().select().draw(false);
    });*/

  // $(selector).on(event, childSelector, data, function, map)

  $(".dataTable").on("dblclick", "tr", function () {
    if (table.search() !== "") {
      table.search("").draw();
      // this clears the search after code below runs to draw the page, otherwise searches again and doesnt go to that page.
    }
    table.row(this).draw().show().select().draw(false);

    //table.row("tbody tr").draw().show().select().draw(false); //page 1 reset
    //console.log("01010101");
    //console.log(this);
    //console.log(table.page());
    // alert("Row index: " + table.row(this).index());
    //alert("Row index: " + table.row("tbody tr").index());
    //table.page(table.page() + 10).draw("page");
  });

  /*$("tbody").on("click", "tr", function () {
      // table.search(this.value).draw();
      //table.search("بقرة").draw();
      table.search("بقرة").draw().show().select().draw(false);
    });*/

  //console.log("01010101");

  // removes diacritics and punctuation on key up for search
  $(".dataTables_filter input").on("keyup click", function () {
    var str = $(this).val();
    str = str
      .replace(
        "﴿بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n",
        'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n<br class="br"><br class="br">﴿'
      )
      .replace(
        "﴿بِّسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n",
        'بِّسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n<br class="br"><br class="br">﴿'
      )
      .replace(/ـ/g, "")
      .replace(
        /[^\u0621-\u064A|^\u0780-\u07B1|^\uFDF2|^\uFDFA|^\d|^𝟣||^𝟣|^𝟤|^𝟥|^𝟦|^𝟧|^𝟨|^𝟩|^𝟪|^𝟫|^𝟢|\s|<br class="br">]/g,
        ""
      )
      .replace(/\s\s/g, " ");
    $(this).val(str);
    // ^\u0621-\u064A is except for arabic normal letters
    // ^\u0780-\u07B1 is except for thaana letters
    // ^\uFDF2|^\uFDFA is ﷲ and ﷺ
    //table.search(str).draw();
    // commenting above out allows searchdelay to work with stringreplace
  });

  // every time page draws, surah and ayah box update to extract surah and ayah values, the word surah is removed, and arabic numbers are turned into regular digits
  // https://stackoverflow.com/questions/7407111/detect-page-change-on-datatable/34995105#34995105
  $("#quranTable").on("draw.dt", function () {
    document.getElementById("surahNameID").value = document
      .getElementsByClassName("qCol1")[1]
      .innerText.replace(/سُورَةُ /g, "");
    // previously /سورة /g // but that broke surah name from showing in jump box
    /*document.getElementById("ayahNoID").value =
        document.getElementsByClassName("qCol4")[1].innerText;*/
    document.getElementById("ayahNoID").value = document
      .getElementsByClassName("qCol5")[1]
      .innerText.replace(/[^١|٢|٣|٤|٥|٦|٧|٨|٩|٠]/g, "")
      .replace(/٠/g, "0")
      .replace(/١/g, "1")
      .replace(/٢/g, "2")
      .replace(/٣/g, "3")
      .replace(/٤/g, "4")
      .replace(/٥/g, "5")
      .replace(/٦/g, "6")
      .replace(/٧/g, "7")
      .replace(/٨/g, "8")
      .replace(/٩/g, "9");
  });

  //
}); // ==================== END OF $(document).ready( function () {
