import sys
import json
from judge import (
    judge_bmi, judge_blood_pressure, judge_hemoglobin,
    judge_fasting_blood_sugar, judge_kidney, judge_liver
)
from PDF_keyword import generate_recommendations_by_condition

def make_judge(results, gender):
    judges = {}
    judges["체질량지수"] = judge_bmi(results.get("체질량지수"))

    # 고혈압 판정
    systolic = results.get("고혈압_수축기")
    diastolic = results.get("고혈압_이완기")
    judges["고혈압"] = judge_blood_pressure(systolic, diastolic)

    # 나머지 항목들 판정
    judges["혈색소"] = judge_hemoglobin(results.get("혈색소"), gender)
    judges["공복혈당"] = judge_fasting_blood_sugar(results.get("공복혈당"))
    judges["신장질환"] = judge_kidney(results.get("혈청 크레아티닌"), results.get("신사구체여과율"))
    judges["간장질환"] = judge_liver(
        results.get("에이에스티(AST)"),
        results.get("에이엘티(ALT)"),
        results.get("감마지티피(γ-GTP)"),
        gender
    )

    #return judges
    
    judges_with_suffix = {}
    for key, value in judges.items():
        judges_with_suffix[f"{key}_판정"] = value

    return judges_with_suffix

if __name__ == "__main__":
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    results = data.get("results")
    gender = data.get("gender")

    if not results or not gender:
        print(json.dumps({"error": "results 또는 gender가 없습니다."}))
        sys.exit(1)

    judges = make_judge(results, gender)
    recommendations = generate_recommendations_by_condition(judges)
    output = {
        "judgements": judges,
        "keywords": recommendations
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))