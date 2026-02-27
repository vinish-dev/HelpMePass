import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";


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