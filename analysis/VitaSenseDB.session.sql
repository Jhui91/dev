USE vitasense;

drop table if exists supplements;
drop table if exists drug_conflicts;
drop table if exists supplement_conflicts;
drop table if exists supplement_conditions;
drop table if exists user_alarms;
drop table if exists user_choices;

CREATE TABLE IF NOT EXISTS supplements (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- 고유 식별자(기본 키)
    item_seq VARCHAR(20) UNIQUE,            -- 영양제 고유번호
    item_name TEXT,                         -- 영양제 이름
    entp_name TEXT,                         -- 제조사명 or 업체명
    efficacy TEXT,                          -- 효능 및 효과
    how_to_use TEXT,                        -- 복용 방법
    warning TEXT,                           -- 복용 시 주의사항
    interaction TEXT,                       -- 다른 약물과의 상호작용 정보
    side_effect TEXT,                       -- 복용 시 부작용
    image_url TEXT,                         -- 영양제 이미지 URL
    atpn_warnings TEXT,                     -- 복용 시 주의사항 (예: 알레르기, 임신 중 등)
    intrc_warnings TEXT                     -- 상호작용 경고 (예: 특정 약물과의 상호작용)
);

CREATE TABLE IF NOT EXISTS drug_conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,        -- 복용 약 이름 (ex. 혈액응고억제제)
    supplement_name VARCHAR(255) NOT NULL,  -- 충돌하는 영양제 이름 (ex. 오메가3)
    reason TEXT,                            -- 충돌 이유 설명
    UNIQUE (drug_name, supplement_name)     -- 중복 등록 방지
);

CREATE TABLE IF NOT EXISTS supplement_conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplement_a VARCHAR(255) NOT NULL,     -- 영양제 A
    supplement_b VARCHAR(255) NOT NULL,     -- 영양제 B
    reason TEXT,                            -- 왜 충돌하는지 설명
    UNIQUE (supplement_a, supplement_b)     -- 중복 방지
);

CREATE TABLE IF NOT EXISTS supplement_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplement_id INT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_condition (supplement_id, condition_name),
    FOREIGN KEY (supplement_id) REFERENCES supplements(id)
);

CREATE TABLE IF NOT EXISTS user_choices (
    choice_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    supplement_id INT NOT NULL,
    daily_count INT NOT NULL DEFAULT 1,
    meal_type ENUM('식전', '식후', '상관없음') NOT NULL DEFAULT '상관없음',
    UNIQUE KEY unique_choice (user_id, condition_name),
    FOREIGN KEY (supplement_id) REFERENCES supplements(id)
);

CREATE TABLE IF NOT EXISTS user_alarms (
    alarm_id INT AUTO_INCREMENT PRIMARY KEY,
    choice_id INT NOT NULL,
    alarm_time TIME NOT NULL,
    meal_type ENUM('식전', '식후', '상관없음') NOT NULL,
    alarm_date DATE NOT NULL,
    intake_status ENUM('미확인', '복용', '미복용') DEFAULT '미확인',
    UNIQUE KEY unique_alarm (choice_id, alarm_date, alarm_time),
    FOREIGN KEY (choice_id) REFERENCES user_choices(choice_id)
);

USE user_info;

DROP TABLE IF EXISTS user_results;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- 서버에서 사용할 고유 ID
    kakao_id BIGINT UNIQUE NOT NULL,           -- 카카오 사용자 고유 ID
    nickname VARCHAR(100),                     -- 카카오 닉네임
    kakao_access_token TEXT,                   -- 카카오 Access Token
    kakao_refresh_token TEXT,                  -- 카카오 Refresh Token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                      -- 새 users 테이블의 id를 참조
    result_json JSON,                          -- 건강검진 결과
    judge_json JSON,                           -- 판정 결과
    supplement_json JSON,                      -- 추천 영양제
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) -- FK 제약조건 설정
);

CREATE INDEX idx_user_created ON user_results (user_id, created_at DESC);
