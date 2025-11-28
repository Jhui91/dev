# VitaSense AWS 배포 - 단계별 가이드 (프리티어)

> **예상 소요 시간:** 1~2시간
> **예상 비용:** 첫 12개월 무료 (₩0~5,000/월)

---

## 📋 체크리스트

배포 전 준비사항:
- [ ] AWS 계정 (신용카드 필요)
- [ ] 카카오 개발자 계정 및 앱 생성
- [ ] 로컬에 Git 설치
- [ ] SSH 클라이언트 (Windows: PuTTY 또는 Windows Terminal)

---

## 1단계: AWS 계정 생성 및 준비 (10분)

### 1-1. AWS 계정 생성

1. **AWS 웹사이트 접속**
   - https://aws.amazon.com/ko/ 접속
   - 우측 상단 "AWS 계정 생성" 클릭

2. **계정 정보 입력**
   ```
   이메일 주소: your-email@example.com
   AWS 계정 이름: VitaSense (또는 원하는 이름)
   ```

3. **연락처 정보 입력**
   - 개인 또는 비즈니스 선택
   - 전화번호, 주소 입력

4. **결제 정보 입력**
   - 신용카드 등록 (프리티어 사용해도 등록 필요)
   - ⚠️ 자동으로 $1 인증 후 환불됨

5. **본인 확인**
   - SMS 또는 전화로 인증 코드 받기

6. **지원 플랜 선택**
   - "기본 지원 - 무료" 선택

### 1-2. AWS 콘솔 로그인

1. https://console.aws.amazon.com/ 접속
2. 루트 사용자로 로그인
3. **리전 선택:** 우측 상단에서 **"서울 (ap-northeast-2)"** 선택
   - ⚠️ 모든 작업에서 서울 리전 유지 필수!

---

## 2단계: RDS MySQL 데이터베이스 생성 (30분)

### 2-1. 첫 번째 RDS 인스턴스 생성 (user_info DB)

1. **RDS 서비스 접속**
   ```
   AWS 콘솔 → 검색창에 "RDS" 입력 → RDS 클릭
   ```

2. **데이터베이스 생성 시작**
   ```
   좌측 메뉴 "데이터베이스" → "데이터베이스 생성" 버튼 클릭
   ```

3. **데이터베이스 생성 방식**
   ```
   ✅ 표준 생성 (Standard create)
   ```

4. **엔진 옵션**
   ```
   엔진 유형: MySQL
   에디션: MySQL Community
   버전: MySQL 8.0.35 (또는 최신 8.0.x)
   ```

5. **템플릿**
   ```
   ✅ 프리 티어 (Free tier)
   ```
   ⚠️ 이 옵션을 선택하면 자동으로 프리티어 설정이 적용됩니다!

6. **설정**
   ```
   DB 인스턴스 식별자: vitasense-user-info
   마스터 사용자 이름: admin
   마스터 암호: [강력한 비밀번호 입력 - 8자 이상, 영문+숫자+특수문자]
   암호 확인: [동일하게 입력]
   ```

   **💡 암호 예시:** `VitaSense2024!DB`
   - ⚠️ **이 비밀번호를 메모장에 반드시 기록하세요!**

7. **인스턴스 구성**
   ```
   프리티어 선택 시 자동 설정됨:
   - DB 인스턴스 클래스: db.t2.micro (1 vCPU, 1 GiB RAM)
   ```

8. **스토리지**
   ```
   프리티어 선택 시 자동 설정됨:
   - 스토리지 유형: 범용 SSD (gp2)
   - 할당된 스토리지: 20 GiB
   - 스토리지 자동 조정: 활성화 (최대 1000 GiB)
   ```

9. **연결**
   ```
   컴퓨팅 리소스: EC2 컴퓨팅 리소스에 연결 안 함

   Virtual Private Cloud (VPC): 기본값 (default)

   DB 서브넷 그룹: 기본값

   퍼블릭 액세스: ✅ 예
   ⚠️ 초기 설정 및 테스트를 위해 "예"로 설정

   VPC 보안 그룹: 새로 생성
   새 VPC 보안 그룹 이름: vitasense-db-sg

   가용 영역: 기본 설정 없음
   ```

10. **추가 구성** (펼치기)
    ```
    초기 데이터베이스 이름: user_info
    ⚠️ 반드시 입력! 이름 정확히: user_info

    DB 파라미터 그룹: 기본값
    옵션 그룹: 기본값

    백업:
    - 자동 백업 활성화: ✅ 체크
    - 백업 보존 기간: 7일
    - 백업 기간: 03:00 ~ 04:00 (새벽 시간대)

    암호화:
    - 암호화 활성화: 선택 사항 (프리티어는 무료)

    로그 내보내기: 체크 안 함 (선택사항)

    유지 관리:
    - 마이너 버전 자동 업그레이드 활성화: ✅ 체크

    삭제 방지: 체크 안 함 (개발용이므로)
    ```

11. **데이터베이스 생성**
    ```
    우측 하단 "데이터베이스 생성" 버튼 클릭
    ```

12. **생성 대기 (5~10분)**
    ```
    상태가 "생성 중" → "사용 가능"으로 변경될 때까지 대기
    ```

### 2-2. 두 번째 RDS 인스턴스 생성 (vitasense DB)

위의 2-1 과정을 **똑같이 반복**하되, 아래 항목만 변경:

```
DB 인스턴스 식별자: vitasense-main
초기 데이터베이스 이름: vitasense
VPC 보안 그룹: 기존 vitasense-db-sg 선택

나머지는 동일:
- 마스터 사용자 이름: admin
- 마스터 암호: [첫 번째 DB와 동일한 비밀번호 사용 권장]
```

### 2-3. RDS 엔드포인트 확인 및 기록

**두 DB가 모두 "사용 가능" 상태가 되면:**

1. **vitasense-user-info 클릭**
   ```
   "연결 & 보안" 탭에서 "엔드포인트" 복사
   예: vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
   ```

2. **vitasense-main 클릭**
   ```
   "연결 & 보안" 탭에서 "엔드포인트" 복사
   예: vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
   ```

3. **메모장에 기록**
   ```
   === RDS 접속 정보 ===
   user_info DB:
   - 엔드포인트: vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
   - 포트: 3306
   - 사용자: admin
   - 비밀번호: VitaSense2024!DB

   vitasense DB:
   - 엔드포인트: vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
   - 포트: 3306
   - 사용자: admin
   - 비밀번호: VitaSense2024!DB
   ```

### 2-4. RDS 보안 그룹 설정

1. **보안 그룹 확인**
   ```
   EC2 콘솔 → 좌측 메뉴 "네트워크 및 보안" → "보안 그룹"
   vitasense-db-sg 찾기
   ```

2. **인바운드 규칙 편집**
   ```
   vitasense-db-sg 선택 → 하단 "인바운드 규칙" 탭 → "인바운드 규칙 편집"
   ```

3. **규칙 추가** (임시로 모든 IP 허용)
   ```
   유형: MySQL/Aurora
   프로토콜: TCP
   포트 범위: 3306
   소스: 0.0.0.0/0 (임시 - 나중에 EC2만 허용으로 변경)
   설명: Temporary allow all for setup

   "규칙 저장" 클릭
   ```

---

## 3단계: 로컬에서 RDS 데이터베이스 스키마 생성 (15분)

### 3-1. MySQL 클라이언트 설치 (로컬 컴퓨터)

**Windows:**
```bash
# MySQL Workbench 다운로드 및 설치
https://dev.mysql.com/downloads/workbench/

또는 명령줄 클라이언트:
https://dev.mysql.com/downloads/mysql/
```

**macOS:**
```bash
brew install mysql-client
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-client -y
```

### 3-2. RDS 연결 테스트

**명령줄 방식:**
```bash
# user_info DB 접속 테스트
mysql -h vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -P 3306 \
      -u admin \
      -p

# 비밀번호 입력: VitaSense2024!DB

# 접속 성공 시:
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| user_info          |
+--------------------+

mysql> exit;
```

**MySQL Workbench 방식:**
```
1. MySQL Workbench 실행
2. "+" 버튼 클릭 (새 연결 생성)
3. Connection Name: VitaSense-UserInfo
4. Hostname: [RDS 엔드포인트 붙여넣기]
5. Port: 3306
6. Username: admin
7. Password: [Store in Keychain/Vault 클릭 → 비밀번호 입력]
8. "Test Connection" 클릭 → 성공 확인
9. "OK" 클릭
```

### 3-3. 스키마 파일 실행

**방법 1: 명령줄에서 실행**

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/JPDamn

# user_info DB에 스키마 적용
mysql -h vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p user_info

# 비밀번호 입력 후:
mysql> source analysis/VitaSenseDB.session.sql;
mysql> SHOW TABLES;
+-----------------------+
| Tables_in_user_info   |
+-----------------------+
| user_results          |
| users                 |
+-----------------------+
mysql> exit;

# vitasense DB에 스키마 적용
mysql -h vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p vitasense

mysql> source analysis/VitaSenseDB.session.sql;
mysql> SHOW TABLES;
+--------------------------+
| Tables_in_vitasense      |
+--------------------------+
| drug_conflicts           |
| supplement_conditions    |
| supplement_conflicts     |
| supplements              |
| user_alarms              |
| user_choices             |
+--------------------------+
mysql> exit;
```

**방법 2: MySQL Workbench에서 실행**

```
1. VitaSense-UserInfo 연결 더블클릭
2. File → Open SQL Script
3. analysis/VitaSenseDB.session.sql 선택
4. ⚡ Execute 버튼 클릭 (번개 아이콘)
5. 좌측 SCHEMAS에서 user_info → Tables 펼치기 → users, user_results 확인

vitasense DB도 동일하게 반복
```

---

## 4단계: EC2 인스턴스 생성 (20분)

### 4-1. EC2 인스턴스 시작

1. **EC2 서비스 접속**
   ```
   AWS 콘솔 → 검색창에 "EC2" → EC2 클릭
   ```

2. **인스턴스 시작**
   ```
   좌측 메뉴 "인스턴스" → "인스턴스 시작" 버튼 클릭
   ```

3. **이름 및 태그**
   ```
   이름: VitaSense-Server
   ```

4. **애플리케이션 및 OS 이미지 (Amazon Machine Image)**
   ```
   빠른 시작: Ubuntu

   Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
   아키텍처: 64비트 (x86)

   ✅ 프리 티어 사용 가능 표시 확인
   ```

5. **인스턴스 유형**
   ```
   인스턴스 유형: t2.micro

   ✅ 프리 티어 사용 가능 표시 확인
   (1 vCPU, 1 GiB 메모리)
   ```

6. **키 페어 (로그인)**
   ```
   "새 키 페어 생성" 클릭

   키 페어 이름: vitasense-keypair
   키 페어 유형: RSA
   프라이빗 키 파일 형식:
     - Windows: .ppk (PuTTY 사용 시)
     - Mac/Linux: .pem

   "키 페어 생성" 클릭

   ⚠️ vitasense-keypair.pem 파일이 다운로드됨
   ⚠️ 이 파일을 안전한 곳에 보관! (재발급 불가)
   ```

7. **네트워크 설정**
   ```
   "편집" 버튼 클릭

   VPC: 기본값 (default)
   서브넷: 기본 설정 없음 (ap-northeast-2a 등 자동 선택)
   퍼블릭 IP 자동 할당: 활성화

   방화벽(보안 그룹): 보안 그룹 생성
   보안 그룹 이름: vitasense-ec2-sg
   설명: Security group for VitaSense server

   인바운드 보안 그룹 규칙:

   규칙 1 (자동 생성됨):
   - 유형: SSH
   - 프로토콜: TCP
   - 포트 범위: 22
   - 소스 유형: 내 IP (또는 0.0.0.0/0 - 어디서든 접속)

   "보안 그룹 규칙 추가" 클릭:

   규칙 2:
   - 유형: HTTP
   - 프로토콜: TCP
   - 포트 범위: 80
   - 소스 유형: 0.0.0.0/0

   규칙 3:
   - 유형: HTTPS
   - 프로토콜: TCP
   - 포트 범위: 443
   - 소스 유형: 0.0.0.0/0

   규칙 4:
   - 유형: 사용자 지정 TCP
   - 프로토콜: TCP
   - 포트 범위: 4000
   - 소스 유형: 0.0.0.0/0
   - 설명: VitaSense API Server
   ```

8. **스토리지 구성**
   ```
   프리티어 자동 설정:
   - 볼륨 1 (루트): 8 GiB (최대 30 GiB까지 프리티어)

   권장: 20 GiB로 변경
   - 크기(GiB): 20
   - 볼륨 유형: gp3
   - 종료 시 삭제: ✅ 체크
   ```

9. **고급 세부 정보** (기본값 사용)

10. **요약 확인 및 인스턴스 시작**
    ```
    우측 "요약" 패널에서:
    - 인스턴스 개수: 1
    - 프리 티어 사용 가능 확인

    "인스턴스 시작" 버튼 클릭
    ```

11. **인스턴스 생성 확인**
    ```
    "인스턴스 시작 중" 메시지 표시
    "인스턴스 보기" 클릭

    상태: 실행 중
    상태 검사: 2/2 검사 통과 (2~3분 소요)
    ```

### 4-2. 인스턴스 정보 확인 및 기록

```
인스턴스 선택 → 하단 "세부 정보" 탭

퍼블릭 IPv4 주소: 13.xxx.xxx.xxx (예시)
퍼블릭 IPv4 DNS: ec2-13-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com

⚠️ 메모장에 기록:
EC2 퍼블릭 IP: 13.xxx.xxx.xxx
```

---

## 5단계: EC2 서버 접속 및 환경 구축 (30분)

### 5-1. SSH 접속

**Mac/Linux:**

```bash
# 키 파일 권한 설정 (최초 1회)
chmod 400 ~/Downloads/vitasense-keypair.pem

# EC2 접속
ssh -i ~/Downloads/vitasense-keypair.pem ubuntu@13.xxx.xxx.xxx

# 최초 접속 시 fingerprint 확인 메시지
# "Are you sure you want to continue connecting?" → yes 입력

# 접속 성공 시:
ubuntu@ip-172-31-xxx-xxx:~$
```

**Windows (PowerShell 또는 명령 프롬프트):**

```powershell
# Windows 10/11은 기본 SSH 클라이언트 내장
ssh -i C:\Users\YourName\Downloads\vitasense-keypair.pem ubuntu@13.xxx.xxx.xxx
```

**Windows (PuTTY 사용 시):**

```
1. PuTTY 실행
2. Host Name: ubuntu@13.xxx.xxx.xxx
3. Port: 22
4. Connection type: SSH
5. 좌측 메뉴: Connection → SSH → Auth → Credentials
6. Private key file: vitasense-keypair.ppk 선택
7. "Open" 클릭
```

### 5-2. 시스템 업데이트

```bash
# 패키지 목록 업데이트
sudo apt update

# 설치된 패키지 업그레이드
sudo apt upgrade -y

# 소요 시간: 3~5분
```

### 5-3. Node.js 20.x 설치

```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js 설치
sudo apt install -y nodejs

# 버전 확인
node -v
# 출력: v20.x.x

npm -v
# 출력: 10.x.x
```

### 5-4. Python 및 필수 라이브러리 설치

```bash
# Python3 및 pip 설치 (Ubuntu 22.04는 기본 포함)
sudo apt install -y python3 python3-pip python3-venv

# Python 버전 확인
python3 --version
# 출력: Python 3.10.x

# PDF 처리에 필요한 시스템 라이브러리 설치
sudo apt install -y \
  libgl1-mesa-glx \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  libgomp1

# 소요 시간: 2~3분
```

### 5-5. Git 및 기타 도구 설치

```bash
# Git 설치
sudo apt install -y git

# MySQL 클라이언트 (DB 연결 테스트용)
sudo apt install -y mysql-client

# 텍스트 에디터 (선택사항)
sudo apt install -y nano vim
```

### 5-6. PM2 설치 (프로세스 관리)

```bash
# PM2 전역 설치
sudo npm install -g pm2

# 버전 확인
pm2 -v
# 출력: 5.x.x
```

---

## 6단계: 애플리케이션 배포 (25분)

### 6-1. 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# Git 저장소 클론
git clone https://github.com/Graduation-Project-JPD/JPDamn.git

# 디렉토리 이동
cd JPDamn

# 파일 확인
ls -la
# index.js, package.json 등 확인
```

### 6-2. Node.js 의존성 설치

```bash
# npm 패키지 설치
npm install

# 소요 시간: 2~3분
# 완료 메시지:
# added xxx packages in xxs
```

### 6-3. Python 의존성 설치

```bash
# Python 패키지 설치
pip3 install -r extract-pdf/extractor/requirements.txt

# 소요 시간: 5~10분 (easyocr가 큰 파일들을 다운로드)
# 주요 패키지: PyMuPDF, easyocr, numpy, opencv-python 등
```

### 6-4. 환경 변수 설정

```bash
# .env 파일 생성
nano .env
```

**아래 내용을 복사하여 붙여넣고 실제 값으로 수정:**

```env
# vitasense DB (RDS)
DB_HOST=vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=VitaSense2024!DB
DB_NAME=vitasense

# user_info DB (RDS)
DB_L_HOST=vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
DB_L_USER=admin
DB_L_PASSWORD=VitaSense2024!DB
DB_L_NAME=user_info

# JWT (아래 명령어로 생성)
JWT_SECRET=your_generated_secret_here

# Kakao API (카카오 개발자 콘솔에서 확인)
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://13.xxx.xxx.xxx:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Frontend URL (프론트엔드 배포 후 변경)
CLIENT_URL=http://localhost:5173

# Server Port
PORT=4000
```

**저장 방법:**
```
Ctrl + O (저장)
Enter
Ctrl + X (종료)
```

**JWT 시크릿 키 생성:**
```bash
# 랜덤 시크릿 키 생성
openssl rand -base64 32

# 출력 예: XyZ123abc456def789...
# 이 값을 복사하여 .env 파일의 JWT_SECRET에 붙여넣기

nano .env
# JWT_SECRET=XyZ123abc456def789... 로 수정
```

**카카오 개발자 설정:**
```
1. https://developers.kakao.com/ 접속
2. 내 애플리케이션 → 앱 선택
3. 앱 키 → REST API 키 복사
4. 카카오 로그인 → Redirect URI 등록:
   http://13.xxx.xxx.xxx:4000/kakao/callback
5. 제품 설정 → 카카오 로그인 → 보안 → Client Secret 발급 및 복사
```

### 6-5. 데이터베이스 연결 테스트

```bash
# user_info DB 접속 테스트
mysql -h vitasense-user-info.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p user_info

# 비밀번호 입력

mysql> SHOW TABLES;
+-----------------------+
| Tables_in_user_info   |
+-----------------------+
| user_results          |
| users                 |
+-----------------------+

mysql> exit;

# vitasense DB도 동일하게 테스트
mysql -h vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p vitasense

mysql> SHOW TABLES;
mysql> exit;
```

### 6-6. 초기 데이터 로드 (영양제 데이터)

```bash
# supplements_dummy.json 데이터를 DB에 삽입
node analysis/main.js

# 성공 메시지:
# "영양제 데이터 삽입 완료" 또는 유사한 메시지
```

### 6-7. 서버 테스트 실행

```bash
# 서버 직접 실행 (테스트용)
node index.js

# 출력:
# VitaSense Server (Kakao Auth) running on port 4000
# 로그인 페이지: http://localhost:4000/
# [Scheduler] 카카오톡 알람 스케줄러가 활성화되었습니다.
# [Scheduler] 일일 알람 생성 스케줄러가 활성화되었습니다 (매일 00:00).

# ✅ 성공!

# 테스트 종료: Ctrl + C
```

### 6-8. PM2로 프로덕션 실행

```bash
# PM2로 서버 시작
pm2 start index.js --name vitasense

# 출력:
# [PM2] Starting index.js in fork_mode (1 instance)
# [PM2] Done.
# ┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
# │ id  │ name       │ namespace   │ version │ mode    │ pid      │
# ├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0   │ vitasense  │ default     │ 1.0.0   │ fork    │ 12345    │
# └─────┴────────────┴─────────────┴─────────┴─────────┴──────────┘

# 실시간 로그 확인
pm2 logs vitasense

# Ctrl + C로 로그 종료 (서버는 계속 실행됨)

# 프로세스 상태 확인
pm2 status

# 부팅 시 자동 시작 설정
pm2 startup

# ⚠️ 출력되는 명령어를 복사하여 실행
# 예: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 현재 PM2 프로세스 목록 저장
pm2 save

# 출력: [PM2] Saving current process list...
```

---

## 7단계: 방화벽 설정 (5분)

```bash
# UFW (Ubuntu Firewall) 설정
sudo ufw allow OpenSSH
sudo ufw allow 4000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# UFW 활성화
sudo ufw enable

# 확인 메시지: "Command may disrupt existing ssh connections. Proceed with operation (y|n)?"
# y 입력

# 상태 확인
sudo ufw status

# 출력:
# Status: active
#
# To                         Action      From
# --                         ------      ----
# OpenSSH                    ALLOW       Anywhere
# 4000/tcp                   ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

---

## 8단계: 접속 테스트 및 확인 (10분)

### 8-1. API 서버 접속 테스트

**로컬 브라우저에서:**

```
http://13.xxx.xxx.xxx:4000/

응답 (JSON):
{
  "redirect": "https://kauth.kakao.com/oauth/authorize?..."
}

✅ 성공! 카카오 로그인 URL이 반환됨
```

### 8-2. 카카오 로그인 테스트

```
1. 브라우저에서 반환된 redirect URL 복사
2. 새 탭에서 해당 URL 접속
3. 카카오 로그인 진행
4. ⚠️ 리디렉션 실패 가능 (CLIENT_URL이 localhost이므로)
   → 정상적인 동작
```

### 8-3. PM2 모니터링

**EC2 SSH 터미널에서:**

```bash
# 실시간 모니터링
pm2 monit

# 화면:
# ┌─ Process List ─────┬─ vitasense Logs ────────────┐
# │ vitasense          │ 출력 로그가 실시간으로 표시  │
# │                    │                             │
# │                    │ [Scheduler] 알람 확인 중... │
# └────────────────────┴─────────────────────────────┘

# 종료: Ctrl + C

# 최근 로그 100줄 보기
pm2 logs vitasense --lines 100

# 에러 로그만 보기
pm2 logs vitasense --err
```

### 8-4. 데이터베이스 데이터 확인

```bash
# supplements 테이블 확인
mysql -h vitasense-main.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p vitasense

mysql> SELECT COUNT(*) FROM supplements;
+----------+
| COUNT(*) |
+----------+
|      xxx | (영양제 개수)
+----------+

mysql> SELECT id, item_name FROM supplements LIMIT 5;
# 영양제 목록 5개 표시

mysql> exit;
```

---

## 9단계: 프론트엔드 연동 (선택사항)

### 프론트엔드에서 설정할 환경 변수:

```env
VITE_API_URL=http://13.xxx.xxx.xxx:4000
```

### API 호출 테스트 (Postman 또는 curl):

```bash
# 로컬 터미널에서:

# 1. 프로필 조회 (인증 필요 - 실패 예상)
curl http://13.xxx.xxx.xxx:4000/auth/profile

# 응답:
# {"code":3002,"message":"토큰이 없습니다."}

# 2. 영양제 조회 (인증 필요)
curl http://13.xxx.xxx.xxx:4000/supplements?condition=고혈압

# 응답: 토큰 없음 에러
```

---

## 10단계: 보안 강화 (권장)

### 10-1. RDS 보안 그룹 수정 (EC2만 접속 허용)

```
1. EC2 콘솔 → 보안 그룹 → vitasense-db-sg
2. 인바운드 규칙 편집
3. 기존 규칙 삭제 (0.0.0.0/0)
4. 새 규칙 추가:
   - 유형: MySQL/Aurora
   - 포트: 3306
   - 소스: vitasense-ec2-sg (보안 그룹 선택)
   - 설명: Allow from EC2 only
5. 규칙 저장
```

이제 RDS는 EC2 인스턴스에서만 접속 가능!

### 10-2. SSH 포트 접속 제한 (선택사항)

```
1. EC2 콘솔 → 보안 그룹 → vitasense-ec2-sg
2. 인바운드 규칙 편집
3. SSH 규칙 수정:
   - 소스: 내 IP (현재 IP만 허용)
```

---

## ✅ 배포 완료 체크리스트

- [ ] AWS 계정 생성 및 서울 리전 선택
- [ ] RDS MySQL 2개 생성 (user_info, vitasense)
- [ ] RDS 엔드포인트 확인 및 기록
- [ ] 로컬에서 RDS 스키마 생성 완료
- [ ] EC2 인스턴스 생성 (t2.micro)
- [ ] 키 페어 다운로드 및 안전하게 보관
- [ ] SSH 접속 성공
- [ ] Node.js 20.x 설치
- [ ] Python 및 라이브러리 설치
- [ ] 프로젝트 클론
- [ ] npm install 완료
- [ ] pip install 완료
- [ ] .env 파일 설정 (모든 환경 변수)
- [ ] 카카오 Redirect URI 등록
- [ ] DB 연결 테스트 성공
- [ ] 초기 데이터(supplements) 로드
- [ ] PM2로 서버 시작
- [ ] PM2 부팅 시 자동 시작 설정
- [ ] UFW 방화벽 설정
- [ ] 브라우저에서 API 접속 테스트 성공
- [ ] RDS 보안 그룹 EC2만 허용으로 변경

---

## 🎉 배포 성공!

**서버 주소:** `http://13.xxx.xxx.xxx:4000`

### 다음 단계:

1. **프론트엔드 배포**
   - Vercel, Netlify, 또는 S3 + CloudFront 사용
   - .env에서 CLIENT_URL 업데이트

2. **도메인 연결** (선택사항)
   - Route 53에서 도메인 구매
   - EC2 Elastic IP 할당
   - A 레코드로 도메인 연결

3. **HTTPS 설정** (권장)
   - Nginx + Let's Encrypt
   - 또는 Application Load Balancer + ACM

4. **모니터링 설정**
   - CloudWatch 알람
   - PM2 Plus (선택사항)

---

## 🆘 문제 해결

### 서버가 시작되지 않음
```bash
pm2 logs vitasense --err
# 에러 로그 확인 후 조치
```

### DB 연결 실패
```bash
# .env 파일 확인
cat .env

# RDS 보안 그룹 확인
# EC2에서 DB 접속 테스트
mysql -h [RDS-endpoint] -u admin -p
```

### PM2 프로세스가 재부팅 후 실행 안 됨
```bash
pm2 startup
# 출력되는 명령어 실행

pm2 save
```

### 카카오 로그인 실패
```
- 카카오 개발자 콘솔에서 Redirect URI 정확히 등록 확인
- http://[EC2-IP]:4000/kakao/callback
```

---

**문서 작성일:** 2025-11-28
**예상 총 소요 시간:** 1~2시간
**예상 비용:** 프리티어 12개월 무료
