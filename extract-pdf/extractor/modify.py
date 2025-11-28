def prompt_user_for_value(label, current_value):
    def get_float_input(prompt_text):
        while True:
            user_input = input(prompt_text).strip()
            try:
                return float(user_input)
            except ValueError:
                print("숫자(실수)만 입력 가능합니다. 다시 입력해주세요.")

    if current_value is None:
        print(f"'{label}' 값이 없습니다. 반드시 입력해야 합니다.")
        return get_float_input(f"{label}의 값을 입력하세요: ")
    else:
        resp = input(f"'{label}' 값을 수정하시겠습니까? (현재값: {current_value}) (Y/N): ").strip().upper()
        if resp == 'Y':
            return get_float_input(f"{label}의 새 값을 입력하세요: ")
        else:
            return current_value


def prompt_modify_results(results):
    print("=== 현재 결과 ===")
    for key, value in results.items():
        print(f"{key}: {value}")

    print("=== 수정 요청 ===")
    for key in results:
        results[key] = prompt_user_for_value(key, results[key])
    return results
