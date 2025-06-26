from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import requests
import textwrap
import base64
import io
import os
from concurrent.futures import ThreadPoolExecutor
from .client import prompt_image_context, ai_call, prompt_context_summary, botsai

def generate_meme_captions(context):
    try:
        prompt = prompt_context_summary(context)
        summary = ai_call(prompt)
        prompt = prompt_image_context(summary)
        content = ai_call(prompt)
        captions = [line.strip() for line in content.split('\n') if line.strip()]
        if captions:
            return captions
        return [context]
    except Exception as e:
        print(f"Error generating captions: {e}")
        return [context]

def load_image(image_source):
    if image_source.startswith(('http://', 'https://')):
        return Image.open(requests.get(image_source, stream=True).raw).convert("RGB")
    return Image.open(image_source).convert("RGB")


def prepare_image(image_path, max_size=(800, 800), quality=85):
    img = load_image(image_path)
    img.thumbnail(max_size)

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)

    encoded = base64.b64encode(buffer.read()).decode("utf-8")
    return encoded

def make_caption_request(image_data):
    url = "https://docsbot.ai/api/tools/image-prompter"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {botsai()}"
    }
    payload = {
        "image": image_data
    }
    response = requests.post(url, headers=headers, json=payload)
    
    return response.text

def get_image_context(image_path):
    image_data = prepare_image(image_path)
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(make_caption_request, image_data) for _ in range(4)]
        
        results = []
        for future in futures:
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                results.append(f"Request failed: {str(e)}")
    
    combined_context = "\n\n".join(results)
    return combined_context

def find_image_regions(image_cv, min_area=5000):
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    grid_regions = detect_grid_layout(image_cv)
    if grid_regions:
        return grid_regions
    
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w * h > min_area and w > 50 and h > 50:
            boxes.append((x, y, w, h))
    
    boxes = remove_overlapping_boxes(boxes)
    boxes = sorted(boxes, key=lambda b: (b[1], b[0]))
    return boxes


def detect_layout_pattern(image_cv, num_captions):
    h, w = image_cv.shape[:2]
    aspect_ratio = w / h
    
    # determine if it's a vector (single row/column) or matrix
    if aspect_ratio > 2.0:
        # wide - likely horizontal vector
        return "horizontal_vector", (1, num_captions)
    elif aspect_ratio < 0.5:
        # tall - likely vertical vector  
        return "vertical_vector", (num_captions, 1)
    else:
        # square-ish - likely matrix
        rows, cols = find_best_matrix_dimensions(num_captions, aspect_ratio)
        return "matrix", (rows, cols)


def find_best_matrix_dimensions(num_captions, aspect_ratio):
    best_fit = (1, num_captions)
    best_score = float('inf')
    for rows in range(1, num_captions + 1):
        if num_captions % rows == 0:
            cols = num_captions // rows
            grid_aspect = cols / rows
            score = abs(grid_aspect - aspect_ratio)
            
            if score < best_score:
                best_score = score
                best_fit = (rows, cols)
    return best_fit

def create_grid_regions(image_cv, layout_type, dimensions):
    h, w = image_cv.shape[:2]
    rows, cols = dimensions
    regions = []
    
    margin = 5
    cell_w = w // cols
    cell_h = h // rows
    
    for row in range(rows):
        for col in range(cols):
            x = col * cell_w + margin
            y = row * cell_h + margin
            rw = cell_w - 2 * margin
            rh = cell_h - 2 * margin
            
            roi = image_cv[y:y+rh, x:x+rw]
            if has_content(roi):
                regions.append((x, y, rw, rh))
    
    return regions


def detect_grid_layout(image_cv, num_captions):
    layout_type, dimensions = detect_layout_pattern(image_cv, num_captions)
    regions = create_grid_regions(image_cv, layout_type, dimensions)
    
    if len(regions) >= num_captions:
        return regions[:num_captions]
    
    return None


def has_content(roi, threshold=0.1):
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY) if len(roi.shape) == 3 else roi
    non_white_pixels = np.sum(gray < 240)
    total_pixels = gray.size
    return (non_white_pixels / total_pixels) > threshold


def remove_overlapping_boxes(boxes, overlap_threshold=0.5):
    if len(boxes) <= 1:
        return boxes
    
    def boxes_overlap(box1, box2):
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2
        
        # calculate intersection
        left = max(x1, x2)
        top = max(y1, y2)
        right = min(x1 + w1, x2 + w2)
        bottom = min(y1 + h1, y2 + h2)
        
        if left >= right or top >= bottom:
            return False
        
        intersection = (right - left) * (bottom - top)
        area1, area2 = w1 * h1, w2 * h2
        smaller_area = min(area1, area2)
        
        return (intersection / smaller_area) > overlap_threshold
    
    filtered = []
    for box in boxes:
        overlaps = any(boxes_overlap(box, existing) for existing in filtered)
        if not overlaps:
            filtered.append(box)
    
    return filtered


def create_caption_zones_on_images(image_regions, img_size, caption_height_ratio=0.15):
    zones = []
    for i, (x, y, w, h) in enumerate(image_regions):
        caption_height = max(30, int(h * caption_height_ratio))
        caption_y = y + h - caption_height
        zones.append(("image_caption", x, caption_y, w, caption_height))
    return zones


def assign_zones_to_captions(zones, captions, image_size):
    assigned = []
    
    # match captions to zones (1:1 if possible)
    for i in range(min(len(zones), len(captions))):
        side, x, y, w, h = zones[i]
        assigned.append(((x, y, w, h), captions[i]))
    
    # handle remaining captions if more captions than zones
    if len(captions) > len(zones):
        remaining_captions = captions[len(zones):]
        W, H = image_size
        
        for i, caption in enumerate(remaining_captions):
            # stack them vertically at bottom
            zone_height = 50
            y_pos = H - (len(remaining_captions) - i) * zone_height
            assigned.append(((0, y_pos, W, zone_height), caption))
    
    return assigned


def fit_font_for_box(draw, text, box_w, box_h, font_path=None, height_ratio=0.6):
    target_h = int(box_h * height_ratio)
    
    for size in range(target_h, 8, -2):
        font = get_scalable_font(size)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        if text_w <= box_w * 0.9 and text_h <= target_h:
            return font
    
    return get_scalable_font(8)


def get_scalable_font(size=20):
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except:
        possible_fonts = [
            "C:/Windows/Fonts/arial.ttf",
            "/Library/Fonts/Arial.ttf", 
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
        for path in possible_fonts:
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except:
                    continue
        return ImageFont.load_default()
    

def draw_text_with_outline(draw, pos, text, font, fill_color="black", outline_color="white", outline_width=2):
    x, y = pos
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)
    draw.text((x, y), text, font=font, fill=fill_color)


def meme_with_captions(image_path, captions, font_path=None):
    # load image, process it and remove blank spaces
    img = load_image(image_path)
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    processed_img = remove_blank_spaces(cv_img)
    processed_pil = Image.fromarray(cv2.cvtColor(processed_img, cv2.COLOR_BGR2RGB))
    cv_processed = cv2.cvtColor(np.array(processed_pil), cv2.COLOR_RGB2BGR)
    
    image_regions = detect_grid_layout(cv_processed, len(captions))
        
    if not image_regions:
        image_regions = find_image_regions(cv_processed)
    
    if image_regions and len(image_regions) >= len(captions):
        zones = create_caption_zones_on_images(image_regions, processed_pil.size)
    else:
        # fallback
        W, H = processed_pil.size
        num_captions = len(captions)
        
        if W > H * 1.5:  # wide image - horizontal strips
            strip_height = H // num_captions
            zones = [("fallback", 0, i * strip_height, W, strip_height) 
                    for i in range(num_captions)]
        else:  # square/tall image - try 2x2 for 4 captions
            if num_captions == 4:
                half_w, half_h = W // 2, H // 2
                zones = [
                    ("fallback", 0, 0, half_w, half_h),
                    ("fallback", half_w, 0, half_w, half_h),
                    ("fallback", 0, half_h, half_w, half_h),
                    ("fallback", half_w, half_h, half_w, half_h)
                ]
            else:
                strip_height = H // num_captions
                zones = [("fallback", 0, i * strip_height, W, strip_height) 
                        for i in range(num_captions)]

    assigned = assign_zones_to_captions(zones, captions, processed_pil.size)
    
    # draw captions
    draw = ImageDraw.Draw(processed_pil)
    
    for (x, y, w, h), text in assigned:
        font = fit_font_for_box(draw, text, w, h, font_path)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = x + (w - text_w) // 2
        ty = y + (h - text_h) // 2
        draw_text_with_outline(draw, (tx, ty), text, font)
    
    return processed_pil


def remove_blank_spaces(image_cv, threshold=5):
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    def find_boundary(arr, threshold, reverse=False):
        arr = arr[::-1] if reverse else arr
        for i, val in enumerate(arr):
            if not (val <= threshold or val >= 255-threshold):
                return i
        return 0
    top = find_boundary(gray.mean(axis=1), threshold)
    bottom = h - find_boundary(gray.mean(axis=1), threshold, reverse=True)
    left = find_boundary(gray.mean(axis=0), threshold)
    right = w - find_boundary(gray.mean(axis=0), threshold, reverse=True)
    
    # return cropped content
    return image_cv[top:bottom, left:right]


def generate_meme(image_path):
    context = get_image_context(image_path)
    captions = generate_meme_captions(context)
    final_meme = meme_with_captions(image_path, captions)
    return final_meme

# if __name__ == "__main__":
#     #image_path = "https://miro.medium.com/v2/resize:fit:1400/1*GI-td9gs8D5OKZd19mAOqA.png"
#     image_path = r"C:\Users\user\Downloads\drake.jpg"
#     context = get_image_context(image_path)
#     captions = generate_meme_captions(context)
#     print("captions generated")
#     final_meme = meme_with_captions(image_path, captions)
#     final_meme.show()