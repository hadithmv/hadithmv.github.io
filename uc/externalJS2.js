// This ensures that the code runs after the entire DOM has been fully loaded.
document.addEventListener("DOMContentLoaded", function () {
  //
  //
  Hammer(document.querySelector(".dataTable")).on("swipeleft", function () {
    table.page("previous").draw("page");
  });
  Hammer(document.querySelector(".dataTable")).on("swiperight", function () {
    table.page("next").draw("page");
  });
  //
  //
}); // document.addEventListener("DOMContentLoaded", function () { END
