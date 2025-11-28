const { spawn } = require("child_process");
const path = require("path");

let errorOccur = false;

// pdf에서 검사값 가져오기
function getResults(req, res) {
  const fileBuffer = req.file.buffer;

  const scriptPath = path.join(
    __dirname,
    "../extract-pdf/extractor",
    "getResults.py"
  );
  const scriptDir = path.dirname(scriptPath);
  const pyProcess = spawn("python", [scriptPath], {
    cwd: scriptDir,
    stdio: ["pipe", "pipe", "pipe"],
    env: { PYTHONIOENCODING: "utf-8" },
  });

  pyProcess.stdin.write(fileBuffer);
  pyProcess.stdin.end();

  let result = "";
  pyProcess.stdout.on("data", (data) => {
    result += data.toString("utf8");
    console.log(result);
  });

  // 파이썬 코드 실행이 종료 된 후
  pyProcess.stdout.on("end", () => {
    if (errorOccur) {
      errorOccur = false;
      return;
    }
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.send(result);
    }
  });

  // 파이썬 코드 실행 중 에러 발생
  pyProcess.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString());
  });

  // 파이썬 파일 실행 실패
  pyProcess.on("error", (err) => {
    console.error("pdf 분석기 실행 실패", err);
    res.status(500).send("Internal Server Error");
    errorOccur = true;
  });
}

// pdf에서 정상여부 가져오기
function getJudges(req, res) {
  const reqBody = req.body;
  const inputStr = JSON.stringify({
    results: reqBody,
    gender: "남",
  });
  const scriptPath = path.join(
    __dirname,
    "../extract-pdf/extractor",
    "getJudge.py"
  );
  const scriptDir = path.dirname(scriptPath);
  const pyProcess = spawn("python", [scriptPath], {
    cwd: scriptDir,
    stdio: ["pipe", "pipe", "pipe"],
    env: { PYTHONIOENCODING: "utf-8" },
  });

  pyProcess.stdin.write(inputStr);
  pyProcess.stdin.end();

  let result = "";
  pyProcess.stdout.on("data", (data) => {
    result += data.toString("utf8");
    console.log(data.toString("utf8"));
  });

  // 파이썬 코드 실행이 종료 된 후
  pyProcess.stdout.on("end", () => {
    if (errorOccur) {
      errorOccur = false;
      return;
    }
    try {
      console.log("end");
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.send(result);
    }
  });

  // 비정상 종료 판별
  pyProcess.on("exit", (code) => {
    if (code === 1) {
      res.status(500).json();
    }
  });

  // 파이썬 코드 실행 중 에러 발생
  pyProcess.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString());
  });

  // 파이썬 파일 실행 실패
  pyProcess.on("error", (err) => {
    console.error("정상 여부 판단기 실행 실패", err);
    res.status(500).send("Internal Server Error");
    errorOccur = true;
  });
}

function modifyResults(req, res) {
  try {
    const modifiedData = req.body;
    console.log("Modified data received:", JSON.stringify(modifiedData));
    res.json(modifiedData);
  } catch (err) {
    console.error("Modify Results 처리 중 오류:", err);
    res.status(500).send("Internal Server Error");
  }
}

function getScore(req, res) {
  const reqBody = req.body;
  const inputStr = JSON.stringify({
    results: reqBody,
    gender: "남",
  });
  const scriptPath = path.join(
    __dirname,
    "../extract-pdf/extractor",
    "getScore.py"
  );
  const scriptDir = path.dirname(scriptPath);

  const pyProcess = spawn("python", [scriptPath], {
    cwd: scriptDir,
    stdio: ["pipe", "pipe", "pipe"],
    env: { PYTHONIOENCODING: "utf-8" },
  });

  pyProcess.stdin.write(inputStr);
  pyProcess.stdin.end();

  let result = "";
  pyProcess.stdout.on("data", (data) => {
    result += data.toString("utf8");
  });

  pyProcess.stdout.on("end", () => {
    if (errorOccur) return;
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.send(result);
    }
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python stderr (getScore):", data.toString());
  });

  pyProcess.on("error", (err) => {
    console.error("점수 계산기 실행 실패", err);
    res.status(500).send("Internal Server Error");
  });
}

module.exports = { getResults, getJudges, modifyResults, getScore };
