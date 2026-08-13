<div align="center">

# 📽️ VisionForge AI

### *Title-to-Cinematic Video Multi-Agent System*

**An autonomous multi-agent pipeline that turns a single text title into a complete cinematic video — story, scenes, prompts, narration, music, subtitles, and final render.**

[![Made with Python](https://img.shields.io/badge/Backend-Python%20%7C%20FastAPI-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Made with Next.js](https://img.shields.io/badge/Frontend-Next.js%20%7C%20React-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built for Google 5-Day AI Agents](https://img.shields.io/badge/Built%20for-Google%205--Day%20AI%20Agent%20Program-4285F4?logo=google&logoColor=white)](#)

*Project by [Karan Agrawal](https://github.com/KaranAgrawal25)*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Why VisionForge AI?](#-why-visionforge-ai)
- [Multi-Agent Architecture](#-multi-agent-architecture)
- [Pipeline Flow](#-pipeline-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Features](#-features)
- [Roadmap](#-roadmap)
- [Purpose & Impact](#-purpose--impact)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

---

## 🚀 Overview

**VisionForge AI** automates the entire video-creation pipeline, end to end. A user provides only **one input — a title** — and the system takes care of everything else:

| Stage | What Happens |
|---|---|
| 🎬 Story Generation | A full narrative arc, scene breakdown, and emotional tone are generated |
| 🖼️ Visual Prompting | Cinematic, production-quality image prompts are written for every scene |
| 🎨 Image Sourcing | Prompts are used to generate high-fidelity scene visuals externally |
| 🗣️ Voiceover | Natural, emotionally-inflected narration is synthesized |
| 🎵 Music | Ambient/cinematic background scoring is layered in |
| 💬 Subtitles | Scene-synced subtitles are generated automatically |
| 🎞️ Rendering | Everything is composited into a final 1080p or 4K video |

The system is architected to mimic a real film studio — instead of one monolithic model trying to do everything, **specialized autonomous agents** each own a distinct creative discipline and hand off their output to the next stage in the pipeline, similar to how a director, screenwriter, cinematographer, and sound designer collaborate on a real production.

---

## 💡 Why VisionForge AI?

Turning an idea into a finished video traditionally requires:

- A scriptwriter to build the narrative
- A storyboard artist to plan the visuals
- A voice actor and sound engineer for audio
- A video editor to composite everything

VisionForge AI compresses that entire creative chain into a **single automated agent pipeline**, letting anyone go from a one-line idea to a fully narrated, scored, subtitled video without touching a video editor.

---

## 🧩 Multi-Agent Architecture

VisionForge AI is composed of six distinct autonomous agents, each responsible for one stage of the creative workflow. Agents communicate through a shared pipeline state, so the output of one agent becomes structured input for the next.

```
┌─────────────────────────┐
│   1. Story & Narration   │  →  Story arc, scene breakdown, narration lines, tone
│         Agent             │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│  2. Prompt Generation     │  →  Cinematic prompts: lighting, camera angle,
│         Agent             │      color mood, environment, style
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   3. Image Input Agent    │  →  Validates uploaded images (order, resolution,
│                            │      aspect ratio consistency)
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   4. Voiceover Agent      │  →  Natural TTS narration synced to scenes
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ 5. Background Music Agent │  →  Selects non-intrusive ambient/cinematic scoring
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ 6. Video Rendering Agent  │  →  Merges visuals, narration, music, subtitles
│                            │      into a final export
└────────────────────────────┘
```

### 1. Story & Narration Agent
Powered by **OpenAI GPT**, this agent takes the raw title and produces:
- A structured story arc with beginning, rising action, and resolution
- Per-scene descriptions with setting and emotional beat
- Narration lines matched to each scene
- An overall cinematic tone (e.g., somber, triumphant, suspenseful)

### 2. Prompt Generation Agent
Translates each scene description into a **production-grade image prompt**, specifying:
- Lighting (golden hour, high-contrast noir, soft diffuse, etc.)
- Camera angle and framing (wide establishing shot, close-up, dutch angle)
- Color grade and mood
- Environment and set dressing
- Overall visual style (photoreal, painterly, cinematic film grain)

These prompts are written to be **model-agnostic**, so they work seamlessly whether the user generates images with Meta AI, FLUX, DALL·E, or any other diffusion-based image generator.

### 3. Image Input Agent
Since image generation currently happens externally (see [Pipeline Flow](#-pipeline-flow)), this agent acts as a **validation gate**, checking that uploaded images:
- Are in the correct scene order
- Share consistent resolution
- Match the expected aspect ratio for the target export format

### 4. Voiceover Agent
Uses **Edge TTS** to synthesize natural-sounding narration for each scene, with attention to pacing and emotional delivery that matches the tone set by the Story Agent.

### 5. Background Music Agent
Selects clean, non-distracting ambient or cinematic background music appropriate to the story's emotional tone — designed to support the narration rather than compete with it.

### 6. Video Rendering Agent
The final assembly stage, built on **FastAPI + MoviePy + FFmpeg**, which:
- Sequences validated images according to the scene order
- Syncs narration audio precisely to each visual
- Mixes in background music at a balanced volume
- Burns in or embeds subtitles
- Exports the final cut in 1080p or 4K

---

## 🔄 Pipeline Flow

```
   [ User enters title ]
            │
            ▼
   [ Story & Narration Agent ]
            │
            ▼
   [ Prompt Generation Agent ]
            │
            ▼
   [ User generates images externally
     using Meta AI / FLUX / DALL·E ]
            │
            ▼
   [ User uploads generated images ]
            │
            ▼
   [ Image Input Agent validates order,
     resolution & aspect ratio ]
            │
            ▼
   [ Voiceover Agent ] ──┐
                          │
   [ Background Music     │
     Agent ]              │
                          ▼
              [ Video Rendering Agent ]
                          │
                          ▼
             🎬 Final Cinematic Video
              (1080p / 4K export)
```

> **Note:** Image generation is handled externally by design in this version — VisionForge AI writes the prompts and validates the results, but the actual pixel generation is delegated to best-in-class external image models rather than a bundled generator. This keeps the pipeline lightweight and lets users pick whichever image model produces the visual style they want.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python |
| **Video Processing** | MoviePy, FFmpeg |
| **Story / Prompt Generation** | OpenAI GPT |
| **Voiceover** | Edge TTS |
| **External Image Generation** | Meta AI, FLUX, DALL·E (user's choice) |

---

## 📁 Project Structure

```
VisionForge-AI/
├── backend/
│   ├── main.py                # FastAPI entrypoint
│   ├── agents/
│   │   ├── story_agent.py
│   │   ├── prompt_agent.py
│   │   ├── image_input_agent.py
│   │   ├── voiceover_agent.py
│   │   ├── music_agent.py
│   │   └── render_agent.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── app/ or pages/
│   ├── components/
│   ├── package.json
│   └── ...
├── README.md
└── LICENSE
```

*(Adjust to match your actual repo layout if it differs.)*

---

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- FFmpeg installed and available on your system PATH

### 1. Clone the repository
```bash
git clone https://github.com/KaranAgrawal25/VisionForge-AI.git
cd VisionForge-AI
```

### 2. Set up the backend
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000` by default.

---

## ⚙️ Configuration

Create a `.env` file in the backend directory with your API credentials:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

> ⚠️ Never commit your `.env` file. Use `.env.example` as a template and add `.env` to `.gitignore`.

---

## 🌐 Usage

1. **Start** both the backend and frontend servers.
2. **Open** the UI in your browser (`http://localhost:3000`).
3. **Enter** a story title — that's the only input required from you.
4. The **Story & Narration Agent** and **Prompt Generation Agent** produce a full scene breakdown and image prompts.
5. **Copy** the generated prompts into Meta AI, FLUX, DALL·E, or your preferred image generator.
6. **Upload** the generated images back into VisionForge AI in scene order.
7. The **Voiceover** and **Background Music Agents** generate the audio layer automatically.
8. **Download** your complete cinematic video, fully narrated, scored, and subtitled.

---

## ⭐ Features

- ✅ One-line input → full cinematic video
- ✅ Scene-wise narrative breakdown
- ✅ Natural, emotionally-toned AI narration
- ✅ Emotion-matched background music selection
- ✅ Automatic subtitle generation
- ✅ 4K video export support
- ✅ Simple, clean, user-friendly UI
- ✅ Modular multi-agent design for accuracy and scalability
- ✅ Model-agnostic prompt generation (works with any image generator)

---

## 🗺️ Roadmap

- [ ] Bundle an in-pipeline image generation agent to remove the manual upload step
- [ ] Add support for multi-language narration and subtitles
- [ ] Scene-level regeneration without re-running the full pipeline
- [ ] Style presets (noir, anime, documentary, etc.)
- [ ] Cloud rendering queue for faster exports

---

## 🎯 Purpose & Impact

VisionForge AI demonstrates how a coordinated team of specialized AI agents — each handling a narrow, well-defined creative task — can collaborate the way a real film studio does, turning a single idea into a fully produced video without manual editing. It's a practical showcase of **agentic AI system design** applied to storytelling, filmmaking, and creative automation, built as part of **Google's 5 Days of AI Agent Program**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🏅 Credits

**Project by [Karan Agrawal](https://github.com/KaranAgrawal25)**

Built as part of **Google's 5 Days of AI Agent Program**.

<div align="center">

*If you found this project interesting, consider giving it a ⭐ on GitHub!*

</div>
