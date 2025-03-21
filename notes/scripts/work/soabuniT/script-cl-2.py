# this is claudes improvement of the previous script

# pip install aiohttp
# pip install tqdm

import asyncio
import aiohttp
import json
import argparse
from tqdm import tqdm
import logging
from pathlib import Path

# Setup logging to track the script's progress and any errors
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuration for the API request
BASE_URL = "https://quranthafseeru.com/read/{}"
HEADERS = {
    "Accept": "application/json",
    "X-Inertia": "true",
    "X-Inertia-Version": "540510c2ac4712bd7d9e3ffb5e475022",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
}

async def fetch_quran_data(session, surah_number):
    """
    Asynchronously fetch data for a single Surah.
    """
    url = BASE_URL.format(surah_number)
    async with session.get(url, headers=HEADERS) as response:
        if response.status == 200:
            data = await response.json()
            return surah_number, data['props']['ayahs']
        else:
            logging.error(f"Error: Received status code {response.status} for Surah {surah_number}")
            return surah_number, None

async def main(start_surah, end_surah):
    """
    Main function to fetch data for a range of Surahs.
    """
    surah_ayahs = {}
    async with aiohttp.ClientSession() as session:
        # Create a list of tasks for each Surah
        tasks = [fetch_quran_data(session, surah_number) for surah_number in range(start_surah, end_surah + 1)]
        
        # Execute tasks concurrently and collect results
        for completed_task in tqdm(asyncio.as_completed(tasks), total=end_surah-start_surah+1, desc="Fetching Surahs"):
            surah_number, result = await completed_task
            if result:
                surah_ayahs[surah_number] = result

    # Flatten the list of ayahs while maintaining order
    all_ayahs = []
    for surah_number in range(start_surah, end_surah + 1):
        if surah_number in surah_ayahs:
            all_ayahs.extend(surah_ayahs[surah_number])

    # Save the collected data to a JSON file
    output_file = Path('quran_ayahs.json')
    with output_file.open('w', encoding='utf-8') as f:
        json.dump(all_ayahs, f, ensure_ascii=False, indent=2)

    logging.info(f"All ayahs data saved to {output_file}")

if __name__ == "__main__":
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Fetch Quran data for specified Surah range.")
    parser.add_argument("--start", type=int, default=1, help="Starting Surah number")
    #parser.add_argument("--end", type=int, default=5, help="Ending Surah number")
    parser.add_argument("--end", type=int, default=114, help="Ending Surah number")
    args = parser.parse_args()

    # Run the main async function
    asyncio.run(main(args.start, args.end))

    
