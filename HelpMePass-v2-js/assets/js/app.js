import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";
import { extractModulesFromText } from "./parser.js";
import { renderResults } from "./ui.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

let allModules = {};

document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    analyzeBtn.addEventListener("click", analyzeFiles);
    document.getElementById("searchBox").addEventListener("input", filterResults);

    // Theme toogle
    const themeBtn = document.getElementById("themeToggle");

    // Restore saved preference
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeBtn.textContent = "🌙 Dark";
    }

    themeBtn.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light");
        themeBtn.textContent = isLight ? "Dark" : "☀️ Light"
        localStorage.setItem("theme", isLight ? "light" : "dark");
    });


    async function analyzeFiles() {
        const input = document.getElementById("files");
        const files = input.files;

        if (!files.length) {
            alert("Please Select PDF files first.");
            return;
        }
        allModules = {};
        for (let file of files) {
            const text = await extractTextFromPDF(file);
            // console.log("RAW TEXT:", text.slice(0, 500)); debug 
            const modules = extractModulesFromText(text);
            for (let moduleName in modules) {
                if (!allModules[moduleName]) {
                    allModules[moduleName] = [];
                }

                allModules[moduleName].push({
                    paper: file.name,
                    content: modules[moduleName],
                    file: file
                });
            }
        }
        renderResults(allModules);
    }
});

export async function extractTextFromPDF(file) {
    const arryBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arryBuffer }).promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let lastY = null;
        let pageText = "";

        for (let item of textContent.items) {

            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                pageText += "\n";
            }

            pageText += item.str + " ";
            lastY = item.transform[5];
        }

        fullText += pageText + "\n";

    }
    return fullText;
}
console.log("PDF.js loaded successfully")


function filterResults() {
    renderResults(allModules)
    const keyword = document.getElementById("searchBox").value.toLowerCase();

    if (!keyword) return;

    const modules = document.querySelectorAll(".module");

    modules.forEach(module => {
        const text = module.innerText.toLowerCase(); //module text in lowercase

        if (text.includes(keyword)) {
            module.style.display = "block";
        } else {
            module.style.display = "none";
        }
    });
}

