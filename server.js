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

const TIMEOUT = 5000; // 5 seconds execution limit

app.post('/run', async (req, res) => {
  const { code } = req.body;
  const requestId = uuidv4();
  const workDir = path.join(__dirname, 'temp', requestId);

  try {
    // 1. Setup workspace
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    const filePath = path.join(workDir, 'Main.java');
    fs.writeFileSync(filePath, code);

    // 2. Compile
    exec(`javac "${filePath}"`, { timeout: TIMEOUT }, (compileErr, stdout, stderr) => {
      if (compileErr || stderr) {
        cleanUp(workDir);
        return res.json({ 
          success: false, 
          error: stderr || compileErr.message 
        });
      }

      // 3. Run
      const child = exec(`java -cp "${workDir}" Main`, { timeout: TIMEOUT }, (runErr, runStat, runStderr) => {
        const output = runStat || runStderr;
        cleanUp(workDir);

        if (runErr && runErr.killed) {
          return res.json({ success: false, error: "Execution Timed Out (Max 5s)" });
        }

        res.json({
          success: true,
          output: output.toString()
        });
      });
    });

  } catch (err) {
    cleanUp(workDir);
    res.status(500).json({ success: false, error: err.message });
  }
});

function cleanUp(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Java Runner Backend active on port ${PORT}`);
});