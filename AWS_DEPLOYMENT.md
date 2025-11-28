# AWS 배포 가이드 - VitaSense

## 목차
1. [사전 준비](#사전-준비)
2. [RDS MySQL 설정](#rds-mysql-설정)
3. [EC2 인스턴스 설정](#ec2-인스턴스-설정)
4. [애플리케이션 배포](#애플리케이션-배포)
5. [도메인 및 HTTPS 설정](#도메인-및-https-설정)
6. [모니터링 및 유지보수](#모니터링-및-유지보수)

---

## 사전 준비

### 1. AWS 계정 생성
- https://aws.amazon.com/ko/ 에서 계정 생성
- 신용카드 등록 필요 (프리티어 사용 가능)

### 2. 필요한 정보 준비
- [ ] 카카오 개발자 앱 REST API 키
- [ ] 카카오 클라이언트 시크릿
- [ ] JWT 비밀 키 생성 (`openssl rand -base64 32`)
- [ ] 도메인 (선택사항)

### 3. AWS 리전 선택
- **권장:** 서울 리전 (`ap-northeast-2`)
- 한국 사용자 대상이므로 지연시간 최소화

---

## RDS MySQL 설정

### 1. RDS 인스턴스 생성 (첫 번째 DB: user_info)

#### AWS 콘솔 접속
1. AWS 콘솔 → **RDS** → **데이터베이스 생성**

#### 설정값
```
엔진 옵션: MySQL 8.0
템플릿: 프리 티어 (또는 개발/테스트)

DB 인스턴스 식별자: vitasense-user-info
마스터 사용자 이름: admin
마스터 암호: [강력한 비밀번호 설정]

DB 인스턴스 클래스:
  - 프리티어: db.t2.micro
  - 프로덕션: db.t4g.micro 또는 db.t4g.small

스토리지:
  - 유형: 범용 SSD (gp3)
  - 할당된 스토리지: 20GB
  - 스토리지 자동 조정: 활성화 (최대 100GB)

연결:
  - 퍼블릭 액세스: 예 (초기 설정용, 나중에 변경 가능)
  - VPC 보안 그룹: 새로 생성 (vitasense-db-sg)
  - 포트: 3306

추가 구성:
  - 초기 데이터베이스 이름: user_info
  - 백업 보존 기간: 7일
  - 자동 백업 시간대: 03:00-04:00 (사용량 적은 시간)
```

#### 보안 그룹 설정
생성 후 **보안 그룹 (vitasense-db-sg)** 인바운드 규칙 수정:
```
유형: MySQL/Aurora
포트: 3306
소스: 0.0.0.0/0 (임시, 나중에 EC2 보안 그룹으로 제한)
```

### 2. RDS 인스턴스 생성 (두 번째 DB: vitasense)

위 과정을 반복하되:
```
DB 인스턴스 식별자: vitasense-main
초기 데이터베이스 이름: vitasense
보안 그룹: 기존 vitasense-db-sg 사용
```

### 3. 엔드포인트 확인 및 기록

생성 완료 후 각 RDS 인스턴스의 **엔드포인트** 복사:
```
vitasense-user-info: xxx-user-info.xxxxxxxx.ap-northeast-2.rds.amazonaws.com
vitasense-main: xxx-main.xxxxxxxx.ap-northeast-2.rds.amazonaws.com
```

### 4. 데이터베이스 스키마 생성

로컬에서 MySQL 클라이언트로 접속:
```bash
# user_info DB 스키마 생성
mysql -h xxx-user-info.xxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin -p user_info < analysis/VitaSenseDB.session.sql

# vitasense DB 스키마 생성
mysql -h xxx-main.xxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin -p vitasense < analysis/VitaSenseDB.session.sql
```

또는 MySQL Workbench 사용:
1. 연결 생성 → 엔드포인트, 사용자명, 비밀번호 입력
2. SQL 파일 실행

---

## EC2 인스턴스 설정

### 1. EC2 인스턴스 생성

#### AWS 콘솔 접속
1. AWS 콘솔 → **EC2** → **인스턴스 시작**

#### 설정값
```
이름: VitaSense-Server

AMI: Ubuntu Server 22.04 LTS (프리 티어 사용 가능)

인스턴스 유형:
  - 프리티어: t2.micro (1 vCPU, 1GB RAM)
  - 권장: t3.small (2 vCPU, 2GB RAM)
  - 고성능: t3.medium (2 vCPU, 4GB RAM)

키 페어:
  - 새 키 페어 생성: vitasense-keypair.pem
  - 다운로드하여 안전하게 보관

네트워크 설정:
  - VPC: 기본값
  - 서브넷: 자동
  - 퍼블릭 IP 자동 할당: 활성화
  - 방화벽(보안 그룹): 새로 생성 (vitasense-ec2-sg)
    - SSH (22): 내 IP
    - HTTP (80): 0.0.0.0/0
    - HTTPS (443): 0.0.0.0/0
    - Custom TCP (4000): 0.0.0.0/0

스토리지:
  - 크기: 20GB (프리티어) ~ 30GB (프로덕션)
  - 유형: gp3
```

### 2. Elastic IP 할당 (권장)

고정 IP 주소 확보:
```
1. EC2 → 네트워크 및 보안 → 탄력적 IP
2. 탄력적 IP 주소 할당
3. 생성된 IP → 작업 → 탄력적 IP 주소 연결
4. 인스턴스: VitaSense-Server 선택
```

**비용:** 인스턴스에 연결된 상태면 무료, 미사용 시 $3.6/월

### 3. SSH 접속 설정

키 파일 권한 설정:
```bash
chmod 400 vitasense-keypair.pem
```

SSH 접속:
```bash
ssh -i vitasense-keypair.pem ubuntu@[EC2-퍼블릭-IP]
```

---

## 애플리케이션 배포

### 1. 서버 초기 설정

SSH 접속 후:

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 버전 확인
node -v  # v20.x.x
npm -v   # 10.x.x

# Python 및 pip 설치
sudo apt install -y python3 python3-pip python3-venv

# Git 설치
sudo apt install -y git

# MySQL 클라이언트 설치 (DB 접속 테스트용)
sudo apt install -y mysql-client

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

### 2. 애플리케이션 클론 및 설정

```bash
# 프로젝트 디렉토리 생성
cd ~
git clone https://github.com/Graduation-Project-JPD/JPDamn.git
cd JPDamn

# Node.js 의존성 설치
npm install

# Python 의존성 설치
pip3 install -r extract-pdf/extractor/requirements.txt
```

### 3. 환경 변수 설정

`.env` 파일 생성:
```bash
nano .env
```

내용:
```env
# vitasense DB (RDS)
DB_HOST=vitasense-main.xxxxxx.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=vitasense

# user_info DB (RDS)
DB_L_HOST=vitasense-user-info.xxxxxx.ap-northeast-2.rds.amazonaws.com
DB_L_USER=admin
DB_L_PASSWORD=your_rds_password
DB_L_NAME=user_info

# JWT
JWT_SECRET=your_generated_jwt_secret_key

# Kakao API
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://your-domain-or-ip:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Frontend URL
CLIENT_URL=http://your-frontend-domain

# Server Port
PORT=4000
```

**Ctrl+O → Enter → Ctrl+X** 로 저장

### 4. 데이터베이스 연결 테스트

```bash
# user_info DB 접속 테스트
mysql -h vitasense-user-info.xxxxx.ap-northeast-2.rds.amazonaws.com \
      -u admin -p

# 접속 성공 후
SHOW DATABASES;
USE user_info;
SHOW TABLES;
exit;
```

### 5. 초기 데이터 로드

```bash
# 영양제 데이터 삽입
node analysis/main.js
```

### 6. PM2로 애플리케이션 실행

```bash
# PM2로 서버 시작
pm2 start index.js --name vitasense

# 로그 확인
pm2 logs vitasense

# 상태 확인
pm2 status

# 부팅 시 자동 시작 설정
pm2 startup
# 출력되는 명령어 복사하여 실행 (sudo env PATH=... 형태)

pm2 save
```

### 7. 방화벽 설정 (Ubuntu UFW)

```bash
# UFW 활성화
sudo ufw allow OpenSSH
sudo ufw allow 4000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 상태 확인
sudo ufw status
```

### 8. 접속 테스트

브라우저에서:
```
http://[EC2-퍼블릭-IP]:4000/
```

카카오 로그인 URL이 반환되면 성공!

---

## 도메인 및 HTTPS 설정

### 옵션 1: Nginx + Let's Encrypt (권장)

#### 1. Nginx 설치
```bash
sudo apt install -y nginx
```

#### 2. Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/vitasense
```

내용:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Nginx 활성화
```bash
sudo ln -s /etc/nginx/sites-available/vitasense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Let's Encrypt SSL 인증서
```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

#### 5. .env 파일 업데이트
```env
KAKAO_REDIRECT_URI=https://your-domain.com/kakao/callback
CLIENT_URL=https://your-frontend-domain.com
```

#### 6. PM2 재시작
```bash
pm2 restart vitasense
```

### 옵션 2: AWS Application Load Balancer

1. **대상 그룹 생성**
   - EC2 → 대상 그룹 → 생성
   - 프로토콜: HTTP, 포트: 4000
   - 대상: VitaSense-Server 추가

2. **로드 밸런서 생성**
   - EC2 → 로드 밸런서 → Application Load Balancer
   - 리스너: HTTP (80), HTTPS (443)
   - SSL 인증서: ACM에서 발급 또는 업로드

3. **Route 53 설정**
   - 도메인 → A 레코드 → ALB 별칭

**비용:** ~$18/월 (약 ₩23,400)

---

## 모니터링 및 유지보수

### 1. PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs vitasense --lines 100

# 에러 로그만
pm2 logs vitasense --err

# 프로세스 재시작
pm2 restart vitasense

# 프로세스 중지
pm2 stop vitasense
```

### 2. CloudWatch 모니터링 (선택사항)

**EC2 메트릭:**
- CPU 사용률
- 네트워크 입출력
- 디스크 I/O

**RDS 메트릭:**
- DB 연결 수
- CPU/메모리 사용률
- 쿼리 성능

**알람 설정:**
```
CPU > 80% → 이메일 알림
디스크 사용률 > 80% → 이메일 알림
```

### 3. 로그 로테이션

PM2 로그 관리:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 4. 백업 전략

**RDS 자동 백업:**
- 매일 자동 백업 (보존 기간: 7일)
- 수동 스냅샷 생성: RDS 콘솔 → 작업 → 스냅샷 생성

**코드 백업:**
```bash
# Git 백업
cd ~/JPDamn
git pull origin main
```

### 5. 보안 업데이트

월 1회 정기 점검:
```bash
# SSH 접속
ssh -i vitasense-keypair.pem ubuntu@[EC2-IP]

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 패키지 업데이트
cd ~/JPDamn
npm outdated
npm update

# PM2 재시작
pm2 restart vitasense

# 재부팅 (필요 시)
sudo reboot
```

---

## 비용 최적화 팁

### 1. 프리티어 최대 활용
- EC2 t2.micro: 750시간/월 무료 (12개월)
- RDS db.t2.micro: 750시간/월 무료 (12개월)
- S3: 5GB 무료 (영구)
- 데이터 전송: 15GB 아웃바운드 무료 (영구)

### 2. 예약 인스턴스 (1년 이상 사용 시)
- 1년 선결제: ~40% 할인
- 3년 선결제: ~60% 할인

### 3. 리소스 모니터링
- CloudWatch로 실제 사용률 확인
- 과도한 리소스 다운사이징

### 4. 스팟 인스턴스 (개발 환경)
- 최대 90% 할인
- 단, 언제든 종료 가능 (프로덕션 비추천)

### 5. S3 수명 주기 정책
- 30일 이상 PDF → S3 Glacier (저렴한 스토리지)
- 90일 이상 → 자동 삭제

---

## 트러블슈팅

### 1. 데이터베이스 연결 실패
```
Error: ER_ACCESS_DENIED_ERROR
```
**해결:**
- RDS 보안 그룹에서 EC2 IP 허용 확인
- `.env` 파일의 DB 비밀번호 확인
- RDS 엔드포인트 주소 정확한지 확인

### 2. 카카오 로그인 실패
```
redirect_uri_mismatch
```
**해결:**
- 카카오 개발자 콘솔에서 Redirect URI 확인
- `http://your-domain.com/kakao/callback` 정확히 등록
- HTTPS 사용 시 프로토콜 일치 확인

### 3. Python 스크립트 실행 오류
```
ModuleNotFoundError: No module named 'fitz'
```
**해결:**
```bash
pip3 install PyMuPDF
```

### 4. 메모리 부족
```
JavaScript heap out of memory
```
**해결:**
```bash
# Node.js 메모리 증가
pm2 delete vitasense
pm2 start index.js --name vitasense --node-args="--max-old-space-size=1024"
pm2 save
```

또는 인스턴스 타입 업그레이드 (t3.small → t3.medium)

### 5. Cron job이 실행 안 됨
**확인:**
```bash
pm2 logs vitasense | grep Scheduler
```

서버 시간대 확인:
```bash
date
timedatectl set-timezone Asia/Seoul
```

---

## 체크리스트

배포 완료 전 확인:

- [ ] RDS 2개 생성 및 스키마 적용
- [ ] EC2 인스턴스 생성 및 보안 그룹 설정
- [ ] Node.js, Python 환경 구축
- [ ] `.env` 파일 설정
- [ ] 초기 데이터(supplements) 로드
- [ ] PM2로 서버 시작 및 자동 시작 설정
- [ ] 카카오 로그인 테스트
- [ ] PDF 업로드 테스트
- [ ] 알람 스케줄러 동작 확인
- [ ] 도메인 연결 (선택)
- [ ] HTTPS 설정 (선택)
- [ ] CloudWatch 알람 설정 (선택)
- [ ] 백업 정책 확인

---

## 참고 자료

- [AWS 프리 티어](https://aws.amazon.com/ko/free/)
- [EC2 요금](https://aws.amazon.com/ko/ec2/pricing/)
- [RDS 요금](https://aws.amazon.com/ko/rds/mysql/pricing/)
- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx 설정 가이드](https://docs.nginx.com/nginx/)

---

**작성일:** 2025-11-28
**업데이트:** VitaSense v1.0 기준
