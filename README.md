# 📽️ VisionForge AI  
### *Title-to-Cinematic Video Multi-Agent System*

VisionForge AI is an autonomous multi-agent system that transforms a single text title into a complete cinematic video. It generates the story, scene breakdowns, prompts, narration, music, subtitles, and renders a full video using a coordinated AI workflow.

This project was created as part of the Google 5 Days of AI Agent Program.

---

## 🚀 Overview

VisionForge AI automates the entire video-creation pipeline.  
A user enters only one line — a title — and the system takes care of everything else:

Story and narration generation  
Scene breakdown  
High-quality visual prompts  
Voiceover generation  
Background music  
Subtitles  
Final video rendering (1080p or 4K)

The system mimics a real film studio using multiple specialized AI agents.

---

## 🧩 Multi-Agent Architecture

VisionForge AI is built using distinct autonomous agents, each handling a separate part of the creative workflow:

### 1. Story & Narration Agent
Uses OpenAI GPT to generate story structure, scene descriptions, narration lines, emotions, and cinematic tone.

### 2. Prompt Generation Agent
Creates detailed cinematic prompts including lighting, color mood, camera angles, environment, style, and atmosphere.  
These prompts work seamlessly with Meta AI, FLUX, or any image generator.

### 3. Image Input Agent
Validates user-uploaded images for correct order, consistent resolution, and correct aspect ratio.

### 4. Voiceover Agent
Uses OpenAI Text-to-Speech to create a natural, emotional voiceover.

### 5. Background Music Agent
Selects clean ambient or cinematic music that does not interfere with narration.

### 6. Video Rendering Agent
Built using FastAPI, MoviePy, and FFmpeg to merge images, sync narration, add music, add subtitles, and export a high-quality video.

---

## 🛠 Tech Stack

**Frontend:** Next.js, React, Tailwind CSS, Framer Motion  
**Backend:** FastAPI, Python, MoviePy, FFmpeg  
**AI Models:** OpenAI GPT (story, prompts, narration), OpenAI TTS (voiceover), Meta AI / FLUX / DALL·E for external image generation

---

## 🏗 How It Works

Step 1: User enters a title  
Step 2: Agents generate story and prompts  
Step 3: User generates images externally using Meta AI or another tool  
Step 4: User uploads generated images  
Step 5: Voiceover and background music are created  
Step 6: Final video is rendered with narration, images, music, and subtitles

---

## ⭐ Features

One-line input to full cinematic video  
Scene-wise breakdown  
Natural AI narration  
Emotion-based background music  
Subtitle support  
4K video export  
Simple, user-friendly UI  
Multi-agent modular design for accuracy and scalability

---

## 📦 Installation

Clone the repository:
git clone https://github.com/KaranAgrawal25/VisionForge-AI.git
cd visionforge-ai

Install backend dependencies:
pip install -r requirements.txt

Run FastAPI backend:
uvicorn main:app --reload

Install frontend dependencies:
cd frontend
npm install
npm run dev


---

## 🌐 Usage

Start backend and frontend  
Open the UI in your browser  
Enter a story title  
Copy generated prompts to Meta AI (or other model)  
Upload generated images  
Download your complete cinematic video

---

## 🎯 Purpose & Impact

VisionForge AI shows how AI agents can collaborate like a real movie studio, converting imagination into video automatically.  
It demonstrates modern AI capabilities for storytelling, filmmaking, automation, and creative production.

---

## 🏅 Credits

Project by **Karan Agrawal**  
Created for **Google 5 Days of AI Agent Challenge**

