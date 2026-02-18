// Store API response data globally
let latestData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners if needed, though inline onclicks are removed in HTML
    const fileInput = document.getElementById('files');
    if (fileInput) {
        fileInput.addEventListener('change', updateFileLabel);
    }
});

function updateFileLabel() {
    const input = document.getElementById('files');
    const label = document.querySelector('.upload-text');
    if (input.files.length > 0) {
        label.innerHTML = `> ${input.files.length} file(s) buffered`;
        label.style.color = 'var(--primary-color)';
    } else {
        label.innerHTML = `> INITIATE UPLOAD SEQUENCE (CLICK OR DRAG)`;
        label.style.color = 'var(--text-muted)';
    }
}

// Show/Hide Loading Overlay
function toggleLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Upload PDFs to backend and display results
async function uploadFiles() {
    const input = document.getElementById('files');
    const files = input.files;

    if (files.length === 0) {
        alert("Please select at least one PDF file first.");
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    toggleLoading(true);

    try {
        const response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        latestData = data;
        renderResults(data);
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to process files. Please try again.");
    } finally {
        toggleLoading(false);
    }
}

function renderResults(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (Object.keys(data).length === 0) {
        resultsDiv.innerHTML = `<p style="text-align:center; color:var(--text-muted);">No modules found in the uploaded documents.</p>`;
        return;
    }

    for (const module in data) {
        const div = document.createElement("div");
        div.className = "module";

        let html = `
            <details open>
                <summary><h2>${module}</h2></summary>
                <div class="module-content">
        `;

        data[module].forEach(entry => {
            const marks = getMarksFromContent(entry.content);
            let markText = `[${marks}M]`;

            // Simple conditional logic for styling
            let priorityClass = 'priority-low';

            if (marks >= 8) {
                markText = `[HIGH PRIORITY: ${marks}M]`;
                priorityClass = 'priority-high';
            } else if (marks >= 6) {
                markText = `[MEDIUM: ${marks}M]`;
                priorityClass = 'priority-med';
            } else {
                markText = `[${marks}M]`;
                priorityClass = 'priority-low';
            }

            html += `
                <div class="question-block">
                    <h4>
                        <span class="mark-indicator ${priorityClass}">${markText}</span>
                        <span class="paper-source">${entry.paper}</span>
                    </h4>
                    <pre>${entry.content}</pre>
                </div>
            `;
        });

        html += `   </div>
            </details>`;

        div.innerHTML = html;
        resultsDiv.appendChild(div);
    }
}

// Download extracted content as TXT file
function downloadText() {
    if (!latestData || Object.keys(latestData).length === 0) {
        alert("No data to download!");
        return;
    }

    let textContent = "";

    for (const module in latestData) {
        textContent += "==============================\n";
        textContent += module + "\n";
        textContent += "==============================\n\n";

        latestData[module].forEach(entry => {
            textContent += "From " + entry.paper + "\n\n";
            textContent += entry.content + "\n\n";
        });

        textContent += "\n\n";
    }

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "HelpMePass_Output.txt";
    a.click();

    URL.revokeObjectURL(url);
}

// Extract marks/score from content (looks for numbers at line end)
function getMarksFromContent(content) {
    if (!content) return 0;

    const lines = content.split("\n");
    let maxMarks = 0;

    lines.forEach(line => {
        const match = line.trim().match(/\b(\d{1,2})\s*$/);
        if (match) {
            const value = parseInt(match[1]);
            if (value > maxMarks && value <= 20) {
                maxMarks = value;
            }
        }
    });

    return maxMarks;
}

// Escape special regex characters
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search and highlight matching content
function filterResults() {
    const keyword = document.getElementById("searchBox").value.toLowerCase();
    const modules = document.querySelectorAll(".module");
    const matchDisplay = document.getElementById("matchCount");

    let totalMatches = 0;

    modules.forEach(module => {
        const preBlocks = module.querySelectorAll("pre");
        let moduleContainsMatch = false;

        preBlocks.forEach(pre => {
            const originalText = pre.textContent; // Always search in textContent to avoid HTML tags
            const lowerText = originalText.toLowerCase();

            if (keyword && lowerText.includes(keyword)) {
                moduleContainsMatch = true;

                const safeKeyword = escapeRegex(keyword);
                const regex = new RegExp(`(${safeKeyword})`, "gi");

                const matches = originalText.match(regex);
                if (matches) {
                    totalMatches += matches.length;
                }

                // Highlight
                pre.innerHTML = originalText.replace(
                    regex,
                    `<span class="highlight">$1</span>`
                );
            } else {
                // Reset (removes spans)
                pre.innerHTML = originalText;
            }
        });

        module.style.display = moduleContainsMatch || keyword === "" ? "block" : "none";
    });

    if (keyword) {
        matchDisplay.textContent = `🔎 ${totalMatches} matches found`;
    } else {
        matchDisplay.textContent = "";
    }
}
