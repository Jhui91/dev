from PDF_TEXT import analyze_pdf_health_data_basic, extract_pages_with_target_disease
from PDF_ocr import analyze_pdf_health_data_ocr, extract_pages_with_target_disease_ocr
from modify import prompt_modify_results
from judge import (
    judge_bmi, judge_blood_pressure, judge_hemoglobin,
    judge_fasting_blood_sugar, judge_kidney, judge_liver
)
from PDF_keyword import generate_recommendations_by_condition
import sys
import tempfile
import json


def try_extract_and_modify(analyzer_func, extractor_func, pdf_path):
    text = extractor_func(pdf_path)
    if text:
        results = analyzer_func(text)
        # results = prompt_modify_results(results)
        return results
    return None


def run_main(pdf_path):
    # 1차: 텍스트 추출 시도
    results = try_extract_and_modify(analyze_pdf_health_data_basic, extract_pages_with_target_disease, pdf_path)

    # 2차: OCR 추출 시도
    if results is None or any(value is None for value in results.values()):
        print("기본 텍스트 추출에서 일부 값이 누락되어 OCR 보조 추출을 실행합니다.")
        results = try_extract_and_modify(analyze_pdf_health_data_ocr, extract_pages_with_target_disease_ocr, pdf_path)

        if results is None:
            print("OCR에서도 목표질환 페이지를 추출하지 못했습니다.")
            return {}, {}
    return results

    # # ▶ 성별 입력
    # gender = ""
    # while gender not in ["남", "여"]:
    #     gender = input("\n성별을 입력하세요 (남/여): ").strip()

    # # 3) 판정 함수 적용
    # results["체질량지수_판정"] = judge_bmi(results.get("체질량지수"))

    # # 고혈압 판정
    # systolic = results.get("고혈압_수축기")
    # diastolic = results.get("고혈압_이완기")
    # results["고혈압_판정"] = judge_blood_pressure(systolic, diastolic)

    # # 나머지 항목들 판정
    # results["혈색소_판정"] = judge_hemoglobin(results.get("혈색소"), gender)
    # results["공복혈당_판정"] = judge_fasting_blood_sugar(results.get("공복혈당"))
    # results["신장질환_판정"] = judge_kidney(results.get("혈청 크레아티닌"), results.get("신사구체여과율"))
    # results["간장질환_판정"] = judge_liver(
    #     results.get("에이에스티(AST)"),
    #     results.get("에이엘티(ALT)"),
    #     results.get("감마지티피(γ-GTP)"),
    #     gender
    # )

    # # 4) 건강 추천 생성
    # recommendations = generate_recommendations_by_condition(results)

    # return results, recommendations


if __name__ == "__main__":
    # pdf파일을 binary로 받음
    pdf_file_path = sys.stdin.buffer.read()
    # binary를 토대로 임시파일 생성
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
        tmp_file.write(pdf_file_path)
        tmp_path = tmp_file.name
    # 임시파일 경로 전달
    results = run_main(tmp_path)
    print(json.dumps(results, ensure_ascii=False, indent=2))
