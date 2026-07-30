<div align="center">

# 📽️ VisionForge AI
### *Title-to-Cinematic Video Multi-Agent System*

**Turn a single line of text into a fully rendered cinematic video — story, prompts, voiceover, music, and subtitles — through a coordinated team of AI agents powered by Google Gemma.**

[![Built with Gemma](https://img.shields.io/badge/Prompt%20Engine-Gemma-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Google AI Agent Program](https://img.shields.io/badge/Google-5%20Days%20of%20AI%20Agents-yellow?style=flat-square)](https://ai.google.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

</div>

---

## 🚀 Overview

VisionForge AI automates the entire video-creation pipeline. A user enters only **one line — a title** — and a coordinated system of autonomous agents handles everything else:

- Story and narration generation
- Scene-by-scene breakdown
- **Cinematic prompt engineering, powered by Gemma**
- Voiceover generation
- Background music selection
- Subtitle generation
- Final video rendering (1080p or 4K)

The system mimics a real film studio, where each agent is a specialist — and **Gemma sits at the creative core of the pipeline**, translating raw story ideas into structured, production-ready visual prompts.

---

## 🧠 Why Gemma?

VisionForge AI was built for Google's **5 Days of AI Agent Program**, and Gemma was chosen deliberately as the backbone of the prompt-generation layer rather than as an afterthought:

| Reason | Why it matters for VisionForge |
|---|---|
| **Open weights, self-hostable** | The Prompt Generation Agent can run locally (via Ollama / Vertex AI) with no per-token vendor lock-in, keeping the pipeline cheap to iterate on during scene regeneration. |
| **Strong structured-output following** | Gemma reliably returns clean JSON scene objects (camera angle, lighting, color grade, mood) without fragile prompt hacking. |
| **Low latency at scale** | Story generation often produces 15–30 scenes per video; Gemma's smaller footprint (2B/9B/27B variants) keeps per-scene prompt generation fast enough for near-real-time previews. |
| **Fine-tunable** | Because Gemma is open-weight, the Prompt Generation Agent can be fine-tuned on a curated dataset of "great cinematic prompts" to consistently match FLUX/Meta AI/DALL·E prompt conventions. |
| **On-device / offline capability** | Gemma's lightweight variants allow the entire prompt-engineering stage to run without internet access, which is ideal for demos and hackathon environments. |

Gemma doesn't just generate text — it acts as the **creative director** of the pipeline, converting abstract story beats into the precise visual language that image generators need.

---

## 🧩 Multi-Agent Architecture

VisionForge AI is built from six specialized, autonomous agents that pass structured data to one another:

```
                    ┌─────────────────────┐
      Title ──────► │ 1. Story & Narration │
                    │       Agent          │
                    └──────────┬───────────┘
                               │  scene breakdown (JSON)
                               ▼
                    ┌─────────────────────┐
                    │ 2. Prompt Generation │ ◄── powered by Gemma
                    │       Agent          │
                    └──────────┬───────────┘
                               │  cinematic prompts
                               ▼
                    ┌─────────────────────┐
                    │ 3. Image Input       │ ◄── user uploads generated images
                    │    Validation Agent  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │ 4. Voice-  │ │ 5. Music   │ │ Subtitles  │
        │ over Agent │ │   Agent    │ │  Generator │
        └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
              └──────────────┼──────────────┘
                              ▼
                   ┌─────────────────────┐
                   │ 6. Video Rendering   │
                   │        Agent         │
                   └──────────┬───────────┘
                              ▼
                     🎬 Final Cinematic Video
```

### 1. Story & Narration Agent
Generates story structure, scene descriptions, narration lines, emotional beats, and overall cinematic tone from a single title.

### 2. Prompt Generation Agent — *Gemma-powered*
Consumes each scene from the Story Agent and produces detailed, structured cinematic prompts: camera angle, lighting setup, color grade, environment, artistic style, and atmosphere. Prompts are formatted to work seamlessly with **Meta AI, FLUX, DALL·E, or any diffusion-based image generator**. Gemma's structured JSON output makes this stage deterministic and easy to validate before handing prompts off to image generation.

### 3. Image Input Agent
Validates user-uploaded images for correct scene order, consistent resolution, and correct aspect ratio before they enter the render pipeline.

### 4. Voiceover Agent
Uses text-to-speech to create natural, emotionally paced narration synced to scene timing.

### 5. Background Music Agent
Selects ambient or cinematic music that complements the story's mood without overpowering narration.

### 6. Video Rendering Agent
Built with FastAPI, MoviePy, and FFmpeg to merge images, sync narration, add music, burn in subtitles, and export the final video.

---

## 🛠 Tech Stack

**Frontend:** Next.js, React, Tailwind CSS, Framer Motion

**Backend:** FastAPI, Python, MoviePy, FFmpeg

**AI Models:**
- 🔷 **Gemma** — cinematic prompt engineering (Prompt Generation Agent), and optionally story/scene structuring
- OpenAI GPT — story structure and narration (optional / swappable)
- OpenAI TTS — voiceover synthesis
- Meta AI / FLUX / DALL·E — external image generation from Gemma-crafted prompts

**Serving Gemma:** Ollama (local inference) or Vertex AI / Gemini API (managed inference), selectable via environment configuration.

---

## 🏗 How It Works

1. **User enters a title** — the only manual input required.
2. **Story & Narration Agent** generates the full scene breakdown.
3. **Prompt Generation Agent (Gemma)** converts each scene into a structured, cinematic image-generation prompt.
4. **User generates images externally** using Meta AI, FLUX, or another preferred image generator, using the Gemma-crafted prompts.
5. **User uploads the generated images**, validated automatically for order and consistency.
6. **Voiceover and background music** are generated and time-aligned to the story.
7. **Final video is rendered** with narration, images, music, and subtitles — exported in 1080p or 4K.

---

## ⭐ Features

- One-line input → full cinematic video
- Gemma-driven scene-wise prompt engineering
- Natural AI narration
- Emotion-based background music selection
- Automatic subtitle generation
- 4K video export
- Simple, user-friendly UI
- Modular multi-agent design for accuracy and scalability
- Swappable inference backend (local Gemma via Ollama or managed via Vertex AI)

---

## 📦 Installation

Clone the repository:
```bash
git clone https://github.com/KaranAgrawal25/VisionForge-AI.git
cd visionforge-ai
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Configure your prompt-generation backend (choose one):
```bash
# Option A — Local Gemma via Ollama
ollama pull gemma2:9b

# Option B — Managed Gemma via Vertex AI / Gemini API
export GEMMA_API_KEY=your_key_here
```

Run FastAPI backend:
```bash
uvicorn main:app --reload
```

Install frontend dependencies:
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Usage

1. Start the backend and frontend.
2. Open the UI in your browser.
3. Enter a story title.
4. Let the Gemma-powered Prompt Generation Agent produce scene-by-scene cinematic prompts.
5. Copy the generated prompts to Meta AI (or another image generator).
6. Upload the generated images.
7. Download your complete cinematic video.

---

## 🎯 Purpose & Impact

VisionForge AI demonstrates how a team of specialized AI agents — anchored by **Gemma's structured, open-weight reasoning** — can collaborate like a real movie studio, converting a single idea into a finished video. It showcases practical, production-style use of Gemma for creative and technical prompt engineering, going beyond simple chat completion into a real multi-agent, multi-modal automation pipeline.

---

## 🏅 Credits

Project by **Karan Agrawal**
