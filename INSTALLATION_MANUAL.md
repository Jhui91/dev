# VitaSense Installation and Execution Manual

> **Development and Production Environment Setup Guide**
> VitaSense Backend Server Compilation, Installation, and Execution

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Prerequisites](#2-prerequisites)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Production Deployment](#4-production-deployment)
5. [Execution and Testing](#5-execution-and-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. System Requirements

### 1.1 Hardware Requirements

**Minimum Specifications:**
- CPU: 1 Core
- RAM: 1 GB
- Disk: 10 GB free space

**Recommended Specifications:**
- CPU: 2+ Cores
- RAM: 2+ GB
- Disk: 20+ GB free space

### 1.2 Operating System

**Supported OS:**
- Ubuntu 20.04 LTS / 22.04 LTS (Recommended)
- Debian 10+
- CentOS 8+
- macOS 10.15+ (Development)
- Windows 10/11 (WSL2 recommended)

### 1.3 Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 14.x+ | Backend server |
| Python | 3.7+ | PDF analysis |
| MySQL | 8.0+ | Database |
| npm | 6.x+ | Package management |
| Git | 2.x+ | Source code management |

---

## 2. Prerequisites

### 2.1 Account and API Key Setup

#### 2.1.1 Kakao Developers Setup

1. **Access Kakao Developers Console**
   - https://developers.kakao.com/console

2. **Create Application**
   - Click "Add Application"
   - App name: VitaSense
   - Company name: (Optional)

3. **Get REST API Key**
   - App Settings → App Keys
   - Copy REST API key (for `.env` file)

4. **Configure Kakao Login**
   - Product Settings → Kakao Login → Activate ON
   - Register Redirect URI:
     - Development: `http://localhost:4000/kakao/callback`
     - Production: `http://[SERVER_IP]:4000/kakao/callback`

5. **Configure Consent Items**
   - Product Settings → Kakao Login → Consent Items
   - Required consent:
     - Nickname (profile_nickname)
     - Send KakaoTalk messages (talk_message)

6. **Generate Client Secret**
   - Product Settings → Kakao Login → Security
   - Generate and copy Client Secret code

#### 2.1.2 MySQL Database Preparation

**Local Development:**
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**Production:**
- Use managed services (AWS RDS, Google Cloud SQL) recommended
- Or set up dedicated MySQL server

---

## 3. Development Environment Setup

### 3.1 Install Node.js and npm

#### Ubuntu/Debian
```bash
# Add NodeSource repository (Node.js 18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version   # v18.x.x
npm --version    # 9.x.x
```

#### macOS
```bash
# Install with Homebrew
brew install node

# Verify installation
node --version
npm --version
```

#### Windows
- Download installer from https://nodejs.org/en/download
- Or use WSL2 Ubuntu (recommended)

### 3.2 Python Environment Setup

#### Install Python 3

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv
```

**macOS:**
```bash
brew install python3
```

#### Create Python Virtual Environment (Recommended)

```bash
# Navigate to project directory
cd /path/to/vitasense

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows
```

### 3.3 Clone Project and Install Dependencies

#### 3.3.1 Git Clone

```bash
# Public repository
git clone https://github.com/Graduation-Project-JPD/JPDamn.git
cd JPDamn

# Private repository (requires Personal Access Token)
git clone https://[YOUR_GITHUB_TOKEN]@github.com/Graduation-Project-JPD/JPDamn.git
cd JPDamn
```

#### 3.3.2 Install Node.js Dependencies

```bash
# Install npm packages
npm install

# Verify installed packages
npm list --depth=0
```

**Key Packages:**
- `express`: Web framework
- `mysql2`: MySQL database client
- `jsonwebtoken`: JWT authentication
- `axios`: HTTP client
- `multer`: File upload
- `node-cron`: Scheduler
- `cors`: CORS middleware
- `dotenv`: Environment variable management

#### 3.3.3 Install Python Dependencies

```bash
# Install PDF analysis libraries
cd extract-pdf/extractor

# Method 1: Install in virtual environment (recommended)
pip install -r requirements.txt

# Method 2: System-wide installation (Ubuntu 22.04+ requires --break-system-packages)
pip3 install -r requirements.txt --break-system-packages

cd ../..
```

**requirements.txt contents:**
```
PyMuPDF==1.23.8
easyocr==1.7.0
numpy==1.24.3
opencv-python==4.8.1.78
torch==2.0.1
torchvision==0.15.2
```

**Install system libraries (Ubuntu/Debian):**
```bash
sudo apt install -y \
  libgl1 \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  libgomp1
```

### 3.4 Database Setup

#### 3.4.1 Create MySQL Databases

```bash
# Connect to MySQL
mysql -u root -p

# Or remote MySQL
mysql -h [HOST] -u [USER] -p
```

**Create databases:**
```sql
-- Create vitasense database
CREATE DATABASE vitasense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user_info database
CREATE DATABASE user_info CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify databases
SHOW DATABASES;

exit;
```

#### 3.4.2 Apply Schema

```bash
# Execute schema SQL file
mysql -u root -p vitasense < analysis/VitaSenseDB.session.sql
mysql -u root -p user_info < analysis/VitaSenseDB.session.sql
```

> **Note:** `VitaSenseDB.session.sql` contains all table schemas for both databases.

#### 3.4.3 Create Database User (Optional)

Create separate database user for security:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create user
CREATE USER 'vitasense'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON vitasense.* TO 'vitasense'@'localhost';
GRANT ALL PRIVILEGES ON user_info.* TO 'vitasense'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

exit;
```

### 3.5 Environment Variables Configuration

#### Create .env File

Create `.env` file in project root:

```bash
nano .env
```

**Development .env Example:**

```env
# vitasense Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vitasense

# user_info Database
DB_L_HOST=localhost
DB_L_USER=root
DB_L_PASSWORD=your_mysql_password
DB_L_NAME=user_info

# JWT Secret (random string recommended)
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters

# Kakao API
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://localhost:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Frontend URL
CLIENT_URL=http://localhost:5173

# Server Port
PORT=4000
```

**Generate JWT_SECRET:**
```bash
# Generate random string with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save: `Ctrl+X` → `Y` → `Enter`

### 3.6 Load Initial Data (Supplement Data)

```bash
# Load supplement data
node analysis/main.js
```

This script inserts supplement data from `analysis/data/supplements_dummy.json` into the database.

---

## 4. Production Deployment

### 4.1 AWS EC2 + RDS Deployment (Recommended)

#### 4.1.1 Create EC2 Instance

**1. Create EC2 in AWS Console:**
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.micro (free tier) or t2.small
- Storage: 20 GB gp3
- Security group settings:
  - SSH (22): My IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom TCP (4000): 0.0.0.0/0

**2. Download SSH keypair and connect:**
```bash
# Set key permissions
chmod 400 vitasense-keypair.pem

# Connect to EC2
ssh -i vitasense-keypair.pem ubuntu@[EC2_PUBLIC_IP]
```

#### 4.1.2 EC2 Environment Setup

**Update system:**
```bash
sudo apt update
sudo apt upgrade -y
```

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Install Python and dependencies:**
```bash
sudo apt install -y python3 python3-pip python3-venv
sudo apt install -y libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1
```

**Install MySQL client:**
```bash
sudo apt install -y mysql-client
```

**Install Git:**
```bash
sudo apt install -y git
```

#### 4.1.3 Create RDS MySQL Instance

**In AWS RDS Console:**
1. Select MySQL 8.0
2. Template: Free tier
3. DB instance identifier: `vitasense-db`
4. Master username: `admin`
5. Master password: Set strong password
6. Public access: Yes
7. VPC security group: Same as EC2
8. Initial database name: `vitasense`

**Add inbound rule to security group:**
- MySQL/Aurora (3306): EC2 security group ID

**Copy endpoint:**
- Example: `vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com`

#### 4.1.4 Deploy Project

**Clone project:**
```bash
cd ~
git clone https://[YOUR_GITHUB_TOKEN]@github.com/Graduation-Project-JPD/JPDamn.git backend
cd backend
```

**Install Node.js dependencies:**
```bash
npm install
```

**Install Python dependencies:**
```bash
cd extract-pdf/extractor
pip3 install -r requirements.txt --break-system-packages
cd ../..
```

**Create .env file:**
```bash
nano .env
```

**Production .env Configuration:**
```env
# vitasense Database (RDS)
DB_HOST=vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=vitasense

# user_info Database (RDS - same instance)
DB_L_HOST=vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_L_USER=admin
DB_L_PASSWORD=your_rds_password
DB_L_NAME=user_info

# JWT Secret
JWT_SECRET=your_generated_secret_key

# Kakao API
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://[EC2_PUBLIC_IP]:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Frontend URL
CLIENT_URL=https://your-frontend-url.com

# Server Port
PORT=4000
```

**Setup RDS database:**
```bash
# Create user_info database on RDS
mysql -h vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com -u admin -p

# In MySQL prompt:
CREATE DATABASE user_info CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
exit;

# Apply schema
mysql -h vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com -u admin -p vitasense < analysis/VitaSenseDB.session.sql
mysql -h vitasense-db.xxxxx.ap-northeast-2.rds.amazonaws.com -u admin -p user_info < analysis/VitaSenseDB.session.sql
```

**Load initial data:**
```bash
node analysis/main.js
```

#### 4.1.5 PM2 Process Management

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start application:**
```bash
pm2 start index.js --name vitasense
```

**Configure PM2 autostart:**
```bash
# Auto-start PM2 on boot
pm2 startup systemd
# Execute the displayed command (sudo command)

# Save current PM2 processes
pm2 save
```

**PM2 Key Commands:**
```bash
pm2 status              # Check status
pm2 logs vitasense      # View logs
pm2 restart vitasense   # Restart
pm2 stop vitasense      # Stop
pm2 delete vitasense    # Delete
pm2 monit               # Monitor
```

### 4.2 Nginx Reverse Proxy Setup (Optional)

To serve on ports 80/443, use Nginx:

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration file
sudo nano /etc/nginx/sites-available/vitasense
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

**Enable Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/vitasense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.3 SSL/TLS Certificate Setup (HTTPS)

**Using Let's Encrypt Certbot:**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Issue SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

---

## 5. Execution and Testing

### 5.1 Development Environment Execution

```bash
# Navigate to project directory
cd /path/to/vitasense

# Start server
node index.js

# Or use nodemon (auto-restart)
npm install -g nodemon
nodemon index.js
```

**Normal execution output:**
```
Server is running on port 4000
[Scheduler] Daily alarm generator initialized (00:00 KST)
[Scheduler] Alarm checker initialized (every minute)
```

### 5.2 Production Environment Execution

```bash
# Start with PM2
cd ~/backend
pm2 start index.js --name vitasense

# Check logs
pm2 logs vitasense
```

### 5.3 Function Testing

#### 5.3.1 Server Status Check

```bash
# Local
curl http://localhost:4000/

# Production
curl http://[EC2_PUBLIC_IP]:4000/
```

**Expected response:**
```json
{
  "redirect": "https://kauth.kakao.com/oauth/authorize?..."
}
```

#### 5.3.2 Database Connection Check

```bash
# MySQL connection test
mysql -h localhost -u root -p vitasense -e "SHOW TABLES;"

# Or RDS
mysql -h [RDS_ENDPOINT] -u admin -p vitasense -e "SHOW TABLES;"
```

**Expected output:**
```
+-----------------------------+
| Tables_in_vitasense         |
+-----------------------------+
| supplement_conditions       |
| supplements                 |
| user_alarms                 |
| user_choices                |
+-----------------------------+
```

#### 5.3.3 Supplement Data Check

```bash
mysql -h localhost -u root -p vitasense -e "SELECT COUNT(*) FROM supplements;"
```

Data should exist for normal operation.

#### 5.3.4 API Endpoint Testing

**Using HTML test page:**

Open `vitasense-test.html` in browser:
1. Enter server URL
2. Click server status check
3. Test each feature

**Testing with curl commands:**

```bash
# 1. Get Kakao login URL
curl http://localhost:4000/

# 2. Query supplement recommendations
curl "http://localhost:4000/supplements?condition=고혈압"

# 3. Health assessment test
curl -X POST http://localhost:4000/pdf/judge \
  -H "Content-Type: application/json" \
  -d '{
    "체질량지수": 23.5,
    "고혈압_수축기": 120,
    "고혈압_이완기": 80,
    "공복혈당": 95,
    "gender": "남"
  }'
```

### 5.4 Log Monitoring

#### Development Environment

Check console output:
```
[Scheduler] 2024-12-06 10:30 알람 확인 중...
카카오 로그인 처리 시작
PDF 분석 시작...
```

#### Production Environment (PM2)

```bash
# Real-time logs
pm2 logs vitasense

# Last 100 lines
pm2 logs vitasense --lines 100

# Error logs only
pm2 logs vitasense --err
```

### 5.5 Performance Monitoring

```bash
# PM2 monitoring dashboard
pm2 monit

# Check memory usage
pm2 status
```

---

## 6. Troubleshooting

### 6.1 Common Errors

#### Error 1: "Cannot find module 'express'"

**Cause:** npm packages not installed

**Solution:**
```bash
npm install
```

#### Error 2: "ECONNREFUSED 127.0.0.1:3306"

**Cause:** MySQL server not running

**Solution:**
```bash
# Start MySQL service
sudo systemctl start mysql
sudo systemctl status mysql
```

#### Error 3: "Unknown database 'vitasense'"

**Cause:** Database not created

**Solution:**
```bash
mysql -u root -p -e "CREATE DATABASE vitasense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p vitasense < analysis/VitaSenseDB.session.sql
```

#### Error 4: "JWT_SECRET is not defined"

**Cause:** .env file missing or misconfigured

**Solution:**
```bash
# Check .env file
cat .env | grep JWT_SECRET

# Add if missing
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

#### Error 5: Python module import error

**Cause:** Python packages not installed

**Solution:**
```bash
cd extract-pdf/extractor
pip3 install -r requirements.txt --break-system-packages
```

#### Error 6: "Error: listen EADDRINUSE :::4000"

**Cause:** Port 4000 already in use

**Solution:**
```bash
# Check process using port
sudo lsof -i :4000

# Kill process
kill -9 [PID]

# Or use different port in .env
echo "PORT=5000" >> .env
```

### 6.2 Database Issues

#### Connection Failure

```bash
# Test MySQL connection
mysql -h [HOST] -u [USER] -p

# Check firewall (AWS security groups, EC2 iptables, etc.)
sudo ufw status
```

#### Permission Issues

```sql
-- Grant privileges in MySQL
GRANT ALL PRIVILEGES ON vitasense.* TO 'your_user'@'%';
GRANT ALL PRIVILEGES ON user_info.* TO 'your_user'@'%';
FLUSH PRIVILEGES;
```

### 6.3 PM2 Issues

#### PM2 doesn't start after reboot

```bash
pm2 startup systemd
# Execute the displayed command
pm2 save
```

#### PM2 logs too large

```bash
pm2 flush  # Delete logs
pm2 install pm2-logrotate  # Install log rotation
```

### 6.4 Performance Issues

#### Out of Memory

```bash
# Increase Node.js memory limit
pm2 start index.js --name vitasense --max-memory-restart 500M

# Or
pm2 delete vitasense
NODE_OPTIONS="--max-old-space-size=1024" pm2 start index.js --name vitasense
```

#### High CPU Usage

```bash
# Monitor processes
pm2 monit

# Use cluster mode (utilize multiple cores)
pm2 start index.js --name vitasense -i max
```

### 6.5 Kakao API Issues

#### "Invalid redirect_uri"

**Solution:**
- Register Redirect URI exactly in Kakao Developers console
- Verify it matches `KAKAO_REDIRECT_URI` in `.env`

#### "Insufficient scope"

**Solution:**
- Add required permissions in Kakao Developers console → Consent Items
- Verify `talk_message`, `profile_nickname` permissions

---

## 7. Maintenance

### 7.1 Updates

```bash
# Get latest code with git pull
cd ~/backend
git pull origin main

# Reinstall dependencies (if changed)
npm install

# Restart server
pm2 restart vitasense
```

### 7.2 Backup

**Database Backup:**
```bash
# Local
mysqldump -u root -p vitasense > vitasense_backup_$(date +%Y%m%d).sql
mysqldump -u root -p user_info > user_info_backup_$(date +%Y%m%d).sql

# RDS
mysqldump -h [RDS_ENDPOINT] -u admin -p vitasense > vitasense_backup_$(date +%Y%m%d).sql
mysqldump -h [RDS_ENDPOINT] -u admin -p user_info > user_info_backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
mysql -u root -p vitasense < vitasense_backup_20241206.sql
```

### 7.3 Log Management

```bash
# Check PM2 logs
pm2 logs vitasense

# Log file location
ls ~/.pm2/logs/

# Delete old logs
pm2 flush
```

---

## 8. Additional Resources

### 8.1 Official Documentation

- **Node.js:** https://nodejs.org/docs
- **Express.js:** https://expressjs.com
- **MySQL:** https://dev.mysql.com/doc
- **PM2:** https://pm2.keymetrics.io/docs
- **Kakao Developers:** https://developers.kakao.com/docs

### 8.2 GitHub Repository

- **VitaSense:** https://github.com/Graduation-Project-JPD/JPDamn

### 8.3 Contact

- **Email:** support@vitasense.com
- **Issue Tracker:** GitHub Issues

---

## 9. Checklist

Pre-installation verification:

**Prerequisites:**
- [ ] Node.js 14.x+ installed
- [ ] Python 3.7+ installed
- [ ] MySQL 8.0+ installed or RDS ready
- [ ] Kakao Developers app created and keys issued
- [ ] Git installed

**Installation:**
- [ ] Project cloned
- [ ] `npm install` completed
- [ ] Python packages installed
- [ ] `.env` file created and configured
- [ ] MySQL databases created
- [ ] Schema applied
- [ ] Initial data loaded

**Execution:**
- [ ] Server starts normally
- [ ] Database connection verified
- [ ] API endpoint tests passed
- [ ] Kakao login verified working

**Production (Optional):**
- [ ] PM2 installed and configured
- [ ] Security groups configured
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)

---

**If installation and execution are successful, VitaSense is running properly! 🎉**

If problems occur, refer to the [Troubleshooting](#6-troubleshooting) section.
