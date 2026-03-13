import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

const TEMP_BASE = path.join(__dirname, 'temp_runs');

// Ensure temp directory exists
async function ensureDir() {
    try { await fs.mkdir(TEMP_BASE); } catch {}
}
ensureDir();

app.post('/run', async (req, res) => {
    const { code } = req.body;
    const runId = uuidv4();
    const runDir = path.join(TEMP_BASE, runId);
    const filePath = path.join(runDir, 'Main.java');

    try {
        await fs.mkdir(runDir);
        await fs.writeFile(filePath, code);

        // Limit execution to 5 seconds
        const TIMEOUT_MS = 5000;

        // Compilation step
        exec(`javac Main.java`, { cwd: runDir }, (compileError, stdout, stderr) => {
            if (compileError) {
                cleanup(runDir);
                return res.json({ success: false, error: stderr || compileError.message });
            }

            // Execution step
            const child = exec(`java Main`, { cwd: runDir, timeout: TIMEOUT_MS }, (runError, runStdout, runStderr) => {
                cleanup(runDir);
                
                if (runError && runError.killed) {
                    return res.json({ success: false, error: 'Execution Timed Out (Max 5s)' });
                }

                if (runError) {
                    return res.json({ success: false, error: runStderr || runError.message });
                }

                res.json({ success: true, output: runStdout + runStderr });
            });
        });
    } catch (err) {
        cleanup(runDir);
        res.status(500).json({ success: false, error: 'Server Internal Error' });
    }
});

async function cleanup(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch (err) {
        console.error('Cleanup failed:', err);
    }
}

const PORT = 5000;
app.listen(PORT, () => console.log(`Java Execution Server running on port ${PORT}`));