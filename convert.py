import os
from PIL import Image

folder = r"e:\elanog\assets\bus-fleet"
for file in os.listdir(folder):
    if file.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join(folder, file)
        try:
            img = Image.open(file_path)
            # convert to RGB if PNG with alpha, to save space, but keeping alpha might be needed for PNG
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            new_file_name = os.path.splitext(file)[0] + ".webp"
            new_file_path = os.path.join(folder, new_file_name)
            
            img.save(new_file_path, "webp", quality=80)
            print(f"Converted {file} to {new_file_name}")
            
            # Optionally remove old file to save space but I will keep them and manually update HTML
            # os.remove(file_path)
        except Exception as e:
            print(f"Failed to convert {file}: {e}")
