from rembg import remove
from PIL import Image

input_path = 'galaxy_cursor.jpg'
output_path = 'galaxy_cursor.png'

try:
    input = Image.open(input_path)
    output = remove(input)
    output.save(output_path)
    print("Background removed successfully.")
except Exception as e:
    print(f"Error: {e}")
