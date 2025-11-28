const { spawn } = require("child_process");
const path = require("path");

function runExtractor() {
  const scriptPath = path.join(__dirname, "extractor", "main.py");
  const scriptDir = path.dirname(scriptPath);

  const pyProcess = spawn("python", [scriptPath], {
    cwd: scriptDir,
    stdio: ["pipe", "pipe", "pipe"],
    env: { PYTHONIOENCODING: "utf-8" },
  });

  let buffer = "";
  pyProcess.stdout.on("data", (data) => {
    buffer += data.toString("utf8");
    let lines = buffer.split("\n");
    for (const line of lines) {
      console.log("hello" + line);
    }
    // console.log("Python stdout:", data.toString("utf8"));
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString("utf8"));
  });

  process.stdin.on("data", (data) => {
    pyProcess.stdin.write(data);
  });

  pyProcess.on("error", (error) => {
    console.error("실행 에러:", error);
  });

  pyProcess.on("close", (code) => {
    console.log(`Python 프로세스가 종료되었습니다. 종료 코드: ${code}`);
  });
}

module.exports = { runExtractor };
