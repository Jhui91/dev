def generate_recommendations_by_condition(results):
    recommendations = {}

    bmi = {}
    if results.get("체질량지수_판정") and results["체질량지수_판정"] not in ["정상", "저체중"]:
        bmi["itemName"] = []
        bmi["efcyQesitm"] = ["체중감량"]
    recommendations["체질량지수"] = bmi

    hypertension = {}
    if results.get("고혈압_판정") and "정상" not in results["고혈압_판정"]:
        hypertension["itemName"] = ["마그네슘"]
        hypertension["efcyQesitm"] = ["고혈압"]
    recommendations["고혈압"] = hypertension

    anemia = {}
    if results.get("혈색소_판정") and "정상" not in results["혈색소_판정"]:
        anemia["itemName"] = []
        anemia["efcyQesitm"] = ["빈혈", "비타민B12"]
    recommendations["혈색소"] = anemia

    sugar = {}
    if results.get("공복혈당_판정") and results["공복혈당_판정"] != "정상":
        sugar["itemName"] = ["마그네슘"]
        sugar["efcyQesitm"] = ["당뇨"]
    recommendations["공복혈당"] = sugar

    kidney = {}
    if results.get("신장질환_판정") and "정상" not in results["신장질환_판정"]:
        kidney["itemName"] = []
        kidney["efcyQesitm"] = ["비타민D", "비타민 D"]
    recommendations["신장질환"] = kidney

    liver = {}
    if results.get("간장질환_판정") and "정상" not in results["간장질환_판정"]:
        liver["itemName"] = ["밀크시슬"]
        liver["efcyQesitm"] = ["간기능", "간질환", "비타민 B", "비타민B"]
    recommendations["간장질환"] = liver

    return recommendations
