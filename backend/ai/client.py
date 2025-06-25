import os
from openai import OpenAI
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

def get_ai_client():
    return OpenAI(
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url="https://api.deepseek.com"
    )

def prompt_context_summary(context):
    return f"""
    You have 4 descriptions of the same image, and you need to summarize them into one context.
    Act like you are a detective and want to identify the main idea of the image with using contexts and clues from all of the descriptions:
    {context}
    
    Rule:
        - return only summary of descriptions
        - no explanation
        - no labels (e.g. 'Top:'), no emojis, no numbering.
    """


def prompt_image_context(context):
    return f"""
    You are a meme expert. Generate meme captions based on this image description:
    "{context}"
    
    CRITICAL RULES:
    - FOR SINGLE IMAGE: Generate EXACTLY ONE caption only
    - FOR MULTIPLE IMAGES/PANELS: Generate one caption per image/panel, separated by newlines
    - Each caption should be short (5-10 words)
    - Use sarcasm, irony, relatable jokes
    - Return ONLY the captions, no explanations, no labels, no emojis, no numbering
    
    IMPORTANT: Count the images/panels in the description carefully:
    - If description mentions ONE image/scene → return ONE caption
    - If description mentions split image/multiple panels/before-after → return multiple captions separated by newlines
    
    Examples:
    Description: "a man is looking sad at hot dog which is on the street ground."
    Output: And there goes my paradise
    
    Description: "Split image, a man is looking without glasses in 1 image, it's almost like he can't see clearly, on the second image he is wearing glasses"
    Output: Lets watch F1\nLets watch 20 rich guys racing
    """


def ai_call(prompt):
    client = get_ai_client()
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        content = response.choices[0].message.content.strip()
        return content
    except Exception as e:
        print(f"Error generating captions: {e}")
        return None