# FastAPI backend for PDF module extraction
# This server handles PDF uploads and extracts module content from question papers

from fastapi import FastAPI, UploadFile, File 
from typing import List
import shutil
import os
import sys 

from core.extractor import extract_modules_from_pdf
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Initialize FastAPI application
app = FastAPI()

# Serve static files (frontend) from the 'frontend' directory
def get_frontend_dir():
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, "frontend")
    return "frontend"

frontend_dir = get_frontend_dir()

app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

# Directory where uploaded PDF files are temporarily stored
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# API endpoint to process uploaded PDF files
# Accepts multiple PDF files and extracts modules from each
@app.post("/process")
async def process_pdfs(files: List[UploadFile] = File(...)):
    # Dictionary to store all extracted modules across all uploaded files
    # Structure: { "Module-1": [{"paper": "file1.pdf", "content": "..."}, ...], ... }
    all_modules = {}
    
    # Process each uploaded file
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save the uploaded file to disk temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract module content from the PDF file
        module_dict = extract_modules_from_pdf(file_path)

        # Aggregate modules from all files
        # If a module appears in multiple PDFs, store all occurrences
        for module, content in module_dict.items():
            # Initialize module list if it doesn't exist yet
            if module not in all_modules:
                all_modules[module] = []

            # Add this paper's content to the module
            all_modules[module].append({
                "paper": file.filename,
                "content": content
            })
    
    return all_modules

def get_frontend_path():
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, "frontend", "index.html")
    return os.path.join("frontend", "index.html")
    

@app.get("/")
def home():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

