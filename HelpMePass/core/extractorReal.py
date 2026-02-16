import pdfplumber, os, re

def extract_modules_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # safer PART-B extraction
    parts = re.split(r'PART-B', text, flags=re.IGNORECASE)
    if len(parts) < 2:
        return {}

    part_b = parts[-1]  # take last occurrence safely

    # cleanup
    part_b = re.sub(r'\d+\s*\|\s*\d+\s*P\s*age.*?\n', '', part_b)
    part_b = re.sub(r'Q\.No\..*?ks\n', '', part_b, flags=re.DOTALL)
    part_b = re.sub(r'L\d+\s*\d+\s*\d+\s*\d+', '', part_b)
    part_b = re.sub(r'\n\s*\n+', '\n', part_b)
    part_b = re.sub(r'\bMar\b', '', part_b)

    module_blocks = re.findall(
        r'(Module-\s*\d+)(.*?)(?=Module-\s*\d+|$)',
        part_b,
        flags=re.DOTALL | re.IGNORECASE
    )

    result = {}

    for module, content in module_blocks:
        clean_content = re.sub(r'\n\s*\n+', '\n\n', content.strip())
        result[module] = clean_content

    return result

def extract_from_folder(pdf_folder):
    all_modules = {}

    for filename in os.listdir(pdf_folder):
        if filename.endswith(".pdf"):
            full_path = os.path.join(pdf_folder, filename)

            module_dict = extract_modules_from_pdf(full_path)

            for module, content in module_dict.items():

                if module not in all_modules:
                    all_modules[module] = []

                all_modules[module].append({
                    "paper": filename,
                    "content": content
                })

    return all_modules


if __name__ == "__main__":
    pdf_folder = r"C:\Users\mm792\Downloads\QPs"
    all_modules = extract_from_folder(pdf_folder)

    for module in sorted(all_modules.keys()):
        print("=" * 70)
        print(module)
        print("=" * 70)

        for entry in all_modules[module]:
            print(f"\n--- From {entry['paper']} ---\n")
            print(entry['content'])

        print("\n")
