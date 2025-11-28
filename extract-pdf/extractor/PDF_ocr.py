import easyocr
import numpy as np
from pdf2image import convert_from_path
import re

def extract_pages_with_target_disease_ocr(pdf_path):
    images = convert_from_path(pdf_path, dpi=300)
    # print(images)
    reader = easyocr.Reader(['ko', 'en'])

    target_text = ""
    for i, image in enumerate(images):
        np_img = np.array(image)
        results = reader.readtext(np_img)
        page_text = "\n".join([res[1] for res in results])
        if "목표질환" in page_text:
            target_text += page_text + "\n"
    return target_text if target_text else None

def extract_section_value_ocr(text, label, pattern):
    match = re.search(rf"{re.escape(label)}.*?{pattern}", text, re.DOTALL)
    return match.group(1).strip() if match else None

def extract_two_numbers_after_label(text, label):
    pos = text.find(label)
    if pos == -1:
        return None, None
    after_text = text[pos:]
    match = re.search(rf"{re.escape(label)}\s*([\d.]+)\s*[\r\n]+\s*([\d.]+)", after_text)
    if match:
        return match.group(1), match.group(2)
    return None, None

def analyze_pdf_health_data_ocr(text):
    results = {}

    results["체질량지수"] = extract_section_value_ocr(text, "체질량지수", r"([\d.]+)")

    systolic, diastolic = extract_two_numbers_after_label(text, "고혈압")
    results["고혈압_수축기"] = systolic
    results["고혈압_이완기"] = diastolic

    results["혈색소"] = extract_section_value_ocr(text, "혈색소", r"([\d.]+)")

    results["공복혈당"] = extract_section_value_ocr(text, "공복혈당", r"([\d.]+)")

    results["혈청 크레아티닌"] = extract_section_value_ocr(text, "혈청 크레아티닌", r"([\d.]+)")
    results["신사구체여과율"] = extract_section_value_ocr(text, "신사구체여과율", r"([\d.]+)")

    results["에이에스티(AST)"] = extract_section_value_ocr(text, "AST", r"([\d.]+)")
    results["에이엘티(ALT)"] = extract_section_value_ocr(text, "ALT", r"([\d.]+)")
    results["감마지티피(γ-GTP)"] = extract_section_value_ocr(text, "GTP", r"([\d.]+)")

    return results
