import sys
import json
from PDF_keyword import generate_recommendations_by_condition

if __name__ == "__main__":
    input_data = sys.stdin.read()
    results = json.loads(input_data)

    recommendations = generate_recommendations_by_condition(results)

    print(json.dumps(recommendations, ensure_ascii=False, indent=2))