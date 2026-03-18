let matchCounter = 0;

export function renderResults(data) {
    matchCounter = 0;
    const resultdiv = document.getElementById("results");
    resultdiv.innerHTML = "";

    for (let moduleName in data) {
        const moduleDiv = document.createElement("div");
        moduleDiv.className = "module";

        const title = document.createElement("h2");
        title.textContent = moduleName;
        moduleDiv.appendChild(title);


        const details = document.createElement("details");
        details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = "View Questions";

        details.appendChild(summary);
        moduleDiv.appendChild(details);


        data[moduleName].forEach(entry => {
            const paperTitle = document.createElement("h4")
            paperTitle.textContent = `From ${entry.paper}`;
            details.appendChild(paperTitle);

            const pre = document.createElement("pre");
            const keyword = document.getElementById("searchBox").value;
            pre.innerHTML = formatContent(heighlightKeyword(entry.content, keyword));
            details.appendChild(pre);
        });

        resultdiv.appendChild(moduleDiv);
    }
    if (!document.getElementById("searchBox").value) {
        document.getElementById("matchCount").textContent = " ";
    } else {
        document.getElementById("matchCount").textContent = `🔎 Matches found: ${matchCounter}`;
    }
}

function heighlightKeyword(text, keyword) {

    if (!keyword || keyword.trim() == "") return text; //don't highlight or count

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");

    return text.replace(regex, (match) => {
        matchCounter++;
        return `<span class="highlight">${match}</span>`;
    });
}

function formatContent(text) {
    return text
        .replace(/OR/g, "<span class='or'>OR</span>")
        .replace(/\n/g, "<br>");
}