import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Ensure temp directory exists
const tempRoot = path.join(__dirname, 'temp');
if (!fs.existsSync(tempRoot)) {
    fs.mkdirSync(tempRoot, { recursive: true });
}

app.post('/run', (req, res) => {
    const { code } = req.body;
    const runId = uuidv4();
    const workDir = path.join(tempRoot, runId);

    try {
        if (!fs.existsSync(workDir)) {
            fs.mkdirSync(workDir, { recursive: true });
        }

        const filePath = path.join(workDir, 'Main.java');
        fs.writeFileSync(filePath, code);

        // Compilation (Max 5s)
        exec(`javac Main.java`, { cwd: workDir, timeout: 5000 }, (compileErr, stdout, stderr) => {
            if (compileErr || stderr) {
                res.json({ success: false, error: stderr || compileErr.message });
                cleanUp(workDir);
                return;
            }

            // Execution (Max 5s)
            exec(`java Main`, { cwd: workDir, timeout: 5000 }, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    res.json({ success: false, error: runStderr || runErr.message });
                } else {
                    res.json({ success: true, output: runStdout });
                }
                cleanUp(workDir);
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

function cleanUp(dir) {
    // Small delay to ensure file handles are released
    setTimeout(() => {
        try {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    }, 2000);
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`JavaLab backend running on port ${PORT}`);
});