# VitaSense User Manual

> **Personalized Supplement Recommendation and Notification System**
> Smart Healthcare Platform Based on Health Checkup PDF Analysis

---

## Table of Contents

1. [Introduction to VitaSense](#1-introduction-to-vitasense)
2. [Getting Started](#2-getting-started)
3. [Key Features Guide](#3-key-features-guide)
4. [Frequently Asked Questions (FAQ)](#4-frequently-asked-questions-faq)
5. [Troubleshooting](#5-troubleshooting)
6. [Privacy Policy](#6-privacy-policy)

---

## 1. Introduction to VitaSense

### 1.1 What is VitaSense?

VitaSense is a smart healthcare service that analyzes health checkup result PDFs to provide **personalized supplement recommendations** and sends **KakaoTalk notifications** to remind you of supplement intake times.

### 1.2 Key Features

✅ **Automatic Health Checkup PDF Analysis**
- Automatic health indicator extraction with simple PDF upload
- Comprehensive analysis of BMI, blood pressure, blood sugar, liver function, kidney function, etc.

✅ **Personalized Supplement Recommendations**
- Optimal supplement recommendations based on health status
- Based on Korea Food & Drug Administration certified supplement database

✅ **KakaoTalk Intake Reminders**
- Reminders sent via KakaoTalk at scheduled times
- Automatic calculation of before/after meal timing
- One-click intake confirmation

✅ **Health History Management**
- Storage and retrieval of past health checkup records
- Track changes in health status over time

---

## 2. Getting Started

### 2.1 Registration and Login

VitaSense offers convenient login using your **Kakao Account**.

#### Login Steps

1. Access VitaSense website
2. Click **"Login with Kakao"** button
3. Login with Kakao account
4. Agree to service terms
   - Consent to provide profile information (nickname)
   - Consent to send KakaoTalk messages
5. Login complete!

> **💡 Note:** If you don't have a Kakao account, please register for one first.

### 2.2 Initial Setup

After login, verify the following:

- **Profile Information**: Check your information in the top right corner
- **Notification Settings**: Verify KakaoTalk notification consent status

---

## 3. Key Features Guide

### 3.1 Health Checkup PDF Upload and Analysis

#### Step 1: Prepare PDF File

Supported health checkup PDFs:
- National Health Insurance Service health checkup results
- General health checkup results (including key indicators)

Required items:
- Body Mass Index (BMI) or height/weight
- Blood pressure (systolic/diastolic)
- Fasting blood sugar
- Liver function (AST/ALT)
- Kidney function (creatinine)
- Anemia (hemoglobin)

#### Step 2: Upload PDF

1. Click **"Upload PDF"** button on main screen
2. Select health checkup PDF file
3. Click **"Start Analysis"** button
4. ⏳ Analysis in progress... (takes approximately 30 seconds to 1 minute)

> **💡 Tip:** PDF analysis uses Python OCR technology to automatically extract values.

#### Step 3: Review Analysis Results

When analysis is complete, the following information is displayed:

**📊 Health Indicator Summary**
```
Body Mass Index: 23.5 kg/m² (Normal)
Blood Pressure: 120/80 mmHg (Normal)
Fasting Blood Sugar: 95 mg/dL (Normal)
Liver Function AST: 25 U/L (Normal)
Liver Function ALT: 28 U/L (Normal)
Kidney Function: 0.9 mg/dL (Normal)
Anemia Level: 14.5 g/dL (Normal)
```

**🏥 Health Assessment Results**
- Normal/Warning/Risk assessment for each item
- Overall health score (out of 100)

**💊 Recommended Supplements**
- List of supplements suitable for your health status
- Efficacy, usage, and precautions for each supplement

#### Step 4: Modify Values (Optional)

If automatically extracted values are incorrect:

1. Click **"Edit"** button next to each item
2. Enter correct values
3. Click **"Reanalyze"** button

### 3.2 Get Supplement Recommendations

#### Method 1: Automatic Recommendations via PDF Analysis

Supplements matching your health status are automatically recommended after PDF upload.

#### Method 2: Manually Select Health Conditions

1. Click **"Supplement Recommendations"** menu
2. Select applicable health conditions:
   - High blood pressure
   - Diabetes (abnormal fasting blood sugar)
   - Obesity (high BMI)
   - Liver health
   - Kidney health
   - Anemia
3. Click **"Get Recommendations"** button

#### View Supplement Information

Each recommended supplement provides:

- **Product Name**: Korea FDA certified supplement name
- **Efficacy**: Main effects and benefits
- **Usage**: Daily recommended dosage and frequency
- **Before/After Meals**: Timing of intake
- **Precautions**: Side effects and warnings
- **Interactions**: Interactions with other medications

### 3.3 Setting Up Alarms

Set intake reminders for recommended supplements.

#### Step 1: Select Supplement

1. Select supplement to take from recommendation list
2. Click **"Set Alarm"** button

#### Step 2: Set Intake Frequency

**Select daily intake frequency:**
- Once daily
- Twice daily
- Three times daily

> The recommended intake frequency for each supplement is automatically suggested.

#### Step 3: Automatic Alarm Time Setting

Alarm times are automatically calculated based on usage instructions (before/after/regardless of meals):

**Before Meals (30 minutes before)**
- 1x: 06:30
- 2x: 06:30, 11:30
- 3x: 06:30, 11:30, 18:30

**After Meals (30 minutes after)**
- 1x: 07:30
- 2x: 07:30, 12:30
- 3x: 07:30, 12:30, 19:30

**Any Time**
- 1x: 07:00
- 2x: 07:00, 12:00
- 3x: 07:00, 12:00, 19:00

#### Step 4: Save Alarm

Click **"Complete Alarm Setup"** button and KakaoTalk notifications will be sent daily at the scheduled times!

### 3.4 Receiving KakaoTalk Notifications

#### Notification Format

At the scheduled time, you'll receive a KakaoTalk message like this:

```
💊 VitaSense Intake Reminder

Time to take Omega-3 EPA+DHA!

⏰ Intake Time: 7:30 AM
📋 Usage: 30 minutes after meal

Please click the [Intake Complete] button!
```

#### Confirm Intake

**Method 1: Directly from KakaoTalk**
1. Check KakaoTalk notification message
2. Click **"Intake Complete"** button
3. ✅ Intake record saved

**Method 2: From VitaSense App**
1. Access VitaSense
2. Go to **"Today's Alarms"** menu
3. Check ✅ items you've taken

#### Manage Intake Records

- **Taken**: Normally taken
- **Not Taken**: Missed intake
- **Unconfirmed**: Not yet confirmed

> Intake records are automatically reflected in statistics and health history.

### 3.5 View Health History

#### View Past Checkup Records

1. Click **"Health History"** menu
2. View list of past uploaded PDF analysis results
3. Select desired date for detailed view

#### Track Health Changes

**Comparison Feature:**
- Compare with previous checkup to see value changes
- Identify improved/deteriorated items at a glance

**Graph Feature:**
- Time series graphs of key indicators (blood pressure, blood sugar, weight, etc.)
- Check long-term health trends

---

## 4. Frequently Asked Questions (FAQ)

### Q1. Do I need to register?

**A:** VitaSense supports simple login with Kakao account. No separate registration process is needed - just login with Kakao.

### Q2. What health checkup PDFs can I upload?

**A:** You can upload health checkup results that include the following items:
- National Health Insurance Service health checkup results
- General health checkup results (including BMI, blood pressure, blood sugar, liver function, kidney function, etc.)

### Q3. PDF analysis failed. What should I do?

**A:** Please check the following:
1. Verify PDF file is in text format (scanned images can also be processed with OCR)
2. Verify required health indicators are included
3. Verify PDF size is under 10MB
4. Use **"Manual Input"** feature if automatic extraction fails

### Q4. Do I have to purchase recommended supplements?

**A:** No. VitaSense only **recommends** supplements suitable for your health status. Purchase is your choice, and you can buy at pharmacies or online using the recommendation information.

### Q5. Can I modify or delete alarms?

**A:** Yes, you can.
- **Modify**: "Alarm Management" → Select alarm → "Change Time"
- **Delete**: "Alarm Management" → Select alarm → "Delete" button

### Q6. I'm not receiving KakaoTalk notifications.

**A:** Please check the following:
1. Verify you gave **"Message Sending Consent"** during Kakao login
2. Check KakaoTalk app notification settings (smartphone settings)
3. Verify VitaSense alarm is in **"Active"** status
4. Verify Kakao account is properly logged in

### Q7. Can I set alarms for multiple supplements?

**A:** Yes, you can set unlimited supplement alarms. Each supplement can have independent alarm times and intake frequencies.

### Q8. Is my personal information safe?

**A:** VitaSense protects personal information as follows:
- Secure login with Kakao OAuth 2.0 authentication
- Health data is encrypted and stored securely
- Absolutely no provision of information to third parties
- AWS cloud security system used

### Q9. Are there any fees?

**A:** VitaSense is a **completely free** service. PDF analysis, supplement recommendations, and notification services are all free to use.

### Q10. Can this replace a doctor's diagnosis?

**A:** No. VitaSense is a **health management support tool** and cannot replace a doctor's diagnosis or prescription. If you have health concerns, please consult with a medical professional.

---

## 5. Troubleshooting

### 5.1 Login Issues

**Problem:** Kakao login doesn't work.

**Solutions:**
1. Verify Kakao account password
2. Delete browser cookies and cache, then retry
3. Try a different browser
4. Verify Kakao account identity verification status

### 5.2 PDF Upload Issues

**Problem:** PDF upload fails.

**Solutions:**
1. **Check file format**: Only PDF files can be uploaded
2. **Check file size**: Must be under 10MB
3. **Check file corruption**: Verify PDF opens normally in PDF viewer
4. **Check internet connection**: Retry in stable Wi-Fi environment

### 5.3 Analysis Result Errors

**Problem:** PDF analysis results are incorrect.

**Solutions:**
1. **Manual correction**: Enter correct values using "Edit" button for each item
2. **Reanalyze**: Click "Reanalyze" button after corrections
3. **Different PDF format**: Use text-format PDF if possible
4. **Customer support**: Contact support if problem persists

### 5.4 Notification Not Received

**Problem:** Not receiving KakaoTalk notifications.

**Solutions:**
1. **Check permissions**: Verify message sending consent in Kakao Developer Console
2. **Alarm status**: Verify alarm is in "Active" status in VitaSense
3. **KakaoTalk login**: Verify KakaoTalk is properly logged in on smartphone
4. **Test notification**: Use "Send Test Notification" feature to verify operation

### 5.5 Performance Issues

**Problem:** Site is slow or unresponsive.

**Solutions:**
1. **Refresh browser** (Ctrl+F5 or Cmd+R)
2. **Delete browser cache**
3. **Use different browser** (Chrome, Edge, Safari recommended)
4. **Check internet connection**

### 5.6 Data Synchronization Issues

**Problem:** Previous records are not visible.

**Solutions:**
1. **Verify login account**: Check if logged in with same Kakao account
2. **Refresh page**
3. **Check browser cookies**: Verify cookies are not blocked

---

## 6. Privacy Policy

### 6.1 Information Collected

VitaSense collects the following information:

**Required Information:**
- Kakao account ID (unique identifier)
- Nickname (for profile display)
- KakaoTalk message sending token

**Optional Information:**
- Health checkup data (when uploading PDF)
- Supplement intake records
- Alarm settings

### 6.2 Purpose of Information Use

- Personalized supplement recommendations
- KakaoTalk notification sending
- Health history management
- Service quality improvement

### 6.3 Information Protection

- **Encryption**: All health data is stored encrypted
- **Access Control**: Only administrators have limited access
- **No Third-Party Provision**: Never provided without user consent

### 6.4 Information Deletion

All personal information is immediately deleted upon account withdrawal.

**Account Withdrawal Method:**
1. Settings → Account Management
2. Click "Withdraw Account" button
3. Select withdrawal reason
4. Confirm "Withdrawal Complete"

---

## 7. Customer Support

### 7.1 Contact Us

**Email:** support@vitasense.com
**Operating Hours:** Weekdays 09:00 - 18:00 (Excluding weekends/holidays)
**Response Time:** Within 24 hours on business days

### 7.2 Feedback and Suggestions

Send us your opinions for service improvement anytime!

- Email: feedback@vitasense.com
- KakaoTalk Channel: VitaSense Official Channel

---

## 8. Version Information

- **Current Version:** v1.0.0
- **Last Updated:** December 2024
- **Compatible Browsers:** Chrome, Edge, Safari, Firefox (latest versions)

---

## 9. System Requirements

### Recommended Environment

**Web Browsers:**
- Google Chrome 90 or higher
- Microsoft Edge 90 or higher
- Safari 14 or higher
- Firefox 88 or higher

**Mobile:**
- iOS 13 or higher
- Android 8.0 or higher

**Internet Speed:**
- Minimum: 5 Mbps
- Recommended: 10 Mbps or higher (for PDF upload)

---

## 10. License and Copyright

© 2024 VitaSense. All rights reserved.

All content, design, and logos of this service are protected by copyright law.
Unauthorized reproduction, distribution, and transmission are prohibited.

**Supplement Data Sources:**
- Korea Food & Drug Administration Health Functional Food Database
- Public Data Portal Open Data

---

**Start a healthy day with VitaSense! 💊**

Contact us anytime with questions.

**📧 Email:** support@vitasense.com
**🌐 Website:** https://vitasense.com
**💬 KakaoTalk:** VitaSense Official Channel
