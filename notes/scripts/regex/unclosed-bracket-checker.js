const fs = require("fs"); // Import the file system module to read and write files

/**
 * Checks if a string has balanced brackets, parentheses, and quotation marks
 * @param {string} text - The text to check for balanced symbols
 * @return {Object} Result containing whether the text is balanced, any unbalanced symbols, and their positions
 */
function isBalanced(text = "") {
  // Define paired symbols where each opening symbol has a corresponding closing symbol
  const pair = {
      "(": ")", // Parentheses
      "[": "]", // Square brackets
      "{": "}", // Curly braces
      '"': '"', // Double quotes (ASCII)
      "'": "'", // Single quotes (ASCII)
      "“": "”", // Left/Right double quotation marks (U+201C, U+201D)
      "‘": "’", // Left/Right single quotation marks (U+2018, U+2019)
      "«": "»", // Double angle quotes (U+00AB, U+00BB)
      "‹": "›", // Single angle quotes (U+2039, U+203A)
      "=": "=", // Equals sign (matches with itself)
    };
  };

  // List of all symbols we want to check for balance
  const brackets = ["(", ")", "[", "]", "{", "}", '"', "'", "="];

  // Stack to keep track of opening symbols and their positions
  const stack = [];

  // Track unbalanced symbols and their positions
  const unbalancedInfo = {
    balanced: true,
    symbols: [],
    positions: [],
  };

  // Iterate through each character in the input text
  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    // Check if the current character is one of our tracked symbols
    if (brackets.includes(c)) {
      // If we already have symbols on the stack
      if (stack.length > 0) {
        const lastItem = stack[stack.length - 1];
        // If the current character is the closing match for the symbol at the top of the stack
        if (pair[lastItem.symbol] === c) {
          stack.pop(); // Remove the opening symbol since we found its match
        } else if (c in pair) {
          // If this is a new opening symbol, add it to the stack with its position
          stack.push({ symbol: c, position: i });
        } else {
          // A closing symbol that doesn't match - record it
          unbalancedInfo.balanced = false;
          unbalancedInfo.symbols.push(c);
          unbalancedInfo.positions.push(i);
        }
      } else {
        // If the stack is empty (no pending opening symbols)
        if (c in pair) {
          // If this is an opening symbol, add it to the stack with its position
          stack.push({ symbol: c, position: i });
        } else {
          // If this is a closing symbol with no matching opening symbol
          unbalancedInfo.balanced = false;
          unbalancedInfo.symbols.push(c);
          unbalancedInfo.positions.push(i);
        }
      }
    }
  }

  // Add any remaining opening symbols from the stack to our unbalanced info
  if (stack.length > 0) {
    unbalancedInfo.balanced = false;
    for (const item of stack) {
      unbalancedInfo.symbols.push(item.symbol);
      unbalancedInfo.positions.push(item.position);
    }
  }

  return unbalancedInfo;
}

/**
 * Gets context around a position in text
 * @param {string} text - The full text
 * @param {number} position - The position of the character
 * @param {number} contextSize - Number of characters on each side to include
 * @return {string} The context string
 */

// Added a new getContext() function that extracts a portion of text around each problematic character (default 15 characters on each side), with ellipses to indicate when text is truncated.
// You can adjust the context size by changing the contextSize parameter in the getContext() function if you want to see more or less surrounding text.
function getContext(text, position, contextSize = 15) {
  const start = Math.max(0, position - contextSize);
  const end = Math.min(text.length, position + contextSize + 1);

  let context = text.substring(start, end);

  // Add ellipsis if we're not showing from the beginning or to the end
  if (start > 0) context = "..." + context;
  if (end < text.length) context = context + "...";

  return context;
}

/**
 * Main function that reads input file, checks each line for balanced symbols,
 * and writes unbalanced lines to output file with context
 */
function checkBalancedBrackets() {
  console.log("Starting bracket balance check..."); // Log start of process
  const startTime = Date.now(); // Record start time for performance measurement

  try {
    // Attempt to read the input file and split it into an array of lines
    const inputLines = fs.readFileSync("input.txt", "utf8").split("\n");
    console.log(`Read ${inputLines.length} lines from input.txt`); // Log how many lines were read

    // Array to store lines that have unbalanced symbols
    const unbalancedLines = [];

    // Process each line from the input file
    for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
      let line = inputLines[lineIndex].trim(); // Remove whitespace from start and end of line
      if (line.length === 0) continue; // Skip empty lines

      // Check if the current line has balanced symbols
      const result = isBalanced(line);

      // If the line has unbalanced symbols, add it to our results
      if (!result.balanced) {
        // Get contexts for each unbalanced symbol
        const contexts = result.positions.map((pos) => {
          const context = getContext(line, pos);
          return `${
            result.symbols[result.positions.indexOf(pos)]
          } in context: "${context}"`;
        });

        // Format the unbalanced information for the output
        const unbalancedInfo = contexts.join(", ");

        // Add the unbalanced line to our results with context information
        unbalancedLines.push(`${line} !!! unbalanced : [${unbalancedInfo}]`);
      }
    }

    // Write all unbalanced lines to the output file
    fs.writeFileSync("output.txt", unbalancedLines.join("\n"));

    // Log how many unbalanced lines were found
    console.log(
      `Found ${unbalancedLines.length} lines with unbalanced brackets`
    );
  } catch (error) {
    // If any errors occur during file reading/writing or processing,
    // log the error to the console
    console.error("Error processing files:", error);
  }

  // Calculate and log the execution time
  const endTime = Date.now();
  console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
}

// Execute the main function when the script is run
checkBalancedBrackets();
