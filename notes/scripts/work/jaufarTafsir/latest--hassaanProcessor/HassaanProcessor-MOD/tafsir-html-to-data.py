import re
import json
from bs4 import BeautifulSoup, NavigableString, Tag
import unicodedata
import os
import glob

# --- Configuration ---
# Set to True to run the pre-processing step that removes all <span> and <br> tags from the HTML files.
# This will modify the files on disk before the main script runs.
# Set to False to skip this step and process the files as they are.
PRE_PROCESS_SPANS = True

# Process all HTML files in current directory
HTML_FILES = glob.glob('*.html')  # Get all HTML files in current directory
if not HTML_FILES:
    print("Error: No HTML files found in current directory")
    exit()

# The specific phrase to check for after initial cleaning (like replacing )
BISMILLAH_PHRASE_CHECK = "اللهُ سُبحَانَهُ وَتَعَالَىގެ އިސްމުފުޅުގެ ބަރަކާތުން ފަށަމެވެ"

# Remove configuration of single file paths since we'll process multiple files
REMOVE_QURANIC_TEXT = True
DEBUG_FOOTNOTES = False # Set True to debug footnote issues
DEBUG_CONTENT = True  # New debug flag


# --- NEW: Pre-processing Function ---
def preprocess_and_remove_tags(file_list):
    """
    Reads each HTML file, removes all <span> and <br> tags,
    and saves the modified content back to the original file.
    """
    print("\n--- Starting Pre-processing: Removing <span> and <br> tags ---")
    if not file_list:
        print("No HTML files found to pre-process.")
        return

    # Regex to find <span> tags and capture their content.
    # re.DOTALL ensures that '.' matches newline characters as well.
    span_pattern = re.compile(r'<span.*?>(.+?)</span>', re.DOTALL)

    # Regex to find all variations of <br> tags (e.g., <br>, <br/>, <BR>)
    br_pattern = re.compile(r'<br\s*/?>', re.IGNORECASE)


    for file_path in file_list:
        try:
            print(f"  - Processing: {file_path}")
            # Read the original file content
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()

            # 1. Replace all <span> tags with just their inner content (\1)
            modified_content = span_pattern.sub(r'\1', original_content)

            # 2. Remove all <br> tags from the result
            modified_content = br_pattern.sub('', modified_content)

            # Write the modified content back to the same file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)

            print(f"    ... Done. Saved changes to {file_path}")

        except FileNotFoundError:
            print(f"    Error: File not found at {file_path}")
        except Exception as e:
            print(f"    An error occurred while processing {file_path}: {e}")

    print("--- Pre-processing complete ---\n")


def is_surah_header(text):
    """Checks if the given text is a surah header using various patterns"""
    # Common variations of how surah can be written
    surah_patterns = [
        'سورة',
        'سُوْرَةُ',
        'سُورَةُ',
        'سُوْرَة'
    ]
    
    # First check if any of our surah patterns exist
    if not any(pattern in text for pattern in surah_patterns):
        return False
        
    # Additional validation to ensure it's a header:
    # 1. Should be relatively short (not a long paragraph)
    # 2. Should not contain certain punctuation that would indicate it's part of a sentence
    # 3. Should be mostly Arabic text
    if len(text) > 100:  # Too long to be a header
        return False
        
    # Check if it looks like a sentence (contains multiple punctuation marks)
    sentence_indicators = ['.', '،', ':', ';', '!', '?', '؟']
    punctuation_count = sum(1 for c in text if c in sentence_indicators)
    if punctuation_count > 1:  # Headers usually don't have multiple punctuation marks
        return False

    # Count Arabic characters
    arabic_chars = len([c for c in text if '\u0600' <= c <= '\u06FF'])
    total_chars = len([c for c in text if c.strip()])  # Count non-whitespace chars

    # Should be predominantly Arabic
    if total_chars > 0 and arabic_chars / total_chars < 0.5:
        return False
        
    return True

# Global counter for sequential footnotes
global_footnote_counter = 0

# Map to store original footnote IDs to their sequential numbers
footnote_id_to_seq_map = {}

# --- Helper Functions ---
def normalize_str(text):
    if not text: return ""
    return unicodedata.normalize('NFC', text)

def clean_text(element):
    if not element: return ""
    text = element.get_text(separator='', strip=True) # Using separator=''
    text = normalize_str(text)
    
    # Text replacements dictionary
    text_replacements = {
        'ـ': '',
        '': 'سُبحَانَهُ وَتَعَالَى',
        '': 'ﷺ',
        '': 'عَلَيهِ السَّلَامُ',
        '': 'عَلَيهِ السَّلَامُ',
        '': 'عَلَيهَا السَّلَامُ',
        '': 'عَلَيهِمُ السَّلَامُ',
        '': 'رَضِيَ اللَّهُ عَنْهُ',
        'h': 'رَضِيَ اللَّهُ عَنْهُ',
        '': 'رَضِيَ اللَّهُ عَنْهُمَا',
        '': 'رَضِيَ اللَّهُ عَنْهَا',
        '': 'رَحِمَهُمَا اللَّهُ',
        'ba': '',
    }

    # Apply text replacements
    for old, new in text_replacements.items():
        text = text.replace(old, new)

    # Swap quote characters
    text = text.replace('“', '__TEMP_QUOTE__')
    text = text.replace('”', '“')
    text = text.replace('__TEMP_QUOTE__', '”')

    # Remove Mushaf Madina font characters (U+FC50 to U+FC9F and U+FCA0 to U+FCFF)
    text = re.sub(r'[\uFC50-\uFCFF]+', '', text)
    # Remove additional Mushaf Madina font characters (U+FC4B to U+FC4F)
    text = re.sub(r'[\uFC4B-\uFC4F]+', '', text)
    # Remove specific Mushaf Madina font characters that appear individually
    text = re.sub(r'[\uFC41-\uFC45]+', '', text)
    # Remove additional Mushaf Madina font characters (U+FC46 to U+FC4A)
    text = re.sub(r'[\uFC46-\uFC4A]+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    # Replace the space marker with an actual space
    text = text.replace('SPACE', ' ')
    return text

def is_quranic_script(text):
    if not text: return False
    
    # Check for Thaana (Dhivehi) characters - these should be excluded
    thaana_pattern = re.compile(r'[\u0780-\u07BF]')
    if thaana_pattern.search(text): return False

    # Check for ayah numbers - these should be excluded
    if re.match(r'^\s*\((\d+)\)', text): return False

    # Check for specific Mushaf Madina font characters that should be removed
    # These are the custom glyphs used for Quranic text formatting
    mushaf_madina_chars = r'[\uFC50-\uFCFF\uFC4B-\uFC4F\uFC41-\uFC45\uFC46-\uFC4A]'
    if re.search(mushaf_madina_chars, text):
        return True

    # Check for specific Quranic symbols that indicate this is Quranic text
    quranic_symbols = ['ﭑ','ﭐ','ﭒ','ﭓ','ﱂ','ﱃ','ﱄ','ﱅ', '﷽']
    if any(sym in text for sym in quranic_symbols):
        return True

    # Check for specific marker patterns that are only used in Quranic text
    specific_marker_pattern = re.compile(r'^[\s\uFD3E\uFD3F\ufdfa\ufdfb\ufd3f\ufd3e\u06dd\u06de\ufdfd]+$')
    if specific_marker_pattern.match(text): 
        return True

    # Only remove text that contains Mushaf Madina font characters
    # Do NOT remove normal Arabic text regardless of length
    return False

def find_and_replace_footnote_tags_by_id(p_element, should_increment_counter=True):
    """Finds footnote <a> tags based on href, replaces them with ID-based placeholders,
    and returns the extracted footnote ID numbers."""
    global global_footnote_counter, footnote_id_to_seq_map
    refs_id_nums = []
    tags_to_replace = []
    footnote_links = p_element.find_all('a', href=lambda x: x and '#footnote-' in x)
    tags_to_replace.extend(footnote_links)
    footnote_links_with_id = p_element.find_all('a', id=lambda x: x and x.startswith('footnote-') and x.endswith('-backlink'))
    for tag in footnote_links_with_id:
        if tag not in tags_to_replace: tags_to_replace.append(tag)
    tags_to_replace.sort(key=lambda tag: tag.sourceline * 1000 + tag.sourcepos if hasattr(tag, 'sourceline') and tag.sourceline is not None else float('inf'), reverse=False)
    processed_tags = set()
    for tag in tags_to_replace:
        if tag in processed_tags or (tag.parent and tag.parent in processed_tags): continue
        href = tag.get('href', '')
        link_id_attr = tag.get('id', '')
        id_match = re.search(r'#footnote-(\d+)', href)
        id_num = id_match.group(1) if id_match else None
        if not id_num:
            id_match_from_link_id = re.search(r'footnote-(\d+)-backlink', link_id_attr)
            if id_match_from_link_id: id_num = id_match_from_link_id.group(1)
        if id_num:
            # Assign sequential number if not already assigned
            if id_num not in footnote_id_to_seq_map:
                if should_increment_counter:
                    global_footnote_counter += 1
                    footnote_id_to_seq_map[id_num] = global_footnote_counter
                else:
                    # Just store the ID without incrementing counter
                    footnote_id_to_seq_map[id_num] = id_num
            seq_num = footnote_id_to_seq_map[id_num]
            placeholder = f"\n[{seq_num}]SPACE"  # Use a special marker for space
            try:
                tag.replace_with(NavigableString(placeholder))
                if id_num not in refs_id_nums: refs_id_nums.append(id_num)
                processed_tags.add(tag)
                if tag.parent and tag.parent.name == 'span' and not clean_text(tag.parent): processed_tags.add(tag.parent)
            except Exception as e:
                if id_num and id_num not in refs_id_nums: refs_id_nums.append(id_num)
    return refs_id_nums

# --- Main Processing Function ---

def process_html_file(html_file_path):
    """Process a single HTML file and generate corresponding output files."""
    global global_footnote_counter, footnote_id_to_seq_map

    # Reset global counters for each file
    global_footnote_counter = 0
    footnote_id_to_seq_map = {}

    # Variables for processing current file
    current_aayah_number = ""
    current_tafseer_lines = []
    current_footnote_id_refs = []  # Store ID numbers found FOR the current ayah
    processing_started = False

    # NEW: Variables to capture introductory text for each Surah
    surah_intro_lines = []
    surah_intro_footnote_refs = []
    waiting_for_first_ayah = False

    # Generate output paths based on input filename
    base_name = os.path.splitext(html_file_path)[0]
    output_json_path = f"{base_name}_output.json"
    output_md_path = f"{base_name}_output.md"

    print(f"\nProcessing {html_file_path}...")

    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        print(f"Successfully read HTML file, content length: {len(html_content)}")
    except FileNotFoundError:
        print(f"Error: HTML file not found at {html_file_path}")
        return
    except Exception as e:
        print(f"Error reading {html_file_path}: {e}")
        return

    soup = BeautifulSoup(html_content, 'html.parser')
    body = soup.body
    if not body:
        print(f"Error: Could not find the <body> tag in {html_file_path}")
        return

    parsed_data = []

    # --- Footnote dictionary population (key=ID, value=dict) ---
    footnotes_map = {}  # Key: ID_Num, Value: {'visible_num': str, 'text': str}
    print("--- Parsing Footnotes ---")
    footnote_divs = soup.find_all('div', id=lambda x: x and x.startswith('footnote-'))
    processed_footnotes = 0
    for div in footnote_divs:
        div_id = div.get('id')
        id_num_match = re.search(r'footnote-(\d+)', div_id)
        id_num = id_num_match.group(1) if id_num_match else None
        
        # Get the footnote text - look for text in all p tags within the div
        footnote_text = ""
        p_tags = div.find_all('p')
        if p_tags:
            # Join all p tag texts with newlines
            footnote_text = "\n".join(clean_text(p) for p in p_tags)
        else:
            # If no p tags, get text directly from div
            footnote_text = clean_text(div)
        
        # Remove the footnote number from the start if present
        footnote_text = re.sub(r'^([\d-]+|[\u0660-\u0669]+)[\s\.\-–—]*', '', footnote_text).strip()
        
        if id_num and footnote_text:
            if id_num in footnotes_map and footnotes_map[id_num]['text'] != footnote_text:
                if DEBUG_FOOTNOTES:
                    print(f"  Warning: Duplicate footnote ID '{id_num}' with DIFFERENT text. Overwriting.")
            footnotes_map[id_num] = {'text': footnote_text}
            if DEBUG_FOOTNOTES:
                print(f"  Stored footnote {id_num}: {footnote_text[:50]}...")
            processed_footnotes += 1

    print(f"--- Finished Parsing Footnotes. Total unique IDs stored: {len(footnotes_map)}. ---")

    # --- Find all relevant paragraphs ---
    main_content_elements = []
    for element in body.children:
        if isinstance(element, Tag):
            element_classes = element.get('class', [])
            if 'Basic-Graphics-Frame' in element_classes:
                continue
            is_header_footer_layout = False
            if '_idGenObjectLayout-1' in element_classes:
                inner_divs = element.find_all('div', recursive=False)
                has_graphics = any('Basic-Graphics-Frame' in d.get('class', []) for d in inner_divs)
                if len(inner_divs) > 1:
                    has_page_num = any(p.get('class') == ['no-styles'] and re.match(r'^\s*\d+\s*$', clean_text(p)) for d in inner_divs for p in d.find_all('p', recursive=False))
                    if not has_page_num:
                        has_page_num = any(p.get('class') == ['no-styles'] and re.match(r'^\s*\d+\s*$', clean_text(p)) for d in inner_divs for p in d.find_all('p', recursive=True))
                    has_surah_name_header = any(('ފޮތް' in clean_text(d) or 'سُوْرَةُ' in clean_text(d)) and len(d.find_all('p')) < 3 for d in inner_divs)
                    if has_graphics or (has_page_num and has_surah_name_header):
                        is_header_footer_layout = True
            if not is_header_footer_layout:
                main_content_elements.append(element)

    all_paragraphs = []
    processed_para_elements = set()
    for elem in main_content_elements:
        candidate_paragraphs = elem.find_all('p', recursive=True)
        for p in candidate_paragraphs:
            if p in processed_para_elements:
                continue
            
            # --- FIX: Skip any paragraph that is inside a footnote definition div ---
            if p.find_parent('div', id=lambda x: x and x.startswith('footnote-')):
                continue
            # --- END FIX ---
            
            if p.find_parent('section', class_='_idFootnotes'):
                continue  # Skip notes section explicitly
            # Add check for parent being a footnote section (new structure)
            parent_section = p.find_parent('section')
            if parent_section and parent_section.find('ol') and parent_section.find('li', id=lambda x: x and x.startswith('footnote-')):
                continue

            is_in_header_footer = False
            parent_layout = p.find_parent(class_='_idGenObjectLayout-1')
            if parent_layout and parent_layout not in main_content_elements:
                is_in_header_footer = True

            if not is_in_header_footer:
                all_paragraphs.append(p)
                processed_para_elements.add(p)

    print(f"Found {len(all_paragraphs)} paragraphs to process")
    print("Checking first few paragraphs for potential headers:")
    for i, p in enumerate(all_paragraphs[:20]):
        cleaned = clean_text(p)
        if is_surah_header(cleaned):
            print(f"Found potential surah header in paragraph {i}: {cleaned}")

    def store_previous_aayah():
        """Stores the data for the previously processed Aayah block."""
        nonlocal current_tafseer_lines, current_footnote_id_refs, parsed_data
        nonlocal current_aayah_number, surah_intro_lines, surah_intro_footnote_refs
        
        # Exit if there's nothing to store for the current ayah number
        if not current_aayah_number or not (current_tafseer_lines or surah_intro_lines):
            # Clear lists and return
            current_tafseer_lines, current_footnote_id_refs = [], []
            surah_intro_lines, surah_intro_footnote_refs = [], []
            return

        # --- Content Assembly ---
        # 1. Number the first line of the main tafseer content (if it exists)
        if current_tafseer_lines:
            # Check if the first line is our special Bismillah block
            # If so, the number is already part of the content, so we don't add another.
            if not current_tafseer_lines[0].startswith("-------------"):
                 current_tafseer_lines[0] = f"({current_aayah_number}) {current_tafseer_lines[0]}"

        # 2. Combine introductory and tafseer content with intelligent separation
        final_lines = []
        if surah_intro_lines:
            final_lines.extend(surah_intro_lines)
        
        if current_tafseer_lines:
            needs_separator = False
            # Check if a separator is needed between intro and tafseer
            if surah_intro_lines:
                last_intro_line = surah_intro_lines[-1].strip()
                first_tafseer_line = current_tafseer_lines[0].strip()
                # Add separator ONLY if intro doesn't end with one AND tafseer doesn't start with one.
                if not last_intro_line.endswith("-------------") and not first_tafseer_line.startswith("-------------"):
                    needs_separator = True
            
            if needs_separator:
                final_lines.append("-------------")
            
            final_lines.extend(current_tafseer_lines)

        tafseer_with_placeholders = "\n".join(final_lines)

        # --- Footnote Assembly ---
        combined_footnote_refs = list(dict.fromkeys(surah_intro_footnote_refs + current_footnote_id_refs))
        footnotes_text = ""
        for id_num in combined_footnote_refs:
            footnote_info = footnotes_map.get(id_num)
            seq_num = footnote_id_to_seq_map.get(id_num)
            
            if footnote_info and seq_num:
                if footnotes_text: footnotes_text += "\n"
                footnotes_text += f"[{seq_num}] {footnote_info['text']}"
            else:
                if footnotes_text: footnotes_text += "\n"
                footnotes_text += f"[{seq_num}] Footnote text for ID {id_num} not found"

        # --- Final Text Cleaning ---
        lines = tafseer_with_placeholders.split('\n')
        cleaned_lines = []
        for line in lines:
            if line.strip() and line.strip() != '-------------':
                cleaned_line = re.sub(r'\s{2,}', ' ', line)
                cleaned_line = re.sub(r'\s([,.!?;:])', r'\1', cleaned_line)
                cleaned_line = re.sub(r'(\()\s', r'\1', cleaned_line)
                cleaned_line = re.sub(r'\s(\))', r'\1', cleaned_line)
                cleaned_lines.append(cleaned_line)
            else:
                cleaned_lines.append(line)
        tafseer_final_text = '\n'.join(cleaned_lines)

        # Append final data
        parsed_data.append({
            "aayah_number": current_aayah_number,
            "tafseer": tafseer_final_text,
            "footnotes": footnotes_text
        })

        # Reset for the next block
        current_tafseer_lines, current_footnote_id_refs = [], []
        surah_intro_lines, surah_intro_footnote_refs = [], []

    print("\n--- Processing Main Content ---")
    # --- Main Loop (Processing Paragraphs) ---
    current_surah = None
    prev_aayah_number = None  # Track previous aayah number
    for i, p in enumerate(all_paragraphs):
        # Only increment footnote counter if we're processing content that will be included
        should_increment = processing_started
        refs_id_nums_found = find_and_replace_footnote_tags_by_id(p, should_increment_counter=should_increment)  # Replace tags with ID placeholders
        cleaned_p_text = clean_text(p)  # Clean text *with* ID placeholders
        if not cleaned_p_text:
            continue
        normalized_p_text = normalize_str(cleaned_p_text)
        is_bismillah_para = BISMILLAH_PHRASE_CHECK in cleaned_p_text
        
        # Check if this is a surah header
        if is_surah_header(normalized_p_text) and not is_bismillah_para:
            store_previous_aayah() # Store any previous data before starting a new surah
            print(f"Found surah header: {normalized_p_text}")
            processing_started = True  # Start processing once we find first surah header
            current_aayah_number = "" # Reset ayah number
            waiting_for_first_ayah = True  # Start collecting introductory text
            surah_intro_footnote_refs.extend(refs_id_nums_found)
            continue
        
        if not processing_started:
            continue
            
        # Check if this is an ayah number
        aayah_match = re.match(r'^\s*\((\d+)\)\s*(.*)', cleaned_p_text)
        if aayah_match:
            # This paragraph marks the start of a new ayah's content.
            # Store the previous ayah's data first.
            if not waiting_for_first_ayah:
                 store_previous_aayah()
            
            new_aayah_number = int(aayah_match.group(1))
            if prev_aayah_number is not None:
                if new_aayah_number != prev_aayah_number + 1:
                    print(f"Found Aayah: {new_aayah_number} [!! NOT CONSECUTIVE !!]")
                else:
                    print(f"Found Aayah: {new_aayah_number}")
            else:
                print(f"Found Aayah: {new_aayah_number}")
            
            # Start collecting data for the new ayah.
            waiting_for_first_ayah = False
            prev_aayah_number = new_aayah_number
            current_aayah_number = aayah_match.group(1)
            current_footnote_id_refs.extend(refs_id_nums_found)

            line_to_add = cleaned_p_text
            if is_bismillah_para:
                # Format the Bismillah paragraph without a leading newline
                line_to_add = f"-------------\nبِسمِ اللهِ الرَّحمَنِ الرَّحِيمِ\n{cleaned_p_text}\n-------------"
            else:
                # It's a regular numbered line, just use the text after the number
                line_to_add = aayah_match.group(2).strip()

            if line_to_add and not (REMOVE_QURANIC_TEXT and is_quranic_script(line_to_add)):
                current_tafseer_lines.append(line_to_add)
            
            continue # Move to the next paragraph
            
        # This code block handles paragraphs that are NOT ayah-numbered.
        # They are either introductory text or continuation of a previous ayah.
        if REMOVE_QURANIC_TEXT and is_quranic_script(cleaned_p_text):
            continue

        line_to_add = cleaned_p_text
        if is_bismillah_para:
            # Handle un-numbered bismillah paragraphs (e.g., in an introduction)
            line_to_add = f"-------------\nبِسمِ اللهِ الرَّحمَنِ الرَّحِيمِ\n{cleaned_p_text}\n-------------"
        # START of the new logic
        elif cleaned_p_text.startswith("ފަހެ، اللهُ سُبحَانَهُ وَتَعَالَى ދެއްވި ވާގިފުޅުން، ކީރިތި ޤުރްއާނުގެ އެއްވަނަ ފޮތުގެ ކުރު ތަފްސީރެއް ލިއުމަށް އަޅުގަނޑު ގަސްތުކުރި މިންވަރަށް ލިޔެ ނިމުނީއެވެ."):
            line_to_add = f"-------------\n{cleaned_p_text}"
        # END of the new logic
        
        # Add the content to the correct list.
        if waiting_for_first_ayah:
            if line_to_add and not line_to_add.isspace():
                surah_intro_lines.append(line_to_add)
            surah_intro_footnote_refs.extend(refs_id_nums_found)
        elif current_aayah_number:
            if line_to_add and not line_to_add.isspace():
                current_tafseer_lines.append(line_to_add)
            current_footnote_id_refs.extend(refs_id_nums_found)

    # Store the very last Aayah block
    store_previous_aayah()

    print(f"Total verses processed: {len(parsed_data)}")

    # --- Output Generation ---
    try:
        # Transform the data from a list of objects to the desired 2D array format
        json_output_data = [[item['tafseer'], item['footnotes']] for item in parsed_data]

        with open(output_json_path, 'w', encoding='utf-8') as f:
            # Dump the newly formatted 2D array
            json.dump(json_output_data, f, ensure_ascii=False, indent=4)
        print(f"Successfully created JSON file: {output_json_path}")
    except Exception as e:
        print(f"Error writing JSON file: {e}")

    # Markdown Output
    md_output = ""
    for item in parsed_data:
        md_output += f"## Aayah {item['aayah_number']}\n\n"
        md_output += f"{item['tafseer']}\n\n"
        if item['footnotes']:
            md_output += "---\n**Footnotes:**\n\n"
            md_output += f"{item['footnotes']}\n"
            md_output += "\n---\n\n"
        else:
            md_output += "\n"
    try:
        with open(output_md_path, 'w', encoding='utf-8') as f:
            f.write(md_output)
        print(f"Successfully created Markdown file: {output_md_path}")
    except Exception as e:
        print(f"Error writing Markdown file: {e}")

# --- Main Execution ---

# Check the flag. If True, run the pre-processing step first.
if PRE_PROCESS_SPANS:
    preprocess_and_remove_tags(HTML_FILES)

print(f"Found {len(HTML_FILES)} HTML file(s) to process:")
for html_file in HTML_FILES:
    print(f"- {html_file}")

for html_file in HTML_FILES:
    process_html_file(html_file)

print("\nProcessing complete.")