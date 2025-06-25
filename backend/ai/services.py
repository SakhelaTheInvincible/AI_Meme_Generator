from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import requests
import textwrap
import base64
import io
from concurrent.futures import ThreadPoolExecutor
from client import prompt_image_context, ai_call, prompt_context_summary

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
        "Content-Type": "application/json"
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



if __name__ == "__main__":
    image_path = "https://miro.medium.com/v2/resize:fit:1400/1*GI-td9gs8D5OKZd19mAOqA.png"
    #image_path = r"C:\Users\user\Downloads\SPIDER2.jpg"
    context = get_image_context(image_path)
    print(generate_meme_captions(context))