export function renderResults(data) {
    const resultdiv = document.getElementById("results");
    resultdiv.innerHTML = "";

    for (module in data) {
        const moduleDiv = document.createElement("div");
        moduleDiv.className = "module";

        const title = document.createElement("h2");
        title.textContent  = module;
        moduleDiv.appendChild(title);

        data[module].forEach(entry => {
            const paperTitle = document.createElement("h4")
            paperTitle.textContent = `From ${entry.paper}`;
            moduleDiv.appendChild(paperTitle);

            const pre = document.createElement("pre");
            pre.textContent = entry.content;
            moduleDiv.appendChild("pre");
        });
        
        resultdiv.appendChild(moduleDiv);
    }
}