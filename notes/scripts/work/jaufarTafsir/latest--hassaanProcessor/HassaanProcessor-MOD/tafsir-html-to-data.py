import re
import json
from bs4 import BeautifulSoup, NavigableString, Tag
import unicodedata
import os
import glob

# --- Configuration ---
# Process all HTML files in current directory
HTML_FILES = glob.glob('*.html')  # Get all HTML files in current directory
if not HTML_FILES:
    print("Error: No HTML files found in current directory")
    exit()

# Remove configuration of single file paths since we'll process multiple files
REMOVE_QURANIC_TEXT = True
DEBUG_FOOTNOTES = False # Set True to debug footnote issues
DEBUG_CONTENT = True  # New debug flag

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
# (Keep normalize_str, clean_text, is_quranic_script functions as they were)
def normalize_str(text):
    if not text: return ""
    return unicodedata.normalize('NFC', text)

def clean_text(element):
    if not element: return ""
    text = element.get_text(separator='', strip=True) # Using separator=''
    text = normalize_str(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_quranic_script(text):
    if not text: return False
    thaana_pattern = re.compile(r'[\u0780-\u07BF]')
    if thaana_pattern.search(text): return False
    if re.match(r'^\s*\((\d+)\)', text): return False
    quranic_chars=r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE00-\u1EEFF]'
    allowed_in_quranic=r'[()\d\s\uFD3E\uFD3F\ufdfa\ufdfb\ufd3f\ufd3e\u06dd\u06de\ufdfd]'
    quranic_line_pattern=re.compile(f'^({quranic_chars}|{allowed_in_quranic})+$')
    if quranic_line_pattern.match(text):
        arabic_count = len(re.findall(quranic_chars, text))
        total_count = len(text)
        if total_count > 0 and ((arabic_count / total_count) > 0.85 or any(sym in text for sym in ['ﭑ','ﭐ','ﭒ','ﭓ','ﱂ','ﱃ','ﱄ','ﱅ', '﷽'])):
            if len(text) < 15 and not any(sym in text for sym in ['ﭑ','ﭐ','ﭒ','ﭓ','ﱂ','ﱃ','ﱄ','ﱅ', '﷽']): return False
            return True
    specific_marker_pattern=re.compile(r'^[\s\uFD3E\uFD3F\ufdfa\ufdfb\ufd3f\ufd3e\u06dd\u06de\ufdfd]+$')
    if specific_marker_pattern.match(text): return True
    return False

def find_and_replace_footnote_tags_by_id(p_element):
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
    tags_to_replace.sort(key=lambda tag: tag.sourceline * 1000 + tag.sourcepos if hasattr(tag, 'sourceline') and tag.sourceline is not None else float('inf'), reverse=True)
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
                global_footnote_counter += 1
                footnote_id_to_seq_map[id_num] = global_footnote_counter
            seq_num = footnote_id_to_seq_map[id_num]
            placeholder = f"\n[{seq_num}]" # Changed to use new format
            try:
                tag.replace_with(NavigableString(placeholder))
                if id_num not in refs_id_nums: refs_id_nums.append(id_num)
                processed_tags.add(tag)
                if tag.parent and tag.parent.name == 'span' and not clean_text(tag.parent): processed_tags.add(tag.parent)
            except Exception as e:
                if id_num and id_num not in refs_id_nums: refs_id_nums.append(id_num)
    return refs_id_nums[::-1]

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
        nonlocal current_aayah_number

        if current_aayah_number and current_tafseer_lines:
            tafseer_with_placeholders = "\n".join(current_tafseer_lines).strip()
            tafseer_final_text = tafseer_with_placeholders

            # Get unique footnote IDs referenced in this Aayah
            unique_id_refs_ordered = list(dict.fromkeys(current_footnote_id_refs))
            
            # Build the footnotes text
            footnotes_text = ""
            for id_num in unique_id_refs_ordered:
                footnote_info = footnotes_map.get(id_num)
                seq_num = footnote_id_to_seq_map.get(id_num)
                
                if footnote_info and seq_num:
                    if footnotes_text:  # Add newline between footnotes
                        footnotes_text += "\n"
                    footnotes_text += f"[{seq_num}] {footnote_info['text']}"
                else:
                    # If original footnote text wasn't found
                    if footnotes_text:
                        footnotes_text += "\n"
                    footnotes_text += f"[{seq_num}] Footnote text for ID {id_num} not found"

            # Final cleanup of spacing
            tafseer_final_text = re.sub(r'\s{2,}', ' ', tafseer_final_text).strip()
            tafseer_final_text = re.sub(r'\s([,.!?;:])', r'\1', tafseer_final_text)
            tafseer_final_text = re.sub(r'(\()\s', r'\1', tafseer_final_text)
            tafseer_final_text = re.sub(r'\s(\))', r'\1', tafseer_final_text)

            parsed_data.append({
                "aayah_number": current_aayah_number,
                "tafseer": tafseer_final_text.strip(),
                "footnotes": footnotes_text  # Now a single multiline string
            })

        current_tafseer_lines = []
        current_footnote_id_refs = []  # Reset IDs

    print("\n--- Processing Main Content ---")
    # --- Main Loop (Processing Paragraphs) ---
    current_surah = None
    for i, p in enumerate(all_paragraphs):
        refs_id_nums_found = find_and_replace_footnote_tags_by_id(p)  # Replace tags with ID placeholders
        cleaned_p_text = clean_text(p)  # Clean text *with* ID placeholders
        if not cleaned_p_text:
            continue
        normalized_p_text = normalize_str(cleaned_p_text)
        
        # Check if this is a surah header
        if is_surah_header(normalized_p_text) and not processing_started:
            print(f"Found surah header: {normalized_p_text}")
            processing_started = True  # Start processing once we find first surah header
            print("\n--- Processing Content ---")
            current_aayah_number = ""
            current_footnote_id_refs.extend(refs_id_nums_found)
            continue
        elif is_surah_header(normalized_p_text):
            # If we find another surah header after processing started,
            # just store the previous ayah and continue - don't reset processing
            store_previous_aayah()
            current_aayah_number = ""
            current_footnote_id_refs.extend(refs_id_nums_found)
            continue
        
        if not processing_started:
            continue
        aayah_match = re.match(r'^\s*\((\d+)\)\s*(.*)', cleaned_p_text)
        if aayah_match:
            store_previous_aayah()
            current_aayah_number = aayah_match.group(1)
            initial_tafseer_part = aayah_match.group(2).strip()
            print(f"Found Aayah: {current_aayah_number}")
            current_footnote_id_refs.extend(refs_id_nums_found)  # Store IDs found in this line
            if initial_tafseer_part:
                if not (REMOVE_QURANIC_TEXT and is_quranic_script(initial_tafseer_part)):
                    current_tafseer_lines.append(initial_tafseer_part)
            continue
        if REMOVE_QURANIC_TEXT and is_quranic_script(cleaned_p_text):
            continue
        if current_aayah_number:
            if cleaned_p_text and not cleaned_p_text.isspace():
                if not re.fullmatch(r'(\s*__FOOTNOTE_ID_\d+__\s*)+', cleaned_p_text):
                    current_tafseer_lines.append(cleaned_p_text)
            current_footnote_id_refs.extend(refs_id_nums_found)  # Store IDs found in this line

    # Store the very last Aayah block
    store_previous_aayah()

    print(f"Total verses processed: {len(parsed_data)}")

    # --- Output Generation ---
    try:
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f, ensure_ascii=False, indent=4)
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
print(f"Found {len(HTML_FILES)} HTML file(s) to process:")
for html_file in HTML_FILES:
    print(f"- {html_file}")

for html_file in HTML_FILES:
    process_html_file(html_file)

print("\nProcessing complete.")