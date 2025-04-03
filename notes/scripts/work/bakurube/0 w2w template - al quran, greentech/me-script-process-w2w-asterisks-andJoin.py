import pandas as pd
import numpy as np

# Read the CSV file
df = pd.read_csv('input.csv')

# Make a copy of the dataframe to modify
modified_df = df.copy()

# Convert all values to strings to avoid type issues
for col in modified_df.columns:
    modified_df[col] = modified_df[col].astype(str)
    # Replace 'nan' strings with empty strings
    modified_df[col] = modified_df[col].replace('nan', '')

# Create a list to keep track of rows to drop
rows_to_drop = []

# Iterate through the dataframe from bottom to top
for i in range(len(df) - 1, 0, -1):
    # Check if the current row has "*" in the second column
    if df.iloc[i, 1] == "*":
        # Add the text from the current row to the row above, separated by a space
        modified_df.iloc[i-1, 0] = modified_df.iloc[i-1, 0] + " " + modified_df.iloc[i, 0]
        modified_df.iloc[i-1, 2] = modified_df.iloc[i-1, 2] + " " + modified_df.iloc[i, 2]
        
        # Mark this row for deletion
        rows_to_drop.append(i)

# Drop the rows with "*" in reverse order to avoid index shifting issues
modified_df = modified_df.drop(rows_to_drop)

# Reset the index
modified_df = modified_df.reset_index(drop=True)

# Save the modified dataframe to a new CSV file
modified_df.to_csv('output.csv', index=False)

print(f"Processed CSV file. Removed {len(rows_to_drop)} rows with '*' in the second column.")


'''
i have a csv file named input

it has 3 columns
words_ar
translate_dv
translate_en

in the 2nd column, translate_dv
there are cells which have just '*' in them

now what i want is, in rows where there is just '*' in the second column,
i want the cells text contents of the other columns, i want them to be added to the cell row above them, seperated by a space. i want this to happen for each of the 1st and 3rd columns, where such instances exist in the 2nd column

then i want to remove the row where there was a '*' in the second column

here is some sample data
بِسْمِ	ﷲ ގެ ނަންފުޅުން އަޅުފަށަމެވެ.	In (the) name
ٱللَّهِ	*	(of) Allah,

this should be changed to
بِسْمِ ٱللَّهِ	ﷲ ގެ ނަންފުޅުން އަޅުފަށަމެވެ.	In (the) name (of) Allah,
and the 2nd row should be removed as its contents have been moved up

note that there can be consequtive cells with '*' in the second column, such as in this example:
مَٰلِكِ	عَمَلُ ތަކަށް ހިސާބުބައްލަވާ ދުވަހުގެވެރި.	(The) Master
يَوْمِ	*	(of the) Day
ٱلدِّينِ	*	(of the) Judgment.

that should be changed to:
مَٰلِكِ يَوْمِ ٱلدِّينِ	عَمَلُ ތަކަށް ހިސާބުބައްލަވާ ދުވަހުގެވެރި.	(The) Master (of the) Day (of the) Judgment.

and so on

...

Traceback (most recent call last):
  File "c:\Users\ashra\Downloads\VScode\hadithmv.github.io\notes\scripts\work\bakurube\3 me\process_csv.py", line 19, in <module>
    modified_df.iloc[i-1, 2] = modified_df.iloc[i-1, 2] + " " + modified_df.iloc[i, 2]
                               ~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~
TypeError: unsupported operand type(s) for +: 'float' and 'str'

'''