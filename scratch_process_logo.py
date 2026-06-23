import sys
from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # We want to detect the orange pixels and find their bounding box
    # Orange hex #FF5C00 is around (255, 92, 0)
    # Let's find the bounding box of saturated orange pixels
    width, height = img.size
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    new_data = []
    for y in range(height):
        for x in range(width):
            pixel = datas[y * width + x]
            r, g, b, a = pixel
            
            # Orange detection: high red, moderate green, low blue, and not grey
            is_orange = r > 180 and g > 50 and b < 100 and (r - g) > 50 and (g - b) > 30
            
            if is_orange:
                # Keep original orange pixel
                new_data.append((r, g, b, a))
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
            else:
                # Make transparent
                new_data.append((255, 255, 255, 0))
                
    if max_x < min_x or max_y < min_y:
        print("No orange logo found!")
        return False
        
    # Put transparency back
    img.putdata(new_data)
    
    # Add a small padding of 15 pixels around the cropped logo
    padding = 20
    crop_box = (
        max(0, min_x - padding),
        max(0, min_y - padding),
        min(width, max_x + padding),
        min(height, max_y + padding)
    )
    
    cropped_img = img.crop(crop_box)
    cropped_img.save(output_path, "PNG")
    print(f"Processed logo saved successfully to {output_path} with bounds {crop_box}")
    return True

if __name__ == "__main__":
    input_img = "/Users/cd/.gemini/antigravity/brain/102fc3e8-92c6-4fee-86b2-a0c25d930d43/media__1779029964476.png"
    output_img = "/Users/cd/.gemini/antigravity/scratch/capten/public/logo.png"
    process_logo(input_img, output_img)
