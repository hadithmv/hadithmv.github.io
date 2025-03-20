# pip install requests

import requests
import json
import time

def fetch_quran_data(surah_number):
    # Construct the URL for the specific surah
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    # Define headers for the HTTP request
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    # Send GET request to the URL
    response = requests.get(url, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        return data['props']['ayahs']
    else:
        print(f"Error: Received status code {response.status_code} for Surah {surah_number}")
        return None

# Initialize an empty list to store all ayahs
all_ayahs = []

# Fetch data for Surahs 1 to 5
for surah_number in range(1, 6):  # This will go from 1 to 5
#for surah_number in range(1, 115):  # This will go from 1 to 114
    print(f"Fetching data for Surah {surah_number}")
    surah_ayahs = fetch_quran_data(surah_number)
    
    # If data was successfully fetched, add it to the list
    if surah_ayahs:
        all_ayahs.extend(surah_ayahs)
        print(f"Data for Surah {surah_number} fetched successfully.")
    else:
        print(f"Failed to fetch data for Surah {surah_number}")
    
    # Add a small delay between requests to be respectful to the server
    time.sleep(2)

# Save all ayahs to a single JSON file
output_file = 'quran_ayahs.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_ayahs, f, ensure_ascii=False, indent=2)

print(f"All ayahs data saved to {output_file}")


    # COMMENTS BELOW

    #
    #
    #
    #
    

"""
    there is this site:
https://quranthafseeru.com/read/1

opening network in devtools, shows this in the headers tab:

Request URL:
https://quranthafseeru.com/read/1
Request Method:
GET
Status Code:
200 OK
Remote Address:
157.245.48.81:443
Referrer Policy:
strict-origin-when-cross-origin
cache-control:
no-cache, private
connection:
keep-alive
content-type:
application/json
date:
Mon, 02 Sep 2024 19:37:15 GMT
server:
nginx/1.18.0 (Ubuntu)
set-cookie:
XSRF-TOKEN=eyJpdiI6Im5OWkpiUmFMbklzSUpCcDZKWU5Ta3c9PSIsInZhbHVlIjoiN1lnVGhMVkxhTjF3SmtRSkNkb0xtSWxXRDIrVm5NbjJtNngzNHBqVW15eUZMNFVMc0o4QVFlUUgvcER1b1BkNkg0cmc0Q0N2a2VVRTR2dHJyLzhKdnNYdkNjTUpmVlJGYUhqZVNNcExJNUFWUm1RTURHZlU3NFJmQStaVG94NDkiLCJtYWMiOiIxNGUxMTg0ZTRjMmI3YzBiZmZkYWQ4N2JmYjI0YjYwZTNmMDVlNGNjMTQ3OWE1NWUzNTVhNDNkMDAxNDg2OTY5IiwidGFnIjoiIn0%3D; expires=Mon, 02 Sep 2024 21:37:15 GMT; Max-Age=7200; path=/; samesite=lax
set-cookie:
thafseeru_session=eyJpdiI6IlorYUpUMmtmZWhiY0tteXZFK3RuYVE9PSIsInZhbHVlIjoiL1k1TWFqSytWZlYxQm9mV2FKM2xTT1FPanBydzZRdUU3Sk1pZkRqQys4UkNkMUF1V0ZiK3k0MkFueXhnc0N0dUdwUUM5QUFTWVh6bk9YdTBSbUNmczl4ZkhIUEc1ajUwWVMrNGthV09JMUdBU3lTSzlpbTJXUUdqVDRtVDV2U3YiLCJtYWMiOiI1OWNjNjVhN2NmMmY1MDFhZTkzNGVlMGIwYzMyMjcyMzRkMmM1MWFhZDBiODc4Mzc2NWExMDM0ZmEwOTBjZDdmIiwidGFnIjoiIn0%3D; expires=Mon, 02 Sep 2024 21:37:15 GMT; Max-Age=7200; path=/; httponly; samesite=lax
transfer-encoding:
chunked
vary:
X-Inertia
x-inertia:
true
accept:
text/html, application/xhtml+xml
accept-encoding:
gzip, deflate, br, zstd
accept-language:
en-US,en-GB;q=0.9,en;q=0.8
cache-control:
no-cache
connection:
keep-alive
content-type:
application/json
cookie:
XSRF-TOKEN=eyJpdiI6IjAyS000S2VEN3g5cndKazRoM1VJalE9PSIsInZhbHVlIjoiZ1ZFMlNwVm9JSmtKREhDYjNhRXpLT3QyTWtRTGFsREdnTm41RXlDVGE1eGZ6aDB0Q2V6TksxZ1RDdUxxNkFmTmcrU1NOWEJaSFhSbzhOWkRWamUvUmI0a1IvSUlzMW54SnlnZGNzYkhpM1NhSGxPNTNVbHM2aGR0MjczV3JsUlYiLCJtYWMiOiJhOTkzZjI5NDJlYzdiNDE5MTY1OTVjMDE5NWEwNzYyNGIyOTViYTg0YzYyZDAyMzY2NGI0MDVjMjhjMmM3OWVmIiwidGFnIjoiIn0%3D; thafseeru_session=eyJpdiI6Imw5UGxyUDJ6alZ1SHJqbDRrRE1hZkE9PSIsInZhbHVlIjoiMmdIZzk3VWVPNnRPREhobkMyaDFtM0QrVWhnd1Y5eU9EY3ZFQTVjOU41YXF2Q2VYWVI3WE8yZFR6MDlJUWN4S1k4UFlpR3RHdTVZcFlhZXRueENudWRPWW4vaWNzdDdhZDJubEh4UzNoOFRac2VpaUdCMFRpUTBORjhibDVLRGEiLCJtYWMiOiJjNWJjYzUyM2Y5MjE5Mjk3NzBmNjBjZjBjYzUyODg2ZGU4NjkxNzY3NzJmMDBmZDhiMDI5YmQyZWRlMzZiOGVjIiwidGFnIjoiIn0%3D
dnt:
1
host:
quranthafseeru.com
pragma:
no-cache
referer:
https://quranthafseeru.com/
sec-ch-ua:
"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"
sec-ch-ua-mobile:
?0
sec-ch-ua-platform:
"Windows"
sec-fetch-dest:
empty
sec-fetch-mode:
cors
sec-fetch-site:
same-origin
user-agent:
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0
x-inertia:
true
x-inertia-version:
540510c2ac4712bd7d9e3ffb5e475022
x-requested-with:
XMLHttpRequest
x-xsrf-token:
eyJpdiI6IjAyS000S2VEN3g5cndKazRoM1VJalE9PSIsInZhbHVlIjoiZ1ZFMlNwVm9JSmtKREhDYjNhRXpLT3QyTWtRTGFsREdnTm41RXlDVGE1eGZ6aDB0Q2V6TksxZ1RDdUxxNkFmTmcrU1NOWEJaSFhSbzhOWkRWamUvUmI0a1IvSUlzMW54SnlnZGNzYkhpM1NhSGxPNTNVbHM2aGR0MjczV3JsUlYiLCJtYWMiOiJhOTkzZjI5NDJlYzdiNDE5MTY1OTVjMDE5NWEwNzYyNGIyOTViYTg0YzYyZDAyMzY2NGI0MDVjMjhjMmM3OWVmIiwidGFnIjoiIn0=


and in the response tab of devtools, it shows:

{
    "component": "surah",
    "props": {
        "errors": {},
        "appName": "Thafseeru",
        "locale": "dv",
        "flash": {
            "message": null
        },
        "surah": "1",
        "ayahs": [
  {
    "id": 1,
    "surah_id": 1,
    "ayah": 1,
    "content": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 1,
      "ayah_id": 1,
      "translation": "رحمن ވަންތަ رحيم ވަންތަ اللَّه ގެ اسم ފުޅުން ފަށައިގަންނަމެވެ. (1)",
      "thafseer": "ބިސްމި (البسملة) ގެ ތަފްސީރު އިސްވެ ހިނގައްޖެއެވެ.",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 2,
    "surah_id": 1,
    "ayah": 2,
    "content": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 2,
      "ayah_id": 2,
      "translation": "حمد ހުރީ، عالم ތަކުގެ ވެރި اللَّه އަށެވެ. (2)",
      "thafseer": "ނެތުމުގެ ތެރޭން މިކައުނު އުފެއްދެވި ގަދަކީރިތިވަންތަ",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 3,
    "surah_id": 1,
    "ayah": 3,
    "content": "الرَّحْمَـٰنِ الرَّحِيمِ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 3,
      "ayah_id": 3,
      "translation": "(އެކަލާނގެއީ) رحمن ވަންތަ رحيم ވަންތަ ރަސްކަލާނގެއެވެ. (3)",
      "thafseer": "މިއީ މާތް الله ގެ އިސްމުފު",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 4,
    "surah_id": 1,
    "ayah": 4,
    "content": "مَالِكِ يَوْمِ الدِّينِ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 4,
      "ayah_id": 4,
      "translation": "قيامة ދުވަހުގެ ވެރި ރަސްކަލާނގެއެވެ. (4)",
      "thafseer": "الله  ސުބްޙާނަހޫ ވަތަޢާލާ އަކީ ހިސާބު",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 5,
    "surah_id": 1,
    "ayah": 5,
    "content": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 5,
      "ayah_id": 5,
      "translation": "އަޅަމެން އަޅުކަންކުރަނީ، އިބަރަސްކަލާނގެއަށެވެ. އަދި އަޅަމެން ވާގިއެދެނީ، އިބަރަސްކަލާނގެ ޙަޟްރަތުންނެވެ. (5)",
      "thafseer": "އަޅަމެންގެ ވެރިރަސްކަލާނކޯއެވެ!އަޅަމެންގެ އަ",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 6,
    "surah_id": 1,
    "ayah": 6,
    "content": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 6,
      "ayah_id": 6,
      "translation": "އަޅަމެންނަށް، ސީދާވެގެންވާ ތެދުމަގަށް މަގު ދައްކަވާނދޭވެ! (6)",
      "thafseer": "ސީދާވެގެންވާ ތެދުމަގަށް އަޅަމެނަށް މަގު",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  },
  {
    "id": 7,
    "surah_id": 1,
    "ayah": 7,
    "content": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    "created_at": null,
    "updated_at": null,
    "thafseer": {
      "id": 7,
      "ayah_id": 7,
      "translation": "(އެއީ) އެއުރެންނަށް އިބަރަސްކަލާނގެ ނިޢުމަތް ދެއްވި މީހުންގެ މަގެވެ. އެއުރެންގެ މައްޗަށް ކޯފާލައްވާފައިވާ މީހުންގެ މަގެއްނޫނެވެ. އަދި މަގުފުރެދިފައިވާ މީހުންގެ މަގެއްވެސް ނުމެނޫންމެއެވެ. (7)",
      "thafseer": "އިބަރަސްކަލާނގެ ހިދާޔަތްދެއްވި އަޅުންގެ މަގެވެ. ނަބިއްޔުންނާއި، ތެދުވެރިންނާއި، ޞާލިޙުންނާ ސަވައިދެއްވާނެތެވެ.\" (ޞަޙީޙުލް ބުޚާރީ، ޙަދީޘު: 4475)",
      "title": "",
      "note": "",
      "created_at": null,
      "updated_at": null
    }
  }
],
        "auth": {
            "user": null
        }
    },
    "url": "\/read\/1",
    "version": "540510c2ac4712bd7d9e3ffb5e475022"
}

how do i get the response programatically

...

claude:

import requests
import json

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: Received status code {response.status_code}")
        return None

# Example usage
surah_data = fetch_quran_data(1)
if surah_data:
    print(json.dumps(surah_data, indent=2))
    # You can now access specific parts of the data, e.g.:
    # ayahs = surah_data['props']['ayahs']
    # for ayah in ayahs:
    #     print(f"Ayah {ayah['ayah']}: {ayah['content']}")

...

thats good. it works. i want output saved to json file

...

claude:

import requests
import json
import os

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: Received status code {response.status_code}")
        return None

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data saved to {filename}")

# Example usage
surah_number = 1
surah_data = fetch_quran_data(surah_number)

if surah_data:
    # Create a directory for output if it doesn't exist
    output_dir = 'quran_data'
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the entire response
    filename = os.path.join(output_dir, f'surah_{surah_number}_full.json')
    save_to_json(surah_data, filename)
    
    # Optionally, save only the ayahs data
    ayahs = surah_data['props']['ayahs']
    filename_ayahs = os.path.join(output_dir, f'surah_{surah_number}_ayahs.json')
    save_to_json(ayahs, filename_ayahs)
    
    print("Data fetching and saving completed successfully.")
else:
    print("Failed to fetch data.")

...

that works for

https://quranthafseeru.com/read/1

i want it to get data from
https://quranthafseeru.com/read/1
https://quranthafseeru.com/read/2
https://quranthafseeru.com/read/3
...all the way to 5

...

claude:

import requests
import json
import os
import time

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: Received status code {response.status_code} for Surah {surah_number}")
        return None

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data saved to {filename}")

# Create a directory for output if it doesn't exist
output_dir = 'quran_data'
os.makedirs(output_dir, exist_ok=True)

# Fetch and save data for Surahs 1 to 5
for surah_number in range(1, 6):  # This will go from 1 to 5
    print(f"Fetching data for Surah {surah_number}")
    surah_data = fetch_quran_data(surah_number)
    
    if surah_data:
        # Save the entire response
        filename = os.path.join(output_dir, f'surah_{surah_number}_full.json')
        save_to_json(surah_data, filename)
        
        # Save only the ayahs data
        ayahs = surah_data['props']['ayahs']
        filename_ayahs = os.path.join(output_dir, f'surah_{surah_number}_ayahs.json')
        save_to_json(ayahs, filename_ayahs)
        
        print(f"Data for Surah {surah_number} saved successfully.")
    else:
        print(f"Failed to fetch data for Surah {surah_number}")
    
    # Add a small delay between requests to be respectful to the server
    time.sleep(2)

print("Data fetching and saving completed for all requested Surahs.")

...

this is my code:

import requests
import json
import os
import time

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: Received status code {response.status_code} for Surah {surah_number}")
        return None

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data saved to {filename}")

# Create a directory for output if it doesn't exist
output_dir = 'quran_data'
os.makedirs(output_dir, exist_ok=True)

# Fetch and save data for Surahs 1 to 5
for surah_number in range(1, 6):  # This will go from 1 to 5
    print(f"Fetching data for Surah {surah_number}")
    surah_data = fetch_quran_data(surah_number)
    
    if surah_data:
        # Save the entire response
        filename = os.path.join(output_dir, f'surah_{surah_number}_full.json')
        save_to_json(surah_data, filename)
        
        # Save only the ayahs data
        ayahs = surah_data['props']['ayahs']
        filename_ayahs = os.path.join(output_dir, f'surah_{surah_number}_ayahs.json')
        save_to_json(ayahs, filename_ayahs)
        
        print(f"Data for Surah {surah_number} saved successfully.")
    else:
        print(f"Failed to fetch data for Surah {surah_number}")
    
    # Add a small delay between requests to be respectful to the server
    time.sleep(2)

print("Data fetching and saving completed for all requested Surahs.")


...


this is my code. it gets json responses from a website

right now it creates a "quran_data" folder, inside are 2 json files for every surah, like surah_1_full and surah_1_ayahs

i dont need the quran-data folder
i dont need files like surah_1_full
i just need files like surah_1_ayahs, but not separate files, i need one file with the json of multiple surahs, one after another

...

claude:

import requests
import json
import time

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data['props']['ayahs']
    else:
        print(f"Error: Received status code {response.status_code} for Surah {surah_number}")
        return None

# Initialize an empty dictionary to store all surahs' ayahs
all_surahs_ayahs = {}

# Fetch data for Surahs 1 to 5
for surah_number in range(1, 6):  # This will go from 1 to 5
    print(f"Fetching data for Surah {surah_number}")
    surah_ayahs = fetch_quran_data(surah_number)
    
    if surah_ayahs:
        all_surahs_ayahs[f"surah_{surah_number}"] = surah_ayahs
        print(f"Data for Surah {surah_number} fetched successfully.")
    else:
        print(f"Failed to fetch data for Surah {surah_number}")
    
    # Add a small delay between requests to be respectful to the server
    time.sleep(2)

# Save all surahs' ayahs to a single JSON file
output_file = 'quran_ayahs.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_surahs_ayahs, f, ensure_ascii=False, indent=2)

print(f"All ayahs data saved to {output_file}")

...

that puts the json data between 

{
  "surah_1": [
 {
      "id": 1,
      "surah_id": 1,
      "ayah": 1,
...
}
],
  "surah_2": [
...
],
  "surah_3": [
...
],
  "surah_4": [
...
]}


i dont want that, i just want the
 {
      "id": 1,
      "surah_id": 1,
      "ayah": 1,
...
},
 {
      "id": 1,
      "surah_id": 1,
      "ayah": 1,
...
},
...

of each surah one after the other

...

claude:

import requests
import json
import time

def fetch_quran_data(surah_number):
    url = f"https://quranthafseeru.com/read/{surah_number}"
    
    headers = {
        "Accept": "application/json",
        "X-Inertia": "true",
        "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data['props']['ayahs']
    else:
        print(f"Error: Received status code {response.status_code} for Surah {surah_number}")
        return None

# Initialize an empty list to store all ayahs
all_ayahs = []

# Fetch data for Surahs 1 to 5
for surah_number in range(1, 6):  # This will go from 1 to 5
    print(f"Fetching data for Surah {surah_number}")
    surah_ayahs = fetch_quran_data(surah_number)
    
    if surah_ayahs:
        all_ayahs.extend(surah_ayahs)
        print(f"Data for Surah {surah_number} fetched successfully.")
    else:
        print(f"Failed to fetch data for Surah {surah_number}")
    
    # Add a small delay between requests to be respectful to the server
    time.sleep(2)

# Save all ayahs to a single JSON file
output_file = 'quran_ayahs.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_ayahs, f, ensure_ascii=False, indent=2)

print(f"All ayahs data saved to {output_file}")

...


"""