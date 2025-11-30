#!/usr/bin/env python3

import os
import sys
import json
import asyncio
from dotenv import load_dotenv
from openai import OpenAI
import edge_tts
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from moviepy.editor import (
    ImageClip, TextClip, AudioFileClip, VideoFileClip,
    CompositeVideoClip, CompositeAudioClip,
    concatenate_videoclips
)
import textwrap
import re

# -------------------------
# CONFIG
# -------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not set in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

OUT_W, OUT_H = 1080, 1920
PROMPTS_FILE = "prompts.json"
OUT_VIDEO = "final_video.mp4"
OUT_SRT = "subtitles.srt"

STYLE_PROMPTS = {
    "cinematic": "cinematic lighting, filmic color grading, dramatic rim light",
    "anime": "anime style, cel-shaded, expressive faces",
    "pixar": "pixar 3D render, soft warm lighting",
    "cartoon": "2D cartoon illustration, bold outlines",
    "horror": "dark moody lighting, scary shadows",
    "futuristic": "neon futuristic sci-fi aesthetic",
}

# Supported media file extensions
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif')
VIDEO_EXTENSIONS = ('.mp4', '.mov', '.avi', '.mkv', '.webm', '.gif')

# Viral subtitle styles inspired by top creators
VIRAL_SUBTITLE_STYLES = {
    "alex_hormozi": {
        "font": "Impact",  # Bold, attention-grabbing
        "fontsize": 80,
        "primary_color": "#FFFF00",  # Yellow
        "stroke_color": "#000000",
        "stroke_width": 5,
        "highlight_color": "#00FFD4",  # Cyan for keywords
        "bg_opacity": 0.7,
        "animation": "word_pop"
    },
    "mr_beast": {
        "font": "Impact",
        "fontsize": 85,
        "primary_color": "#FFFFFF",
        "stroke_color": "#FF0000",  # Red stroke
        "stroke_width": 6,
        "highlight_color": "#FFEA00",  # Yellow for emphasis
        "bg_opacity": 0.8,
        "animation": "bounce"
    },
    "modern_minimal": {
        "font": "Arial-Bold",
        "fontsize": 70,
        "primary_color": "#FFFFFF",
        "stroke_color": "#000000",
        "stroke_width": 4,
        "highlight_color": "#A78BFA",  # Purple
        "bg_opacity": 0.6,
        "animation": "fade_in"
    },
    "trendy_gradient": {
        "font": "Arial-Bold",
        "fontsize": 75,
        "primary_color": "#FF6B6B",  # Gradient effect (simulated with colors)
        "stroke_color": "#000000",
        "stroke_width": 5,
        "highlight_color": "#00FFD3",  # Cyan
        "bg_opacity": 0.7,
        "animation": "slide_up"
    },
    "bold_contrast": {
        "font": "Impact",
        "fontsize": 90,
        "primary_color": "#000000",  # Black text
        "stroke_color": "#FFFFFF",  # White stroke (inverted)
        "stroke_width": 6,
        "highlight_color": "#FF00FF",  # Magenta
        "bg_opacity": 0.9,
        "animation": "scale_in"
    }
}

# Microsoft Edge TTS Voice Profiles
VOICE_PROFILES = {
    "storyteller_female": {
        "voice": "en-US-AriaNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "style": "newscast-casual"
    },
    "dramatic_female": {
        "voice": "en-US-JennyNeural",
        "rate": "-5%",
        "pitch": "+5Hz",
        "style": "excited"
    },
    "calm_female": {
        "voice": "en-GB-SoniaNeural",
        "rate": "-10%",
        "pitch": "-5Hz",
        "style": "friendly"
    },
    "narrator_male": {
        "voice": "en-US-GuyNeural",
        "rate": "-5%",
        "pitch": "-10Hz",
        "style": "newscast"
    },
    "enthusiastic_male": {
        "voice": "en-US-DavisNeural",
        "rate": "+5%",
        "pitch": "+5Hz",
        "style": "chat"
    },
}

# Background music mood mapping
MUSIC_MOODS = {
    "uplifting": ["happy", "cheerful", "joyful", "optimistic", "bright", "positive"],
    "dramatic": ["intense", "dramatic", "epic", "powerful", "climactic"],
    "calm": ["peaceful", "relaxing", "calm", "serene", "gentle", "soft"],
    "dark": ["dark", "scary", "horror", "ominous", "suspenseful", "tense"],
    "energetic": ["energetic", "upbeat", "exciting", "dynamic", "fast"],
    "emotional": ["emotional", "touching", "heartfelt", "sentimental", "moving"],
    "mysterious": ["mysterious", "enigmatic", "curious", "intriguing"],
    "adventure": ["adventure", "heroic", "journey", "exploration"]
}
# Add these functions to your video_engine.py file
# Place them after the MUSIC_MOODS definition and before the analyze_subtitle_style function

def is_video_file(filepath):
    """
    Check if a file is a video based on its extension.
    """
    return filepath.lower().endswith(VIDEO_EXTENSIONS)

def read_user_media(folder):
    """
    Reads and sorts user media files (images or videos) from the specified folder.
    Returns a list of file paths sorted by scene number.
    """
    if not os.path.exists(folder):
        raise FileNotFoundError(f"❌ Folder not found: {folder}")
    
    all_files = os.listdir(folder)
    
    # Filter for valid media files
    media_files = [
        f for f in all_files 
        if f.lower().endswith(IMAGE_EXTENSIONS + VIDEO_EXTENSIONS)
    ]
    
    if not media_files:
        raise FileNotFoundError(
            f"❌ No media files found in {folder}/\n"
            f"   Supported formats: {IMAGE_EXTENSIONS + VIDEO_EXTENSIONS}"
        )
    
    # Sort files by scene number (extract number from filename)
    def get_scene_number(filename):
        # Extract number from patterns like: scene_0.jpg, scene_1.mp4, etc.
        match = re.search(r'scene[_\s-]*(\d+)', filename, re.IGNORECASE)
        if match:
            return int(match.group(1))
        # If no scene number found, try to extract any number
        match = re.search(r'(\d+)', filename)
        return int(match.group(1)) if match else 999
    
    media_files.sort(key=get_scene_number)
    
    # Return full paths
    media_paths = [os.path.join(folder, f) for f in media_files]
    
    print(f"\n📁 Found {len(media_paths)} media file(s):")
    for i, path in enumerate(media_paths):
        file_type = "VIDEO" if is_video_file(path) else "IMAGE"
        print(f"   {i}. {os.path.basename(path)} ({file_type})")
    
    return media_paths
# -------------------------
# SUBTITLE STYLE ANALYSIS
# -------------------------
def analyze_subtitle_style(title, scenes):
    """
    AI analyzes content to determine the best viral subtitle style.
    """
    
    full_content = f"Title: {title}\n" + " ".join([s["narration"] for s in scenes])
    
    system = """You are a social media video expert specializing in viral content.
    Analyze the content and recommend the best subtitle style.
    Respond with ONE of these options: alex_hormozi, mr_beast, modern_minimal, trendy_gradient, bold_contrast"""
    
    user_prompt = f"""
    Content: {full_content}
    
    Which viral subtitle style fits best? Consider:
    - Target audience (Gen Z, millennials, business professionals)
    - Content tone (educational, entertaining, dramatic, inspirational)
    - Platform optimization (TikTok/Instagram/YouTube Shorts)
    
    Respond with ONE option only.
    """
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    
    style_choice = resp.choices[0].message.content.strip().lower()
    
    if style_choice not in VIRAL_SUBTITLE_STYLES:
        style_choice = "modern_minimal"
    
    print(f"\n🎬 Selected Subtitle Style: {style_choice.replace('_', ' ').title()}")
    return style_choice

def identify_keywords(text):
    """
    Identifies keywords to highlight in subtitles for emphasis.
    """
    
    # Common words to highlight: numbers, superlatives, action verbs, emotions
    highlight_patterns = [
        'amazing', 'incredible', 'best', 'worst', 'never', 'always',
        'first', 'last', 'new', 'now', 'today', 'epic', 'crazy',
        'unbelievable', 'shocking', 'secret', 'revealed', 'must',
        'you', 'your', 'free', 'easy', 'simple', 'powerful'
    ]
    
    words = text.lower().split()
    keywords = []
    
    for i, word in enumerate(words):
        # Check if word matches highlight patterns
        word_clean = word.strip('.,!?')
        if word_clean in highlight_patterns or word_clean.isdigit():
            keywords.append(i)
    
    return keywords

# -------------------------
# VOICE ANALYSIS & SELECTION
# -------------------------
def analyze_narration_style(scenes):
    """
    Analyzes the narration content and determines the best voice profile.
    """
    
    full_narration = " ".join([s["narration"] for s in scenes])
    
    system = """You are a voice casting director. Analyze the narration and determine the best voice type.
    Respond with ONE of these options: storyteller_female, dramatic_female, calm_female, narrator_male, enthusiastic_male"""
    
    user_prompt = f"""
    Narration: {full_narration}
    
    What voice profile would best suit this narration? Consider:
    - Tone and mood
    - Target audience
    - Content type
    
    Respond with ONE option only.
    """
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    
    voice_choice = resp.choices[0].message.content.strip().lower()
    
    if voice_choice not in VOICE_PROFILES:
        voice_choice = "storyteller_female"
    
    print(f"🎤 Selected Voice: {voice_choice.replace('_', ' ').title()}")
    return voice_choice

# -------------------------
# MUSIC ANALYSIS & SELECTION
# -------------------------
def analyze_story_mood(title, scenes):
    """
    Uses GPT to analyze the overall mood of the story.
    """
    
    full_narration = " ".join([s["narration"] for s in scenes])
    
    system = """You are a music supervisor for videos. Analyze the story and determine the best background music mood.
    Respond with ONLY ONE WORD from these options: uplifting, dramatic, calm, dark, energetic, emotional, mysterious, adventure"""
    
    user_prompt = f"""
    Video Title: "{title}"
    Story: {full_narration}
    
    What mood of background music would fit best? Respond with ONE WORD only.
    """
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    
    mood = resp.choices[0].message.content.strip().lower()
    
    if mood not in MUSIC_MOODS:
        mood = "calm"
    
    print(f"🎵 Detected Story Mood: {mood.upper()}")
    return mood

def get_background_music(mood):
    """
    Selects appropriate background music based on mood.
    """
    
    music_folder = "music"
    music_file = os.path.join(music_folder, f"music_{mood}.mp3")
    
    if not os.path.exists(music_folder):
        os.makedirs(music_folder)
        print(f"\n⚠️  Created 'music/' folder. Add background music files:")
        print(f"   Download from: https://pixabay.com/music/ (royalty-free)")
        return None
    
    if os.path.exists(music_file):
        print(f"✅ Using background music: {music_file}")
        return music_file
    
    music_files = [f for f in os.listdir(music_folder) if f.endswith(('.mp3', '.wav', '.m4a'))]
    if music_files:
        fallback = os.path.join(music_folder, music_files[0])
        print(f"⚠️  Using fallback music: {fallback}")
        return fallback
    
    return None

# -------------------------
# SCENE GENERATION
# -------------------------
def generate_scenes_from_title(title, style):
    system = "You are a professional video scriptwriter. Respond only in JSON."

    user_prompt = f"""
    Title: "{title}"
    Style: "{style}"

    Output JSON:
    {{
      "scenes": [
        {{
          "narration": "8-18 words, engaging and punchy",
          "image_prompt": "highly detailed 12-40 word prompt with camera, lighting, 9:16 aspect",
          "emotion": "one of: neutral, excited, dramatic, sad, mysterious, intense, cheerful"
        }},
        ...
      ]
    }}
    
    Make narrations viral-worthy with strong hooks and emotional impact.
    Include emotion for voice delivery.
    """

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )

    raw = resp.choices[0].message.content

    try:
        data = json.loads(raw)
    except:
        start = raw.find("{")
        end = raw.rfind("}")
        data = json.loads(raw[start:end+1])

    scenes = data["scenes"]
    style_text = STYLE_PROMPTS.get(style, "")

    for s in scenes:
        s["image_prompt"] += f", {style_text}, ultra-detailed, vertical 9:16"
        if "emotion" not in s:
            s["emotion"] = "neutral"

    with open(PROMPTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("\n🎨 PROMPTS GENERATED:")
    print("=" * 80)
    for i, sc in enumerate(scenes):
        print(f"\n📍 SCENE {i}:")
        print(f"   Narration: {sc['narration']}")
        print(f"   Emotion: {sc.get('emotion', 'neutral')}")
        print(f"   Image Prompt: {sc['image_prompt']}")
        print("-" * 80)

    print("\n👉 Download images using above prompts and place them in folder: images_user/")
    print("   Use names: scene_0.jpg, scene_1.jpg, scene_2.jpg, etc.")
    print("   ")
    print("   💡 TIP: You can also use VIDEOS (animated clips)!")
    print("   Supported: .mp4, .mov, .webm, .gif - just name them scene_0.mp4, scene_1.mp4, etc.")
    print("   Mix and match images and videos as you like!")
    print(f"\n💾 Full prompts saved to: {PROMPTS_FILE}\n")

    return scenes

# -------------------------
# ADVANCED TTS WITH EDGE-TTS
# -------------------------
async def make_expressive_tts_async(text, output_file, voice_profile, emotion="neutral"):
    """
    Generate expressive TTS using Microsoft Edge TTS (completely free).
    """
    
    profile = VOICE_PROFILES[voice_profile]
    voice = profile["voice"]
    rate = profile["rate"]
    pitch = profile["pitch"]
    
    if emotion in ["excited", "cheerful"]:
        rate = "+10%"
        pitch = "+10Hz"
    elif emotion in ["dramatic", "intense"]:
        rate = "-5%"
        pitch = "+5Hz"
    elif emotion in ["sad"]:
        rate = "-15%"
        pitch = "-10Hz"
    elif emotion in ["mysterious"]:
        rate = "-10%"
        pitch = "-5Hz"
    
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_file)
    return output_file

def make_expressive_tts(text, output_file, voice_profile, emotion="neutral"):
    return asyncio.run(make_expressive_tts_async(text, output_file, voice_profile, emotion))

# -------------------------
# VIRAL SUBTITLE CREATION
# -------------------------
def create_viral_subtitle(text, style_name, duration, scene_index):
    """
    Creates viral-style subtitles with keyword highlighting and dynamic effects.
    """
    
    style = VIRAL_SUBTITLE_STYLES[style_name]
    keywords = identify_keywords(text)
    
    # Split text into words for word-by-word animation effect
    words = text.split()
    
    # For simplicity, we'll create a composite subtitle with highlighted keywords
    # In a production environment, you'd want word-by-word timing
    
    subtitle_clips = []
    y_position = OUT_H * 0.75  # Position subtitles in lower third
    
    # Create main subtitle with keyword highlighting
    full_text = text
    
    # Main subtitle
    main_sub = TextClip(
        full_text,
        fontsize=style["fontsize"],
        color=style["primary_color"],
        font=style["font"],
        stroke_color=style["stroke_color"],
        stroke_width=style["stroke_width"],
        method="caption",
        size=(OUT_W - 120, None),
        align='center'
    ).set_duration(duration).set_position(("center", y_position))
    
    # Add semi-transparent background for better readability
    bg_height = main_sub.h + 40
    bg = ImageClip(create_subtitle_background(OUT_W, bg_height, style["bg_opacity"]))
    bg = bg.set_duration(duration).set_position(("center", y_position - 20))
    
    return CompositeVideoClip([bg, main_sub], size=(OUT_W, OUT_H))

def create_subtitle_background(width, height, opacity):
    """
    Creates a semi-transparent background for subtitles.
    """
    from PIL import Image
    import numpy as np
    
    # Create semi-transparent black background
    img = Image.new('RGBA', (width, height), (0, 0, 0, int(255 * opacity)))
    return np.array(img)

# -------------------------
# VIDEO BUILD WITH VIRAL SUBTITLES
# -------------------------
def build_video_from_user_images(image_folder, style="cinematic", title=""):
    """
    Build video with professional voice, viral subtitles, and background music.
    Supports both images AND videos as input!
    """

    with open(PROMPTS_FILE, "r") as f:
        data = json.load(f)
    scenes = data["scenes"]

    # AI-powered selections
    voice_profile = analyze_narration_style(scenes)
    subtitle_style = analyze_subtitle_style(title, scenes)
    mood = analyze_story_mood(title, scenes)
    bg_music_file = get_background_music(mood)

    # Read media files (images or videos) - automatically sorted by scene number
    media_paths = read_user_media(image_folder)

    clips = []
    temp_audio = []
    timer = 0

    print(f"\n🎙️  Generating voiceovers with {VOICE_PROFILES[voice_profile]['voice']}")
    print(f"🎬 Using {subtitle_style.replace('_', ' ').title()} subtitle style")

    for i, scene in enumerate(scenes):
        narration = scene["narration"]
        emotion = scene.get("emotion", "neutral")

        # Get media file for this scene (fallback to last if not enough files)
        media_file = media_paths[i] if i < len(media_paths) else media_paths[-1]

        # Generate TTS
        audio_file = f"audio_{i}.mp3"
        make_expressive_tts(narration, audio_file, voice_profile, emotion)
        temp_audio.append(audio_file)
        audio = AudioFileClip(audio_file)

        # Create base clip - handle both images AND videos
        if is_video_file(media_file):
            # It's a video file
            base_clip = VideoFileClip(media_file)
            
            # Trim or loop video to match audio duration
            if base_clip.duration < audio.duration:
                # Loop video if too short
                num_loops = int(audio.duration / base_clip.duration) + 1
                base_clip = concatenate_videoclips([base_clip] * num_loops)
            
            # Trim to exact audio duration
            base_clip = base_clip.subclip(0, audio.duration)
            
            # Resize and fit to vertical format
            base_clip = base_clip.resize(width=OUT_W)
            clip = base_clip.on_color(size=(OUT_W, OUT_H), color=(0, 0, 0))
            
        else:
            # It's an image file
            clip = ImageClip(media_file).set_duration(audio.duration).resize(width=OUT_W)
            clip = clip.on_color(size=(OUT_W, OUT_H), color=(0, 0, 0))

        # Create viral-style subtitle
        subtitle_clip = create_viral_subtitle(narration, subtitle_style, audio.duration, i)

        # Composite video with subtitle
        comp = CompositeVideoClip([clip, subtitle_clip], size=(OUT_W, OUT_H)).set_audio(audio)
        clips.append(comp)

        timer += audio.duration
        media_type = "VIDEO" if is_video_file(media_file) else "IMAGE"
        print(f"  ✓ Scene {i} ({media_type}) | Emotion: {emotion} | Duration: {audio.duration:.1f}s")

    # Concatenate all clips
    final = concatenate_videoclips(clips)
    
    # Add background music with professional mixing
    if bg_music_file and os.path.exists(bg_music_file):
        print(f"\n🎵 Adding background music...")
        
        bg_music = AudioFileClip(bg_music_file)
        
        if bg_music.duration < final.duration:
            num_loops = int(final.duration / bg_music.duration) + 1
            from moviepy.audio.AudioClip import concatenate_audioclips
            bg_music = concatenate_audioclips([bg_music] * num_loops)
        
        bg_music = bg_music.subclip(0, final.duration)
        bg_music = bg_music.volumex(0.18)  # 18% volume for music
        
        narration_audio = final.audio
        composite_audio = CompositeAudioClip([narration_audio, bg_music])
        final = final.set_audio(composite_audio)
        
        print("✅ Audio mix complete!")

    # Export final video
    print("\n🎬 Rendering final video...")
    final.write_videofile(OUT_VIDEO, fps=30, codec="libx264", audio_codec="aac", 
                          preset='medium', bitrate='8000k')

    # Cleanup
    for audio_file in temp_audio:
        if os.path.exists(audio_file):
            os.remove(audio_file)

    return OUT_VIDEO

# -------------------------
# INTERACTIVE UI
# -------------------------
def main():
    print("\n✨ Welcome to VideoGPT Pro by Karan ✨")
    print("🎤 Professional Voice + 🔥 Viral Subtitles")
    print("------------------------------------------")

    title = input("📌 Enter your video TITLE: ").strip()
    if not title:
        print("Title required!")
        return

    print("\n🎨 Choose style:")
    print("cinematic | anime | pixar | cartoon | horror | futuristic")
    style = input("👉 Style (default: cinematic): ").strip().lower() or "cinematic"

    print("\n🧠 Generating viral-worthy scenes...")
    scenes = generate_scenes_from_title(title, style)

    input("\n🔥 Place images/videos in images_user/ (scene_0.jpg, scene_1.mp4, etc.), then press ENTER...")

    print("\n🎬 Building video with AI-optimized everything...")
    build_video_from_user_images("images_user", style, title)
    
    print(f"\n✅ Video created: {OUT_VIDEO}")
    print("🚀 Ready for TikTok/Instagram/YouTube Shorts!")


if __name__ == "__main__":
    main()