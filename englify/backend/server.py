from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Load the tokenizer and model
model_path = "model_finale"  # Ensure this path is correct
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True)
model.eval()  # Set the model to evaluation mode

app = FastAPI()

# Allow CORS for your frontend (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow only your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class TranslationRequest(BaseModel):
    text: str

def translate_text(text):
    """Translates input text using the trained model."""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(model.device)
    output_tokens = model.generate(**inputs, max_length=512, num_return_sequences=1)
    translated_text = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
    return translated_text

@app.get("/")
async def root():
    return {"message": "Translation API is running!"}

@app.post("/generate")
async def generate(request: TranslationRequest):
    translated_text = translate_text(request.text)
    return {"translation": translated_text}


# to run: uvicorn server:app --host 0.0.0.0 --port 5000 --reload