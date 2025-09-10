import csv
import re

# Configuration - Change these to modify the transformation
# ========================================================

# Available number systems
NUMBER_SYSTEMS = {
    "regular": "0123456789",
    "arabic": "٠١٢٣٤٥٦٧٨٩",  # Arabic-Indic
    "superscript": "⁰¹²³⁴⁵⁶⁷⁸⁹"  # Superscript
}

# Available bracket types
BRACKET_TYPES = {
    "round": ["(", ")"],
    "square": ["[", "]"],
    "superscript": ["⁽", "⁾"],
    "corner": ["⌜", "⌝"]
}

# SETTINGS - Modify these to change transformation
# ===============================================
INPUT_NUMBER_SYSTEM = "regular"      # What number system to look for
INPUT_BRACKET_TYPE = "square"         # What bracket type to look for
OUTPUT_NUMBER_SYSTEM = "superscript"      # What number system to convert to
OUTPUT_BRACKET_TYPE = "superscript"       # What bracket type to convert to

# File settings
INPUT_FILE = "input.csv"
OUTPUT_FILE = "output.csv"

# ========================================================

def create_number_mapping(from_system, to_system):
    """Create a mapping dictionary from one number system to another"""
    from_chars = NUMBER_SYSTEMS[from_system]
    to_chars = NUMBER_SYSTEMS[to_system]
    return {from_chars[i]: to_chars[i] for i in range(10)}

def transform_number(number_str, number_mapping):
    """Transform a number string using the provided mapping"""
    result = ""
    for char in number_str:
        result += number_mapping.get(char, char)
    return result

def transform_bracketed_numbers(text, input_brackets, output_brackets, number_mapping):
    """Transform all bracketed numbers in the text"""
    # Escape special regex characters in brackets
    left_bracket = re.escape(input_brackets[0])
    right_bracket = re.escape(input_brackets[1])
    
    # Create pattern to match bracketed numbers
    # This pattern looks for the opening bracket, followed by one or more digits, followed by the closing bracket
    pattern = f"{left_bracket}([{re.escape(NUMBER_SYSTEMS[INPUT_NUMBER_SYSTEM])}]+){right_bracket}"
    
    def replace_match(match):
        # Extract the number part (without brackets)
        number = match.group(1)
        # Transform the number
        transformed_number = transform_number(number, number_mapping)
        # Return with new brackets
        return f"{output_brackets[0]}{transformed_number}{output_brackets[1]}"
    
    # Replace all matches
    return re.sub(pattern, replace_match, text)

def process_csv():
    """Process the CSV file and transform bracketed numbers"""
    try:
        # Get bracket configurations
        input_brackets = BRACKET_TYPES[INPUT_BRACKET_TYPE]
        output_brackets = BRACKET_TYPES[OUTPUT_BRACKET_TYPE]
        
        # Create number mapping
        number_mapping = create_number_mapping(INPUT_NUMBER_SYSTEM, OUTPUT_NUMBER_SYSTEM)
        
        # Read and process the CSV
        with open(INPUT_FILE, 'r', newline='', encoding='utf-8') as infile:
            # Detect delimiter
            sample = infile.read(1024)
            infile.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.reader(infile, delimiter=delimiter)
            
            # Process all rows
            processed_rows = []
            for row in reader:
                processed_row = []
                for cell in row:
                    transformed_cell = transform_bracketed_numbers(
                        cell, input_brackets, output_brackets, number_mapping
                    )
                    processed_row.append(transformed_cell)
                processed_rows.append(processed_row)
        
        # Write the processed data
        with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile, delimiter=delimiter)
            writer.writerows(processed_rows)
        
        print(f"✅ Transformation complete!")
        print(f"📁 Input: {INPUT_FILE}")
        print(f"📁 Output: {OUTPUT_FILE}")
        print(f"🔢 Numbers: {INPUT_NUMBER_SYSTEM} → {OUTPUT_NUMBER_SYSTEM}")
        print(f"🔘 Brackets: {INPUT_BRACKET_TYPE} {input_brackets} → {OUTPUT_BRACKET_TYPE} {output_brackets}")
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find file '{INPUT_FILE}'")
        print("Make sure the file exists in the same directory as this script.")
    except Exception as e:
        print(f"❌ Error processing file: {str(e)}")

def show_examples():
    """Show examples of what the transformation will do"""
    input_brackets = BRACKET_TYPES[INPUT_BRACKET_TYPE]
    output_brackets = BRACKET_TYPES[OUTPUT_BRACKET_TYPE]
    number_mapping = create_number_mapping(INPUT_NUMBER_SYSTEM, OUTPUT_NUMBER_SYSTEM)
    
    print("🔍 Transformation Examples:")
    print("=" * 50)
    
    test_cases = [
        f"{input_brackets[0]}123{input_brackets[1]}",
        f"Text with {input_brackets[0]}45{input_brackets[1]} numbers",
        f"{input_brackets[0]}0{input_brackets[1]} and {input_brackets[0]}789{input_brackets[1]}",
    ]
    
    for test in test_cases:
        transformed = transform_bracketed_numbers(
            test, input_brackets, output_brackets, number_mapping
        )
        print(f"'{test}' → '{transformed}'")

if __name__ == "__main__":
    print("🔄 CSV Bracketed Number Transformer")
    print("=" * 50)
    
    # Show current configuration
    print(f"📋 Current Settings:")
    print(f"   Input Numbers: {INPUT_NUMBER_SYSTEM} ({NUMBER_SYSTEMS[INPUT_NUMBER_SYSTEM][:5]}...)")
    print(f"   Input Brackets: {INPUT_BRACKET_TYPE} {BRACKET_TYPES[INPUT_BRACKET_TYPE]}")
    print(f"   Output Numbers: {OUTPUT_NUMBER_SYSTEM} ({NUMBER_SYSTEMS[OUTPUT_NUMBER_SYSTEM][:5]}...)")
    print(f"   Output Brackets: {OUTPUT_BRACKET_TYPE} {BRACKET_TYPES[OUTPUT_BRACKET_TYPE]}")
    print()
    
    # Show examples
    show_examples()
    print()
    
    # Process the file
    process_csv()

'''
give me code that

for a csv file called "input"

changes all bracketed numbers (the kind of bracket and number i will be able to specify) into another kinds of bracket numbers (which i will be specifying as well)

number options:

regular: "0123456789",
          arabic: "٠١٢٣٤٥٦٧٨٩", // Arabic-Indic
          superscript: "⁰¹²³⁴⁵⁶⁷⁸⁹", // Superscript

bracket options:

round: ["(", ")"],
          square: ["[", "]"],
          superscript: ["⁽", "⁾"],
          corner: ["⌜", "⌝"],

i should be able to set options in the code, such as this is the selected option for number, and this is the selected option for brackets
i should be able to easily change something in the code to change it to other options
'''