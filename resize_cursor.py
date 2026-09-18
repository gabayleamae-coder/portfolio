from PIL import Image

input_path = 'galaxy_cursor.png'
output_path = 'cursor.png'

try:
    img = Image.open(input_path)
    img = img.resize((32, 32), Image.Resampling.LANCZOS)
    img.save(output_path)
    print("Cursor resized successfully.")
except Exception as e:
    print(f"Error: {e}")
