# app.py
import os
import json
from flask import Flask, render_template, request, jsonify
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration & Initialization ---
app = Flask(__name__)

# The genai.Client() automatically uses the GEMINI_API_KEY environment variable.
client = None
try:
    if not os.getenv("GEMINI_API_KEY"):
        raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")

    client = genai.Client()
    print("Gemini Client successfully initialized.")

except Exception as e:
    print(f"ERROR: Gemini client initialization failed. {e}")


# --- Prompt and Output Structure ---

# 1. SYSTEM INSTRUCTION (Template - variables will be injected later)
SYSTEM_INSTRUCTION_TEMPLATE = """
You are the AI Storyboard Director. Your task is to convert a user's movie idea into a highly detailed, scene-by-scene film blueprint. 
The output MUST be a valid JSON object conforming strictly to the specified JSON schema.

**Film Parameters:**
- **Aspect Ratio:** {aspect_ratio} (Use this to influence scene framing, e.g., WIDE SHOTS for 2.35:1)
- **Film Tone:** {film_tone} (Use this to influence emotions, lighting, and scene atmosphere.)

For each scene, provide:
- A unique 'scene_number' (integer).
- A concise 'setting' description.
- A film-standard 'timeline' (e.g., '00:00:00 - 00:00:45').
- A 'detailed_scene' (action/staging description).
- 'character_emotions' (e.g., 'Protagonist: determined, Elara: suspicious').
- 'camera_angle' (Use cinematic terms like CLOSE-UP, WIDE SHOT, DUTCH ANGLE, HANDHELD).
- 'dialogue' (Include character name or V.O. for voiceover, e.g., 'ELARA: We have to move.').
- An 'image_tag' (a concise, domain-specific prompt for a visual AI to generate a storyboard panel).
"""

# 2. JSON SCHEMA (Remains the same for consistent parsing)
RESPONSE_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "movie_title": types.Schema(type=types.Type.STRING),
        "logline": types.Schema(type=types.Type.STRING),
        "blueprint": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "scene_number": types.Schema(type=types.Type.INTEGER),
                    "setting": types.Schema(type=types.Type.STRING),
                    "timeline": types.Schema(type=types.Type.STRING),
                    "detailed_scene": types.Schema(type=types.Type.STRING),
                    "character_emotions": types.Schema(type=types.Type.STRING),
                    "camera_angle": types.Schema(type=types.Type.STRING),
                    "dialogue": types.Schema(type=types.Type.STRING),
                    "image_tag": types.Schema(type=types.Type.STRING),
                },
                required=[
                    "scene_number", "setting", "timeline", "detailed_scene", 
                    "character_emotions", "camera_angle", "dialogue", "image_tag"
                ],
            ),
        ),
    },
    required=["movie_title", "logline", "blueprint"],
)


# --- Core AI Generation Function ---

def generate_storyboard_blueprint_real(idea, num_scenes, film_tone, aspect_ratio):
    """Calls the Gemini API with structured inputs."""
    
    # 1. Format the dynamic System Instruction
    system_instruction = SYSTEM_INSTRUCTION_TEMPLATE.format(
        aspect_ratio=aspect_ratio,
        film_tone=film_tone
    )
    
    # 2. Format the User Prompt with the requested scene count
    user_prompt = (f"Generate a detailed film blueprint with exactly **{num_scenes} scenes** "
                   f"for this movie idea: {idea}")

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        response_schema=RESPONSE_SCHEMA,
        temperature=0.7 
    )

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=user_prompt,
        config=config,
    )
    
    return json.loads(response.text)


# --- Flask Routes ---

@app.route('/')
def index():
    """Renders the main application page."""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_storyboard():
    """API endpoint to receive the user idea and return the AI blueprint."""
    data = request.get_json()
    user_idea = data.get('idea', '')
    
    # New feature inputs
    num_scenes = int(data.get('num_scenes', 5)) # Ensure it's an integer
    film_tone = data.get('film_tone', 'Gritty Sci-Fi')
    aspect_ratio = data.get('aspect_ratio', '1.85:1 (Widescreen)')

    if not user_idea:
        return jsonify({"error": "Please provide a movie idea."}), 400

    if not client:
        return jsonify({"error": "API Client not initialized. Check GEMINI_API_KEY setup."}), 500

    try:
        # Pass all user inputs to the AI generation function
        blueprint_data = generate_storyboard_blueprint_real(user_idea, num_scenes, film_tone, aspect_ratio)
        return jsonify(blueprint_data)
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"error": f"Failed to generate blueprint from AI. Error: {str(e)}"}), 500

if __name__ == '__main__':
    if client:
        app.run(debug=True)
    else:
        print("\n--- APP START FAILED ---")
        print("Flask server cannot start without a valid Gemini API key.")