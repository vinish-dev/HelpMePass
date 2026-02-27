//text processing logic 

export function extractModulesFromText(text) {
    const modules = {};

    //Split Part-B safely
    const partSplit = text.split(/PART-B/i);
    if (partSplit.length < 2) return modules;

    //select last part-b occurance 
    const partB = partSplit[partSplit.length - 1];

    //module regex
    const moduleRegex = /(Module\s*[-–]?\s*\d+)([\s\S]*?)(?=Module\s*[-–]?\s*\d+|$)/gi;

    let match;
    //temp: search  
    while ((match = moduleRegex.exec(partB)) !== null){
        const moduleName = match[1].trim();
        const content = cleanText(match[2])
        modules[moduleName] = content;
    }

    return modules;
}

function cleanText(text){
    return text
        .replace(/\n\s*\n+/g,"\n")
        .replace(/\Mar\b/gi, "")
        .trim();
}