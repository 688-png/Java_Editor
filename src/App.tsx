import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Trash2, Cpu, Square } from 'lucide-react';
import axios from 'axios';

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab");
        
        for(int i = 1; i <= 5; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`;

export default function App() {
  const [code, setCode] = useState(() => localStorage.getItem('javalab_code') || DEFAULT_CODE);
  const [output, setOutput] = useState<{ type: 'out' | 'err' | 'info', text: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput([{ type: 'info', text: 'Compiling and running...' }]);

    try {
      const response = await axios.post('http://localhost:5000/run', { code });
      const data = response.data;
      
      if (data.success) {
        setOutput(prev => [...prev, { type: 'out', text: data.output || 'Program finished with no output.' }]);
      } else {
        setOutput(prev => [...prev, { type: 'err', text: data.error }]);
      }
    } catch (err: any) {
      setOutput(prev => [...prev, { type: 'err', text: 'Connection Error: Is the backend server running?' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearConsole = () => setOutput([]);
  
  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Main.java";
    document.body.appendChild(element);
    element.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runCode();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200" onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-white">JavaLab</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadCode}
            className="p-2 hover:bg-slate-800 rounded-md transition-colors title='Download Main.java'"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all ${
              isRunning 
              ? 'bg-slate-700 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
            }`}
          >
            {isRunning ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Wrapper */}
        <div className="flex-1 border-r border-slate-800 relative">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Console Panel */}
        <div className="w-[450px] flex flex-col bg-black">
          <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Console</span>
            <button 
              onClick={clearConsole}
              className="p-1 hover:text-white text-slate-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
            {output.length === 0 && (
              <div className="text-slate-600 italic">No output yet. Click run to execute.</div>
            )}
            {output.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap break-all ${
                line.type === 'err' ? 'text-red-400' : 
                line.type === 'info' ? 'text-blue-400' : 'text-green-50'
              }`}>
                {line.type === 'info' && <span className="mr-2">❯</span>}
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}