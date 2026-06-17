let matchCounter = 0;
const COMPLETED_KEY = "helpmepass_completed";

function getCompletedSet() {
    try {
        return new Set(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"));
    } catch {
        return new Set();
    }
}

function setQuestionCompleted(key, done) {
    const set = getCompletedSet();
    if (done) set.add(key);
    else set.delete(key);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

export function renderResults(data) {
    matchCounter = 0;
    const completedQuestions = getCompletedSet();
    const resultdiv = document.getElementById("results");
    resultdiv.innerHTML = "";

    for (let moduleName in data) {
        const moduleDiv = document.createElement("div");
        moduleDiv.className = "module";

        //Module header: [-] Module-1
        const moduleHeader = document.createElement("div");
        moduleHeader.className = "module-header";
        moduleHeader.innerHTML = `<span class="module-toggle">[-]</span> <span class="module-title">${moduleName.toUpperCase().replace("MODULE","MODULE-")}</span>`;
        

        const moduleBody = document.createElement("div");
        moduleBody.className = "module-body";
        
        moduleHeader.addEventListener("click", ()=>{
            const isOpen = moduleBody.style.display !== "none";
            moduleBody.style.display = isOpen ? "none": "block";
            moduleHeader.querySelector(".module-toggle").textContent = isOpen ? "[+]" : "[-]";
        });
        
        moduleDiv.appendChild(moduleHeader);
        moduleDiv.appendChild(moduleBody);


        data[moduleName].forEach(entry => {
            const keyword = document.getElementById("searchBox").value;
            const marksMatch = entry.content.match(/\d+\s*$/);
            const marks = marksMatch ? parseInt(marksMatch[0].trim()): null;

            let priorityLabel = "";
            let priorityClass = "";
            if (marks!==null) {
                if (marks >= 8) {
                    priorityLabel = `HIGH PRIORITY: ${marks}M`;
                    priorityClass = "priority-high";
                }else if(marks >= 5){
                    priorityLabel = `${marks}M`;
                    priorityClass = "priority-medium";

                }
                else{
                    priorityLabel = `${marks}M`;
                    priorityClass = "priority-low";
                }
            }
            const card = document.createElement("div");
            card.className = "paper-card";

            const cardHeader = document.createElement("div");
            cardHeader.className = "card-header";
            
            const leftGroup = document.createElement("span");
            leftGroup.className = `priority-badge ${priorityClass}`;
            leftGroup.textContent = priorityLabel ? `[${priorityLabel}]` : "";

            const rightGroup = document.createElement("div");
            rightGroup.className = "card-header-right";

            const paperName = document.createElement("span");
            paperName.className = "paper-name";
            paperName.textContent = entry.paper;

            const viewBtn = document.createElement("button");
            viewBtn.textContent = "View PDF";
            viewBtn.className = "view-btn";

            viewBtn.onclick = () => {
                if (entry.file) {
                    const url = URL.createObjectURL(entry.file);
                    window.open(url, "_blank");
                } else{
                    alert("PDF not available");
                }
            };
            
            rightGroup.appendChild(paperName);
            rightGroup.appendChild(viewBtn);
            cardHeader.appendChild(leftGroup);
            cardHeader.appendChild(rightGroup);
            card.appendChild(cardHeader);

            const contentDiv = document.createElement("div");
            contentDiv.className = "card-content";

            const lines = entry.content.split('\n').filter(line => line.trim()!=="");
            lines.forEach(line => {
                if(line.trim() === "OR"){
                    const orLine = document.createElement("div");
                    orLine.className = "OR";
                    contentDiv.appendChild(orLine);
                } else {
                    const questionKey = `${moduleName}|${entry.paper}|${line.trim()}`;
                    const row = document.createElement("div");
                    row.className = "question-row";
                    if (completedQuestions.has(questionKey)) {
                        row.classList.add("completed");
                    }

                    const textSpan = document.createElement("span");
                    textSpan.className = "question-text";
                    textSpan.innerHTML = formatMarks(highlightKeyword(line, keyword));

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.className = "question-done";
                    checkbox.checked = completedQuestions.has(questionKey);
                    checkbox.title = "Mark as done";
                    checkbox.addEventListener("change", () => {
                        row.classList.toggle("completed", checkbox.checked);
                        setQuestionCompleted(questionKey, checkbox.checked);
                    });

                    row.appendChild(textSpan);
                    row.appendChild(checkbox);
                    contentDiv.appendChild(row);
                }
            });

            card.appendChild(contentDiv);
            moduleBody.appendChild(card);
        });

        resultdiv.appendChild(moduleDiv);
    }

    if (!document.getElementById("searchBox").value) {
        document.getElementById("matchCount").textContent = " ";
    } else {
        document.getElementById("matchCount").textContent = `🔎 Matches found: ${matchCounter}`;
    }
}

function highlightKeyword(text, keyword) {
    if (!keyword || keyword.trim() === "") return text; //don't highlight or count
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    return text.replace(regex, (match) => {
        matchCounter++;
        return `<span class="highlight">${match}</span>`;
    });
}

function formatMarks(text) {
    // Parenthesized: (2 1 1,6 8)
    let formatted = text.replace(/\(([\d\s,]+)\)/g, (match, inner) => {
        const lastDigitMatch = inner.match(/(\d+)(?!.*\d)/);
        if (lastDigitMatch) {
            const lastDigit = lastDigitMatch[0];
            const lastIndex = inner.lastIndexOf(lastDigit);
            const before = inner.substring(0, lastIndex);
            const after = inner.substring(lastIndex + lastDigit.length);
            return `<span class="marks-container">(${before}<span class="marks-highlight">${lastDigit}</span>${after})</span>`;
        }
        return match;
    });

    // Unparenthesized at end: "L2 1 3 8" or "2 1 1,6 8"
    formatted = formatted.replace(/\s+((?:(?:L|CO|PO|BL)?\s*\d+[\s,]*)+\d+)\s*$/i, (match, inner) => {
        const lastDigitMatch = inner.match(/(\d+)(?!.*\d)/);
        if (lastDigitMatch) {
            const lastDigit = lastDigitMatch[0];
            const lastIndex = inner.lastIndexOf(lastDigit);
            const before = inner.substring(0, lastIndex);
            const after = inner.substring(lastIndex + lastDigit.length);
            return ` <span class="marks-container">${before}<span class="marks-highlight">${lastDigit}</span>${after}</span>`;
        }
        return match;
    });

    return formatted;
}