# 🎬 AI Storyboard Director

The **AI Storyboard Director** is a full-stack web application that converts a simple movie idea into a detailed, professional, scene‑by‑scene film blueprint using the **Google Gemini API**.

---

## ✨ Features

- **Customizable AI Generation** — Define the film's tone, visual style, and structure.
- **Story Length Control** — Specify the number of scenes (e.g., 5, 10, 15).
- **Aesthetic Framing** — Add *Film Tone*, *Aspect Ratio*, and other stylistic cues.
- **Cinematic Breakdown** for every scene:
  - Timeline / Timecode  
  - Setting / Location  
  - Character Emotions  
  - Dialogue  
  - Camera Angle  
- **Storyboard Visualizer** — Each scene includes an *AI Visual Tag* that links directly to a Google Images search.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---------|------------|-------------|
| Backend | **Python (Flask)** | API orchestration and Gemini request handling |
| AI Model | **Google Gemini 2.5 Flash** | Generates structured scene output |
| SDK | **google‑genai** | Python library for Gemini API access |
| Frontend | **HTML, CSS, JS** | Interactive storyboard UI |
| Config | **python‑dotenv** | Secure API key loading |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.8+
- Gemini API Key (from Google AI Studio)

### 2. Project Structure
```
ai_storyboard_director/
├── .env
├── app.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── templates/
    └── index.html
```

### 3. Environment Setup
```bash
python3 -m venv .venv
source .venv/bin/activate     # macOS/Linux
.\.venv\Scriptsctivate.bat  # Windows
pip install flask google-genai python-dotenv
```

### 4. API Key Configuration
Create a `.env` file in the root:
```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

> **Important:** Add `.env` to `.gitignore`.

### 5. Run the Application
```bash
python app.py
```
Open: **http://127.0.0.1:5000/**

---

## 📄 File Descriptions

| File | Description |
|------|-------------|
| **app.py** | Flask backend with routes, Gemini configuration, JSON schema, and system instruction. |
| **static/js/main.js** | Sends user input to `/generate`, renders scene results, and handles visualizer links. |
| **templates/index.html** | Main UI layout and form structure. |
| **.env** | Stores the API key securely. |

---

## 📜 License
This project is open for learning, customization, and extension.

---

## 🤝 Contributions
Developers and filmmakers are welcome to extend the model prompts, visualizer options, and UI.

---
