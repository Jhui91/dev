from judge import judge_bmi, judge_blood_pressure, judge_hemoglobin, judge_fasting_blood_sugar, judge_kidney, judge_liver

def calculate_score(results, gender):
    score = 0

    # 1. BMI (12점)
    bmi_map = {"정상": 0, "저체중": -4, "과체중": -4, "비만": -8, "고도비만": -12}
    bmi_result = judge_bmi(results.get("체질량지수"))
    score += 12 + bmi_map.get(bmi_result, 0)

    # 2. 혈압 (22점)
    bp_map = {
        "정상": 0,
        "고혈압 전단계": -7,
        "고혈압 의심 1기": -15,
        "고혈압 의심 2기": -22
    }
    bp_result = judge_blood_pressure(results.get("고혈압_수축기"), results.get("고혈압_이완기"))
    score += 22 + bp_map.get(bp_result, 0)

    # 3. 혈색소 (8점)
    hb_result = judge_hemoglobin(results.get("혈색소"), gender)
    hb_map = {"정상":0, "경도 이상":-3, "중등도 이상":-5, "중증 이상":-8}
    score += 8 + hb_map.get(hb_result, 0)

    # 4. 공복혈당 (22점)
    sugar_result = judge_fasting_blood_sugar(results.get("공복혈당"))
    sugar_map = {"정상":0, "공복혈당장애 의심":-7, "당뇨병 의심":-15, "당뇨병 확진":-22}
    score += 22 + sugar_map.get(sugar_result, 0)

    # 5. 신장질환 (20점)
    kidney_result = judge_kidney(results.get("혈청 크레아티닌"), results.get("신사구체여과율"))
    kidney_score = 0
    if kidney_result == "정상":
        kidney_score = 0
    elif kidney_result == "gfr 이상":
        kidney_score = -9
    elif kidney_result == "creatinine 이상":
        kidney_score = -11
    else:
        kidney_score = -20
    score += 20 + kidney_score

    # 6. 간장질환 (16점)
    liver_result = judge_liver(
        results.get("에이에스티(AST)"),
        results.get("에이엘티(ALT)"),
        results.get("감마지티피(γ-GTP)"),
        gender
    )
    # liver_result는 리스트일 수 있음 ["AST 이상", "GTP 이상"] 등
    liver_score = 0
    if "AST 이상" in liver_result:
        liver_score -= 5
    if "ALT 이상" in liver_result:
        liver_score -= 8
    if "GTP 이상" in liver_result:
        liver_score -= 3
    score += 16 + liver_score

    return score

def calculate_individual_scores(results, gender):
    scores = {}

    # 1. BMI (12점 만점)
    bmi_map = {"정상": 0, "저체중": -4, "과체중": -4, "비만": -8, "고도비만": -12}
    bmi_result = judge_bmi(results.get("체질량지수"))
    bmi_score = 12 + bmi_map.get(bmi_result, 0)
    scores["bmi"] = round((bmi_score / 12) * 100, 2)

    # 2. 혈압 (22점 만점)
    bp_map = {
        "정상": 0,
        "고혈압 전단계": -7,
        "고혈압 의심 1기": -15,
        "고혈압 의심 2기": -22
    }
    bp_result = judge_blood_pressure(results.get("고혈압_수축기"), results.get("고혈압_이완기"))
    bp_score = 22 + bp_map.get(bp_result, 0)
    scores["blood_pressure"] = round((bp_score / 22) * 100, 2)

    # 3. 혈색소 (8점 만점)
    hb_map = {"정상":0, "경도 이상":-3, "중등도 이상":-5, "중증 이상":-8}
    hb_result = judge_hemoglobin(results.get("혈색소"), gender)
    hb_score = 8 + hb_map.get(hb_result, 0)
    scores["hemoglobin"] = round((hb_score / 8) * 100, 2)

    # 4. 공복혈당 (22점 만점)
    sugar_map = {"정상":0, "공복혈당장애 의심":-7, "당뇨병 의심":-15, "당뇨병 확진":-22}
    sugar_result = judge_fasting_blood_sugar(results.get("공복혈당"))
    sugar_score = 22 + sugar_map.get(sugar_result, 0)
    scores["blood_sugar"] = round((sugar_score / 22) * 100, 2)

    # 5. 신장질환 (20점 만점)
    kidney_result = judge_kidney(results.get("혈청 크레아티닌"), results.get("신사구체여과율"))
    kidney_score = 0
    if kidney_result == "정상":
        kidney_score = 0
    elif kidney_result == "gfr 이상":
        kidney_score = -9
    elif kidney_result == "creatinine 이상":
        kidney_score = -11
    else:
        kidney_score = -20
    kidney_final_score = 20 + kidney_score
    scores["kidney"] = round((kidney_final_score / 20) * 100, 2)

    # 6. 간장질환 (16점 만점)
    liver_result = judge_liver(
        results.get("에이에스티(AST)"),
        results.get("에이엘티(ALT)"),
        results.get("감마지티피(γ-GTP)"),
        gender
    )
    liver_score = 0
    if liver_result and "AST 이상" in liver_result:
        liver_score -= 5
    if liver_result and "ALT 이상" in liver_result:
        liver_score -= 8
    if liver_result and "GTP 이상" in liver_result:
        liver_score -= 3
    liver_final_score = 16 + liver_score
    scores["liver"] = round((liver_final_score / 16) * 100, 2)
    
    total_score = bmi_score + bp_score + hb_score + sugar_score + kidney_final_score + liver_final_score
    
    return scores, total_score