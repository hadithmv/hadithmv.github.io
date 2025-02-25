
import re

def is_balanced_rtl(line):
    stack = []
    rtl_pairs = {')': '(', ']': '[', '}': '{', '“': '”', '”': '“'}
    single_pairs = {'--', '==', '""'}
    
    # Check paired symbols
    for char in line:
        if char in rtl_pairs.values():  # Opening bracket (LTR perspective)
            stack.append(char)
        elif char in rtl_pairs:  # Closing bracket (LTR perspective)
            if not stack or stack.pop() != rtl_pairs[char]:
                return False
    
    # If stack isn't empty, it means unbalanced brackets
    if stack:
        return False
    
    # Check single pair symbols
    for pair in single_pairs:
        if line.count(pair) % 2 != 0:
            return False
    
    return True

def find_unbalanced_lines(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', encoding='utf-8') as outfile:
        for line in infile:
            if not is_balanced_rtl(line.strip()):
                outfile.write(line)

if __name__ == "__main__":
    find_unbalanced_lines("this.txt", "output.txt")


'''

I want catch lines where there are brackets and stuff like below if they are not opened and closed properly:
(), [], {}, --, "", ==, “”

note there can be nested such opens and closes, like:
() (()) ()

but note that this is rtl text, so it would actually open and close like below not above:
)(, ][, }{, --, "", ==, ”“

and nests would be like:
)( ))(( )(

input file is called "this.txt"
output all such lines with improper rtl opening and closing stuff, save such lines in an output file called "output.txt"

write a script

'''