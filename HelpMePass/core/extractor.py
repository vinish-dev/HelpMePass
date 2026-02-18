# PDF extraction module for question papers
# Extracts module-wise content from PDF question papers

import pdfplumber, os, re

# Function to extract module content from a single PDF file
def extract_modules_from_pdf(pdf_path):
    """
    Extract modules from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        dict: Dictionary mapping module names to their content
    """
    # Open and read the entire PDF file
    with pdfplumber.open(pdf_path) as pdf:
        # Accumulate text from all pages
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # Extract PART-B section (contains module questions)
    # Split by 'PART-B' and take the last occurrence (safer approach)
    parts = re.split(r'PART-B', text, flags=re.IGNORECASE)
    if len(parts) < 2:
        # Return empty dict if PART-B not found
        return {}

    part_b = parts[-1]  # Get the last occurrence of PART-B content

    # Clean up unwanted patterns from the extracted text
    
    # Remove page number headers (e.g., "1 | 12 Page...")
    part_b = re.sub(r'\d+\s*\|\s*\d+\s*P\s*age.*?\n', '', part_b)
    
    # Remove question number headers (e.g., "Q.No. 1a) ...")
    part_b = re.sub(r'Q\.No\..*?ks\n', '', part_b, flags=re.DOTALL)
    
    # Remove line number patterns (e.g., "L1 2 3 4")
    part_b = re.sub(r'L\d+\s*\d+\s*\d+\s*\d+', '', part_b)
    
    # Normalize excessive whitespace/blank lines to single newlines
    part_b = re.sub(r'\n\s*\n+', '\n', part_b)
    
    # Remove stray 'Mar' text
    part_b = re.sub(r'\bMar\b', '', part_b)

    # Find all module blocks (Module-1, Module-2, etc.)
    module_blocks = re.findall(
        r'(Module-\s*\d+)(.*?)(?=Module-\s*\d+|$)',
        part_b,
        flags=re.DOTALL | re.IGNORECASE
    )

    result = {}

    # Process each module block
    for module, content in module_blocks:
        # Clean up excessive whitespace in module content
        clean_content = re.sub(r'\n\s*\n+', '\n\n', content.strip())
        result[module] = clean_content

    return result

# Function to batch process PDFs from a folder
def extract_from_folder(pdf_folder):
    """
    Extract modules from all PDF files in a folder.
    
    Args:
        pdf_folder (str): Path to folder containing PDF files
        
    Returns:
        dict: Dictionary with modules and their content from all PDFs
    """
    all_modules = {}

    # Iterate through all files in the folder
    for filename in os.listdir(pdf_folder):
        if filename.endswith(".pdf"):
            full_path = os.path.join(pdf_folder, filename)

            # Extract modules from this PDF
            module_dict = extract_modules_from_pdf(full_path)

            # Aggregate results from all PDFs
            for module, content in module_dict.items():

                if module not in all_modules:
                    all_modules[module] = []

                all_modules[module].append({
                    "paper": filename,
                    "content": content
                })

    return all_modules


# Main execution - can be used as a standalone script
if __name__ == "__main__":
    # Specify folder with question papers
    pdf_folder = r"C:\Users\mm792\Downloads\QPs"
    all_modules = extract_from_folder(pdf_folder)

    # Print organized output
    for module in sorted(all_modules.keys()):
        print("=" * 70)
        print(module)
        print("=" * 70)

        for entry in all_modules[module]:
            print(f"\n--- From {entry['paper']} ---\n")
            print(entry['content'])

        print("\n")
