import pdfplumber, re
# import os


def extract_modules_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        # extract all page text 
        text = "" # all page text
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    part_b = re.split(r'PART-B',text, flags=re.IGNORECASE)[2] 
    part_b = re.sub(r'\d+\s*\|\s*\d+\s*P\s*age.*?\n', '', part_b)
    part_b = re.sub(r'Q\.No\..*?ks\n', '', part_b, flags=re.DOTALL)
    part_b = re.sub(r'L\d+\s*\d+\s*\d+\s*\d+', '', part_b)
    part_b = re.sub(r'\n\s*\n+', '\n', part_b)
    part_b = re.sub(r'\bMar\b', '', part_b)



    module_blocks = re.findall(
        r'(Module-\s*\d+)(.*?)(?=Module-\s*\d+|$)',
        part_b,
        flags=re.DOTALL
    )

    return module_blocks

pdf_folder = r"C:\Users\mm792\Downloads\QPs" #Folder with all QPs

all_modules = {} #map: key->module-no value->content

for filename in os.listdir(pdf_folder):
    if filename.endswith(".pdf"):
        full_path = os.path.join(pdf_folder, filename)

        module_block = extract_modules_from_pdf(full_path)
        #  [
        #   ("Module-1", "text..."),
        #   ("Module-2", "text..."),
        #  ]
        for module, content in module_block:
            clean_content = re.sub(r'\n\s*\n+', '\n\n', content.strip())

            if module not in all_modules:
                all_modules[module] = []

            all_modules[module].append((filename,clean_content))


# for module in sorted(all_modules.keys()):
#     print("="*70)
#     print(module)
#     print("="*70)

#     for filename, content in all_modules[module]:
#         print(f"\n---- From {filename}  ---\n")
#         print(content)
#         print("\n")

#     print("\n")













# loc = r"C:\Users\mm792\Downloads\Apr_May_2023(2022Scheme) (2).pdf"

# modules = extract_modules_from_pdf(loc)
# for module, content in modules:
#     print("=" * 60)
#     print(module)
#     print("=" * 60)

#     # clean spacing for readability
#     clean = re.sub(r'\n\s*\n+', '\n\n', content.strip())
#     print(clean)
#     print("\n\n")
