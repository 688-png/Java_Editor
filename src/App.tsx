import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Upload, Trash2, Cpu, Square, FileCode, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab");
        
        for(int i = 1; i <= 5; i++) {
            System.out.println("Line: " + i);
        }
    }
}`;

type LogEntry = {
  type: 'out' | 'err' | 'info';
  text: string;
};

export default function App() {
  const [code, setCode] = useState(() => localStorage.getItem('javalab_code') || DEFAULT_CODE);
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput([{ type: 'info', text: 'Compiling Main.java...' }]);

    try {
      const response = await axios.post('http://localhost:5000/run', { code });
      const { success, output: runOutput, error } = response.data;
      
      if (success) {
        setOutput(prev => [...prev, { type: 'out', text: runOutput || 'Program executed successfully (no output).' }]);
      } else {
        setOutput(prev => [...prev, { type: 'err', text: error }]);
      }
    } catch (err: any) {
      setOutput(prev => [...prev, { type: 'err', text: 'Backend Connection Error: Is the local server running on port 5000?' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm('Importing this file will replace your current code. Continue?')) {
          setCode(content);
        }
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Main.java';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearConsole = () => setOutput([]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">
            JavaLab<span className="text-blue-500 text-sm ml-1">v1.0</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".java,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors"
            title="Import Java File"
          >
            <Upload size={18} />
            <span className="text-sm font-medium hidden md:block">Import</span>
          </button>
          
          <button 
            onClick={downloadCode}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors"
            title="Download Main.java"
          >
            <Download size={18} />
            <span className="text-sm font-medium hidden md:block">Download</span>
          </button>

          <div className="w-px h-6 bg-slate-800 mx-2" />

          <button 
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-1.5 rounded font-bold transition-all ${
              isRunning 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/40'
            }`}
          >
            {isRunning ? <Square size={16} className="animate-pulse" /> : <Play size={16} fill="currentColor" />}
            {isRunning ? 'RUNNING' : 'RUN'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / Files info */}
        <div className="w-12 md:w-48 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 uppercase text-[10px] font-bold tracking-widest text-slate-500 hidden md:block">
            Explorer
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-l-2 border-blue-500 cursor-default">
            <FileCode size={16} className="text-blue-400 shrink-0" />
            <span className="text-sm truncate hidden md:block">Main.java</span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4">
             <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
               <CheckCircle2 size={10} className="text-green-500" /> Auto-save enabled
             </span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 15,
                padding: { top: 20 },
                minimap: { enabled: false },
                scrollbar: { vertical: 'visible', verticalScrollbarSize: 10 },
                automaticLayout: true,
                cursorBlinking: 'smooth',
                lineNumbers: 'on',
                glyphMargin: true
              }}
            />
          </div>
        </div>

        {/* Console Panel */}
        <div className="w-1/3 min-w-[300px] max-w-[600px] flex flex-col bg-black border-l border-slate-800">
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Terminal</span>
            <button 
              onClick={clearConsole}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
              title="Clear Console"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
            {output.length === 0 && (
              <div className="text-slate-600 italic select-none">
                {">"} Click "RUN" to compile and execute your Java code.
              </div>
            )}
            {output.map((line, i) => (
              <div key={i} className={`mb-1 break-words ${
                line.type === 'err' ? 'text-red-400 font-medium' : 
                line.type === 'info' ? 'text-blue-400' : 'text-green-50'
              }`}>
                {line.type === 'info' && <span className="mr-2 text-slate-600">i</span>}
                {line.type === 'err' && <span className="mr-2">✘</span>}
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}