/* === === ===
NESTED DROPDOWN CODE
=== === === */

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
  // Select the main dropdown container
  const dropdown = document.querySelector(".belowPage-bab-dropdown");

  // Only proceed if the dropdown exists on the page
  if (dropdown) {
    // Add a click event listener to the dropdown for event delegation
    dropdown.addEventListener("click", function (e) {
      // Prevent the default anchor tag behavior
      e.preventDefault();
      // Get the clicked element
      const target = e.target;

      // Check if the clicked element is an anchor tag
      if (target.tagName === "A") {
        // Get the parent list item of the clicked anchor
        const parent = target.parentElement;

        // Handle different click scenarios
        if (target.classList.contains("open-all")) {
          // If "open all" is clicked, open all dropdowns
          openAllDropdowns(dropdown);
        } else if (target.classList.contains("collapse-all")) {
          // If "collapse all" is clicked, collapse only sub-sub-dropdowns
          collapseSubSubDropdowns(dropdown);
        } else if (parent.querySelector("ul")) {
          // If the clicked item has a nested list, toggle its visibility
          parent.classList.toggle("active");
        } else if (target.hasAttribute("data-value")) {
          // If the clicked item has a data-value attribute, update URL and reload
          const value = target.getAttribute("data-value");
          // Update the URL hash
          window.location.hash = "#tableID=l1:p" + value;
          // Smoothly scroll to the top before reloading
          window.scrollTo({ top: 0, behavior: "smooth" });
          // Delay reload until after the smooth scroll completes
          setTimeout(() => {
            location.reload();
          }, 150); // Adjust the delay as needed
        }
      }
    });

    // Function to open all dropdowns
    function openAllDropdowns(rootElement) {
      // Select all list items in the dropdown
      const allItems = rootElement.querySelectorAll("li");
      allItems.forEach((item) => {
        // If the item contains a nested list, make it visible
        if (item.querySelector("ul")) {
          item.classList.add("active");
        }
      });
    }

    // Function to collapse only sub-sub-dropdowns
    function collapseSubSubDropdowns(rootElement) {
      // Select only the active sub-sub-dropdown items
      const subSubDropdowns = rootElement.querySelectorAll(
        "li > ul > li.active"
      );
      subSubDropdowns.forEach((item) => {
        // Remove the active class to collapse the sub-sub-dropdown
        item.classList.remove("active");
      });
    }
  }

  // Ensure the page is smoothly scrolled to the top after reload
  // This runs regardless of whether the dropdown exists
  window.scrollTo({ top: 0, behavior: "smooth" });
});
