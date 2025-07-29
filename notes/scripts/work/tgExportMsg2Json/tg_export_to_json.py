import os
import sys
import json
from bs4 import BeautifulSoup
import re

# Find all .html files in the current directory
html_files = [f for f in os.listdir('.') if f.lower().endswith('.html')]

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
    # Replace <br><br> with a unique placeholder, then <br> with another
    html = re.sub(r'<br\s*/?>\s*<br\s*/?>', '__DOUBLE_BR__', html)
    html = re.sub(r'<br\s*/?>', '__SINGLE_BR__', html)
    soup = BeautifulSoup(html, 'html.parser')

    messages = []
    # Each message is in a div with class 'message default clearfix' or 'message default clearfix joined'
    for msg_div in soup.find_all('div', class_=['message', 'default', 'clearfix']):
        # Only process if it has 'default clearfix' in its class list
        classes = msg_div.get('class', [])
        if 'default' not in classes or 'clearfix' not in classes:
            continue
        # Find the date/time
        date_div = msg_div.find('div', class_='pull_right date details')
        if not date_div or not date_div.has_attr('title'):
            continue
        # Extract just the date and time (first part of the title)
        datetime_full = date_div['title']
        datetime = ' '.join(datetime_full.split(' ')[:2])

        # Find the text
        text_div = msg_div.find('div', class_='text')
        if not text_div:
            continue
        # Remove any reactions or unwanted children
        for unwanted in text_div.find_all(['span', 'div'], class_=['reactions']):
            unwanted.decompose()
        text = text_div.get_text(separator='', strip=True)
        # Restore line breaks
        text = text.replace('__DOUBLE_BR__', '\n\n').replace('__SINGLE_BR__', '\n')
        if not text:
            continue
        messages.append([datetime, text])  # 2D array: [datetime, text]

    # Output to JSON file
    json_file = os.path.splitext(html_file)[0] + '.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

print(f"Processed {len(html_files)} HTML file(s). JSON output created for each.") 