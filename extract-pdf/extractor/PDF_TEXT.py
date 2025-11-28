import fitz  # PyMuPDF
import re

def extract_pages_with_target_disease(pdf_path):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"PDF 열기 실패: {e}")
        return None

    target_text = ""
    for page in doc:
        text = page.get_text()
        if "목표질환" in text:
            target_text += text + "\n"
    return target_text if target_text else None

def extract_section_value(text, label, pattern):
    match = re.search(rf"{re.escape(label)}.*?{pattern}", text, re.DOTALL)
    return match.group(1).strip() if match else None

def extract_two_numbers_after_label(text, label):
    pattern = rf"{re.escape(label)}.*?([\d.]+)\s*/\s*([\d.]+)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return None, None

def analyze_pdf_health_data_basic(text):
    results = {}
    results["체질량지수"] = extract_section_value(text, "체질량지수(kg/㎡)", r"([\d.]+)")

    systolic, diastolic = extract_two_numbers_after_label(text, "고혈압")
    results["고혈압_수축기"] = systolic
    results["고혈압_이완기"] = diastolic

    results["혈색소"] = extract_section_value(text, "혈색소(g/dL)", r"([\d.]+)")

    results["공복혈당"] = extract_section_value(text, "공복혈당(mg/dL)", r"([\d.]+)")

    results["혈청 크레아티닌"] = extract_section_value(text, "크레아티닌(mg/dL)", r"([\d.]+)")
    results["신사구체여과율"] = extract_section_value(text, "(mL/min/1.73㎡)", r"([\d.]+)")

    results["에이에스티(AST)"] = extract_section_value(text, "AST", r"([\d.]+)")
    results["에이엘티(ALT)"] = extract_section_value(text, "ALT", r"([\d.]+)")
    results["감마지티피(γ-GTP)"] = extract_section_value(text, "GTP", r"([\d.]+)")

    return results
