import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";
import { extractModulesFromText } from "./parser";
import { renderResults } from "./ui";

pdfjsLib.GlobalWorkerOptions.workerSrc =  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";


const analyzeBtn = document.getElementById("analyzeBtn");
analyzeBtn.addEventListener("click", analyzeFiles);

async function analyzeFiles() {
    const input = document.getElementById("files");
    const files = input.files;

    if(!files.length){
        alert("Please Select PDF files first.");
        return;
    }

    let allModules = {};

    for (let file of files){
        const text = await extractModulesFromPDF(file);
        const modules = extractModulesFromText(text);

        for(let moduleName in modules) {
            if (!allModules[moduleName]) {
                allModules[moduleName] = [];
            }

            allModules[moduleName].push({
                paper: file.name,
                content: modules[moduleName]
            });
        }
    }
    renderResults(allModules);
}

export async function extractTextFromPDF(file) {
    const arryBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arryBuffer}).promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText +"\n"
        
    }
    return fullText;
}
console.log("PDF.js loaded successfully")