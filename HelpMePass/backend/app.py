from fastapi import FastAPI, UploadFile, File 
from typing import List
import shutil
import os

from core.extractor import extract_modules_from_pdf
from fastapi.responses import HTMLResponse

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

@app.get("/", response_class=HTMLResponse)
def home():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HelpMePass</title>
    <style>
        body{
            font-family: Arial, Helvetica, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
        }

        h1{
            color: #222;
        }

        button{
            padding: 10px 15px;
            background: black;
            color: #fff;
            border: none;
            cursor: pointer;
        }

        .module{
            margin-top: 20px;
            padding: 10px;
            bottom: 1px solid black;
        }

    </style>
</head>
<body>
    <h1>HelpMePass✅</h1>
    <p>Upload your QPs. Let panic begin</p>

    <input type="file" id="files" multiple>
    <br><br>

    <button onclick="uploadFiles()">Help Me Pass</button>
    <div id="results"></div>

    <script>
        async function uploadFiles() {
            const input = document.getElementById('files');
            const files = input.files;

            const formData = new FormData();
            for (let i = 0; i < files.length; i++){
                formData.append("files", files[i]);
            }

            const response = await fetch("/process",{
                method: "POST",
                body: formData
            });

            const data = await response.json();

            const resultsDiv  =document.getElementById("results");
            resultsDiv.innerHTML = "";

            for(const module in data) {
                const div = document.createElement("div");
                div.className  = "module";

                let html = `<h2>${module}</h2>`;

                data[module].forEach(entry => {
                    html += `<h4> Form ${entry.paper}</h4>`;
                    html += `<pre>${entry.content}</pre>`;
                });

                div.innerHTML = html;
                resultsDiv.appendChild(div)
            }
        }
    </script>

</body>
</html>
"""