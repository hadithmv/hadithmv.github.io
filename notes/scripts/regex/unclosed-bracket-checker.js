const fs = require("fs"); // Import the file system module to read and write files

/**
 * Checks if a string has balanced brackets, parentheses, and quotation marks
 * @param {string} text - The text to check for balanced symbols
 * @return {Object} Result containing whether the text is balanced and any unbalanced symbols
 */
function isBalanced(text = "") {
  // Define paired symbols where each opening symbol has a corresponding closing symbol
  const pair = {
    "(": ")", // Parentheses
    "[": "]", // Square brackets
    "{": "}", // Curly braces
    '"': '"', // Double quotes
    "'": "'", // Single quotes
    "“": "”", // Curly quotes
    "=": "=", // Equals sign (matches with itself)
  };

  // List of all symbols we want to check for balance
  const brackets = ["(", ")", "[", "]", "{", "}", '"', "'", "="];
  // Note: You can extend this list with more symbols as needed

  // Stack to keep track of opening symbols that need to be closed
  // We'll push opening symbols onto this stack and pop them off when we find matching closing symbols
  const stack = [];

  // Iterate through each character in the input text
  for (let c of text) {
    // Check if the current character is one of our tracked symbols
    if (brackets.includes(c)) {
      // If we already have symbols on the stack
      if (stack.length > 0) {
        // If the current character is the closing match for the symbol at the top of the stack
        if (pair[stack[stack.length - 1]] === c) {
          stack.pop(); // Remove the opening symbol since we found its match
        } else if (c in pair) {
          // If this is a new opening symbol, add it to the stack
          stack.push(c);
        }
        // Note: If it's a closing symbol that doesn't match the top of the stack,
        // we keep going (the text is already unbalanced)
      } else {
        // If the stack is empty (no pending opening symbols)
        if (c in pair) {
          // If this is an opening symbol, add it to the stack
          stack.push(c);
        } else {
          // If this is a closing symbol with no matching opening symbol,
          // text is immediately unbalanced - return right away
          return { balanced: false, remainingStack: [c] };
        }
      }
    }
  }

  // After processing all characters:
  // - If stack is empty, all symbols were properly matched and closed
  // - If stack has items, we have opening symbols without matching closing symbols
  return {
    balanced: stack.length === 0,
    remainingStack: stack, // Return any unmatched symbols for error reporting
  };
}

/**
 * Main function that reads input file, checks each line for balanced symbols,
 * and writes unbalanced lines to output file
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
    for (let line of inputLines) {
      line = line.trim(); // Remove whitespace from start and end of line
      if (line.length === 0) continue; // Skip empty lines

      // Check if the current line has balanced symbols
      const { balanced, remainingStack } = isBalanced(line);

      // If the line has unbalanced symbols, add it to our results
      if (!balanced) {
        // Format the unbalanced characters for the output
        const unbalancedChars =
          remainingStack.length > 0 ? remainingStack.join("") : "unknown";

        // Add the unbalanced line to our results with information about what's unbalanced
        unbalancedLines.push(`${line} !!! unbalanced : [${unbalancedChars}]`);
      }
    }

    // Write all unbalanced lines to the output file
    // Join the array of lines with newline characters to create a single string
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

/*
take a look at this code
[aadils code]
i want to do it like in javascript

i dont need to use surah-juz-basmalah-ayah.js at all

input file would be a plain text file called input.txt, with just lines of text
output file would be a plain text file called output.txt with the lines of text where there is an unbalanced opening and closing caught

as for telling what was unbalanced in each line of the output, that can be included right at the end of the line, but still part of that line, where the text of the output line would come first, followed by !!! unbalanced : [unbalanced character, like ( for example]

...

I'll rewrite this code in JavaScript for you. The goal is to:

Read from a plain text file called input.txt (line by line)
Check each line for balanced brackets/quotes
Write lines with unbalanced brackets to output.txt with a special marker showing what's unbalanced

JavaScript Bracket Balance Checker
This JavaScript version accomplishes the same purpose as your Python code but with the specific requirements you mentioned:

It reads from input.txt line by line
Checks each line for balanced brackets and quotes
Writes unbalanced lines to output.txt
Includes a marker at the end of each unbalanced line showing what's unbalanced

To use this code:

Save it as something like bracketChecker.js
Make sure you have Node.js installed
Create your input.txt file with the text you want to check
Run it with node bracketChecker.js

The output format will be exactly as you requested, with the unbalanced lines followed by !!! unbalanced : [character].

*/
