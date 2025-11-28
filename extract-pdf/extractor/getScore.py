import sys
import json
from score_calculator import calculate_individual_scores 

if __name__ == "__main__":
  try:
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    results = data.get("results")
    gender = data.get("gender")
        
    if not results or not gender:
      print(json.dumps({"error": "Error: 'results'와 'gender' 값이 필요합니다."}))
      sys.exit(1)

    individual_scores, total_score = calculate_individual_scores(results, gender) 
        
    output = {
      "total_score": total_score,
      "individual_scores": individual_scores
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
        
  except Exception as e:
    print(json.dumps({"error": f"Python 스크립트 오류: {str(e)}"}))
    sys.exit(1)