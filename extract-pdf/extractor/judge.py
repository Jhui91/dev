def judge_bmi(bmi_value):
    if bmi_value is None:
        return None
    bmi = float(bmi_value)
    if bmi < 18.5:
        return "저체중"
    elif 18.5 <= bmi <= 24.9:
        return "정상"
    elif 25 <= bmi <= 29.9:
        return "과체중"
    elif 30 <= bmi <= 34.9:
        return "비만"
    else:
        return "고도비만"

def judge_blood_pressure(systolic, diastolic):
    if systolic is None or diastolic is None:
        return None
    s = float(systolic)
    d = float(diastolic)
    if s >= 160 or d >= 100:
        return "고혈압 의심 2기"
    elif 140 <= s <= 159 or 90 <= d <= 99:
        return "고혈압 의심 1기"
    elif 120 <= s <= 139 or 80 <= d <= 89:
        return "고혈압 전단계"
    else:
        return "정상"

def judge_hemoglobin(hb_value, gender):
    if hb_value is None or gender not in ["남", "여"]:
        return None
    hb = float(hb_value)
    if gender == "남":
        if 13.0 <= hb <= 16.5:
            return "정상"
        elif (12.0 <= hb < 13.0) or (16.5 < hb <= 17.5):
            return "경도 이상"
        elif (11.0 <= hb < 12.0) or (17.5 < hb <= 18.5):
            return "중등도 이상"
        else:
            return "중증 이상"
    else:
        if 12.0 <= hb <= 15.5:
            return "정상"
        elif (11.0 <= hb < 12.0) or (15.5 < hb <= 16.5):
            return "경도 이상"
        elif (10.0 <= hb < 11.0) or (16.5 < hb <= 17.5):
            return "중등도 이상"
        else:
            return "중증 이상"

def judge_fasting_blood_sugar(value):
    if value is None:
        return None
    sugar = float(value)
    if sugar <100.0:
        return "정상"
    elif 100.0 <= sugar < 126.0:
        return "공복혈당장애 의심"
    elif 126.0 <= sugar < 200.0:
        return "당뇨병 의심"
    else:
        return "당뇨병 확진"

def judge_kidney(creatinine, gfr):
    if creatinine is None or gfr is None:
        return None
    c = float(creatinine)
    g = float(gfr)
    if c <= 1.5 and g >= 60.0:
        return "정상"
    elif c <=1.5 and g < 60.0:
        return "gfr 이상"
    elif c > 1.5 and g >= 60.0:
        return "creatinine 이상"
    else:
        return "신장기능 이상 의심"

def judge_liver(ast, alt, gtp, gender):
    if None in (ast, alt, gtp) or gender not in ["남", "여"]:
        return None
    ast = float(ast)
    alt = float(alt)
    gtp = float(gtp)
    gtp_limit = 63.0 if gender == "남" else 35.0

    abnormal_list = []

    if ast > 40.0:
        abnormal_list.append("AST 이상")
    if alt > 35.0:
        abnormal_list.append("ALT 이상")
    if gtp > gtp_limit:
        abnormal_list.append("GTP 이상")

    if not abnormal_list:
        return ["정상"]
    
    return abnormal_list
