import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Upload, Trash2, Terminal as TerminalIcon, Code2, ChevronUp, ChevronDown } from 'lucide-react';

const DEFAULT_JAVA = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab!");
        for(int i = 1; i <= 5; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`;

interface LogEntry {
  msg: string;
  type: 'info' | 'error' | 'success' | 'text';
}

export default function App() {
  const [code, setCode] = useState(localStorage.getItem('javalab_code') || DEFAULT_JAVA);
  const [output, setOutput] = useState<LogEntry[]>([
    { msg: 'Welcome to JavaLab. Press Run to execute your code.', type: 'info' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const handleRun = async () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    setOutput([{ msg: '> Compiling and running...', type: 'info' }]);
    
    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const lines = data.output.split('\n').filter((l: string) => l !== "");
        if (lines.length === 0) {
          setOutput([{ msg: 'Program finished with no output.', type: 'info' }]);
        } else {
          setOutput(lines.map((l: string) => ({ msg: l, type: 'success' })));
        }
      } else {
        setOutput([{ msg: `Error:\n${data.error}`, type: 'error' }]);
      }
    } catch (err) {
      setOutput([{ msg: 'Error: Backend server not reachable. Ensure server.js is running locally.', type: 'error' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Main.java';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-900/20">
            <Code2 size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">JavaLab</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".java,.txt" />
          
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
              title="Import local .java file"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
              title="Download code to disk"
            >
              <Download size={18} />
            </button>
          </div>

          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 ${
              isRunning ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Play size={16} fill={isRunning ? "none" : "currentColor"} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </header>

      {/* Editor & Console Container */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 relative border-b border-slate-800">
           <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Courier New', monospace",
              minimap: { enabled: false },
              automaticLayout: true,
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              backgroundColor: '#0f172a'
            }}
          />
        </div>

        {/* Console Drawer */}
        <div 
          className={`flex flex-col bg-slate-950 transition-all duration-300 ${
            isConsoleOpen ? 'h-[40%] min-h-[120px]' : 'h-10'
          }`}
        >
          <div 
            className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors shrink-0"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <TerminalIcon size={14} className="text-emerald-400" />
              Console
              {isRunning && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setOutput([]); }}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-white"
                title="Clear logs"
              >
                <Trash2 size={14} />
              </button>
              {isConsoleOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-black/40">
            {output.length > 0 ? (
              output.map((line, i) => (
                <div 
                  key={i} 
                  className={`mb-1 break-words ${
                    line.type === 'error' ? 'text-rose-400' : 
                    line.type === 'info' ? 'text-sky-400' : 
                    'text-emerald-400'
                  }`}
                >
                  {line.type === 'info' && <span className="mr-2">ℹ</span>}
                  {line.msg}
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No output yet.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}