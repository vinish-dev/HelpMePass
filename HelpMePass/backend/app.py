from fastapi import FastAPI, UploadFile, File 
from typing import List
import shutil
import os

from core.extractor import extract_modules_from_pdf

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def process_pdfs(files: List[UploadFile] = File(...)):

    all_modules = {}
    
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        #save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        module_dict = extract_modules_from_pdf(file_path)
        # print("Processing:", file.filename)  # api testing 
        # print("Modules found:", module_dict.keys())

        for module, content in module_dict.items():
            if module not in all_modules: #initializtion
                all_modules[module] = []

            all_modules[module].append({ #accumulation
                "paper": file.filename,
                "content": content
            })
    return all_modules