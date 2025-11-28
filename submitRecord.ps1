# submitRecord.ps1

# 1. 파일 경로 설정
$resultPath = ".\extract-pdf\result.json"
$judgePath  = ".\extract-pdf\judge.json"
$submitPath = ".\submit.json"

# 2. 파일 존재 여부 확인
if (!(Test-Path $resultPath) -or !(Test-Path $judgePath)) {
    Write-Host "result.json 또는 judge.json 파일이 존재하지 않습니다." -ForegroundColor Red
    exit 1
}

# 3. JSON 객체 로딩
$result = Get-Content -Raw -Path $resultPath | ConvertFrom-Json
$judge  = Get-Content -Raw -Path $judgePath | ConvertFrom-Json

# 4. 병합 후 submit.json 저장
[PSCustomObject]@{
    result = $result
    judge  = $judge
} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $submitPath

Write-Host "submit.json 생성 완료." -ForegroundColor Green

# # 5. 서버로 제출 (인증 쿠키 필요)
# if (!(Test-Path "cookie.txt")) {
#     Write-Host "cookie.txt (로그인 쿠키)가 없습니다. 로그인 후 다시 시도하세요." -ForegroundColor Yellow
#     exit 1
# }

# # 6. curl 요청 실행
# Write-Host "서버에 제출 중..." -ForegroundColor Cyan
# curl.exe --% -X POST http://localhost:4000/user/submitAll `
#   -H "Content-Type: application/json" `
#   -b cookie.txt `
#   -d "@submit.json"
