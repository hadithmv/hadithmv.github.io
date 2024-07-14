import os
import shutil
import pandas as pd

# Define the paths
excel_path = r'C:\Users\ashra\Downloads\00 transfer to desktop\Art\Rameezbe\0 Stock\this.xlsx'
source_directory_kids = r'C:\Users\ashra\Downloads\00 transfer to desktop\Art\Rameezbe\1.5 Message English Kids Books'
destination_directory_kids = r'C:\Users\ashra\Downloads\00 transfer to desktop\Art\Rameezbe\1.5 Message English Kids Books\00 CURRENT TO SEND KIDS'

source_directory_adults = r'C:\Users\ashra\Downloads\00 transfer to desktop\Art\Rameezbe\1 Message English Adult Books'
destination_directory_adults = r'C:\Users\ashra\Downloads\00 transfer to desktop\Art\Rameezbe\1 Message English Adult Books\00 CURRENT TO SEND ADULTS'

# Folders to avoid
folders_to_avoid = [
    "ABDUL HAY'S TOMATO RED TILES",
    "THE BORROWER AND LENDER BY BUSHRA JIBALI",
    "STRAIGHTENING THE LINES FOR PRAYER - ACCORDING TO THE SUNNAH"
]

# Function to empty a directory
def empty_directory(directory):
    for root, dirs, files in os.walk(directory, topdown=False):
        for name in files:
            try:
                os.remove(os.path.join(root, name))
            except PermissionError as e:
                print(f"PermissionError: {e}")
        for name in dirs:
            try:
                shutil.rmtree(os.path.join(root, name))
            except PermissionError as e:
                print(f"PermissionError: {e}")

# Empty the destination directories for kids and adults
empty_directory(destination_directory_kids)
empty_directory(destination_directory_adults)

print("Emptied destination directories.")

# Load the Excel file
df = pd.read_excel(excel_path)

# Find the column index for "Item Description"
item_description_col_index = df.columns.get_loc("Item Description")

# Iterate over the rows in the "Item Description" column for kids books
for folder_name in df.iloc[:, item_description_col_index]:  
    folder_name_str = str(folder_name)  # Convert to string if not already

    # Skip folders in the avoid list
    if folder_name_str in folders_to_avoid:
        print(f'Skipping folder for kids books: {folder_name_str}')
        continue

    # Check if the folder exists in the source directory for kids books
    source_folder_path = os.path.join(source_directory_kids, folder_name_str)
    if os.path.isdir(source_folder_path):
        # Copy the folder to the destination directory for kids books
        destination_folder_path = os.path.join(destination_directory_kids, folder_name_str)
        shutil.copytree(source_folder_path, destination_folder_path)
        print(f'Copied folder for kids books: {folder_name_str}')
        
        # Delete files with extensions other than .txt or .jpg
        for root, dirs, files in os.walk(destination_folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                if not file.endswith(('.txt', '.jpg')):
                    os.remove(file_path)
                    print(f'Deleted: {file_path}')
    else:
        print(f'Folder not found for kids books: {folder_name_str}')

# Iterate over the rows in the "Item Description" column for adult books
for folder_name in df.iloc[:, item_description_col_index]:  
    folder_name_str = str(folder_name)  # Convert to string if not already

    # Skip folders in the avoid list
    if folder_name_str in folders_to_avoid:
        print(f'Skipping folder for adult books: {folder_name_str}')
        continue

    # Check if the folder exists in the source directory for adult books
    source_folder_path = os.path.join(source_directory_adults, folder_name_str)
    if os.path.isdir(source_folder_path):
        # Copy the folder to the destination directory for adult books
        destination_folder_path = os.path.join(destination_directory_adults, folder_name_str)
        shutil.copytree(source_folder_path, destination_folder_path)
        print(f'Copied folder for adult books: {folder_name_str}')
        
        # Delete files with extensions other than .txt or .jpg
        for root, dirs, files in os.walk(destination_folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                if not file.endswith(('.txt', '.jpg')):
                    os.remove(file_path)
                    print(f'Deleted: {file_path}')
    else:
        print(f'Folder not found for adult books: {folder_name_str}')
