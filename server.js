import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const TIMEOUT = 5000;

app.post('/run', (req, res) => {
  const { code } = req.body;
  const requestId = uuidv4();
  const workDir = path.join(__dirname, 'temp', requestId);

  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const filePath = path.join(workDir, 'Main.java');
  fs.writeFileSync(filePath, code);

  // Compile
  exec(`javac "${filePath}"`, { timeout: TIMEOUT }, (compileErr, stdout, stderr) => {
    if (compileErr || stderr) {
      cleanUp(workDir);
      return res.json({ 
        success: false, 
        error: stderr || compileErr.message 
      });
    }

    // Run
    exec(`java -cp "${workDir}" Main`, { timeout: TIMEOUT }, (runErr, runStat, runStderr) => {
      const result = runStat || runStderr;
      cleanUp(workDir);

      if (runErr && runErr.killed) {
        return res.json({ success: false, error: "Execution Timed Out (Max 5s)" });
      }

      res.json({
        success: true,
        output: result.toString()
      });
    });
  });
});

function cleanUp(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {}
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Java Runner Backend active on port ${PORT}`);
});