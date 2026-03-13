import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

app.post('/run', (req, res) => {
    const { code } = req.body;
    const sessionId = uuidv4();
    const sessionPath = path.join(TEMP_DIR, sessionId);

    fs.mkdirSync(sessionPath);

    const filePath = path.join(sessionPath, 'Main.java');
    
    // 1. Write File
    fs.writeFileSync(filePath, code);

    // 2. Compile
    exec(`javac "${filePath}"`, { timeout: 5000 }, (compileErr, stdout, stderr) => {
        if (compileErr || stderr) {
            cleanUp(sessionPath);
            return res.json({ 
                success: false, 
                error: stderr || compileErr.message 
            });
        }

        // 3. Execute
        // Using -cp to point to the temporary directory
        exec(`java -cp "${sessionPath}" Main`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
            const output = runStdout || runStderr;
            const error = runErr ? runErr.message : null;

            cleanUp(sessionPath);

            if (runErr && runErr.killed) {
                return res.json({ success: false, error: "Execution Timed Out (5s limit)" });
            }

            res.json({ 
                success: !runErr, 
                output: output,
                error: error
            });
        });
    });
});

function cleanUp(dir) {
    try {
        fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {
        console.error("Cleanup error:", e);
    }
}

app.listen(PORT, () => {
    console.log(`JavaLab Backend running at http://localhost:${PORT}`);
});