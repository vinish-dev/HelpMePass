//text processing logic 

export function extractModulesFromText(text) {
    const modules = {};

    //Split Part-B safely
    const partSplit = text.split(/PART\s*-\s*B/i);
    if (partSplit.length < 2) return modules;

    //select last part-b occurance 
    const partB = partSplit[partSplit.length - 1];

    //module regex
    const moduleRegex = /(Module\s*[-–]?\s*\d+)([\s\S]*?)(?=Module\s*[-–]?\s*\d+|$)/gi;
    console.log("MODULES FOUND:", modules);
    let match;
    //temp: search  
    while ((match = moduleRegex.exec(partB)) !== null) {
        const rawName = match[1];
        const moduleNumber = rawName.match(/\d+/)[0];
        const moduleName = `Module ${moduleNumber}`;
        const content = cleanText(match[2]);
        modules[moduleName] = content;
    }
    return modules;
}

function cleanText(text) {
    return text
        .replace(/\s{2,}/g, " ")
        .replace(/\b(OR)\b/g,"\n$1\n")
        .replace(/(\d+\s+[ab]\))/g, "\n$1")
        .replace(/\n\s+/g, "\n")
        .replace(/\d+\s*\|\s*\d+\s*Page?/gi, "")
        .replace(/\b\d+\s*BFE\s*\d+/gi, "")
        .replace(/Q\.No.*Marks/gi, "")
        .trim();
}