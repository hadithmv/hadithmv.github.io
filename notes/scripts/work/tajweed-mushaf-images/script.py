import requests
import os

# Directory to save images
save_dir = 'downloaded_images'
os.makedirs(save_dir, exist_ok=True)

# Base URL of the images
base_url = 'https://easyquran-eg.com/qrhafs/assets/frontend/dist/img/'

for i in range(1, 605):  # 605 because range is exclusive at the end
    image_number = f"{i:03d}"  # Format number as three digits with leading zeros
    image_url = f"{base_url}{image_number}.jpg"
    response = requests.get(image_url)
    
    if response.status_code == 200:
        with open(os.path.join(save_dir, f"{image_number}.jpg"), 'wb') as file:
            file.write(response.content)
        print(f"Downloaded {image_url}")
    else:
        print(f"Failed to download {image_url}")

print("Download complete.")
