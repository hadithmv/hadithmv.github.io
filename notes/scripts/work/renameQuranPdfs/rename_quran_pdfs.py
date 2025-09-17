import os
import re
import json

def extract_surah_names_from_js(js_file_path):
    """
    Extract surah names from the JavaScript file and return as a dictionary.
    """
    surah_names = {}
    
    try:
        with open(js_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Find the object definition using regex
        # This pattern matches the structure: number: "name",
        pattern = r'(\d+):\s*["\']([^"\']+)["\']'
        matches = re.findall(pattern, content)
        
        for match in matches:
            surah_number = int(match[0])
            surah_name = match[1]
            surah_names[surah_number] = surah_name
            
    except FileNotFoundError:
        print(f"Error: JavaScript file '{js_file_path}' not found.")
        return None
    except Exception as e:
        print(f"Error reading JavaScript file: {e}")
        return None
    
    return surah_names

def rename_pdf_files(directory_path, js_file_path):
    """
    Rename PDF files in the directory based on surah names from JS file.
    """
    # Extract surah names from JavaScript file
    surah_names = extract_surah_names_from_js(js_file_path)
    
    if not surah_names:
        print("Failed to extract surah names. Exiting.")
        return
    
    print(f"Loaded {len(surah_names)} surah names from JavaScript file.")
    
    # Get list of files in directory
    try:
        files = os.listdir(directory_path)
    except FileNotFoundError:
        print(f"Error: Directory '{directory_path}' not found.")
        return
    
    # Filter for PDF files that are just numbers
    pdf_files = []
    for file in files:
        if file.endswith('.pdf'):
            # Check if filename (without extension) is just a number
            name_without_ext = file[:-4]  # Remove .pdf extension
            if name_without_ext.isdigit():
                pdf_files.append(file)
    
    if not pdf_files:
        print("No PDF files with numeric names found.")
        return
    
    print(f"Found {len(pdf_files)} PDF files to rename.")
    
    # Rename each file
    renamed_count = 0
    for file in pdf_files:
        try:
            # Get surah number from filename
            surah_number = int(file[:-4])  # Remove .pdf extension
            
            # Check if we have a name for this surah
            if surah_number in surah_names:
                surah_name = surah_names[surah_number]
                
                # Clean surah name for filename (replace apostrophes and other problematic characters)
                clean_surah_name = surah_name.replace("'", "")  # Remove apostrophes
                clean_surah_name = clean_surah_name.replace('"', '')  # Remove quotes
                clean_surah_name = clean_surah_name.replace('/', '_')  # Replace forward slashes
                clean_surah_name = clean_surah_name.replace('\\', '_')  # Replace backslashes
                clean_surah_name = clean_surah_name.replace(':', '_')  # Replace colons
                clean_surah_name = clean_surah_name.replace('?', '')  # Remove question marks
                clean_surah_name = clean_surah_name.replace('*', '')  # Remove asterisks
                clean_surah_name = clean_surah_name.replace('<', '')  # Remove less than
                clean_surah_name = clean_surah_name.replace('>', '')  # Remove greater than
                clean_surah_name = clean_surah_name.replace('|', '_')  # Replace pipes
                
                # Create new filename with zero-padded number
                new_filename = f"{surah_number:03d}_{clean_surah_name}_Quran_Tafsir_Jaufar_Faiz.pdf"
                
                # Full paths
                old_path = os.path.join(directory_path, file)
                new_path = os.path.join(directory_path, new_filename)
                
                # Check if new filename already exists
                if os.path.exists(new_path):
                    print(f"Warning: '{new_filename}' already exists. Skipping '{file}'.")
                    continue
                
                # Rename the file
                os.rename(old_path, new_path)
                print(f"Renamed: '{file}' -> '{new_filename}'")
                renamed_count += 1
                
            else:
                print(f"Warning: No surah name found for number {surah_number}. Skipping '{file}'.")
                
        except ValueError:
            print(f"Warning: Could not parse surah number from '{file}'. Skipping.")
        except Exception as e:
            print(f"Error renaming '{file}': {e}")
    
    print(f"\nCompleted! Successfully renamed {renamed_count} files.")

def main():
    # Set your directory path and JavaScript file path here
    directory_path = "."  # Current directory, change if needed
    js_file_path = "surah-names-english.js"
    
    print("Quran PDF File Renamer")
    print("=" * 40)
    print(f"Directory: {directory_path}")
    print(f"JavaScript file: {js_file_path}")
    print()
    
    # Ask for confirmation before proceeding
    response = input("Do you want to proceed with renaming? (y/n): ").lower().strip()
    if response != 'y':
        print("Operation cancelled.")
        return
    
    rename_pdf_files(directory_path, js_file_path)

if __name__ == "__main__":
    main()