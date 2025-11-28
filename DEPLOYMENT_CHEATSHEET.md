# VitaSense 배포 치트시트 (Quick Reference)

## 🚀 배포 순서 요약

```
1. AWS 계정 생성 (10분)
   └─ 리전: 서울 (ap-northeast-2)

2. RDS MySQL × 2 생성 (30분)
   ├─ vitasense-user-info (user_info DB)
   └─ vitasense-main (vitasense DB)

3. 로컬에서 스키마 생성 (15분)
   └─ VitaSenseDB.session.sql 실행

4. EC2 인스턴스 생성 (20분)
   └─ Ubuntu 22.04, t2.micro

5. EC2 환경 구축 (30분)
   ├─ Node.js 20.x
   ├─ Python 3
   └─ PM2

6. 애플리케이션 배포 (25분)
   ├─ Git clone
   ├─ npm install
   ├─ pip install
   ├─ .env 설정
   └─ 초기 데이터 로드

7. PM2로 실행 (5분)
   └─ 부팅 시 자동 시작 설정

8. 테스트 (10분)

총 소요 시간: 1~2시간
```

---

## 📝 핵심 설정값

### RDS 설정 (× 2개)

| 항목 | user_info DB | vitasense DB |
|------|-------------|--------------|
| 식별자 | vitasense-user-info | vitasense-main |
| 엔진 | MySQL 8.0.35 | MySQL 8.0.35 |
| 템플릿 | **프리 티어** | **프리 티어** |
| 인스턴스 | db.t2.micro | db.t2.micro |
| 스토리지 | 20 GiB gp2 | 20 GiB gp2 |
| 사용자 | admin | admin |
| 비밀번호 | [동일하게 사용] | [동일하게 사용] |
| 초기 DB 이름 | **user_info** | **vitasense** |
| 퍼블릭 액세스 | 예 | 예 |
| 보안 그룹 | vitasense-db-sg | vitasense-db-sg |

### EC2 설정

| 항목 | 값 |
|------|-----|
| 이름 | VitaSense-Server |
| AMI | Ubuntu Server 22.04 LTS |
| 인스턴스 유형 | **t2.micro (프리티어)** |
| 키 페어 | vitasense-keypair.pem |
| 스토리지 | 20 GiB gp3 |
| 보안 그룹 | vitasense-ec2-sg |
| 인바운드 규칙 | SSH(22), HTTP(80), HTTPS(443), TCP(4000) |

---

## 💻 필수 명령어 모음

### EC2 접속
```bash
# Mac/Linux
chmod 400 vitasense-keypair.pem
ssh -i vitasense-keypair.pem ubuntu@[EC2-IP]

# Windows
ssh -i vitasense-keypair.pem ubuntu@[EC2-IP]
```

### 초기 환경 구축
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Python 및 필수 패키지
sudo apt install -y python3 python3-pip python3-venv \
  libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1

# Git, MySQL 클라이언트
sudo apt install -y git mysql-client

# PM2 설치
sudo npm install -g pm2
```

### 애플리케이션 배포
```bash
# 프로젝트 클론
cd ~
git clone https://github.com/Graduation-Project-JPD/JPDamn.git
cd JPDamn

# 의존성 설치
npm install
pip3 install -r extract-pdf/extractor/requirements.txt

# JWT 시크릿 생성
openssl rand -base64 32
```

### .env 파일 템플릿
```bash
nano .env
```

```env
DB_HOST=vitasense-main.XXXXXX.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourPassword123!
DB_NAME=vitasense

DB_L_HOST=vitasense-user-info.XXXXXX.ap-northeast-2.rds.amazonaws.com
DB_L_USER=admin
DB_L_PASSWORD=YourPassword123!
DB_L_NAME=user_info

JWT_SECRET=[openssl rand -base64 32 결과]
KAKAO_REST_API_KEY=your_kakao_key
KAKAO_REDIRECT_URI=http://[EC2-IP]:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_secret
CLIENT_URL=http://localhost:5173
PORT=4000
```

### DB 스키마 생성 (로컬)
```bash
# user_info DB
mysql -h vitasense-user-info.XXXXXX.ap-northeast-2.rds.amazonaws.com \
      -u admin -p user_info < analysis/VitaSenseDB.session.sql

# vitasense DB
mysql -h vitasense-main.XXXXXX.ap-northeast-2.rds.amazonaws.com \
      -u admin -p vitasense < analysis/VitaSenseDB.session.sql
```

### 초기 데이터 로드
```bash
node analysis/main.js
```

### PM2 명령어
```bash
# 서버 시작
pm2 start index.js --name vitasense

# 로그 확인
pm2 logs vitasense
pm2 logs vitasense --lines 100
pm2 logs vitasense --err

# 상태 확인
pm2 status
pm2 monit

# 재시작/중지
pm2 restart vitasense
pm2 stop vitasense
pm2 delete vitasense

# 부팅 시 자동 시작
pm2 startup
# ⚠️ 출력되는 명령어 실행
pm2 save
```

### 방화벽 설정
```bash
sudo ufw allow OpenSSH
sudo ufw allow 4000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 🔍 테스트 명령어

### API 서버 테스트
```bash
# 로컬 브라우저에서
http://[EC2-IP]:4000/

# curl로 테스트
curl http://[EC2-IP]:4000/
```

### DB 연결 테스트
```bash
# EC2에서
mysql -h vitasense-user-info.XXXXXX.ap-northeast-2.rds.amazonaws.com -u admin -p
mysql -h vitasense-main.XXXXXX.ap-northeast-2.rds.amazonaws.com -u admin -p

# 테이블 확인
SHOW TABLES;
SELECT COUNT(*) FROM supplements;
```

---

## ⚙️ 보안 그룹 규칙

### vitasense-db-sg (RDS)
```
인바운드:
- MySQL/Aurora (3306) ← vitasense-ec2-sg
```

### vitasense-ec2-sg (EC2)
```
인바운드:
- SSH (22) ← 내 IP 또는 0.0.0.0/0
- HTTP (80) ← 0.0.0.0/0
- HTTPS (443) ← 0.0.0.0/0
- TCP (4000) ← 0.0.0.0/0
```

---

## 🐛 트러블슈팅

### 서버 시작 실패
```bash
pm2 logs vitasense --err
pm2 delete vitasense
pm2 start index.js --name vitasense
```

### DB 연결 실패
```bash
# .env 파일 확인
cat .env

# 보안 그룹 확인 (AWS 콘솔)
# RDS 엔드포인트 정확한지 확인
```

### Python 모듈 없음
```bash
pip3 install PyMuPDF easyocr numpy opencv-python
```

### 메모리 부족
```bash
pm2 delete vitasense
pm2 start index.js --name vitasense --node-args="--max-old-space-size=768"
pm2 save
```

### PM2 자동 시작 안 됨
```bash
pm2 unstartup
pm2 startup
# 출력되는 명령어 실행
pm2 save
```

---

## 📊 모니터링

### 로그 확인
```bash
# 실시간 로그
pm2 logs vitasense

# 최근 100줄
pm2 logs vitasense --lines 100

# 에러만
pm2 logs vitasense --err

# 특정 키워드 검색
pm2 logs vitasense | grep ERROR
pm2 logs vitasense | grep Scheduler
```

### 시스템 리소스
```bash
# CPU, 메모리 사용률
pm2 monit

# 시스템 전체
htop
# (설치: sudo apt install htop)

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

### 프로세스 정보
```bash
pm2 info vitasense
pm2 describe vitasense
```

---

## 🔄 업데이트 배포

### 코드 업데이트
```bash
cd ~/JPDamn
git pull origin main
npm install
pm2 restart vitasense
pm2 logs vitasense
```

### 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
# 재부팅 후 PM2가 자동으로 서버 시작
```

---

## 💰 비용 관리

### 프리티어 사용량 확인
```
AWS 콘솔 → 우측 상단 계정명 → Billing Dashboard
→ 좌측 메뉴 "Free Tier" 클릭
```

### 리소스 정리 (사용 중지 시)
```bash
# EC2에서
pm2 stop vitasense

# AWS 콘솔에서
1. EC2 인스턴스 → 중지 (Stop)
   - 중지 시 요금 절감, 데이터 유지
   - 종료(Terminate) 시 데이터 삭제

2. RDS 인스턴스 → 중지 (7일 후 자동 재시작)
   - 완전 삭제 시 스냅샷 생성 권장
```

---

## 📞 카카오 개발자 설정

### 필수 설정
```
1. https://developers.kakao.com/ 로그인
2. 내 애플리케이션 → 앱 선택/생성
3. 앱 키 → REST API 키 복사
4. 카카오 로그인 활성화
5. Redirect URI 등록:
   http://[EC2-IP]:4000/kakao/callback
6. 동의 항목 설정:
   - 닉네임: 필수
   - 카카오톡 메시지 전송: 필수
7. Client Secret 발급
```

---

## ✅ 최종 체크리스트

**RDS**
- [ ] user_info DB 생성 완료
- [ ] vitasense DB 생성 완료
- [ ] 스키마 적용 완료
- [ ] 초기 데이터(supplements) 로드 완료

**EC2**
- [ ] 인스턴스 실행 중
- [ ] SSH 접속 가능
- [ ] Node.js, Python 설치 완료
- [ ] PM2 설치 완료

**애플리케이션**
- [ ] 프로젝트 클론 완료
- [ ] npm install 완료
- [ ] pip install 완료
- [ ] .env 파일 설정 완료
- [ ] PM2로 서버 실행 중
- [ ] 부팅 시 자동 시작 설정 완료

**보안**
- [ ] RDS 보안 그룹: EC2만 허용
- [ ] EC2 보안 그룹: 필요한 포트만 오픈
- [ ] UFW 방화벽 활성화

**테스트**
- [ ] API 서버 접속 테스트 성공
- [ ] DB 연결 테스트 성공
- [ ] 카카오 로그인 URL 생성 확인
- [ ] PM2 로그 정상 확인

---

## 🔗 유용한 링크

- **AWS 콘솔:** https://console.aws.amazon.com/
- **카카오 개발자:** https://developers.kakao.com/
- **PM2 문서:** https://pm2.keymetrics.io/
- **프로젝트 저장소:** https://github.com/Graduation-Project-JPD/JPDamn

---

**프리티어 한도:**
- EC2 t2.micro: 750시간/월 (12개월)
- RDS db.t2.micro: 750시간/월 (12개월)
- 스토리지: 30GB EBS + 20GB RDS (12개월)
- 데이터 전송: 15GB 아웃바운드/월 (영구)

**참고:** 인스턴스 2개(EC2 1개, RDS 2개) 사용 시 750시간 공유
→ EC2 1개 + RDS 1개: 24시간 운영 가능
→ RDS 2개 사용 시: 하루 12시간씩만 프리티어 무료

**해결책:** RDS 하나로 통합 또는 일부 유료 전환 (~$13/월)
